import type { User } from '../types';

// Mock user database
const users: User[] = [
    { id: '1', email: 'client@acme.com', role: 'client', tenantId: 'acme-corp', tenantName: 'ACME Corporation', hasCompletedOnboarding: true },
    { id: '2', email: 'manager@acme.com', role: 'manager', tenantId: 'acme-corp', tenantName: 'ACME Corporation', hasCompletedOnboarding: true },
    { id: '3', email: 'client@stark.com', role: 'client', tenantId: 'stark-ind', tenantName: 'Stark Industries', hasCompletedOnboarding: true },
    { id: '4', email: 'admin@safetynet.com', role: 'admin', tenantId: 'system-admin', tenantName: 'AML SafetyNet', hasCompletedOnboarding: true },
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
        tenantName,
        hasCompletedOnboarding: false,
      };
      users.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const getUserByTenantId = (tenantId: string): User | undefined => {
    // This is a simplification. In a real app, a tenant could have multiple users.
    // For this mock, we find the first client user associated with the tenant.
    return users.find(u => u.tenantId === tenantId && u.role === 'client');
};

export const completeUserOnboarding = (tenantId: string): User | undefined => {
    const userIndex = users.findIndex(u => u.tenantId === tenantId && u.role === 'client');
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], hasCompletedOnboarding: true };
        return users[userIndex];
    }
    return undefined;
};

export const adminCreateClient = (companyName: string, email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (users.find(u => u.email === email)) {
                reject(new Error('A user with this email already exists.'));
                return;
            }
            if (!companyName.trim()) {
                reject(new Error('Company name cannot be empty.'));
                return;
            }
            const tenantId = `${companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            const newUser: User = {
                id: String(users.length + 1),
                email,
                role: 'client',
                tenantId,
                tenantName: companyName,
                hasCompletedOnboarding: false,
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