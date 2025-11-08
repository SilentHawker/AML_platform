
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { getModelConfigById, getDefaultModelConfig } from './modelConfigService';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.INTEGER,
      description: "A numerical score from 0 to 100 representing the overall compliance level of the policy.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise, high-level summary of the policy's strengths and weaknesses against the provided FINTRAC regulations.",
    },
    findings: {
      type: Type.ARRAY,
      description: "A detailed list of specific compliance findings.",
      items: {
        type: Type.OBJECT,
        properties: {
          regulation: {
            type: Type.STRING,
            description: "The specific FINTRAC regulation or guideline section being assessed (e.g., 'FINTRAC Guideline 6G: Record Keeping'). This must match one of the regulations provided in the prompt.",
          },
          policySection: {
            type: Type.STRING,
            description: "The corresponding section, clause, or page number in the user's policy document. If not found, state 'Not Addressed'.",
          },
          originalText: {
            type: Type.STRING,
            description: "The exact, verbatim text from the policy document that this finding refers to. This should be the complete sentence or paragraph that is being analyzed.",
          },
          analysis: {
            type: Type.STRING,
            description: "A detailed analysis of how the policy section aligns or fails to align with the regulation, based *only* on the provided regulation interpretation.",
          },
          suggestion: {
            type: Type.STRING,
            description: "A concrete, actionable suggestion for how to improve the policy to meet the compliance requirement.",
          },
          isCompliant: {
            type: Type.BOOLEAN,
            description: "A boolean value indicating whether the policy section is compliant with this specific regulation.",
          },
          severity: {
            type: Type.STRING,
            description: "The severity of the compliance gap, rated as 'Low', 'Medium', 'High', or 'Critical'."
          }
        },
        required: ['regulation', 'policySection', 'originalText', 'analysis', 'suggestion', 'isCompliant', 'severity'],
      },
    },
  },
  required: ['overallScore', 'summary', 'findings'],
};

/**
 * A specialized handler that communicates with the Gemini API to analyze a policy.
 * It takes a fully-formed prompt and system instruction, selects the appropriate model
 * based on configuration, and expects a JSON response that conforms to the AnalysisResult schema.
 *
 * @param prompt The main prompt content, including regulations and policy text.
 * @param systemInstruction The master prompt that guides the AI's behavior.
 * @param modelId Optional ID of the specific AI model to use. If not provided, the default model is used.
 * @returns A promise that resolves to the structured analysis result.
 */
export const generateAnalysisFromPrompt = async (prompt: string, systemInstruction: string, modelId?: string): Promise<AnalysisResult> => {
    try {
        const modelConfig = modelId ? getModelConfigById(modelId) : getDefaultModelConfig();

        if (!modelConfig) {
            throw new Error("No AI model configured. Please ask an administrator to configure a default model.");
        }

        if (!modelConfig.apiKey) {
            console.error("API Key for model is missing:", modelConfig);
            throw new Error(`API Key for model "${modelConfig.description}" is missing. Please contact an administrator.`);
        }
        
        // Create a new AI instance for each request with the specific key
        const ai = new GoogleGenAI({ apiKey: modelConfig.apiKey });

        const response = await ai.models.generateContent({
            model: modelConfig.modelName,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        // Basic validation
        if (!result.findings || !Array.isArray(result.findings)) {
            throw new Error("Invalid response format from API: 'findings' array is missing.");
        }

        return result as AnalysisResult;

    } catch (error) {
        console.error("Error generating analysis from Gemini:", error);
        if (error instanceof Error && (error.message.includes("model"))) {
            throw error;
        }
        throw new Error("Failed to get a valid analysis from the AI. The service may be unavailable or the model configuration is incorrect.");
    }
};
