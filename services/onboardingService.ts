import type { OnboardingData } from '../types';

const ONBOARDING_DATA_PREFIX = 'onboarding_data_';

export const saveOnboardingData = (tenantId: string, data: OnboardingData): void => {
    try {
        const key = `${ONBOARDING_DATA_PREFIX}${tenantId}`;
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save onboarding data to localStorage:", error);
    }
};

export const getOnboardingData = (tenantId: string): OnboardingData | null => {
    try {
        const key = `${ONBOARDING_DATA_PREFIX}${tenantId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Failed to retrieve onboarding data from localStorage:", error);
        return null;
    }
};
