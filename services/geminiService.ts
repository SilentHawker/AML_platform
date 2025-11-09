import { GoogleGenAI, Type } from '@google/genai';
import type { OnboardingData, SuggestedChange } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    originalText: { type: Type.STRING, description: 'The exact, verbatim text snippet from the original document that needs to be changed.' },
                    suggestedText: { type: Type.STRING, description: 'The new, compliant text that should replace the original snippet.' },
                    reason: { type: Type.STRING, description: 'A clear, concise explanation of why the change is necessary, referencing specific Canadian FINTRAC guidelines or AML principles.' },
                    severity: { type: Type.STRING, description: 'The severity of the compliance gap. Must be one of: "Low", "Medium", "High", "Critical".' }
                },
                required: ['originalText', 'suggestedText', 'reason', 'severity'],
            }
        }
    }
};

const buildSystemInstruction = (onboardingData: OnboardingData | null) => {
    let context = `You are an expert AML compliance consultant specializing in Canadian FINTRAC regulations. Your task is to analyze a client's AML policy document and provide specific, actionable suggestions for improvement.`;

    if (onboardingData) {
        context += `\n\n### Client Context ###\n`
        context += `This client is a Money Service Business (MSB) with the following characteristics:\n`;
        if (onboardingData.msb_activities.length > 0) {
            context += `- Activities: ${onboardingData.msb_activities.join(', ')}\n`;
        }
        if (onboardingData.delivery_channels.length > 0) {
            context += `- Delivery Channels: ${onboardingData.delivery_channels.join(', ')}\n`;
        }
        if (onboardingData.client_types.length > 0) {
            context += `- Client Types: ${onboardingData.client_types.join(', ')}\n`;
        }
        if (onboardingData.uses_vc) {
             context += `- Deals with virtual currency.\n`;
        }
        context += `Tailor your analysis to these specific operational details. Focus only on gaps or weaknesses in the provided policy text. Do not invent new sections or suggest content for topics not already present in the document.`;
    }
    
    context += `\n\n### Task ###\n`
    context += `Review the following AML policy. Identify all sections that are non-compliant, unclear, or could be strengthened according to FINTRAC's guidelines. For each identified issue, you MUST provide a JSON object with the original text, your suggested replacement, a reason for the change, and a severity level. If the policy is perfect, return an empty array of suggestions. Ensure 'originalText' is an exact substring from the provided document.`;

    return context;
};

export const analyzePolicyAndSuggestChanges = async (policyText: string, onboardingData: OnboardingData | null): Promise<Omit<SuggestedChange, 'id' | 'status' | 'modifiedText'>[]> => {
    try {
        const systemInstruction = buildSystemInstruction(onboardingData);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for better reasoning and JSON generation
            contents: [{ parts: [{ text: policyText }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2, // Lower temperature for more deterministic, factual output
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        if (result && result.suggestions) {
            return result.suggestions;
        }

        return [];
    } catch (error) {
        console.error("Error analyzing policy with Gemini:", error);
        throw new Error("The AI analysis failed. This could be due to a temporary issue or a problem with the document format after parsing. Please try again.");
    }
};
