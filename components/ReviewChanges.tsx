
import React, { useState, useEffect, useMemo } from 'react';
import { getPolicyById, finalizePolicyUpdate } from '../services/policyService';
import type { Policy, SuggestedChange } from '../types';
import Spinner from './Spinner';
import FullPolicyView from './FullPolicyView';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import ChangeCard from './ChangeCard';

interface ReviewChangesProps {
  policyId: string;
  tenantId: string; // tenantId may not be needed if policyId is globally unique
  onBack: () => void;
  onComplete: () => void;
}

const ReviewChanges: React.FC<ReviewChangesProps> = ({ policyId, onBack, onComplete }) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [changes, setChanges] = useState<SuggestedChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const policyData = await getPolicyById(policyId);
            if (policyData) {
                setPolicy(policyData);
                if (policyData.review) {
                  setChanges(policyData.review.changes);
                }
            } else {
                setError("Policy not found. If you reloaded the page, this temporary review may have been lost.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load policy.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchPolicy();
  }, [policyId]);

  const handleStatusChange = (changeId: string, newStatus: 'accepted' | 'rejected') => {
    setChanges(currentChanges =>
      currentChanges.map(c => (c.id === changeId ? { ...c, status: newStatus } : c))
    );
  };

  const handleFinalize = async () => {
    if (!policy) return;
    setIsFinalizing(true);
    try {
        await finalizePolicyUpdate(policy, changes);
        setTimeout(() => {
            onComplete();
        }, 1000);
    } catch(e: any) {
        console.error("Failed to finalize policy:", e);
        setError(e.message || "An unknown error occurred.");
        setIsFinalizing(false);
    }
  };

  const { acceptedCount, rejectedCount, pendingCount } = useMemo(() => {
    return changes.reduce((acc, c) => {
        if (c.status === 'accepted') acc.acceptedCount++;
        else if (c.status === 'rejected') acc.rejectedCount++;
        else acc.pendingCount++;
        return acc;
    }, { acceptedCount: 0, rejectedCount: 0, pendingCount: 0 });
  }, [changes]);


  if (isLoading) {
    return <div className="text-center p-8"><Spinner /></div>;
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  if (!policy || policy.status !== 'Review Required' || !policy.review) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold text-gray-800 mt-4">No Review Required</h3>
        <p className="text-gray-600 mt-2">This policy is already active or has no pending changes.</p>
        <button onClick={onBack} className="mt-6 text-blue-600 hover:underline">Return to Dashboard</button>
      </div>
    );
  }
  
  const originalPolicyText = policy.versions.find(v => v.version === policy.currentVersion)?.text || '';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-2">&larr; Back to Dashboard</button>
        <h2 className="text-2xl font-bold text-gray-800">Reviewing: {policy.name}</h2>
        <p className="text-sm text-gray-500">AI has identified {changes.length} potential improvements. Accept or reject each suggestion below.</p>
        <div className="mt-3 text-sm font-medium flex space-x-4">
            <span className="text-green-600">{acceptedCount} Accepted</span>
            <span className="text-red-600">{rejectedCount} Rejected</span>
            <span className="text-gray-600">{pendingCount} Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane: Changes */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {changes.length > 0 ? changes.map(change => (
              <ChangeCard 
                key={change.id} 
                change={change} 
                onStatusChange={handleStatusChange} 
                isSelected={selectedChangeId === change.id}
                onClick={() => setSelectedChangeId(change.id)}
              />
            )) : <p className="text-center text-gray-500 p-8">No changes were suggested.</p>}
        </div>

        {/* Right Pane: Full Document */}
        <div className="max-h-[70vh] overflow-y-auto">
            <FullPolicyView
                originalText={originalPolicyText}
                changes={changes}
            />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 sticky bottom-4">
          <div className="flex items-center justify-between">
              <div>
                  <h4 className="font-semibold">Finish Review</h4>
                  <p className="text-sm text-gray-600">Accept the changes to create a new, compliant version of your policy.</p>
              </div>
              <button
                onClick={handleFinalize}
                disabled={isFinalizing || pendingCount > 0}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isFinalizing ? <><Spinner /> Finalizing...</> : pendingCount > 0 ? `Resolve ${pendingCount} more` : 'Finalize & Save New Version'}
              </button>
          </div>
      </div>
    </div>
  );
};

export default ReviewChanges;