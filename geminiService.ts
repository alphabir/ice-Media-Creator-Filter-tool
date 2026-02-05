
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
              audienceIntentDetails: { type: Type.STRING, description: "Detailed reasoning for the selected audience intent with specific examples or observations from the creator's content style." }
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
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemInstruction = `
    You are the Ice Media Labs AI Creator Intelligence Agent.
    
    KPI EVALUATION LOGIC:
    For every creator, perform a verification against 4 key performance pillars:
    1. Brand Awareness: Impressions, Reach, Growth, Mentions.
    2. Engagement: Interaction depth, Sentiment, Shares/Saves.
    3. Conversions: Bio-link intent, Purchase signals, 'Link in bio' frequency.
    4. ROI & EMV: Performance value vs Niche benchmarks.
    
    CRITICAL: For each KPI category, you MUST provide a granular 'insight' string derived directly from the creator's metrics:
    - If 'Good to Go': Use insights like 'High engagement rate compared to category average indicates strong audience connection and trust' or 'Exceptional reach with high save rate suggests content resonance and value'.
    - If 'Average': Use insights like 'Consistent reach but low shares and saves indicate passive consumption or niche audience limitations'.
    - If 'Low': Use insights like 'Low conversion rate despite high follower count suggests potential audience mismatch or lack of clear call-to-action'.

    AUDIENCE INTENT:
    Classify why the audience follows this creator (Entertainment, Learning, Purchase, Inspiration).
    Crucially, provide "audienceIntentDetails" which explains the choice with specific examples of content hooks, emotional triggers, or calls to action observed.

    COMPREHENSIVE INDIA STATE ANALYSIS:
    If India is a primary or secondary region, you MUST provide an extremely detailed "stateBreakdown".
    DO NOT limit to just a few states. You MUST include a probabilistic distribution across at least 20 different Indian states and union territories. 
    Select from the following list to reach the minimum count of 20:
    - STATES: Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal.
    - UNION TERRITORIES: Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi (NCR), Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry.
    
    Base the distribution on language cues, cultural markers, and urban density signals found in the creator's profile and content.

    CONSTRAINTS:
    - All data is AI-Estimated based on logical inference for Ice Media Labs.
    - Professional, agency-tier tone. No guessing without rationale.
    - Ensure the sum of percentages in stateBreakdown is logical (close to 100% of the Indian audience segment).
  `;

  const parts = [
    { text: `Analyze the following creator data for Ice Media Labs and provide comprehensive KPI and state-level demographic categorizations:\n${inputs}` },
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
