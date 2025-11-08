
import type { CompanyProfile, Employee } from '../types';
import { getOnboardingData } from './onboardingService';

const MOCK_PROFILES: CompanyProfile[] = [
    {
        tenantId: 'acme-corp',
        legalName: 'ACME Corporation',
        operatingName: '',
        fintracRegNumber: 'M12345678',
        businessAddress: '123 Main Street, Anytown, ON, A1B 2C3',
        businessLines: ['MSBs'],
        employees: [
            {
                id: 'emp-acme-1',
                name: 'Alice Manager',
                email: 'manager@acme.com',
                phone: '555-0101',
                role: 'Compliance Officer',
                notificationPreferences: ['email', 'inApp'],
            },
            {
                id: 'emp-acme-2',
                name: 'Bob Client',
                email: 'client@acme.com',
                phone: '555-0102',
                role: 'Primary Contact',
                notificationPreferences: ['email'],
            },
        ],
    },
    {
        tenantId: 'stark-ind',
        legalName: 'Stark Industries',
        operatingName: '',
        fintracRegNumber: 'M87654321',
        businessAddress: '1 Stark Tower, New York, NY, 10001',
        businessLines: ['MSBs', 'Securities Dealers'],
        employees: [
             {
                id: 'emp-stark-1',
                name: 'Pepper Potts',
                email: 'ceo@stark.com',
                phone: '212-970-4133',
                role: 'CEO',
                notificationPreferences: ['inApp'],
            },
            {
                id: 'emp-stark-2',
                name: 'Happy Hogan',
                email: 'happy@stark.com',
                phone: '212-970-4134',
                role: 'Head of Security',
                notificationPreferences: ['email'],
            }
        ]
    }
];

const PROFILES_KEY = 'company_profiles';

const initializeData = () => {
    if (!localStorage.getItem(PROFILES_KEY)) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(MOCK_PROFILES));
    }
};

initializeData();

const getAllProfiles = (): CompanyProfile[] => {
    const profiles = localStorage.getItem(PROFILES_KEY);
    return profiles ? JSON.parse(profiles) : [];
}

export const getProfile = (tenantId: string): CompanyProfile | undefined => {
    const profiles = getAllProfiles();
    let profile = profiles.find(p => p.tenantId === tenantId);

    // If no profile exists, create one from onboarding data as a fallback
    if (!profile) {
        const onboardingData = getOnboardingData(tenantId);
        if (onboardingData) {
            profile = {
                tenantId: tenantId,
                legalName: onboardingData.company_legal_name,
                operatingName: onboardingData.operating_name,
                fintracRegNumber: onboardingData.fintrac_reg_number,
                businessAddress: '', // Not in onboarding data
                businessLines: ['MSBs'], // Assume MSB if they filled this specific form.
                employees: [],
            };
            // Save this new profile
            updateProfile(tenantId, profile);
        }
    }
    return profile;
};

export const updateProfile = (tenantId: string, updatedProfile: CompanyProfile): CompanyProfile => {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.tenantId === tenantId);

    if (index > -1) {
        profiles[index] = updatedProfile;
    } else {
        profiles.push(updatedProfile);
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return updatedProfile;
}
