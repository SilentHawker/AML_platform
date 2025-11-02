export interface User {
  id: string;
  email: string;
  role: 'client' | 'manager' | 'admin';
  tenantId: string;
  tenantName: string;
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
}

export interface Regulation {
  id: string;
  name: string;
  link: string;
  interpretation: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Finding {
  regulation: string;
  policySection: string;
  originalText: string;
  analysis: string;
  suggestion: string;
  isCompliant: boolean;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  findings: Finding[];
}