export type BusinessLine = 'MSBs' | 'Securities Dealers' | 'Financial Entities' | 'Casinos';

export interface User {
  id: string;
  email: string;
  role: 'client' | 'manager' | 'admin';
  tenantId: string;
  tenantName: string;
  hasCompletedOnboarding: boolean;
}

export interface OnboardingData {
  // Section A
  company_legal_name: string;
  operating_name?: string;
  fintrac_reg_number: string;
  is_msb_registered: boolean;
  jurisdictions: string[];
  delivery_channels: string[];
  has_agents: boolean;
  agent_areas?: string;

  // Section B
  msb_activities: string[];
  corridors_profile: string;
  accepts_cash: boolean;
  uses_vc: boolean;

  // Section C (Conditional)
  fx_standalone?: boolean;
  fx_rates?: string;

  // Section D (Conditional)
  has_eft?: boolean;
  eft_types?: string[];
  eft_24h_agg?: boolean;

  // Section E (Conditional)
  has_instruments?: boolean;

  // Section F (Conditional)
  lvctr_in_place?: boolean;
  vc_travel_rule?: boolean;
  vc_custody?: string;

  // Section G
  client_types: string[];
  id_methods: string[];
  bo_verification: boolean;
  third_party_determination: boolean;
  
  // Section H
  risk_tiering: string[];
  edd_applied: boolean;
  edd_measures?: string;

  // Section I
  pep_hio_controls: boolean;

  // Section J
  reports_filed: string[];
  twentyfour_rule_applies: boolean;
  travel_rule_applies: boolean;

  // Section K
  recordkeeping_mode: string[];

  // Section L
  co_appointed: boolean;
  policies_up_to_date: boolean;
  risk_assessment_exists: boolean;
  training_program: boolean;
  effectiveness_review: boolean;

  // Section M
  sanctions_screening: boolean;
  sanctions_tools?: string;

  // Section N
  additional_notes?: string;
}

export interface SuggestedChange {
  id:string;
  originalText: string;
  suggestedText: string;
  reason: string; // Why the change is suggested
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  modifiedText?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PolicyReview {
  id: string;
  policyId: string;
  triggeredBy: string; // e.g., 'FINTRAC Guideline Update 2024-07-26'
  createdAt: string;
  changes: SuggestedChange[];
  status: 'pending' | 'completed';
  completedAt?: string;
}

export interface Policy {
  id: string;
  name: string;
  tenantId: string;
  currentVersion: number;
  status: 'Active' | 'Review Required';
  versions: {
    version: number;
    text: string;
    createdAt: string;
  }[];
  // This will hold the pending review data for simulated policies
  review?: PolicyReview;
}

export interface Regulation {
  id: string;
  name: string;
  link: string;
  interpretation: string;
  isVerified: boolean;
  createdAt: string;
  businessLine: BusinessLine;
}

export interface AIModelConfig {
  id: string;
  modelName: string; // e.g., 'gemini-2.5-pro'
  apiKey: string; // Stored in localStorage for demo purposes ONLY.
  description: string; // User-friendly name, e.g., "Advanced Reasoning Model"
  isDefault: boolean;
  createdAt: string;
}

export type NotificationPreference = 'email' | 'inApp';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  notificationPreferences: NotificationPreference[];
}

export interface CompanyProfile {
  tenantId: string;
  legalName: string;
  operatingName?: string;
  fintracRegNumber: string;
  businessAddress: string;
  businessLines: BusinessLine[];
  employees: Employee[];
  // Assuming onboarding data is part of the client profile from the API
  onboardingData?: OnboardingData;
}