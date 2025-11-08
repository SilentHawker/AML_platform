
import React, { useState, useEffect } from 'react';
import type { Policy } from '../types';
import { getPolicies } from '../services/policyService';
import PolicyManager from './PolicyManager';
import ReviewChanges from './ReviewChanges';
import Spinner from './Spinner';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from './AdminPanel';
import Profile from './Profile';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import Onboarding from './Onboarding';


const Dashboard: React.FC = () => {
  const { user, impersonatedTenant } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingPolicyId, setReviewingPolicyId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'policies' | 'profile' | 'onboarding'>('policies');


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
  
  const handleStartOnboarding = () => {
    setActiveView('onboarding');
  };

  if (isLoading || !user) {
    return <div className="text-center p-8"><Spinner /></div>;
  }

  // Admin View: Not impersonating
  if (user.role === 'admin' && !impersonatedTenant) {
    return <AdminPanel />;
  }

  const renderCurrentView = () => {
    if (reviewingPolicyId && activeTenantId) {
        return (
            <ReviewChanges 
                policyId={reviewingPolicyId} 
                tenantId={activeTenantId}
                onBack={() => setReviewingPolicyId(null)}
                onComplete={handleFinishReview}
            />
        );
    }

    switch (activeView) {
        case 'policies':
            return <PolicyManager policies={policies} onStartReview={handleStartReview} />;
        case 'profile':
            return <Profile onStartOnboarding={handleStartOnboarding} />;
        case 'onboarding':
            return <Onboarding onComplete={() => setActiveView('profile')} />;
        default:
            return <PolicyManager policies={policies} onStartReview={handleStartReview} />;
    }
  };

  // Client/Manager/Impersonating Admin View
  return (
    <div className="space-y-4">
       {(!reviewingPolicyId && activeView !== 'onboarding') && (
          <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  <button
                      onClick={() => setActiveView('policies')}
                      className={`${
                          activeView === 'policies'
                              ? 'border-blue-600 text-blue-700'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                      <FileTextIcon className="h-5 w-5" />
                      <span>Policies</span>
                  </button>
                  <button
                      onClick={() => setActiveView('profile')}
                      className={`${
                          activeView === 'profile'
                              ? 'border-blue-600 text-blue-700'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                       <BriefcaseIcon className="h-5 w-5" />
                       <span>Company Profile</span>
                  </button>
              </nav>
          </div>
      )}
      {renderCurrentView()}
    </div>
  );
};

export default Dashboard;
