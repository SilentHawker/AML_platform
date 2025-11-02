import React, { useState, useEffect, useMemo } from 'react';
import { getPendingPolicyReview, getPolicyById, finalizePolicyUpdate } from '../services/policyService';
import type { Policy, PolicyReview, SuggestedChange } from '../types';
import Spinner from './Spinner';
import ChangeCard from './ChangeCard';
import FullPolicyView from './FullPolicyView';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ReviewChangesProps {
  policyId: string;
  tenantId: string;
  onBack: () => void;
  onComplete: () => void;
}

type ViewMode = 'segmented' | 'document';

const ReviewChanges: React.FC<ReviewChangesProps> = ({ policyId, tenantId, onBack, onComplete }) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [review, setReview] = useState<PolicyReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('document');
  
  // Create a component-level state to manage the changes during the review
  const [changes, setChanges] = useState<SuggestedChange[]>([]);

  useEffect(() => {
    // When the component loads or the policyId changes, refetch everything.
    // This is especially important after a new policy upload.
    setIsLoading(true);
    const policyData = getPolicyById(policyId, tenantId);
    const reviewData = getPendingPolicyReview(policyId);
    if (policyData) {
      setPolicy(policyData);
      // A policy might exist without a review if all findings were compliant
      if (reviewData) {
          setReview(reviewData);
          setChanges(reviewData.changes.map(c => ({...c}))); // Deep copy for local state
      } else {
          setReview(null);
          setChanges([]);
      }
    }
    setIsLoading(false);
  }, [policyId, tenantId]);

  const handleUpdateChange = (updatedChange: SuggestedChange) => {
    setChanges(prevChanges => 
      prevChanges.map(c => c.id === updatedChange.id ? updatedChange : c)
    );
  };
  
  const handleAcceptAll = () => {
    setChanges(prevChanges => 
      prevChanges.map(c => 
        c.status === 'pending' ? { ...c, status: 'accepted' } : c
      )
    );
  };

  const reviewedCount = useMemo(() => {
    return changes.filter(c => c.status !== 'pending').length;
  }, [changes]);

  const totalCount = changes.length;
  const isReviewComplete = reviewedCount === totalCount;
  const progressPercentage = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;
  
  const originalPolicyText = useMemo(() => {
    if (!policy) return '';
    const latestVersion = policy.versions.find(v => v.version === policy.currentVersion);
    return latestVersion?.text || '';
  }, [policy]);

  const handleFinalize = () => {
    if (!policy) return;
    setIsFinalizing(true);
    
    // FIX: Ensure updatedText starts as a string to prevent runtime errors.
    // This handles cases where data might be corrupted (e.g. in localStorage).
    let updatedText = originalPolicyText;
    
    const acceptedChanges = changes.filter(c => c.status === 'accepted' || c.status === 'modified');

    acceptedChanges.forEach(change => {
        // FIX: Safely determine the text to insert, providing a fallback.
        // Removes the risky non-null assertion (!) and handles undefined gracefully.
        const textToInsert = (change.status === 'modified' ? change.modifiedText : change.suggestedText) || '';
        if (change.originalText) {
            updatedText = updatedText.replace(change.originalText, textToInsert);
        }
    });

    try {
        finalizePolicyUpdate(policy.id, tenantId, updatedText, changes);
        setTimeout(() => { // Simulate network delay
            onComplete();
        }, 1000);
    } catch(e) {
        console.error("Failed to finalize policy:", e);
        setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8"><Spinner /></div>;
  }

  if (!policy) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-gray-600">Could not load the policy or review details for this client.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="border-b pb-4 mb-4">
            <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-2">&larr; Back to Dashboard</button>
            <h2 className="text-2xl font-bold text-gray-800">Reviewing: {policy.name}</h2>
            <p className="text-sm text-gray-500">Triggered by: <strong>{review?.triggeredBy ?? 'Initial Analysis'}</strong></p>
        </div>
        
        {/* Progress Bar */}
        {totalCount > 0 && (
          <div>
              <div className="flex justify-between items-center mb-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Review Progress</h3>
                    <span className="text-sm font-medium text-gray-600">{reviewedCount} of {totalCount} changes reviewed</span>
                  </div>
                  <button
                    onClick={handleAcceptAll}
                    disabled={isReviewComplete}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Accept All Pending
                  </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
          </div>
        )}
      </div>
      
      {/* View Toggler */}
      {totalCount > 0 && (
        <div className="flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
                <button
                    onClick={() => setViewMode('segmented')}
                    className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-lg transition-colors ${
                        viewMode === 'segmented'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    } focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                    Segmented View
                </button>
                <button
                    onClick={() => setViewMode('document')}
                    className={`-ml-px px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-lg transition-colors ${
                        viewMode === 'document'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    } focus:z-10 focus:ring-2 focus:ring-blue-500`}
                >
                    Full Document View
                </button>
            </div>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-800 mt-4">No Compliance Issues Found</h3>
            <p className="text-gray-600 mt-2">Our analysis did not find any non-compliant sections in this policy. No changes are required.</p>
        </div>
      ) : viewMode === 'segmented' ? (
        <div className="space-y-4">
          {changes.map(change => (
            <ChangeCard 
              key={change.id}
              change={change}
              onUpdate={handleUpdateChange}
            />
          ))}
        </div>
      ) : (
        <FullPolicyView
            originalText={originalPolicyText}
            changes={changes}
        />
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 sticky bottom-4">
          <div className="flex items-center justify-between">
              <div>
                  <h4 className="font-semibold">{isReviewComplete ? "Review Complete!" : "Finish Review"}</h4>
                  <p className="text-sm text-gray-600">{isReviewComplete ? "You can now finalize the document." : "Please address all suggestions to proceed."}</p>
              </div>
              <button
                onClick={handleFinalize}
                disabled={!isReviewComplete || isFinalizing}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isFinalizing ? <><Spinner /> Finalizing...</> : 'Finalize & Save New Version'}
              </button>
          </div>
      </div>
    </div>
  );
};

export default ReviewChanges;