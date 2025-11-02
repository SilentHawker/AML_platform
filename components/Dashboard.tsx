import React, { useState, useEffect } from 'react';
import type { Policy } from '../types';
import { getPolicies } from '../services/policyService';
import PolicyManager from './PolicyManager';
import ReviewChanges from './ReviewChanges';
import Spinner from './Spinner';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from './AdminPanel';

const Dashboard: React.FC = () => {
  const { user, impersonatedTenant } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingPolicyId, setReviewingPolicyId] = useState<string | null>(null);

  const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;

  const fetchPolicies = () => {
    if (activeTenantId) {
      const userPolicies = getPolicies(activeTenantId);
      setPolicies(userPolicies);
    }
  };

  useEffect(() => {
    // Refetch policies whenever the active tenant changes (e.g., admin impersonation)
    setIsLoading(true);
    fetchPolicies();
    setIsLoading(false);
  }, [activeTenantId]);

  const handleStartReview = (policyId: string) => {
    setReviewingPolicyId(policyId);
  };

  const handleFinishReview = () => {
    setReviewingPolicyId(null);
    // Refetch policies to show updated status and version
    fetchPolicies(); 
  };
  
  if (isLoading || !user) {
    return <div className="text-center p-8"><Spinner /></div>;
  }

  // Admin View: Not impersonating
  if (user.role === 'admin' && !impersonatedTenant) {
    return <AdminPanel />;
  }

  // Client/Manager/Impersonating Admin View
  return (
    <div className="space-y-8">
      {reviewingPolicyId && activeTenantId ? (
        <ReviewChanges 
          policyId={reviewingPolicyId} 
          tenantId={activeTenantId}
          onBack={() => setReviewingPolicyId(null)}
          onComplete={handleFinishReview}
        />
      ) : (
        <PolicyManager 
          policies={policies}
          onStartReview={handleStartReview}
        />
      )}
    </div>
  );
};

export default Dashboard;