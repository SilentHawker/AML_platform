
import type { OnboardingData, CompanyProfile } from '../types';
import { getProfile, updateProfile } from './profileService';


export const saveOnboardingData = async (tenantId: string, data: OnboardingData): Promise<void> => {
    try {
        const profile = await getProfile(tenantId);
        if (!profile) {
            throw new Error("Profile not found for tenant.");
        }
        const updatedProfile: CompanyProfile = {
            ...profile,
            legalName: data.company_legal_name || profile.legalName,
            operatingName: data.operating_name || profile.operatingName,
            fintracRegNumber: data.fintrac_reg_number || profile.fintracRegNumber,
            onboardingData: data
        };
        await updateProfile(tenantId, updatedProfile);
    } catch (error) {
        console.error("Failed to save onboarding data:", error);
        throw error;
    }
};

export const getOnboardingData = async (tenantId: string): Promise<OnboardingData | null> => {
    try {
        const profile = await getProfile(tenantId);
        return profile?.onboardingData || null;
    } catch (error) {
        console.error("Failed to retrieve onboarding data:", error);
        return null;
    }
};