import type { DemoScenario } from '../types';

/** Three preset patient scenarios for demo purposes */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'healthy',
    label: 'Healthy Patient',
    description: '35-year-old with ideal metrics — both models confirm low risk.',
    icon: '💚',
    values: {
      age: 35,
      cholesterol: 185,
      blood_pressure: 115,
      glucose: 92,
      max_heart_rate: 175,
      oldpeak: 0.2,
      st_slope: 1,
    },
  },
  {
    id: 'at-risk',
    label: 'At-Risk Patient',
    description: '55-year-old with elevated cholesterol & BP — quantum catches what classical misses.',
    icon: '⚠️',
    values: {
      age: 55,
      cholesterol: 280,
      blood_pressure: 160,
      glucose: 140,
      max_heart_rate: 120,
      oldpeak: 2.5,
      st_slope: 2,
    },
  },
  {
    id: 'high-risk',
    label: 'High-Risk Patient',
    description: '70-year-old with multiple critical markers — urgent intervention needed.',
    icon: '🔴',
    values: {
      age: 70,
      cholesterol: 310,
      blood_pressure: 185,
      glucose: 165,
      max_heart_rate: 88,
      oldpeak: 4.2,
      st_slope: 3,
    },
  },
];
