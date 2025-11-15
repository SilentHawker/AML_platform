import type { CompanyProfile } from '../types';
import { fetchApi } from './api';

// MOCK_PROFILES are now replaced by the backend API.

export const getProfile = async (tenantId: string): Promise<CompanyProfile | undefined> => {
    if (!tenantId) {
        console.warn("getProfile was called without a valid tenantId. Aborting fetch.");
        return undefined;
    }
    try {
        // The API returns a different shape, so we adapt it to our CompanyProfile type
        const clientData = await fetchApi<any>(`/api/v1/clients/${tenantId}`);
        if (!clientData) return undefined;

        // Assuming the API returns a structure that can be mapped to CompanyProfile
        return {
            tenantId: clientData.client_id,
            legalName: clientData.company_name,
            operatingName: clientData.operating_name || '',
            fintracRegNumber: clientData.fintrac_reg_number || '',
            businessAddress: clientData.business_address || '',
            businessLines: clientData.business_lines || ['MSBs'],
            employees: clientData.employees || [],
            onboardingData: clientData.onboarding_data || null,
        };
    } catch (error) {
        console.error(`Failed to fetch profile for tenant ${tenantId}:`, error);
        return undefined;
    }
};

export const updateProfile = async (tenantId: string, updatedProfile: CompanyProfile): Promise<CompanyProfile> => {
    // There is no PUT /clients/{id} endpoint specified.
    // This is a critical missing piece for updating profiles.
    // We will log a warning and return the object as if it were successful for demo purposes.
    console.warn(`API does not support PUT /clients/${tenantId}. Simulating profile update.`);
    
    // In a real scenario, this would be:
    // const payload = { ...updatedProfile }; // adapt to API schema
    // return fetchApi<CompanyProfile>(`/clients/${tenantId}`, { method: 'PUT', body: payload });
    
    return Promise.resolve(updatedProfile);
};