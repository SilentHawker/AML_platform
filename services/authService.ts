
import type { User } from '../types';
import { fetchApi } from './api';

// Mock user database is now replaced by the backend API.

export const login = async (email: string, password: string): Promise<User> => {
  // Assuming the login endpoint validates and returns the user object
  const user = await fetchApi<User>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  // The API may not return all fields, so we supplement if necessary.
  return {
      hasCompletedOnboarding: true, // Assuming login implies onboarding is done, or API provides this
      ...user
  };
};

export const register = async (email: string, password: string): Promise<User> => {
  // Assume new self-registrations create a client with a default company name
  const tenantName = 'New Client Inc.';
  const newUser = await fetchApi<User>('/clients', {
      method: 'POST',
      body: { email, password, company_name: tenantName }
  });
  return { ...newUser, hasCompletedOnboarding: false, tenantName };
};

export const getUserByTenantId = async (tenantId: string): Promise<User | undefined> => {
    // The GET /clients/{client_id} endpoint seems to be for company profiles, not user objects.
    // For this app, the 'User' is tied to a client/tenant. We can get the client details.
    // This is a temporary measure as the API surface is not fully clear on users vs clients.
    try {
        const clients = await fetchApi<any[]>('/clients');
        const client = clients.find(c => c.client_id === tenantId);
        if (!client) return undefined;
        // Construct a User-like object from client data for compatibility
        return {
            id: client.client_id,
            email: client.email, // Assuming email exists on client object
            role: 'client',
            tenantId: client.client_id,
            tenantName: client.company_name,
            hasCompletedOnboarding: client.has_completed_onboarding || false,
        };
    } catch (e) {
        console.error("Failed to get user by tenant ID", e);
        return undefined;
    }
};


export const completeUserOnboarding = async (tenantId: string): Promise<User | undefined> => {
    // There is no direct endpoint for this. We assume that saving the onboarding data
    // via the profile service is what completes this step.
    // This function will now be a placeholder or could be removed if the logic is fully in the profile service.
    console.log(`Onboarding considered complete for tenant: ${tenantId}`);
    return getUserByTenantId(tenantId);
};

export const adminCreateClient = async (companyName: string, email: string): Promise<User> => {
    const newUser = await fetchApi<any>('/clients', {
        method: 'POST',
        body: { email, company_name: companyName, password: `temp-password-${Date.now()}` } // Assume backend handles temp password
    });
     // Adapt the response to the User type
    return {
        id: newUser.client_id,
        email: newUser.email,
        role: 'client',
        tenantId: newUser.client_id,
        tenantName: newUser.company_name,
        hasCompletedOnboarding: false,
    };
};

export const requestPasswordReset = (email: string): Promise<void> => {
    return new Promise((resolve) => {
        // This functionality does not have a corresponding API endpoint.
        // It remains a mock.
        console.log(`Password reset requested for: ${email}`);
        setTimeout(() => {
            resolve();
        }, 700);
    });
};

export const logout = (): Promise<void> => {
  // Logout is a client-side action (clearing state/storage), no API call needed.
  return Promise.resolve();
};
