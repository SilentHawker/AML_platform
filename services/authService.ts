import type { User } from '../types';

// Mock user database
const users: User[] = [
    { id: '1', email: 'client@acme.com', role: 'client', tenantId: 'acme-corp', tenantName: 'ACME Corporation' },
    { id: '2', email: 'manager@acme.com', role: 'manager', tenantId: 'acme-corp', tenantName: 'ACME Corporation' },
    { id: '3', email: 'client@stark.com', role: 'client', tenantId: 'stark-ind', tenantName: 'Stark Industries' },
    { id: '4', email: 'admin@safetynet.com', role: 'admin', tenantId: 'system-admin', tenantName: 'AML SafetyNet' },
];

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, you'd also check the password hash
      const user = users.find(u => u.email === email);
      if (user && password) { // Simple password check for demo
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

export const register = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users.find(u => u.email === email)) {
        reject(new Error('User already exists'));
        return;
      }
      if (!password || password.length < 6) {
        reject(new Error('Password must be at least 6 characters'));
        return;
      }
      // For simplicity, new users are registered to a new mock tenant
      const tenantId = `new-tenant-${Date.now()}`;
      const tenantName = 'New Client Inc.';
      const newUser: User = { 
        id: String(users.length + 1), 
        email, 
        role: 'client',
        tenantId,
        tenantName
      };
      users.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const requestPasswordReset = (email: string): Promise<void> => {
    return new Promise((resolve) => {
        // Simulate network delay. In a real app, this would send an email.
        console.log(`Password reset requested for: ${email}`);
        setTimeout(() => {
            resolve();
        }, 700);
    });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 200);
  });
};