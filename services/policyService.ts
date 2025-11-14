import type { Policy, SuggestedChange } from '../types';
import { fetchApi } from './api';
import { analyzePolicyAndSuggestChanges } from './geminiService';
import { getOnboardingData } from './onboardingService';

// This is a temporary store for simulated policies so they don't get lost on re-render.
// In a real app, this would be handled by the backend.
const SIMULATED_POLICY_STORE: { [id: string]: Policy } = {};

// --- NEW INTERFACE and FUNCTION as requested ---
export interface ApiPolicy {
  id: string;
  client_id: string;
  title: string;
  content?: string;
  markdown?: string;
  master_prompt_id?: string;
  language: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export const createPolicy = async (data: {
  client_id: string;
  title: string;
  master_prompt_id?: string;
  content?: string;
  markdown?: string;
  language?: string;
  status?: string;
}): Promise<ApiPolicy> => {
  return fetchApi<ApiPolicy>('/api/v1/policies', {
    method: 'POST',
    body: data
  });
};
// --- END NEW ---

export const getPolicies = (tenantId: string): Promise<Policy[]> => {
    return fetchApi<Policy[]>(`/policies/client/${tenantId}`);
};

export const getPolicyById = async (id: string): Promise<Policy | undefined> => {
    if (id.startsWith('simulated-')) {
        return Promise.resolve(SIMULATED_POLICY_STORE[id]);
    }
    return fetchApi<Policy>(`/policies/${id}`);
}

export const getTenants = async (): Promise<{ id: string, name: string }[]> => {
    try {
        const clients = await fetchApi<any[]>('/clients');
        return clients.map(client => ({
            id: client.client_id,
            name: client.company_name,
        }));
    } catch (e) {
        console.error("Failed to fetch tenants", e);
        return [];
    }
}

export const generatePolicy = async (companyName: string, customPrompt: string | null): Promise<{ policy_text: string }> => {
    return fetchApi<{ policy_text: string }>('/generate', {
        method: "POST",
        body: { company_name: companyName, custom_prompt: customPrompt, language: "en" },
    });
};

export const createPolicyWithAnalysis = async (policyName: string, policyText: string, tenantId: string): Promise<Policy> => {
  
  // 1. Get client's onboarding data for context
  const onboardingData = await getOnboardingData(tenantId);
  
  // 2. Get AI-generated suggestions
  const suggestions = await analyzePolicyAndSuggestChanges(policyText, onboardingData);

  // 3. Create the new simulated policy with a review object
  console.warn("API does not support POST /policies. Simulating policy creation with review data.");
  
  const newReview = {
      id: `review-${Date.now()}`,
      policyId: `simulated-${Date.now()}`,
      triggeredBy: 'Initial Upload Analysis',
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      changes: suggestions.map((s, index) => ({
          ...s,
          id: `change-${Date.now()}-${index}`,
          status: 'pending' as const,
      })),
  };

  const simulatedPolicy: Policy = {
      id: newReview.policyId,
      name: policyName,
      tenantId: tenantId,
      currentVersion: 1,
      status: 'Review Required',
      versions: [{ version: 1, text: policyText, createdAt: new Date().toISOString() }],
      review: newReview, // Attach the review object
  };

  SIMULATED_POLICY_STORE[simulatedPolicy.id] = simulatedPolicy; // Store it
  return Promise.resolve(simulatedPolicy);
};

export const finalizePolicyUpdate = async (policy: Policy, finalChanges: SuggestedChange[]): Promise<Policy> => {
    const { id } = policy;
    const originalText = policy.versions.find(v => v.version === policy.currentVersion)?.text || '';

    if (!originalText) {
        throw new Error("Could not find the original text for this policy version.");
    }

    // Build the new text from the accepted/modified changes
    let newText = originalText;
    const acceptedOrModified = finalChanges.filter(c => c.status === 'accepted' || c.status === 'modified');
    
    // Apply changes sequentially.
    acceptedOrModified.forEach(change => {
        const textToApply = change.status === 'modified' ? change.modifiedText : change.suggestedText;
        if (textToApply) {
            newText = newText.replace(change.originalText, textToApply);
        }
    });

    // Simulate the update since there is no PUT /policies/{id} endpoint
    console.warn(`API does not support PUT /policies/${id}. Simulating policy update.`);
    const updatedPolicy: Policy = {
        ...policy,
        status: 'Active',
        review: undefined, // Clear the review object
        currentVersion: policy.currentVersion + 1,
        versions: [
            ...policy.versions,
            { version: policy.currentVersion + 1, text: newText, createdAt: new Date().toISOString() }
        ]
    };

    if (updatedPolicy.id.startsWith('simulated-')) {
        delete SIMULATED_POLICY_STORE[updatedPolicy.id]; // Clean up after finalization
    }
    
    return Promise.resolve(updatedPolicy);
}