// ── Shared TypeScript types for QHeal ─────────────────────────────────────────

export interface PatientInput {
  age: number;
  cholesterol: number;
  blood_pressure: number;
  glucose: number;
  max_heart_rate: number;
  oldpeak: number;
  st_slope: number;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface ClinicalRecommendation {
  text: string;
  category: string;
  urgency: 'Urgent' | 'Strongly Recommended' | 'Recommended' | 'Preventative';
  icon: string;
}

export interface FeatureAttribution {
  name: string;
  value: number;
  insight: string;
  is_quantum: boolean;
}

export interface PredictionResponse {
  classical_risk: number;
  quantum_risk: number;
  improvement: number;
  risk_level: RiskLevel;
  recommendations: ClinicalRecommendation[];
  quantum_features_dim: number;
  quantum_available: boolean;
  feature_attributions?: FeatureAttribution[];
}

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  icon: string;
  values: PatientInput;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
