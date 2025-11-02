import type { Policy, PolicyReview, SuggestedChange, AnalysisResult } from '../types';

const MOCK_POLICY_TEXT_V1 = `
AML Compliance Policy for Digital Assets Inc.
Version 1.0 - January 15, 2023

1. Introduction
This policy outlines the procedures for preventing money laundering.

2. Customer Identification Program (CIP)
We will verify the identity of any person seeking to open an account. For individuals, we will collect name, address, date of birth, and a government-issued ID.

3. Reporting
All cash transactions over $10,000 will be reported to FINTRAC. Suspicious activities will be monitored and reported promptly.

4. Cryptocurrency Transactions
Virtual currency transactions are treated like cash transactions for reporting thresholds. We will monitor blockchain analytics for suspicious patterns.
`;

const MOCK_POLICIES: Policy[] = [
    {
      id: 'policy-001',
      name: 'ACME Corp AML Policy',
      tenantId: 'acme-corp',
      currentVersion: 1,
      status: 'Review Required',
      versions: [
        {
          version: 1,
          text: MOCK_POLICY_TEXT_V1,
          createdAt: '2023-01-15T10:00:00Z',
        },
      ],
    },
    {
        id: 'policy-002',
        name: 'Stark Industries AML Policy',
        tenantId: 'stark-ind',
        currentVersion: 1,
        status: 'Active',
        versions: [
          {
            version: 1,
            text: "1. We follow all the rules.",
            createdAt: '2024-05-20T10:00:00Z',
          },
        ],
      },
];

const MOCK_REVIEWS: PolicyReview[] = [
    {
        id: 'review-001',
        policyId: 'policy-001',
        triggeredBy: 'FINTRAC Guideline Update 2024-07-26: Enhanced Crypto Reporting',
        createdAt: '2024-07-28T09:00:00Z',
        status: 'pending',
        changes: [
            {
                id: 'change-001',
                originalText: 'Virtual currency transactions are treated like cash transactions for reporting thresholds.',
                suggestedText: 'All virtual currency transactions, regardless of amount, require enhanced due diligence. Transactions equivalent to $1,000 CAD or more must be reported to FINTRAC within 24 hours.',
                reason: 'The new FINTRAC guidelines lower the reporting threshold for crypto and mandate faster reporting times to address the high-risk nature of virtual assets.',
                status: 'pending',
                severity: 'Critical',
            },
            {
                id: 'change-002',
                originalText: 'We will monitor blockchain analytics for suspicious patterns.',
                suggestedText: 'We will utilize a certified third-party blockchain analytics provider to actively monitor all wallet interactions for connections to sanctioned addresses, mixers, or illicit activities. Alerts must be reviewed by a compliance officer within 8 hours.',
                reason: 'Regulators now require a more proactive and tool-based approach to blockchain monitoring, including specified review timelines for alerts.',
                status: 'pending',
                severity: 'High',
            },
            {
                id: 'change-003',
                originalText: 'For individuals, we will collect name, address, date of birth, and a government-issued ID.',
                suggestedText: 'For individuals, we will collect name, address, date of birth, and a government-issued ID. Additionally, we will conduct a liveness check and biometric verification using a trusted third-party service during onboarding.',
                reason: 'To combat identity fraud in remote onboarding, enhanced digital identity verification methods are now considered a best practice under the new guidelines.',
                status: 'pending',
                severity: 'Medium',
            }
        ]
    }
];

// Initialize with mock data if none exists
const initializeData = () => {
    if (!localStorage.getItem('policies')) {
        localStorage.setItem('policies', JSON.stringify(MOCK_POLICIES));
    }
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify(MOCK_REVIEWS));
    }
}

initializeData();

const getAllPolicies = (): Policy[] => {
    const policies = localStorage.getItem('policies');
    return policies ? JSON.parse(policies) : [];
}

const getAllReviews = (): PolicyReview[] => {
    const reviews = localStorage.getItem('reviews');
    return reviews ? JSON.parse(reviews) : [];
}

export const getPolicies = (tenantId: string): Policy[] => {
    return getAllPolicies().filter(p => p.tenantId === tenantId);
};

