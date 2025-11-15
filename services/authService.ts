
import type { User } from '../types';
import { fetchApi } from './api';
import { getProfile } from './profileService';

interface LoginResponse {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'manager' | 'admin';
  token: string;
}

// Mock user database is now replaced by the backend API.
export const login = async (email: string, password: string): Promise<User> => {
  const loginResponse = await fetchApi<LoginResponse>('/api/v1/admin/login', {
    method: 'POST',
    body: { email, password },
    auth: false, // This is an unauthenticated endpoint
  });

  // For admins, we create a user object without tenant-specific details.
  if (loginResponse.role === 'admin') {
    return {
      id: loginResponse.id,
      email: loginResponse.email,
      role: loginResponse.role,
      tenantId: '', // Admins are not tied to a single tenant
      tenantName: 'Admin',
      hasCompletedOnboarding: true, // Admins do not go through client onboarding
    };
  }
  
  // For clients, we assume the login response ID can be used to fetch their company profile.
  // The API spec is ambiguous on the link between a user and a client/tenant, so this is a reasonable assumption.
  const tenantId = loginResponse.id;
  const profile = await getProfile(tenantId);
  
  if (!profile) {
      throw new Error("Logged in successfully, but could not find an associated company profile.");
  }

  return {
    id: loginResponse.id,
    email: loginResponse.email,
    role: loginResponse.role,
    tenantId: profile.tenantId,
    tenantName: profile.legalName,
    hasCompletedOnboarding: !!profile.onboardingData,
  };
};


export const getUserByTenantId = async (tenantId: string): Promise<User | undefined> => {
    // Refactored to use the more specific getProfile service
    try {
        const profile = await getProfile(tenantId);
        if (!profile) return undefined;
        // Construct a User-like object from client data for compatibility.
        // Email is not available on the profile, this is a limitation.
        return {
            id: profile.tenantId,
            email: '', 
            role: 'client',
            tenantId: profile.tenantId,
            tenantName: profile.legalName,
            hasCompletedOnboarding: !!profile.onboardingData,
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

interface CreateClientResponse {
    ok: boolean;
    result: {
        client_id: string;
        company_name: string;
    }
}

export const adminCreateClient = async (companyName: string): Promise<User> => {
    const response = await fetchApi<CreateClientResponse>('/clients', {
        method: 'POST',
        // Body aligns with the provided API spec, which does not include email or password.
        body: { company_name: companyName } 
    });

    if (!response.ok || !response.result) {
        throw new Error("Failed to create client on the server.");
    }
    
    const newClient = response.result;

    // Adapt the response to the User type. Email is not returned by the API.
    return {
        id: newClient.client_id,
        email: '', // API does not provide an email on client creation.
        role: 'client',
        tenantId: newClient.client_id,
        tenantName: newClient.company_name,
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
