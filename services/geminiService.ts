
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { getRegulations } from './regulationService';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this environment, we assume API_KEY is set.
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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

export const analyzePolicy = async (policyText: string): Promise<AnalysisResult> => {
    try {
        const verifiedRegulations = getRegulations().filter(r => r.isVerified);
        
        if (verifiedRegulations.length === 0) {
            throw new Error("No verified regulations are available for analysis. An administrator must configure and verify regulations first.");
        }

        const regulationsContext = verifiedRegulations.map(r => 
            `Regulation: "${r.name}"\nLink: ${r.link}\nInterpretation: "${r.interpretation}"`
        ).join('\n\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Here are the verified Canadian FINTRAC regulations to use for your analysis:\n\n---BEGIN REGULATIONS---\n${regulationsContext}\n---END REGULATIONS---\n\nPlease analyze the following Anti-Money Laundering (AML) policy document based *only* on the regulations provided above. Here is the policy text:\n\n---BEGIN POLICY---\n${policyText}\n---END POLICY---`,
            config: {
                systemInstruction: "You are an expert AML compliance analyst specializing in Canadian FINTRAC regulations. Your task is to analyze a client's AML policy document. Your analysis MUST be strictly based on the list of verified regulations provided in the prompt. Do not use your general knowledge; only use the rules and interpretations given to you. Provide a detailed analysis, identify compliance gaps, and suggest specific improvements. Structure your response according to the provided JSON schema. When you identify a finding, you MUST include the 'originalText' field, which should contain the exact verbatim text from the policy that your analysis is based on.",
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
        console.error("Error analyzing policy with Gemini:", error);
        if (error instanceof Error && error.message.includes("regulations")) {
            throw error;
        }
        throw new Error("Failed to get a valid analysis from the AI. The policy might be too complex or the service may be unavailable.");
    }
};