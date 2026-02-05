
export enum BrandSafety {
  LOW = 'Low Risk',
  MEDIUM = 'Medium Risk',
  HIGH = 'High Risk'
}

export enum AudienceIntent {
  ENTERTAINMENT = 'Entertainment',
  LEARNING = 'Learning',
  PURCHASE = 'Purchase',
  INSPIRATION = 'Inspiration'
}

export enum ReachCategory {
  LOW = 'Low Reach',
  STABLE = 'Stable Reach',
  HIGH = 'High Reach',
  VIRAL = 'Viral Potential'
}

export enum KPICategory {
  GOOD = 'Good to Go',
  AVERAGE = 'Average',
  LOW = 'Low'
}

export interface RegionSplit {
  name: string;
  percentage: number;
}

export interface StateData {
  state: string;
  percentage: number;
}

export interface KPIMetric {
  category: KPICategory;
  score: number; // 1-100
  insight: string;
}

export interface KPIAnalysis {
  awareness: KPIMetric;
  engagement: KPIMetric;
  conversions: KPIMetric;
  roi: KPIMetric;
  overallTier: KPICategory;
}

export interface AnalysisResult {
  handle: string;
  regions: {
    primary: RegionSplit;
    secondary: RegionSplit[];
  };
  stateBreakdown?: StateData[];
  contentIntelligence: {
    primaryNiche: string;
    secondaryNiche: string;
    dominantFormat: string;
    brandSafety: BrandSafety;
    intent: AudienceIntent;
  };
  reachEstimation: {
    category: ReachCategory;
    reasoning: string;
  };
  kpiAnalysis: KPIAnalysis; // New: KPI Evaluation Logic
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    genderSkew: { male: number; female: number; other: number };
    metroSplit: { metro: number; tier2_3: number };
    reasoning: string;
  };
  campaignFit: {
    score: number;
    recommendedCategories: string[];
    riskFlags: string[];
  };
}

export interface AnalysisResponse {
  creators: AnalysisResult[];
  summary: string;
}
