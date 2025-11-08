
import React, { useState, useMemo } from 'react';
import type { OnboardingData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { saveOnboardingData } from '../services/onboardingService';
import { getOnboardingData } from '../services/onboardingService';
import { completeUserOnboarding } from '../services/authService';

// --- Helper Components for Form Fields ---

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const TextInput: React.FC<TextInputProps> = ({ label, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input id={name} name={name} {...props} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
const TextArea: React.FC<TextAreaProps> = ({ label, name, ...props }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea id={name} name={name} {...props} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
    </div>
);


interface CheckboxGroupProps {
  legend: string;
  name: keyof OnboardingData;
  options: string[];
  value: string[];
  onChange: (name: keyof OnboardingData, value: string[]) => void;
}
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ legend, name, options, value, onChange }) => {
  const handleChange = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange(name, newValue);
  };
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700">{legend}</legend>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map(option => (
          <div key={option} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option}`}
                name={name}
                type="checkbox"
                value={option}
                checked={value.includes(option)}
                onChange={() => handleChange(option)}
                className="focus:ring-blue-500 h-4 w-4 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor={`${name}-${option}`} className="font-medium text-gray-700">{option}</label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

interface RadioGroupProps {
  legend: string;
  name: keyof OnboardingData;
  value: boolean;
  onChange: (name: keyof OnboardingData, value: boolean) => void;
}
const RadioGroup: React.FC<RadioGroupProps> = ({ legend, name, value, onChange }) => (
    <div>
        <legend className="block text-sm font-medium text-gray-700">{legend}</legend>
        <div className="mt-2 flex items-center space-x-6">
            <label className="flex items-center space-x-2">
                <input type="radio" name={name} checked={value === true} onChange={() => onChange(name, true)} className="focus:ring-blue-500 h-4 w-4 border-gray-300" />
                <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
                <input type="radio" name={name} checked={value === false} onChange={() => onChange(name, false)} className="focus:ring-blue-500 h-4 w-4 border-gray-300" />
                <span>No</span>
            </label>
        </div>
    </div>
);


// --- Main Onboarding Component ---

interface OnboardingProps {
  onImpersonationComplete?: () => void;
  onComplete?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onImpersonationComplete, onComplete }) => {
  const { user, completeOnboarding, impersonatedTenant } = useAuth();
  const [step, setStep] = useState(1);
  const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;
  const [isEditing] = useState(() => activeTenantId ? !!getOnboardingData(activeTenantId) : false);

  const getInitialData = (): OnboardingData => {
    const existingData = activeTenantId ? getOnboardingData(activeTenantId) : null;
    const defaultData: OnboardingData = {
      company_legal_name: impersonatedTenant?.tenantName || user?.tenantName || '',
      operating_name: '',
      fintrac_reg_number: '',
      is_msb_registered: false,
      jurisdictions: [],
      delivery_channels: [],
      has_agents: false,
      agent_areas: '',
      msb_activities: [],
      corridors_profile: '',
      accepts_cash: false,
      uses_vc: false,
      fx_standalone: false,
      fx_rates: '',
      has_eft: false,
      eft_types: [],
      eft_24h_agg: false,
      has_instruments: false,
      lvctr_in_place: false,
      vc_travel_rule: false,
      vc_custody: '',
      client_types: [],
      id_methods: [],
      bo_verification: false,
      third_party_determination: false,
      risk_tiering: [],
      edd_applied: false,
      edd_measures: '',
      pep_hio_controls: false,
      reports_filed: [],
      twentyfour_rule_applies: false,
      travel_rule_applies: false,
      recordkeeping_mode: [],
      co_appointed: false,
      policies_up_to_date: false,
      risk_assessment_exists: false,
      training_program: false,
      effectiveness_review: false,
      sanctions_screening: false,
      sanctions_tools: '',
      additional_notes: '',
    };
     return existingData ? { ...defaultData, ...existingData } : defaultData;
  };
  
  const [formData, setFormData] = useState<OnboardingData>(getInitialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: keyof OnboardingData, value: string[]) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: keyof OnboardingData, value: boolean) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const totalSteps = 8;
  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantIdToSaveFor = impersonatedTenant?.tenantId || user?.tenantId; 
    
    if (!tenantIdToSaveFor) {
        console.error("Cannot complete onboarding: tenant ID is missing.");
        return;
    }

    // Save the form data to its own storage
    saveOnboardingData(tenantIdToSaveFor, formData);
    
    // Now handle the UI update and user status change
    if (impersonatedTenant) {
        // It's an admin finishing for a client
        completeUserOnboarding(tenantIdToSaveFor); // Update the user in the mock DB
        onImpersonationComplete?.(); // Tell the parent component to refresh the impersonated user state
    } else {
        // It's a client finishing for themselves. The context function handles everything.
        completeOnboarding();
    }

    onComplete?.();
  };

  const showFxSection = useMemo(() => formData.msb_activities.includes('Foreign exchange dealing'), [formData.msb_activities]);
  const showRemittanceSection = useMemo(() => formData.msb_activities.includes('Remitting or transmitting funds'), [formData.msb_activities]);
  const showInstrumentsSection = useMemo(() => formData.msb_activities.includes('Issuing or redeeming money orders / traveller’s cheques / similar negotiable instruments'), [formData.msb_activities]);
  const showVcSection = useMemo(() => formData.msb_activities.includes('Dealing in virtual currency — Exchange service') || formData.msb_activities.includes('Dealing in virtual currency — Transfer service'), [formData.msb_activities]);
  
  const renderStepContent = () => {
    switch(step) {
      case 1: // Section A - Company & Registration
        return (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-semibold">Section A — Company & Registration</h3>
            <TextInput label="1. Legal name of the company" name="company_legal_name" value={formData.company_legal_name} onChange={handleInputChange} required />
            <TextInput label="2. Operating name (if different)" name="operating_name" value={formData.operating_name} onChange={handleInputChange} />
            <TextInput label="3. FINTRAC MSB/Foreign MSB registration number" name="fintrac_reg_number" value={formData.fintrac_reg_number} onChange={handleInputChange} required />
            <RadioGroup legend="4. Are you currently registered with FINTRAC as an MSB or Foreign MSB?" name="is_msb_registered" value={formData.is_msb_registered} onChange={handleRadioChange} />
            <CheckboxGroup legend="5. Where do you operate? (select all that apply)" name="jurisdictions" options={['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon', 'Outside Canada']} value={formData.jurisdictions} onChange={handleCheckboxChange} />
            <CheckboxGroup legend="6. Delivery channels in scope (select all that apply)" name="delivery_channels" options={['Retail location (owned)', 'Agents/Mandataries', 'Online web', 'Mobile app', 'Telephone', 'Third‑party kiosks', 'API partners']} value={formData.delivery_channels} onChange={handleCheckboxChange} />
            <RadioGroup legend="7. Do you maintain an agent/mandatary network?" name="has_agents" value={formData.has_agents} onChange={handleRadioChange} />
            {formData.has_agents && <TextArea label="8. List agent provinces/territories (if applicable)." name="agent_areas" value={formData.agent_areas} onChange={handleInputChange} />}
          </div>
        );
      case 2: // Section B - Business Activities
        return (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold">Section B — Business Activities</h3>
                <CheckboxGroup legend="9. Select your MSB activities (as defined under PCMLTFA) (select all that apply)" name="msb_activities" options={['Foreign exchange dealing', 'Remitting or transmitting funds', 'Issuing or redeeming money orders / traveller’s cheques / similar negotiable instruments', 'Dealing in virtual currency — Exchange service', 'Dealing in virtual currency — Transfer service', 'Crowdfunding platform services', 'Armoured car / transport of currency', 'Cheque cashing services']} value={formData.msb_activities} onChange={handleCheckboxChange} />
                <TextArea label="10. Main corridors (countries) and average transaction size" name="corridors_profile" value={formData.corridors_profile} onChange={handleInputChange} required />
                <RadioGroup legend="11. Do you accept cash at any point in the flow (own locations or agents)?" name="accepts_cash" value={formData.accepts_cash} onChange={handleRadioChange} />
                <RadioGroup legend="12. Do you accept, hold, or transfer virtual currency?" name="uses_vc" value={formData.uses_vc} onChange={handleRadioChange} />
            </div>
        );
      case 3: // Conditional Sections C, D, E, F
        return (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-semibold">Business Activity Details</h3>
                {!showFxSection && !showRemittanceSection && !showInstrumentsSection && !showVcSection && <p className="text-gray-600">No additional details required based on your selected activities.</p>}
                {showFxSection && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h4 className="font-semibold text-gray-800">Section C — Foreign Exchange</h4>
                        <RadioGroup legend="13. [FX] Do you perform stand‑alone foreign exchange (outside remittances)?" name="fx_standalone" value={formData.fx_standalone!} onChange={handleRadioChange} />
                        <TextArea label="14. [FX] How are FX rates sourced and applied? (e.g., provider, rate timestamping)" name="fx_rates" value={formData.fx_rates} onChange={handleInputChange} />
                    </div>
                )}
                {showRemittanceSection && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h4 className="font-semibold text-gray-800">Section D — Remittance / EFT</h4>
                        <RadioGroup legend="15. [Remittance] Do you send or receive international EFTs?" name="has_eft" value={formData.has_eft!} onChange={handleRadioChange} />
                        <CheckboxGroup legend="16. [Remittance] EFT type(s) handled" name="eft_types" options={['Outgoing (EFTO)', 'Incoming (EFTI)', 'SWIFT MT103 via bank', 'Non‑SWIFT networks']} value={formData.eft_types!} onChange={handleCheckboxChange} />
                        <RadioGroup legend="17. [Remittance] Do you aggregate transfers to apply the 24‑hour rule company‑wide (incl. agents)?" name="eft_24h_agg" value={formData.eft_24h_agg!} onChange={handleRadioChange} />
                    </div>
                )}
                {showInstrumentsSection && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h4 className="font-semibold text-gray-800">Section E — Negotiable Instruments</h4>
                        <RadioGroup legend="18. [Negotiable instruments] Do you issue or redeem money orders/traveller’s cheques?" name="has_instruments" value={formData.has_instruments!} onChange={handleRadioChange} />
                    </div>
                )}
                {showVcSection && (
                    <div className="p-4 border rounded-md space-y-4">
                        <h4 className="font-semibold text-gray-800">Section F — Virtual Currency</h4>
                        <RadioGroup legend="19. [VC] Do you file LVCTR (≥ CAD 10,000 equivalent) when applicable?" name="lvctr_in_place" value={formData.lvctr_in_place!} onChange={handleRadioChange} />
                        <RadioGroup legend="20. [VC] Travel Rule controls implemented for VCT?" name="vc_travel_rule" value={formData.vc_travel_rule!} onChange={handleRadioChange} />
                        <TextArea label="21. [VC] Describe custody setup (hot/cold wallets, VASP partners, chain analytics tools)." name="vc_custody" value={formData.vc_custody} onChange={handleInputChange} />
                    </div>
                )}
            </div>
        );
      case 4: // Section G, H
        return (
            <div className="space-y-6 animate-fade-in">
                 <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Section G — KYC & Identification</h3>
                    <CheckboxGroup legend="22. Client types onboarded (select all that apply)" name="client_types" options={['Individuals', 'Sole proprietors', 'Corporations', 'Trusts', 'Partnerships', 'Charities/Non‑profits', 'Public bodies']} value={formData.client_types} onChange={handleCheckboxChange} />
                    <CheckboxGroup legend="23. ID verification methods you use/allow (select all that apply)" name="id_methods" options={['Government‑issued photo ID (in‑person)', 'Credit file method', 'Dual‑process method', 'Affiliate/member method', 'Reliance on another reporting entity', 'Agent/mandatary performs verification', 'Entity — confirmation of existence', 'Entity — simplified identification (where permitted)']} value={formData.id_methods} onChange={handleCheckboxChange} />
                    <RadioGroup legend="24. Do you verify beneficial ownership for entities and record control structure?" name="bo_verification" value={formData.bo_verification} onChange={handleRadioChange} />
                    <RadioGroup legend="25. Do you determine third‑party involvement for LCTs and other prescribed transactions?" name="third_party_determination" value={formData.third_party_determination} onChange={handleRadioChange} />
                </div>
                 <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-xl font-semibold">Section H — Ongoing Monitoring & EDD</h3>
                    <CheckboxGroup legend="26. How do you tier risk and set monitoring frequency? (select all that apply)" name="risk_tiering" options={['Low/Standard', 'Medium', 'High', 'Prohibited']} value={formData.risk_tiering} onChange={handleCheckboxChange} />
                    <RadioGroup legend="27. Is EDD applied for high‑risk clients/transactions and PEPs/HIOs?" name="edd_applied" value={formData.edd_applied} onChange={handleRadioChange} />
                    {formData.edd_applied && <TextArea label="28. List EDD measures used (e.g., source of funds, senior management approval, tighter limits)." name="edd_measures" value={formData.edd_measures} onChange={handleInputChange} />}
                </div>
            </div>
        );
        case 5: // Section I, J, K
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Section I — PEPs/HIOs</h3>
                        <RadioGroup legend="29. Do you screen for PEPs/HIOs and apply required measures for EFT ≥ CAD 100,000?" name="pep_hio_controls" value={formData.pep_hio_controls} onChange={handleRadioChange} />
                    </div>
                     <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-xl font-semibold">Section J — Reporting & Thresholds</h3>
                        <CheckboxGroup legend="30. Reports you file (select all that apply)" name="reports_filed" options={['STR/DOD — Suspicious Transaction Reports', 'LCTR — Large Cash Transaction Reports', 'LVCTR — Large Virtual Currency Transaction Reports', 'EFTI/EFTO — International EFT Reports', 'TPR — Terrorist Property Reports', 'Listed person/entity property reports', 'Suspected sanctions evasion notifications']} value={formData.reports_filed} onChange={handleCheckboxChange} />
                        <RadioGroup legend="31. Do you apply the 24‑hour rule for LCTR/LVCTR/EFT company‑wide (incl. agents)?" name="twentyfour_rule_applies" value={formData.twentyfour_rule_applies} onChange={handleRadioChange} />
                        <RadioGroup legend="32. Do you enforce the Travel Rule for EFTs and (if applicable) VCTs?" name="travel_rule_applies" value={formData.travel_rule_applies} onChange={handleRadioChange} />
                    </div>
                     <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-xl font-semibold">Section K — Recordkeeping</h3>
                        <CheckboxGroup legend="33. Recordkeeping — storage & retention (select all that apply)" name="recordkeeping_mode" options={['Digital (centralized)', 'Digital (hybrid with agents)', 'Paper (on‑site)', 'Retention period configured to FINTRAC requirements', 'Retrievable within statutory timeframe']} value={formData.recordkeeping_mode} onChange={handleCheckboxChange} />
                    </div>
                </div>
            );
        case 6: // Section L, M
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Section L — Compliance Program (Five Elements)</h3>
                        <RadioGroup legend="34. Have you appointed a Compliance Officer with authority/resources?" name="co_appointed" value={formData.co_appointed} onChange={handleRadioChange} />
                        <RadioGroup legend="35. Written policies & procedures kept up to date and approved by a senior officer?" name="policies_up_to_date" value={formData.policies_up_to_date} onChange={handleRadioChange} />
                        <RadioGroup legend="36. Enterprise‑wide ML/TF risk assessment documented and refreshed at least biennially?" name="risk_assessment_exists" value={formData.risk_assessment_exists} onChange={handleRadioChange} />
                        <RadioGroup legend="37. Ongoing AML/ATF training program documented and tracked?" name="training_program" value={formData.training_program} onChange={handleRadioChange} />
                        <RadioGroup legend="38. Biennial effectiveness review completed (internal or external, independent)?" name="effectiveness_review" value={formData.effectiveness_review} onChange={handleRadioChange} />
                    </div>
                     <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-xl font-semibold">Section M — Sanctions</h3>
                        <RadioGroup legend="39. Do you screen against Canadian sanctions lists and global watchlists before/during transactions?" name="sanctions_screening" value={formData.sanctions_screening} onChange={handleRadioChange} />
                        <TextArea label="40. Name sanctions screening providers/tools (if any)." name="sanctions_tools" value={formData.sanctions_tools} onChange={handleInputChange} />
                    </div>
                </div>
            );
        case 7: // Section N - Wrap up
            return (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-semibold">Section N — Wrap‑up</h3>
                    <TextArea label="41. Anything else we should know about your operations, products, or controls?" name="additional_notes" value={formData.additional_notes} onChange={handleInputChange} />
                </div>
            );
        case 8: // Review
            return (
                <div className="animate-fade-in space-y-4">
                    <h3 className="text-2xl font-semibold text-center">Review Your Answers</h3>
                    <div className="space-y-3 p-4 border rounded-lg bg-gray-50 max-h-[60vh] overflow-y-auto">
                        {Object.entries(formData).map(([key, value]) => (
                             <div key={key} className="text-sm border-b pb-2">
                                 <p className="font-bold text-gray-700 capitalize">{key.replace(/_/g, ' ')}</p>
                                 <p className="text-gray-600 pl-2">
                                     {Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
                                 </p>
                             </div>
                        ))}
                    </div>
                </div>
            );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">Client Onboarding Questionnaire</h1>
      <p className="text-center text-gray-600 mb-8">MSB AML/ATF Intake (Canada) — FINTRAC Core Questionnaire</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
      </div>
      
      <form onSubmit={handleSubmit} className="min-h-[400px]">
        {renderStepContent()}
        
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <div className="flex items-center space-x-3">
                 <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Back
                 </button>
                 {onComplete && (
                    <button
                        type="button"
                        onClick={onComplete}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                 )}
            </div>
            
            <div>
                {step < totalSteps && (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                  >
                    {step === totalSteps - 1 ? 'Review Answers' : 'Next'}
                  </button>
                )}

                {step === totalSteps && (
                    <button
                        type="submit"
                        className="px-6 py-2 font-semibold text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700"
                    >
                        {isEditing ? 'Save Changes' : 'Submit Questionnaire'}
                    </button>
                )}
            </div>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
