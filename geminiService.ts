
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse } from "./types";

const API_KEY = process.env.API_KEY;

const KPI_METRIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "Must be 'Good to Go', 'Average', or 'Low'" },
    score: { type: Type.NUMBER, description: "Scale of 1-100" },
    insight: { type: Type.STRING, description: "Highly specific reasoning derived from metrics and content signals." }
  },
  required: ["category", "score", "insight"]
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    creators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          handle: { type: Type.STRING },
          regions: {
            type: Type.OBJECT,
            properties: {
              primary: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                },
                required: ["name", "percentage"]
              },
              secondary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    percentage: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["primary", "secondary"]
          },
          stateBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                state: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              },
              required: ["state", "percentage"]
            }
          },
          kpiAnalysis: {
            type: Type.OBJECT,
            properties: {
              awareness: KPI_METRIC_SCHEMA,
              engagement: KPI_METRIC_SCHEMA,
              conversions: KPI_METRIC_SCHEMA,
              roi: KPI_METRIC_SCHEMA,
              overallTier: { type: Type.STRING, description: "Overall classification: 'Good to Go', 'Average', or 'Low'" }
            },
            required: ["awareness", "engagement", "conversions", "roi", "overallTier"]
          },
          contentIntelligence: {
            type: Type.OBJECT,
            properties: {
              primaryNiche: { type: Type.STRING },
              secondaryNiche: { type: Type.STRING },
              dominantFormat: { type: Type.STRING },
              brandSafety: { type: Type.STRING },
              intent: { type: Type.STRING },
              audienceIntentDetails: { type: Type.STRING, description: "Detailed reasoning for the selected audience intent." }
            },
            required: ["primaryNiche", "secondaryNiche", "dominantFormat", "brandSafety", "intent", "audienceIntentDetails"]
          },
          reachEstimation: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["category", "reasoning"]
          },
          demographics: {
            type: Type.OBJECT,
            properties: {
              ageGroups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    range: { type: Type.STRING },
                    percentage: { type: Type.NUMBER }
                  }
                }
              },
              genderSkew: {
                type: Type.OBJECT,
                properties: {
                  male: { type: Type.NUMBER },
                  female: { type: Type.NUMBER },
                  other: { type: Type.NUMBER }
                }
              },
              metroSplit: {
                type: Type.OBJECT,
                properties: {
                  metro: { type: Type.NUMBER },
                  tier2_3: { type: Type.NUMBER }
                }
              },
              reasoning: { type: Type.STRING }
            },
            required: ["ageGroups", "genderSkew", "metroSplit", "reasoning"]
          },
          campaignFit: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              recommendedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "recommendedCategories", "riskFlags"]
          }
        },
        required: ["handle", "regions", "kpiAnalysis", "contentIntelligence", "reachEstimation", "demographics", "campaignFit"]
      }
    },
    summary: { type: Type.STRING }
  },
  required: ["creators", "summary"]
};

export async function analyzeCreators(inputs: string, images?: { data: string; mimeType: string }[]): Promise<AnalysisResponse> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemInstruction = `
    You are the Ice Media Labs AI Creator Intelligence Agent.
    
    TASK: Analyze the provided list of creators in BULK. 
    Maintain high precision for every single entry in the roster.

    KPI INSIGHT GUIDELINES (MANDATORY):
    - 'Good to Go': Use metrics-driven insights like 'High engagement rate vs category avg indicates strong connection' or 'Exceptional reach with high save rate suggests content value'.
    - 'Average': Use insights like 'Consistent reach but low shares/saves indicate passive consumption' or 'Moderate growth with stable engagement but lacks high conversion signals'.
    - 'Low': Use insights like 'Low conversion rate despite high followers suggests audience mismatch' or 'Stagnant engagement signals indicate potential burnout or content fatigue'.

    STATE BREAKDOWN:
    For Indian audiences, provide a detailed distribution across at least 20 States/UTs based on linguistic and cultural cues.

    BULK PROCESSING:
    Ensure every creator mentioned in the input is represented in the output 'creators' array.
  `;

  const parts = [
    { text: `Analyze the following creator roster for Ice Media Labs and provide proper, detailed KPI and demographic categorizations:\n${inputs}` },
    ...(images || []).map(img => ({ inlineData: img }))
  ];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const json = JSON.parse(response.text || '{}');
    return json as AnalysisResponse;
  } catch (error) {
    console.error("Ice Media Intelligence Error:", error);
    throw error;
  }
}
