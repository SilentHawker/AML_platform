import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Spinner from './Spinner';
import ForgotPassword from './ForgotPassword';
import Onboarding from './Onboarding';
import { getUserByTenantId } from '../services/authService';
import type { User } from '../types';

type View = 'login' | 'register' | 'forgotPassword';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout, impersonatedTenant, stopImpersonation } = useAuth();
  const [currentView, setCurrentView] = useState<View>('login');
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    if (impersonatedTenant) {
      // In a real app, this would likely be an API call.
      const targetUser = getUserByTenantId(impersonatedTenant.tenantId);
      setImpersonatedUser(targetUser || null);
    } else {
      setImpersonatedUser(null);
    }
  }, [impersonatedTenant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const renderAuthView = () => {
    switch (currentView) {
      case 'register':
        return <Register onSwitchView={() => setCurrentView('login')} />;
      case 'forgotPassword':
        return <ForgotPassword onSwitchView={() => setCurrentView('login')} />;
      case 'login':
      default:
        return <Login onSwitchToRegister={() => setCurrentView('register')} onSwitchToForgotPassword={() => setCurrentView('forgotPassword')} />;
    }
  }

  const handleImpersonationOnboardingComplete = () => {
    // Re-fetch the impersonated user's data to confirm their status has changed
    if (impersonatedTenant) {
      const targetUser = getUserByTenantId(impersonatedTenant.tenantId);
      setImpersonatedUser(targetUser || null);
    }
  };

  const renderMainContent = () => {
    if (!user) return null;

    // 1. If the logged-in user is a client and hasn't onboarded.
    if (user.role === 'client' && !user.hasCompletedOnboarding) {
        return <Onboarding />;
    }

    // 2. If an admin is impersonating a client who hasn't onboarded.
    // The check for `impersonatedUser` prevents a flash of the dashboard while it loads.
    if (user.role === 'admin' && impersonatedUser && !impersonatedUser.hasCompletedOnboarding) {
        return <Onboarding onImpersonationComplete={handleImpersonationOnboardingComplete} />;
    }

    // Otherwise, show the dashboard.
    return <Dashboard />;
  }

  return (
    <>
      {impersonatedTenant && (
        <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold text-center p-2 shadow-md">
            You are viewing the dashboard as <span className="font-bold">{impersonatedTenant.tenantName}</span>.
            <button onClick={stopImpersonation} className="ml-4 font-bold underline hover:text-yellow-800">
                Return to Admin View
            </button>
        </div>
      )}
      <Header 
        isAuthenticated={isAuthenticated} 
        userEmail={user?.email} 
        userRole={user?.role}
        onLogout={logout} 
      />
      <main className="container mx-auto p-4 md:p-8">
        {isAuthenticated ? (
          renderMainContent()
        ) : (
          <div className="max-w-md mx-auto mt-10">
            {renderAuthView()}
          </div>
        )}
      </main>
    </>
  );
};

export default AppContent;