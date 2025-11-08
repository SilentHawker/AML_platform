
import React from 'react';
import type { OnboardingData } from '../types';

interface QuestionnaireDisplayProps {
    data: OnboardingData | null;
}

const QUESTION_LABELS: { [key in keyof OnboardingData]?: string } = {
    company_legal_name: "1. Legal name of the company",
    operating_name: "2. Operating name (if different)",
    fintrac_reg_number: "3. FINTRAC MSB/Foreign MSB registration number",
    is_msb_registered: "4. Are you currently registered with FINTRAC as an MSB or Foreign MSB?",
    jurisdictions: "5. Where do you operate?",
    delivery_channels: "6. Delivery channels in scope",
    has_agents: "7. Do you maintain an agent/mandatary network?",
    agent_areas: "8. List agent provinces/territories",
    msb_activities: "9. Select your MSB activities",
    corridors_profile: "10. Main corridors (countries) and average transaction size",
    accepts_cash: "11. Do you accept cash at any point?",
    uses_vc: "12. Do you accept, hold, or transfer virtual currency?",
    fx_standalone: "13. [FX] Do you perform stand‑alone foreign exchange?",
    fx_rates: "14. [FX] How are FX rates sourced and applied?",
    has_eft: "15. [Remittance] Do you send or receive international EFTs?",
    eft_types: "16. [Remittance] EFT type(s) handled",
    eft_24h_agg: "17. [Remittance] Do you aggregate transfers to apply the 24‑hour rule?",
    has_instruments: "18. [Negotiable instruments] Do you issue or redeem money orders/traveller’s cheques?",
    lvctr_in_place: "19. [VC] Do you file LVCTR?",
    vc_travel_rule: "20. [VC] Travel Rule controls implemented for VCT?",
    vc_custody: "21. [VC] Describe custody setup",
    client_types: "22. Client types onboarded",
    id_methods: "23. ID verification methods you use/allow",
    bo_verification: "24. Do you verify beneficial ownership for entities?",
    third_party_determination: "25. Do you determine third‑party involvement?",
    risk_tiering: "26. How do you tier risk and set monitoring frequency?",
    edd_applied: "27. Is EDD applied for high‑risk clients/transactions?",
    edd_measures: "28. List EDD measures used",
    pep_hio_controls: "29. Do you screen for PEPs/HIOs?",
    reports_filed: "30. Reports you file",
    twentyfour_rule_applies: "31. Do you apply the 24‑hour rule?",
    travel_rule_applies: "32. Do you enforce the Travel Rule?",
    recordkeeping_mode: "33. Recordkeeping — storage & retention",
    co_appointed: "34. Have you appointed a Compliance Officer?",
    policies_up_to_date: "35. Written policies & procedures kept up to date?",
    risk_assessment_exists: "36. Enterprise‑wide ML/TF risk assessment documented?",
    training_program: "37. Ongoing AML/ATF training program documented?",
    effectiveness_review: "38. Biennial effectiveness review completed?",
    sanctions_screening: "39. Do you screen against Canadian sanctions lists?",
    sanctions_tools: "40. Name sanctions screening providers/tools",
    additional_notes: "41. Anything else we should know?",
};

const Field: React.FC<{ label: string; value: any }> = ({ label, value }) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return null;
    }

    const displayValue = Array.isArray(value)
        ? value.join(', ')
        : typeof value === 'boolean'
        ? value ? 'Yes' : 'No'
        : String(value);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-sm text-gray-800 md:col-span-2">{displayValue}</p>
        </div>
    );
};


const QuestionnaireDisplay: React.FC<QuestionnaireDisplayProps> = ({ data }) => {
    if (!data) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No questionnaire data to display.</p>
            </div>
        );
    }
    return (
        <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-3">
            {Object.entries(QUESTION_LABELS).map(([key, label]) => (
                <Field key={key} label={label} value={data[key as keyof OnboardingData]} />
            ))}
        </div>
    );
};

export default QuestionnaireDisplay;
