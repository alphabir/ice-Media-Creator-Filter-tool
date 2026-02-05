
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse, BrandSafety, AudienceIntent, ReachCategory } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const KPI_METRIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "Must be 'Good to Go', 'Average', or 'Low'" },
    score: { type: Type.NUMBER, description: "Scale of 1-100" },
    insight: { type: Type.STRING }
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
              intent: { type: Type.STRING }
            },
            required: ["primaryNiche", "secondaryNiche", "dominantFormat", "brandSafety", "intent"]
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
  const systemInstruction = `
    You are an AI Creator Intelligence & Audience Analysis Tool built for a media agency.
    
    KPI EVALUATION LOGIC:
    For every creator, perform a verification against 4 key performance pillars:
    1. Brand Awareness: Impressions, Reach, Growth, Mentions.
    2. Engagement: Interaction depth, Sentiment, Shares/Saves.
    3. Conversions: Bio-link intent, Purchase signals.
    4. ROI & EMV: Performance value vs Niche benchmarks.
    Categorize each as 'Good to Go', 'Average', or 'Low'.

    COMPREHENSIVE INDIA STATE ANALYSIS:
    If India is a primary or secondary region, you MUST provide a detailed "stateBreakdown".
    DO NOT limit to just 1 or 2 states. Include a probabilistic distribution across as many of these as relevant (ideally 10-15+ entries if the audience is national):
    - STATES: Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal.
    - UNION TERRITORIES: Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi (NCR), Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry.
    
    Base the distribution on language (e.g., Bengali -> WB), cultural markers, and urban density signals.

    CONSTRAINTS:
    - All data is AI-Estimated based on logical inference.
    - Professional tone. No guessing without rationale.
  `;

  const parts = [
    { text: `Analyze the following creator data and provide comprehensive KPI and state-level demographic categorizations:\n${inputs}` },
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
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
