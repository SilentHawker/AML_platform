import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Spinner from './Spinner';
import ForgotPassword from './ForgotPassword';

type View = 'login' | 'register' | 'forgotPassword';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout, impersonatedTenant, stopImpersonation } = useAuth();
  const [currentView, setCurrentView] = useState<View>('login');

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
          <Dashboard />
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