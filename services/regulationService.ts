
import type { Regulation } from '../types';

const MOCK_REGULATIONS: Regulation[] = [
    {
        id: 'reg-2024-01',
        name: 'Compliance program requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/compliance-conformite/Guide4/4-eng',
        interpretation: 'Outlines the five required elements of a compliance program: appointing a compliance officer, developing written policies and procedures, conducting a risk assessment, implementing a training program, and conducting a biennial effectiveness review.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-02',
        name: 'Client identification requirements for MSBs',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/client/msb-eng',
        interpretation: 'Specifies when and how Money Services Businesses must verify the identity of their clients, including individuals and entities, as part of their Know Your Client (KYC) obligations.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-03',
        name: 'Methods to verify the identity of persons and entities',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/Guide11/11-eng',
        interpretation: 'Details the acceptable methods for verifying client identity, including government-issued photo ID, credit file, dual-process, affiliate/member, and reliance methods for both individuals and entities.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-04',
        name: 'Beneficial ownership requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/BO-BO/eng',
        interpretation: 'Defines requirements for identifying and verifying the beneficial owners of corporations, trusts, and other entities to determine who ultimately owns or controls them.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-05',
        name: 'Business relationship requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/brr-eng',
        interpretation: 'Explains when a business relationship is established and the requirements that apply, including ongoing monitoring of transactions.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-06',
        name: 'Ongoing monitoring requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/omr-eng',
        interpretation: 'Details the obligation to conduct ongoing monitoring of all business relationships, including periodically reviewing client information and transaction patterns for high-risk clients.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-07',
        name: 'Enhanced Due Diligence (EDD) measures',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/omr-eng',
        interpretation: 'Requires taking special measures (Enhanced Due Diligence) for high-risk clients or transactions to mitigate money laundering risks, such as obtaining source of funds information and conducting more frequent monitoring.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-08',
        name: 'Third-party determination requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/tpdr-eng',
        interpretation: 'Outlines the requirement to determine if a transaction is being conducted on behalf of a third party and to obtain and record identifying information for that third party.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-09',
        name: 'Politically Exposed Persons (PEPs) and Heads of International Organizations (HIOs)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/client-clientele/pep/pep-non-acct-eng',
        interpretation: 'Specifies the obligations for determining if a client is a PEP or HIO, conducting enhanced due diligence, and obtaining senior management approval for high-risk relationships.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-10',
        name: 'Reporting suspicious transactions (STR)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/str-dod/str-dod-eng',
        interpretation: 'Mandates the submission of a Suspicious Transaction Report (STR) to FINTRAC within 30 days of detecting reasonable grounds to suspect a transaction is related to money laundering or terrorist financing.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-11',
        name: 'ML/TF Indicators for MSBs',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/indicators-indicateurs/msb_mltf-eng',
        interpretation: 'Provides a list of common red flags and indicators to help Money Services Businesses identify potentially suspicious transactions related to money laundering and terrorist financing.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-12',
        name: 'ML/TF Indicators for Virtual Currency Transactions',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/indicators-indicateurs/vc_mltf-eng',
        interpretation: 'Provides specific indicators of suspicious activity related to virtual currency transactions, such as the use of mixers/tumblers, transactions with known illicit addresses, and unusual funding patterns.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-13',
        name: 'Submitting Terrorist Property Reports (TPR)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/Guide5/5-eng',
        interpretation: 'Requires reporting entities to report property in their possession or control that they know is owned or controlled by or on behalf of a terrorist or a terrorist group.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-14',
        name: 'Reporting sanctions-related information',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/sanctions/sanctions-eng',
        interpretation: 'Clarifies the obligation to report suspected sanctions evasion activity and provides guidance on how this interacts with STR reporting obligations.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-15',
        name: 'FINTRAC Bulletin on Sanctions Evasion',
        link: 'https://fintrac-canafe.canada.ca/intel/bulletins/sanctions-eng',
        interpretation: 'Provides intelligence and indicators on how sanctioned countries and entities may attempt to evade sanctions through the financial system.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-16',
        name: 'Reporting large cash transactions (LCTR)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/lctr-doie/lctr-doie-eng',
        interpretation: 'Requires reporting the receipt of $10,000 CAD or more in cash in a single transaction or multiple transactions within a 24-hour period.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-17',
        name: 'Reporting large virtual currency transactions (LVCTR)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/lvctr/lvctr-eng',
        interpretation: 'Requires reporting the receipt of virtual currency equivalent to $10,000 CAD or more in a single transaction or multiple transactions within a 24-hour period.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-18',
        name: 'Reporting electronic funds transfers (EFTR)',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/eft-dt/eft-dt-eng',
        interpretation: 'Mandates reporting of international electronic funds transfers of $10,000 CAD or more, initiated at the request of a client, in a single transaction or multiple transactions within a 24-hour period.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-19',
        name: 'The 24-hour rule',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/24hour/1-eng',
        interpretation: 'Explains the requirement to aggregate multiple transactions of less than $10,000 made by or on behalf of the same person or entity within a 24-hour period that total $10,000 or more, and to file the appropriate large transaction report (LCTR, LVCTR, EFTR).',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-20',
        name: 'Travel Rule requirements',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/travel-acheminement/1-eng',
        interpretation: 'Requires financial intermediaries, including MSBs, to obtain and include specific originator and beneficiary information with electronic funds transfers (EFTs) and virtual currency transfers (VCTs) to ensure transparency.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-21',
        name: 'Record keeping requirements for MSBs',
        link: 'https://fintrac-canafe.canada.ca/guidance-directives/recordkeeping-document/record/msb-eng',
        interpretation: 'Details the specific records that Money Services Businesses must maintain, including client identification, transaction records, and business relationships, and specifies the minimum retention period of 5 years.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-2024-22',
        name: 'Ministerial Directives and Transaction Restrictions',
        link: 'https://fintrac-canafe.canada.ca/obligations/directives-eng',
        interpretation: 'Outlines special measures that the Minister of Finance can direct reporting entities to take regarding transactions originating from or destined to specific high-risk jurisdictions or involving designated persons.',
        isVerified: true,
        createdAt: '2024-08-01T10:00:00Z',
        // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
        businessLine: 'MSBs',
    },
    {
        id: 'reg-sd-01',
        name: 'IIROC Rule 1300 - Supervision',
        link: 'https://www.iiroc.ca/rules-and-enforcement/iiroc-rules/rule-1300',
        interpretation: 'Outlines the supervision requirements for dealer members, including developing and maintaining a supervisory system to ensure compliance with IIROC requirements and securities legislation.',
        isVerified: true,
        createdAt: '2024-08-01T11:00:00Z',
        businessLine: 'Securities Dealers',
    },
    {
        id: 'reg-sd-02',
        name: 'National Instrument 31-103 Registration Requirements',
        link: 'https://www.osc.ca/en/securities-law/instruments-rules-policies/3/31-103',
        interpretation: 'Establishes the registration requirements for firms and individuals in the securities industry, including proficiency, solvency, and compliance obligations.',
        isVerified: false,
        createdAt: '2024-08-01T11:05:00Z',
        businessLine: 'Securities Dealers',
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