export const getPolicyById = (id: string, tenantId: string): Policy | undefined => {
    const policies = getPolicies(tenantId);
    return policies.find(p => p.id === id);
}

export const getTenants = (): { id: string, name: string }[] => {
    // In a real app, this would be a separate API call. Here we derive it from policies and users.
    const policies = getAllPolicies();
    const tenants = new Map<string, string>();
    policies.forEach(p => {
        // A simple way to get a tenant name - in a real app, tenant would be its own entity.
        const tenantName = p.name.split(' ')[0] + " " + p.name.split(' ')[1];
        if (!tenants.has(p.tenantId)) {
            tenants.set(p.tenantId, tenantName);
        }
    });
    // Add known tenants that might not have policies yet
    if (!tenants.has('acme-corp')) tenants.set('acme-corp', 'ACME Corporation');
    if (!tenants.has('stark-ind')) tenants.set('stark-ind', 'Stark Industries');
    
    return Array.from(tenants, ([id, name]) => ({ id, name }));
}

export const getPendingPolicyReview = (policyId: string): PolicyReview | undefined => {
    return getAllReviews().find(r => r.policyId === policyId && r.status === 'pending');
};

export const getReviewHistory = (policyId: string): PolicyReview[] => {
    return getAllReviews()
        .filter(r => r.policyId === policyId && r.status === 'completed')
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
};

export const createPolicyAndReview = (policyName: string, policyText: string, analysisResult: AnalysisResult, tenantId: string): Policy => {
  const allPolicies = getAllPolicies();
  const allReviews = getAllReviews();

  const newPolicyId = `policy-${new Date().getTime()}`;

  const newPolicy: Policy = {
    id: newPolicyId,
    name: policyName,
    tenantId: tenantId,
    currentVersion: 1,
    status: 'Review Required',
    versions: [
      {
        version: 1,
        text: policyText,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const newReview: PolicyReview = {
    id: `review-${new Date().getTime()}`,
    policyId: newPolicyId,
    triggeredBy: 'New Policy Upload & Analysis',
    createdAt: new Date().toISOString(),
    status: 'pending',
    changes: analysisResult.findings
      .filter(finding => !finding.isCompliant && finding.originalText) // Only create changes for non-compliant findings with original text
      .map((finding, index) => ({
        id: `change-${newPolicyId}-${index}`,
        originalText: finding.originalText,
        suggestedText: finding.suggestion,
        reason: finding.analysis,
        status: 'pending',
        severity: finding.severity,
      })),
  };
  
  // If there are no non-compliant findings, the policy is considered active.
  if (newReview.changes.length === 0) {
      newPolicy.status = 'Active';
  } else {
      allReviews.push(newReview);
  }

  allPolicies.push(newPolicy);

  localStorage.setItem('policies', JSON.stringify(allPolicies));
  localStorage.setItem('reviews', JSON.stringify(allReviews));

  return newPolicy;
};

export const finalizePolicyUpdate = (policyId: string, tenantId: string, newText: string, finalizedChanges: SuggestedChange[]): Policy => {
    const allPolicies = getAllPolicies();
    const policyIndex = allPolicies.findIndex(p => p.id === policyId && p.tenantId === tenantId);

    if (policyIndex === -1) {
        throw new Error('Policy not found for this tenant');
    }
    const policy = allPolicies[policyIndex];
    
    const newVersion = {
        version: policy.currentVersion + 1,
        text: newText,
        createdAt: new Date().toISOString()
    };

    policy.versions.push(newVersion);
    policy.currentVersion = newVersion.version;
    policy.status = 'Active';

    allPolicies[policyIndex] = policy;
    localStorage.setItem('policies', JSON.stringify(allPolicies));

    // Mark the review as completed instead of deleting it
    let allReviews = getAllReviews();
    const reviewIndex = allReviews.findIndex(r => r.policyId === policyId && r.status === 'pending');
    if (reviewIndex > -1) {
        allReviews[reviewIndex].status = 'completed';
        allReviews[reviewIndex].completedAt = new Date().toISOString();
        allReviews[reviewIndex].changes = finalizedChanges; // Save the final state of changes
        localStorage.setItem('reviews', JSON.stringify(allReviews));
    }

    return policy;
}