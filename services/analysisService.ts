

import type { AnalysisResult } from '../types';
import { getRegulations } from './regulationService';
import { getMasterPrompt } from './promptService';
import { generateAnalysisFromPrompt } from './geminiService';
import { getOnboardingData } from './onboardingService';

/**
 * Orchestrates the policy analysis process.
 * This function gathers all necessary context (regulations, master prompt) and
 * then calls the AI model handler to perform the analysis.
 *
 * @param policyText The raw text of the policy to be analyzed.
 * @param tenantId The ID of the tenant whose policy is being analyzed, used to fetch onboarding context.
 * @param modelId Optional ID of a specific AI model configuration to use.
 * @returns A promise that resolves to the structured analysis result.
 */
export const performPolicyAnalysis = async (policyText: string, tenantId: string, modelId?: string): Promise<AnalysisResult> => {
    try {
        const verifiedRegulations = getRegulations().filter(r => r.isVerified);
        
        if (verifiedRegulations.length === 0) {
            throw new Error("No verified regulations are available for analysis. An administrator must configure and verify regulations first.");
        }
        
        const onboardingData = getOnboardingData(tenantId);
        let onboardingContext = "No onboarding questionnaire data was provided for this client.";
        if (onboardingData) {
            onboardingContext = `Here is the client's completed onboarding questionnaire, which details their specific business activities:\n\n---BEGIN QUESTIONNAIRE DATA---\n${JSON.stringify(onboardingData, null, 2)}\n---END QUESTIONNAIRE DATA---`;
        }

        const regulationsContext = verifiedRegulations.map(r => 
            `Regulation: "${r.name}"\nLink: ${r.link}\nInterpretation: "${r.interpretation}"`
        ).join('\n\n');

        const masterPrompt = getMasterPrompt();

        const prompt = `${onboardingContext}\n\nHere are the verified Canadian FINTRAC regulations to use for your analysis:\n\n---BEGIN REGULATIONS---\n${regulationsContext}\n---END REGULATIONS---\n\nPlease analyze the following Anti-Money Laundering (AML) policy document based *only* on the regulations and questionnaire data provided above. Here is the policy text:\n\n---BEGIN POLICY---\n${policyText}\n---END POLICY---`;
        
        // Delegate the actual AI call to the specialized geminiService handler
        return await generateAnalysisFromPrompt(prompt, masterPrompt, modelId);

    } catch (error) {
        // Re-throw specific errors or a generic one
        console.error("Error during policy analysis orchestration:", error);
        if (error instanceof Error) {
            throw error; // Propagate the original error message
        }
        throw new Error("An unexpected error occurred during the analysis process.");
    }
};