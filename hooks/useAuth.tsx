import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { login as apiLogin, register as apiRegister, logout as apiLogout, requestPasswordReset as apiRequestPasswordReset, adminCreateClient as apiAdminCreateClient, completeUserOnboarding as apiCompleteUserOnboarding } from '../services/authService';

interface ImpersonationInfo {
  tenantId: string;
  tenantName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password:string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
  impersonatedTenant: ImpersonationInfo | null;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
  adminCreateClient: (companyName: string, email: string) => Promise<User>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonatedTenant, setImpersonatedTenant] = useState<ImpersonationInfo | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (email: string, password: string) => {
    const registeredUser = await apiRegister(email, password);
    setUser(registeredUser);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    return registeredUser;
  };
  
  const requestPasswordReset = async (email: string) => {
    await apiRequestPasswordReset(email);
    // In a real app, this would trigger an email, but here we just resolve
  };

  const adminCreateClient = async (companyName: string, email: string) => {
    const newUser = await apiAdminCreateClient(companyName, email);
    // This function doesn't log in as the new user, but prepares for impersonation.
    return newUser;
  };
  
  const completeOnboarding = () => {
    setUser(currentUser => {
        if (!currentUser) return null;

        // Update the mock database as the single source of truth
        apiCompleteUserOnboarding(currentUser.tenantId);
        
        // Update the state for the current session
        const updatedUser = { ...currentUser, hasCompletedOnboarding: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    });
  }

  const logout = () => {
    apiLogout();
    setUser(null);
    setImpersonatedTenant(null); // Clear impersonation on logout
    localStorage.removeItem('user');
  };

  const startImpersonation = (tenantId: string, tenantName: string) => {
    if (user?.role === 'admin') {
      setImpersonatedTenant({ tenantId, tenantName });
    }
  };

  const stopImpersonation = () => {
    setImpersonatedTenant(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      requestPasswordReset, 
      isLoading,
      impersonatedTenant,
      startImpersonation,
      stopImpersonation,
      adminCreateClient,
      completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};