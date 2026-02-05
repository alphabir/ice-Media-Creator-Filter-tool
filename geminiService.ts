
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse } from "./types";

const API_KEY = process.env.API_KEY;

const SUPPORTED_BINARY_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
  'application/pdf'
];

const KPI_METRIC_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "Must be 'Good to Go', 'Average', or 'Low'" },
    score: { type: Type.NUMBER, description: "Scale of 1-100" },
    insight: { type: Type.STRING, description: "Specific reasoning derived from metrics and content signals." }
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
          brandSummary: { type: Type.STRING },
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
        required: ["handle", "brandSummary", "regions", "kpiAnalysis", "contentIntelligence", "reachEstimation", "demographics", "campaignFit"]
      }
    },
    summary: { type: Type.STRING }
  },
  required: ["creators", "summary"]
};

export async function analyzeCreators(
  inputs: string, 
  images?: { data: string; mimeType: string }[],
  documents?: { data: string; mimeType: string }[]
): Promise<AnalysisResponse> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemInstruction = `
    You are the Ice Media Labs AI Creator Intelligence Agent.
    
    CORE KPI LOGIC (STRICT AGENCY ALGORITHM):
    Calculate the 'Engagement Rate' strictly using the MEDIAN approach:
    1. Identify metrics for the last 30 posts from provided text, signals, or rosters.
    2. Calculate MEDIAN Likes (Avg. Likes) and MEDIAN Comments (Avg. Comments).
    3. Formula: Engagement Rate = ((Median Likes + Median Comments) / Total Followers) * 100.
    
    In the 'engagement.insight' field, you MUST state the calculated rate and mention that it is based on the median of the last 30 posts.

    ROSTER DATA HANDLING:
    You are receiving text that contains extracted data from Excel, Word, and Text rosters.
    Process these lists bulk-style. 

    STATE BREAKDOWN:
    Provide a detailed distribution across at least 20 Indian States/UTs.
  `;

  // Filter binary parts to ONLY supported MIME types for Gemini
  // Gemini does NOT support DOCX/XLSX natively in generateContent inlineData
  const validImageParts = (images || []).filter(img => SUPPORTED_BINARY_MIME_TYPES.includes(img.mimeType));
  const validDocParts = (documents || []).filter(doc => SUPPORTED_BINARY_MIME_TYPES.includes(doc.mimeType));

  const parts: any[] = [
    { text: `Analyze this creator roster. Calculate engagement rates strictly using the Median of the last 30 posts. Roster data:\n${inputs}` },
    ...validImageParts.map(img => ({ inlineData: img })),
    ...validDocParts.map(doc => ({ inlineData: doc }))
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
