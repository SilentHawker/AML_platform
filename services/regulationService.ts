import type { Regulation } from '../types';

const MOCK_REGULATIONS: Regulation[] = [
    {
        id: 'reg-001',
        name: 'FINTRAC Guideline 6G: Record Keeping',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/overview-apercu/FINTRAC_Guideline_6G-eng',
        interpretation: 'Requires financial entities to keep detailed records of large cash transactions, electronic funds transfers, and virtual currency transactions over certain thresholds. Records must be kept for at least 5 years and be readily available for FINTRAC examination.',
        isVerified: true,
        createdAt: '2024-07-01T10:00:00Z',
    },
    {
        id: 'reg-002',
        name: 'PCMLTFA Section 5: Reporting of Suspicious Transactions',
        link: 'https://laws-lois.justice.gc.ca/eng/acts/p-24.501/page-1.html#h-1030998',
        interpretation: 'Mandates the reporting of any financial transaction where there are reasonable grounds to suspect it is related to the commission of a money laundering or terrorist financing offense. This reporting must be done promptly and includes detailed information about the transaction and the parties involved.',
        isVerified: true,
        createdAt: '2024-07-01T10:00:00Z',
    },
    {
        id: 'reg-003',
        name: 'FINTRAC Guideline 1: Submitting Reports',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/report-declarer/Guide1/1-eng',
        interpretation: 'Specifies the technical requirements and timelines for submitting Large Cash Transaction Reports (LCTRs), Suspicious Transaction Reports (STRs), and other required reports to FINTRAC. It details the required fields and submission methods.',
        isVerified: false,
        createdAt: '2024-07-01T10:00:00Z',
    },
];

const initializeData = () => {
    if (!localStorage.getItem('regulations')) {
        localStorage.setItem('regulations', JSON.stringify(MOCK_REGULATIONS));
    }
};

initializeData();

export const getRegulations = (): Regulation[] => {
    const regulations = localStorage.getItem('regulations');
    return regulations ? JSON.parse(regulations) : [];
};

export const addRegulation = (data: Omit<Regulation, 'id' | 'createdAt'>): Regulation => {
    const regulations = getRegulations();
    const newRegulation: Regulation = {
        ...data,
        id: `reg-${new Date().getTime()}`,
        createdAt: new Date().toISOString(),
    };
    regulations.push(newRegulation);
    localStorage.setItem('regulations', JSON.stringify(regulations));
    return newRegulation;
};

export const updateRegulation = (updatedRegulation: Regulation): Regulation => {
    let regulations = getRegulations();
    const index = regulations.findIndex(r => r.id === updatedRegulation.id);
    if (index === -1) {
        throw new Error('Regulation not found');
    }
    regulations[index] = updatedRegulation;
    localStorage.setItem('regulations', JSON.stringify(regulations));
    return updatedRegulation;
};
