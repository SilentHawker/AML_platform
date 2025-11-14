import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generatePolicy, createPolicyWithAnalysis } from '../services/policyService';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface PolicyGeneratorProps {
  onGenerationComplete: (newPolicyId: string) => void;
  onCancel: () => void;
}

const PolicyGenerator: React.FC<PolicyGeneratorProps> = ({ onGenerationComplete, onCancel }) => {
  const { user, impersonatedTenant } = useAuth();
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeTenantName = impersonatedTenant?.tenantName || user?.tenantName;
  const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenantId || !activeTenantName) {
        setError("Could not determine the active client. Please refresh and try again.");
        return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Step 1: Generate the policy text from the backend
      const { policy_text } = await generatePolicy(activeTenantName, customPrompt || null);

      if (!policy_text) {
          throw new Error("The generation service returned an empty policy.");
      }

      // Step 2: Create a policy with AI analysis, similar to the upload flow
      const policyName = `Generated AML Policy for ${activeTenantName}`;
      const newPolicy = await createPolicyWithAnalysis(policyName, policy_text, activeTenantId);
      
      onGenerationComplete(newPolicy.id);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during policy generation and analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 animate-fade-in-down">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
        Generate New Policy
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Our AI can generate a baseline AML policy based on your company's profile. You can add specific instructions below to customize it. The generated policy will then be analyzed for compliance gaps.
      </p>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">Custom Instructions (Optional)</label>
          <textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'Include a section on dealing with high-risk jurisdictions like...' or 'Emphasize our mobile app delivery channel.'"
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? <><Spinner /> Generating...</> : 'Generate & Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyGenerator;