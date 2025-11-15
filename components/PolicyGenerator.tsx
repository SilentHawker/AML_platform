
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generatePolicy, createPolicyWithAnalysis } from '../services/policyService';
import { listMasterPrompts, MasterPrompt } from '../services/promptService';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface PolicyGeneratorProps {
  onGenerationComplete: (newPolicyId: string) => void;
  onCancel: () => void;
}

const PolicyGenerator: React.FC<PolicyGeneratorProps> = ({ onGenerationComplete, onCancel }) => {
  const { user, impersonatedTenant } = useAuth();
  // State for master prompts
  const [prompts, setPrompts] = useState<MasterPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptsError, setPromptsError] = useState<string | null>(null);

  // State for generation
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeTenantName = impersonatedTenant?.tenantName || user?.tenantName;
  const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;

  // Fetch prompts on mount
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setPromptsLoading(true);
        setPromptsError(null);
        const activePrompts = await listMasterPrompts(true);
        setPrompts(activePrompts);
      } catch (err: any) {
        setPromptsError('Failed to load generation prompts. Please try again later.');
        console.error(err);
      } finally {
        setPromptsLoading(false);
      }
    };
    fetchPrompts();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenantId || !activeTenantName) {
        setError("Could not determine the active client. Please refresh and try again.");
        return;
    }
    if (!selectedPromptId) {
        setError("Please select a generation prompt.");
        return;
    }

    const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
    if (!selectedPrompt) {
        setError("Selected prompt not found. Please refresh.");
        return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Step 1: Generate the policy text from the backend using the selected prompt text
      const { markdown } = await generatePolicy(activeTenantName, selectedPrompt.prompt_text);

      if (!markdown) {
          throw new Error("The generation service returned an empty policy.");
      }

      // Step 2: Create a policy with AI analysis, similar to the upload flow
      const policyName = `Generated Policy for ${activeTenantName}`;
      const newPolicy = await createPolicyWithAnalysis(policyName, markdown, activeTenantId);
      
      onGenerationComplete(newPolicy.id);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during policy generation and analysis.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderPromptSelector = () => {
    if (promptsLoading) {
      return (
        <div className="flex items-center space-x-2 text-gray-500">
          <Spinner /> <span>Loading prompts...</span>
        </div>
      );
    }
    if (promptsError) {
      return <p className="text-red-600 text-sm">{promptsError}</p>;
    }
    return (
      <>
        <label htmlFor="masterPrompt" className="block text-sm font-medium text-gray-700">Select a Generation Prompt</label>
        <select
          id="masterPrompt"
          value={selectedPromptId}
          onChange={(e) => setSelectedPromptId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
        >
          <option value="" disabled>-- Please choose a prompt --</option>
          {prompts.map(prompt => (
            <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
          ))}
        </select>
        {prompts.find(p => p.id === selectedPromptId)?.description && (
          <p className="mt-2 text-xs text-gray-500">{prompts.find(p => p.id === selectedPromptId)?.description}</p>
        )}
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 animate-fade-in-down">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
        Generate New Policy
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Our AI can generate a baseline AML policy based on your company's profile and a master prompt. The generated policy will then be analyzed for compliance gaps.
      </p>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {renderPromptSelector()}
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading || promptsLoading || !selectedPromptId} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? <><Spinner /> Generating...</> : 'Generate & Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyGenerator;