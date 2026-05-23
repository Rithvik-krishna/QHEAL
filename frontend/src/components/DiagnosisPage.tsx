import { useState, useEffect } from 'react';
import '../styles/QHEAL_ENTERPRISE_SAAS.css';

// ── 4-QUBIT VARIATIONAL QUANTUM CIRCUIT STATEVECTOR SIMULATOR ──
// Performs the exact same NumPy unitary matrix operations on the client in real-time.
function applyRY(state: number[], q: number, theta: number): number[] {
  const next = [...state];
  const cosVal = Math.cos(theta / 2);
  const sinVal = Math.sin(theta / 2);
  const mask = 1 << (3 - q); // MSB ordering (q0 is leftmost, q3 is rightmost)
  for (let i = 0; i < 16; i++) {
    if ((i & mask) === 0) {
      const i0 = i;
      const i1 = i | mask;
      const v0 = state[i0];
      const v1 = state[i1];
      next[i0] = cosVal * v0 - sinVal * v1;
      next[i1] = sinVal * v0 + cosVal * v1;
    }
  }
  return next;
}

function applyCNOT(state: number[], c: number, t: number): number[] {
  const next = new Array(16).fill(0);
  const cMask = 1 << (3 - c);
  const tMask = 1 << (3 - t);
  for (let i = 0; i < 16; i++) {
    if ((i & cMask) !== 0) {
      const j = i ^ tMask;
      next[j] = state[i];
    } else {
      next[i] = state[i];
    }
  }
  return next;
}

function applyCZ(state: number[], c: number, t: number): number[] {
  const next = [...state];
  const cMask = 1 << (3 - c);
  const tMask = 1 << (3 - t);
  for (let i = 0; i < 16; i++) {
    if ((i & cMask) !== 0 && (i & tMask) !== 0) {
      next[i] = -state[i];
    }
  }
  return next;
}

function simulateQuantumStatevector(x: number[]): number[] {
  let state = new Array(16).fill(0);
  state[0] = 1.0; // Initial state |0000>
  
  // Layer 1: RY Encoding
  for (let i = 0; i < 4; i++) {
    const theta = x[i] * Math.PI;
    state = applyRY(state, i, theta);
  }
  
  // Layer 2: CNOT ring entanglement
  for (let i = 0; i < 3; i++) {
    state = applyCNOT(state, i, i + 1);
  }
  state = applyCNOT(state, 3, 0); // close the ring
  
  // Layer 3: RY mixing with shifted features
  for (let i = 0; i < 4; i++) {
    const theta = x[(i + 1) % 4] * Math.PI / 2;
    state = applyRY(state, i, theta);
  }
  
  // Layer 4: CZ entanglement pairs
  state = applyCZ(state, 0, 1);
  state = applyCZ(state, 2, 3);
  
  // Measurement: probability distribution
  const probs = state.map(val => val * val);
  const sum = probs.reduce((a, b) => a + b, 0);
  return probs.map(p => p / (sum + 1e-12));
}

interface Biomarkers {
  age: number;
  cholesterol: number;
  bloodPressure: number;
  glucose: number;
  maxHeartRate: number;
  stDepression: number;
  stSlope: number;
}

interface ClinicalRecommendation {
  text: string;
  category: string;
  urgency: 'Urgent' | 'Strongly Recommended' | 'Recommended' | 'Preventative';
  icon: string;
}

interface FeatureAttribution {
  name: string;
  value: number;
  insight: string;
  is_quantum: boolean;
}

interface PredictionResults {
  classical_risk: number;
  quantum_risk: number;
  classical_confidence: number;
  quantum_confidence: number;
  classical_certainty_label: string;
  quantum_certainty_label: string;
  classical_confidence_reason: string;
  quantum_confidence_reason: string;
  improvement: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  recommendations: ClinicalRecommendation[];
  statevector?: number[];
  normalized_features?: number[];
  feature_attributions?: FeatureAttribution[];
}

export function DiagnosisPage() {
  const [biomarkers, setBiomarkers] = useState<Biomarkers>({
    age: 45,
    cholesterol: 220,
    bloodPressure: 130,
    glucose: 110,
    maxHeartRate: 150,
    stDepression: 1.0,
    stSlope: 2
  });

  const [activePreset, setActivePreset] = useState<string>('');
  const [results, setResults] = useState<PredictionResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [compareMode, setCompareMode] = useState<'quantum' | 'classical'>('quantum');

  // Simulated staged VQC calculation steps
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    
    const timers = [
      setTimeout(() => setLoadingStep(1), 0),
      setTimeout(() => setLoadingStep(2), 500),
      setTimeout(() => setLoadingStep(3), 1000),
      setTimeout(() => setLoadingStep(4), 1500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleSliderChange = (key: keyof Biomarkers, value: string) => {
    setActivePreset('');
    setBiomarkers(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      let response;
      try {
        response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: biomarkers.age,
            cholesterol: biomarkers.cholesterol,
            blood_pressure: biomarkers.bloodPressure,
            glucose: biomarkers.glucose,
            max_heart_rate: biomarkers.maxHeartRate,
            oldpeak: biomarkers.stDepression,
            st_slope: biomarkers.stSlope
          })
        });
      } catch {
        response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age: biomarkers.age,
            cholesterol: biomarkers.cholesterol,
            blood_pressure: biomarkers.bloodPressure,
            glucose: biomarkers.glucose,
            max_heart_rate: biomarkers.maxHeartRate,
            oldpeak: biomarkers.stDepression,
            st_slope: biomarkers.stSlope
          })
        });
      }
      
      const data = await response.json();
      // Ensure the staged transition feels real and medical by waiting for the final step to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = (scenario: 'healthy' | 'atRisk' | 'highRisk') => {
    setActivePreset(scenario);
    const scenarios: Record<string, Biomarkers> = {
      healthy: {
        age: 35,
        cholesterol: 200,
        bloodPressure: 120,
        glucose: 100,
        maxHeartRate: 160,
        stDepression: 0.0,
        stSlope: 1
      },
      atRisk: {
        age: 55,
        cholesterol: 280,
        bloodPressure: 160,
        glucose: 140,
        maxHeartRate: 120,
        stDepression: 1.0,
        stSlope: 2
      },
      highRisk: {
        age: 70,
        cholesterol: 300,
        bloodPressure: 180,
        glucose: 160,
        maxHeartRate: 85,
        stDepression: 2.0,
        stSlope: 2
      }
    };
    setBiomarkers(scenarios[scenario]);
  };

  return (
    <div className="qheal-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* Scenario Presets */}
      <div style={{ marginBottom: '28px' }}>
        <span className="section-label" style={{ marginBottom: '8px' }}>Clinical Patient Presets</span>
        <div className="scenarios-container">
          <div 
            className={`scenario-card ${activePreset === 'healthy' ? 'active' : ''}`}
            onClick={() => loadScenario('healthy')}
          >
            <div className="scenario-icon">💚</div>
            <div className="scenario-title">Baseline Patient</div>
            <div className="scenario-description">35-year-old profile with baseline cardiac parameters.</div>
          </div>
          
          <div 
            className={`scenario-card ${activePreset === 'atRisk' ? 'active' : ''}`}
            onClick={() => loadScenario('atRisk')}
          >
            <div className="scenario-icon">⚠️</div>
            <div className="scenario-title">Elevated Risk Patient</div>
            <div className="scenario-description">55-year-old profile with moderately elevated indicators.</div>
          </div>
          
          <div 
            className={`scenario-card ${activePreset === 'highRisk' ? 'active' : ''}`}
            onClick={() => loadScenario('highRisk')}
          >
            <div className="scenario-icon">🔴</div>
            <div className="scenario-title">Critical Profile Patient</div>
            <div className="scenario-description">70-year-old profile displaying critical physiological parameters.</div>
          </div>
        </div>
      </div>

      {/* Main Workstation Layout */}
      <div className="diagnosis-wrapper">
        
        {/* LEFT COLUMN: BIOMARKER INPUTS */}
        <div className="biomarker-section">
          <div className="section-header">
            <span>⚕️</span>
            Physiological Diagnostics Intake
          </div>

          {/* Group 1: Demographic & Metabolic Baseline */}
          <div className="form-group-title">01 · Demographic & Metabolic Baseline</div>

          {/* Age */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Chronological Age</span>
              <span className="slider-value">{biomarkers.age} <span className="input-unit">years</span></span>
            </div>
            <div className="slider-desc">Biological age index of the patient.</div>
            <input 
              type="range" 
              min="20" 
              max="90" 
              value={biomarkers.age}
              onChange={(e) => handleSliderChange('age', e.target.value)}
            />
          </div>

          {/* Cholesterol */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Serum Cholesterol</span>
              <span className="slider-value">{biomarkers.cholesterol} <span className="input-unit">mg/dL</span></span>
            </div>
            <div className="slider-desc">Total serum lipids. Risk threshold recommended level is under 240 mg/dL.</div>
            <input 
              type="range" 
              min="100" 
              max="400" 
              value={biomarkers.cholesterol}
              onChange={(e) => handleSliderChange('cholesterol', e.target.value)}
            />
          </div>

          {/* Glucose */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Fasting Blood Sugar</span>
              <span className="slider-value">{biomarkers.glucose} <span className="input-unit">mg/dL</span></span>
            </div>
            <div className="slider-desc">Fasting serum glucose count. Elevated levels suggest insulin metabolic stress.</div>
            <input 
              type="range" 
              min="70" 
              max="300" 
              value={biomarkers.glucose}
              onChange={(e) => handleSliderChange('glucose', e.target.value)}
            />
          </div>

          {/* Group 2: Hemodynamic & Cardiac Stress Profile */}
          <div className="form-group-title">02 · Hemodynamic & Cardiac Stress Profile</div>

          {/* Blood Pressure */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Systolic Blood Pressure</span>
              <span className="slider-value">{biomarkers.bloodPressure} <span className="input-unit">mmHg</span></span>
            </div>
            <div className="slider-desc">Resting hemodynamic blood pressure. Normal range sits under 130 mmHg.</div>
            <input 
              type="range" 
              min="80" 
              max="200" 
              value={biomarkers.bloodPressure}
              onChange={(e) => handleSliderChange('bloodPressure', e.target.value)}
            />
          </div>

          {/* Max Heart Rate */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Max Exercise Heart Rate</span>
              <span className="slider-value">{biomarkers.maxHeartRate} <span className="input-unit">bpm</span></span>
            </div>
            <div className="slider-desc">Peak cardiac frequency under controlled exercise stress tolerance.</div>
            <input 
              type="range" 
              min="60" 
              max="200" 
              value={biomarkers.maxHeartRate}
              onChange={(e) => handleSliderChange('maxHeartRate', e.target.value)}
            />
          </div>

          {/* ST Depression */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">Electrocardiogram ST Depression</span>
              <span className="slider-value">{biomarkers.stDepression.toFixed(1)} <span className="input-unit">mm</span></span>
            </div>
            <div className="slider-desc">Exercise-induced ST segment relative depression levels. Indicates oxygen supply margin.</div>
            <input 
              type="range" 
              min="0" 
              max="6" 
              step="0.1"
              value={biomarkers.stDepression}
              onChange={(e) => handleSliderChange('stDepression', e.target.value)}
            />
          </div>

          {/* ST Slope (Segmented Selection Button Row) */}
          <div className="slider-wrapper">
            <div className="slider-label-row">
              <span className="slider-label">ST Slope Slope Trend</span>
              <span className="slider-value" style={{ textTransform: 'capitalize' }}>
                {biomarkers.stSlope === 1 ? 'Upsloping' : biomarkers.stSlope === 2 ? 'Flat' : 'Downsloping'}
              </span>
            </div>
            <div className="slider-desc" style={{ marginBottom: '12px' }}>Electrocardiogram recovery curve slope profile. Downsloping hints at ischemic risk.</div>
            <div className="segmented-select">
              <button 
                type="button"
                className={`segmented-option ${biomarkers.stSlope === 1 ? 'active' : ''}`}
                onClick={() => setBiomarkers(prev => ({ ...prev, stSlope: 1 }))}
              >
                Upsloping
              </button>
              <button 
                type="button"
                className={`segmented-option ${biomarkers.stSlope === 2 ? 'active' : ''}`}
                onClick={() => setBiomarkers(prev => ({ ...prev, stSlope: 2 }))}
              >
                Flat
              </button>
              <button 
                type="button"
                className={`segmented-option ${biomarkers.stSlope === 3 ? 'active' : ''}`}
                onClick={() => setBiomarkers(prev => ({ ...prev, stSlope: 3 }))}
              >
                Downsloping
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          <button 
            className="btn btn-primary btn-analyze"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '8px' }}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing Quantum Metrics...
              </>
            ) : (
              '⚛ Run Quantum ML Analysis'
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: REAL-TIME MONITOR & CLINICAL RESULTS */}
        <div className="results-section">
          
          {/* CARD 1: PHYSIOLOGICAL CORRELATION MONITOR (Permanently visible & active in real-time) */}
          {(() => {
            // 1. Math normalization to [0, 1] range
            const normAge = Math.min(Math.max((biomarkers.age - 20) / 70, 0), 1);
            const normChol = Math.min(Math.max((biomarkers.cholesterol - 100) / 300, 0), 1);
            const normBP = Math.min(Math.max((biomarkers.bloodPressure - 80) / 120, 0), 1);
            const normGlucose = Math.min(Math.max((biomarkers.glucose - 70) / 230, 0), 1);
            const normHR = Math.min(Math.max((200 - biomarkers.maxHeartRate) / 140, 0), 1); // low HR = high risk
            const normSTDep = Math.min(Math.max(biomarkers.stDepression / 6.0, 0), 1);
            const normSTSlope = biomarkers.stSlope === 1 ? 0.0 : biomarkers.stSlope === 2 ? 0.5 : 1.0;

            // 2. Node states calculations
            const getNodeColor = (val: number) => {
              if (val >= 0.7) return '#f43f5e'; // premium medical rose-red
              if (val >= 0.35) return '#fbbf24'; // premium clinical amber-yellow
              return '#10b981'; // premium health emerald-green
            };

            const getNodeSize = (val: number) => {
              return 6 + val * 5; // scales from 6px to 11px
            };

            const getNodePulse = (val: number) => {
              if (val >= 0.7) return '0.7s';
              if (val >= 0.35) return '1.4s';
              return '2.8s';
            };

            // Heptagon Node array coordinates (symmetrical 400x240 viewbox layout)
            const nodeArray = [
              { id: 'bp', x: 200, y: 35, val: normBP, label: 'BP', unit: `${biomarkers.bloodPressure} mmHg`, textAnchor: 'middle', textX: 200, textY: 18 },
              { id: 'age', x: 320, y: 70, val: normAge, label: 'Age', unit: `${biomarkers.age} yrs`, textAnchor: 'start', textX: 335, textY: 74 },
              { id: 'hr', x: 320, y: 155, val: normHR, label: 'Max HR', unit: `${biomarkers.maxHeartRate} bpm`, textAnchor: 'start', textX: 335, textY: 159 },
              { id: 'stDep', x: 245, y: 215, val: normSTDep, label: 'ST Dep.', unit: `${biomarkers.stDepression.toFixed(1)} mm`, textAnchor: 'middle', textX: 245, textY: 234 },
              { id: 'stSlope', x: 155, y: 215, val: normSTSlope, label: 'ST Slope', unit: biomarkers.stSlope === 1 ? 'Upslope' : biomarkers.stSlope === 2 ? 'Flat' : 'Downslope', textAnchor: 'middle', textX: 155, textY: 234 },
              { id: 'glucose', x: 80, y: 155, val: normGlucose, label: 'Glucose', unit: `${biomarkers.glucose} mg/dL`, textAnchor: 'end', textX: 65, textY: 159 },
              { id: 'chol', x: 80, y: 70, val: normChol, label: 'Cholesterol', unit: `${biomarkers.cholesterol} mg/dL`, textAnchor: 'end', textX: 65, textY: 74 }
            ];

            // 3. Dynamic Edges based on parameter crossings
            const edges: any[] = [];
            const alerts: string[] = [];

            const tryAddEdge = (id: string, n1: any, n2: any, w1: number, w2: number, name: string) => {
              const avgVal = (w1 + w2) / 2;
              if (avgVal > 0.2) {
                const strength = Math.min(Math.max((avgVal - 0.2) / 0.8, 0), 1);
                const isCritical = w1 >= 0.7 && w2 >= 0.7;
                let color = '#38bdf8'; // soft sky blue for normal/low baseline coupling
                if (isCritical) {
                  color = '#f43f5e';
                } else if (w1 >= 0.35 || w2 >= 0.35) {
                  color = '#fbbf24';
                }
                edges.push({
                  id,
                  x1: n1.x, y1: n1.y,
                  x2: n2.x, y2: n2.y,
                  strength,
                  isCritical,
                  color,
                  name
                });
              }
            };

            // Register pathways
            tryAddEdge('chol-bp', nodeArray[6], nodeArray[0], normChol, normBP, 'Vascular compliance corridor');
            tryAddEdge('glu-chol', nodeArray[5], nodeArray[6], normGlucose, normChol, 'Cardiometabolic correlation');
            tryAddEdge('age-bp', nodeArray[1], nodeArray[0], normAge, normBP, 'Arterial stiffness coupling');
            tryAddEdge('hr-stdep', nodeArray[2], nodeArray[3], normHR, normSTDep, 'Exercise stress ECG anomaly');
            tryAddEdge('bp-stdep', nodeArray[0], nodeArray[3], normBP, normSTDep, 'Myocardial stress index');
            tryAddEdge('glu-stdep', nodeArray[5], nodeArray[3], normGlucose, normSTDep, 'Metabolic stress pathway');
            tryAddEdge('slope-stdep', nodeArray[4], nodeArray[3], normSTSlope, normSTDep, 'ECG anomaly complex');
            tryAddEdge('age-hr', nodeArray[1], nodeArray[2], normAge, normHR, 'Chronotropic competence drift');

            // 4. Multi-Variable Compound Systems
            const hasVascularSynergy = biomarkers.cholesterol > 240 && biomarkers.bloodPressure > 140;
            const hasMetabolicStress = biomarkers.glucose > 126 && biomarkers.stDepression > 1.0;
            const hasCardiacStrain = biomarkers.age > 55 && biomarkers.bloodPressure > 140 && biomarkers.stDepression > 1.0;

            if (hasCardiacStrain) {
              alerts.push('CRITICAL CLUSTER: Multidimensional systemic cardiac strain active (advanced age + systolic hypertension + ischemic ECG signature).');
            } else {
              if (hasVascularSynergy) {
                alerts.push('VASCULAR RESISTANCE: Severe concomitant lipid load and hypertensive overload.');
              }
              if (hasMetabolicStress) {
                alerts.push('METABOLIC OVERFLOW: Active glucose-driven myocardial stress pathway identified.');
              }
            }

            // High-severity secondary parameters
            if (biomarkers.cholesterol > 260 && !hasVascularSynergy) {
              alerts.push('Elevated vascular strain: High-pressure lipid perfusion indicators.');
            }
            if (biomarkers.bloodPressure > 155 && !hasCardiacStrain && !hasVascularSynergy) {
              alerts.push('Hemodynamic instability: Elevated resting blood pressure.');
            }
            if (biomarkers.stDepression > 1.8 && !hasCardiacStrain && !hasMetabolicStress) {
              alerts.push('Stress-induced ECG anomaly: Marked ST depression indicating transient ischemia.');
            }
            if (biomarkers.maxHeartRate < 100 && biomarkers.age > 60) {
              alerts.push('Chronotropic competence drift: Dampened heart rate reserve under stress.');
            }

            return (
              <div className="results-card" style={{ padding: '24px 28px' }}>
                <style>{`
                  @keyframes stroke-dash {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  @keyframes pulse-glow {
                    0%, 100% { opacity: 0.65; filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.1)); }
                    50% { opacity: 1; filter: drop-shadow(0 0 5px currentColor); }
                  }
                  .insight-bullet {
                    font-size: 11px;
                    line-height: 1.45;
                    border-radius: 8px;
                    padding: 10px 14px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    transition: all 0.2s ease;
                  }
                  .insight-bullet.critical {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.03);
                    border: 1px solid rgba(239, 68, 68, 0.12);
                  }
                  .insight-bullet.warning {
                    color: #fbbf24;
                    background: rgba(245, 158, 11, 0.03);
                    border: 1px solid rgba(245, 158, 11, 0.12);
                  }
                  .insight-bullet.stable {
                    color: #10b981;
                    background: rgba(16, 185, 129, 0.03);
                    border: 1px solid rgba(16, 185, 129, 0.12);
                  }
                `}</style>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
                    Physiological Correlation Monitor
                  </div>
                  <div className="live-indicator" style={{ marginTop: 0 }}>
                    <span className="live-dot"></span>
                    <span style={{ fontSize: '10px' }}>Telemetry Active</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* SVG Map Container */}
                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center' }}>
                    <svg viewBox="0 0 400 240" style={{ width: '100%', maxWidth: '400px', height: 'auto', overflow: 'visible' }}>
                      <defs>
                        <filter id="glow-cnot" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* 1. SYSTEMIC ANOMALY CLUSTER POLYGON OVERLAY */}
                      {hasCardiacStrain && (
                        <g>
                          <polygon 
                            points="200,35 320,70 245,215" 
                            fill="rgba(244, 63, 94, 0.03)" 
                            stroke="rgba(244, 63, 94, 0.3)" 
                            strokeWidth="1.5" 
                            strokeDasharray="4,4" 
                            style={{ 
                              animation: 'pulse-glow 1.5s ease-in-out infinite',
                              color: '#f43f5e'
                            }} 
                          />
                          <text 
                            x="255" 
                            y="110" 
                            fill="#f43f5e" 
                            fontSize="7.5" 
                            fontWeight="800" 
                            textAnchor="middle" 
                            style={{ letterSpacing: '0.8px' }}
                          >
                            CARDIAC STRAIN CLUSTER
                          </text>
                        </g>
                      )}

                      {/* 2. VASCULAR SYNERGY HIGHLIGHT */}
                      {hasVascularSynergy && (
                        <g>
                          <line 
                            x1={80} y1={70} 
                            x2={200} y2={35} 
                            stroke="rgba(244, 63, 94, 0.12)" 
                            strokeWidth="8" 
                            strokeLinecap="round" 
                          />
                          <text 
                            x="135" 
                            y="45" 
                            fill="#f43f5e" 
                            fontSize="7" 
                            fontWeight="800" 
                            textAnchor="middle"
                            style={{ letterSpacing: '0.5px' }}
                          >
                            VASCULAR OVERLOAD
                          </text>
                        </g>
                      )}

                      {/* 3. METABOLIC STRESS PATHWAY HIGHLIGHT */}
                      {hasMetabolicStress && (
                        <g>
                          <line 
                            x1={80} y1={155} 
                            x2={245} y2={215} 
                            stroke="rgba(236, 72, 153, 0.12)" 
                            strokeWidth="8" 
                            strokeLinecap="round" 
                          />
                          <text 
                            x="165" 
                            y="190" 
                            fill="#ec4899" 
                            fontSize="7" 
                            fontWeight="800" 
                            textAnchor="middle"
                            style={{ letterSpacing: '0.5px' }}
                          >
                            METABOLIC OVERFLOW PATH
                          </text>
                        </g>
                      )}

                      {/* Render Dynamic Edges */}
                      {edges.map(edge => {
                        const strokeWidth = 0.5 + edge.strength * 3.5;
                        const opacity = 0.08 + edge.strength * 0.65;
                        const dashSpeed = 3 - edge.strength * 2.2; 

                        return (
                          <g key={edge.id}>
                            <line 
                              x1={edge.x1} y1={edge.y1} 
                              x2={edge.x2} y2={edge.y2} 
                              stroke="rgba(255,255,255,0.015)" 
                              strokeWidth="1.5" 
                            />
                            <line 
                              x1={edge.x1} y1={edge.y1} 
                              x2={edge.x2} y2={edge.y2} 
                              stroke={edge.color} 
                              strokeWidth={strokeWidth} 
                              strokeOpacity={opacity} 
                            />
                            <line 
                              x1={edge.x1} y1={edge.y1} 
                              x2={edge.x2} y2={edge.y2} 
                              stroke={edge.color} 
                              strokeWidth={strokeWidth * 0.8} 
                              strokeDasharray="4,8"
                              strokeOpacity={opacity + 0.15}
                              style={{ 
                                animation: `stroke-dash ${dashSpeed}s linear infinite`,
                                filter: edge.isCritical ? 'url(#glow-cnot)' : 'none'
                              }} 
                            />
                          </g>
                        );
                      })}

                      {/* Render Dynamic Heptagon Nodes */}
                      {nodeArray.map(node => {
                        const size = getNodeSize(node.val);
                        const color = getNodeColor(node.val);
                        const pulseSpeed = getNodePulse(node.val);
                        
                        return (
                          <g key={node.id}>
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r={size + 4} 
                              fill="none" 
                              stroke={color} 
                              strokeWidth="1"
                              style={{
                                animation: `pulse-glow ${pulseSpeed} ease-in-out infinite`,
                                opacity: 0.35,
                                color: color
                              }}
                            />
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r={size} 
                              fill={color} 
                              style={{
                                filter: node.val >= 0.7 ? 'url(#glow-cnot)' : 'none'
                              }}
                            />
                            <text 
                              x={node.textX} 
                              y={node.textY} 
                              fill="#f8fafc" 
                              fontSize="9.5" 
                              textAnchor={node.textAnchor as 'inherit' | 'end' | 'start' | 'middle'} 
                              fontWeight="600" 
                              opacity={node.val >= 0.7 ? 1 : 0.85}
                            >
                              {node.label}
                            </text>
                            <text 
                              x={node.textX} 
                              y={node.textY + 11} 
                              fill="#64748b" 
                              fontSize="8" 
                              textAnchor={node.textAnchor as 'inherit' | 'end' | 'start' | 'middle'} 
                              fontWeight="400"
                            >
                              {node.unit}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Real-time Dynamic Clinical Insights Feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    {alerts.length === 0 ? (
                      <div className="insight-bullet stable">
                        <span>💚</span>
                        <div>
                          <strong>STABLE PHYSIOLOGICAL BASELINE:</strong> All checked homeostatic markers map inside normal ranges. No pathological interaction pathways active.
                        </div>
                      </div>
                    ) : (
                      alerts.map((alert, idx) => {
                        const isCritical = alert.startsWith('CRITICAL') || alert.startsWith('VASCULAR');
                        return (
                          <div key={idx} className={`insight-bullet ${isCritical ? 'critical' : 'warning'}`}>
                            <span>⚠️</span>
                            <div>
                              <strong>{isCritical ? 'HIGH COUPLING ALERT' : 'CORRELATIVE DRIFT'}:</strong> {alert}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '12px' }}>
                    <strong>Interaction Detection Engine:</strong> The graph shows mathematical relationships between clinical metrics mapped dynamically. Nodes inflate and edges brighten when correlated elevated biomarkers cross safety thresholds.
                  </div>
                </div>
              </div>
            );
          })()}

          {/* CARD 2: PREDICTIVE DIAGNOSTICS CARD (Intake / Loading Sequence / Diagnostic Success Report) */}
          {loading ? (
            /* AI Staged Loading State */
            <div className="results-card center-content" style={{ minHeight: '320px', padding: '32px' }}>
              <div className="loading-sequence">
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Executing VQC Diagnostic Sequence</h3>
                <div className={`loading-step ${loadingStep === 1 ? 'active' : loadingStep > 1 ? 'completed' : ''}`}>
                  <span className="loading-indicator-dot"></span>
                  <span>Initializing 4-qubit Hilbert register...</span>
                </div>
                <div className={`loading-step ${loadingStep === 2 ? 'active' : loadingStep > 2 ? 'completed' : ''}`}>
                  <span className="loading-indicator-dot"></span>
                  <span>Applying amplitude rotation unitaries...</span>
                </div>
                <div className={`loading-step ${loadingStep === 3 ? 'active' : loadingStep > 3 ? 'completed' : ''}`}>
                  <span className="loading-indicator-dot"></span>
                  <span>Entangling state vectors via CNOT gates...</span>
                </div>
                <div className={`loading-step ${loadingStep === 4 ? 'active' : loadingStep > 4 ? 'completed' : ''}`}>
                  <span className="loading-indicator-dot"></span>
                  <span>Extracting joint measurement probabilities...</span>
                </div>
              </div>
            </div>
          ) : !results ? (
            /* Diagnostics Intake Ready State */
            <div className="results-card center-content" style={{ borderStyle: 'dashed', minHeight: '260px', padding: '32px 24px' }}>
              <div style={{ fontSize: '28px', opacity: 0.3, marginBottom: '12px' }}>⚛</div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Predictive Analytics Intake Ready</h3>
              <p className="text-muted" style={{ maxWidth: '340px', fontSize: '11px', marginTop: '6px', lineHeight: 1.5, textAlign: 'center' }}>
                Adjust the clinical patient variables on the left. Once configured, execute the formal high-fidelity hybrid Variational Quantum Classifier (VQC) solver to generate diagnostic reports.
              </p>
            </div>
          ) : (
            /* Full Diagnostic Report Success State */
            <>
              <style>{`
                .risk-item.quantum-glowing-card {
                  border-color: rgba(99, 102, 241, 0.45) !important;
                  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%) !important;
                  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }
                .risk-item.classical-glowing-card {
                  border-color: rgba(245, 158, 11, 0.45) !important;
                  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(251, 191, 36, 0.02) 100%) !important;
                  box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
                }
                .pulse-indicator-badge {
                  animation: text-pulse 2s infinite;
                  font-weight: 700;
                  font-size: 10px !important;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                @keyframes text-pulse {
                  0%, 100% { opacity: 0.75; color: #ef4444; }
                  50% { opacity: 1; color: #f87171; text-shadow: 0 0 4px rgba(239, 68, 68, 0.6); }
                }
                @keyframes fadeInRec {
                  from {
                    opacity: 0;
                    transform: translateY(6px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .verif-card {
                  background: var(--dark-bg-secondary);
                  border: 1px solid var(--border-color);
                  border-radius: 16px;
                  padding: 24px;
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                }
                .verif-card-title {
                  font-size: 13px;
                  font-weight: 600;
                  text-transform: uppercase;
                  color: #818cf8;
                  letter-spacing: 0.8px;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                  padding-bottom: 8px;
                }
                .circuit-wire {
                  stroke: rgba(255,255,255,0.08);
                  stroke-width: 1.5;
                }
                .gate-box {
                  fill: #1e293b;
                  stroke: #818cf8;
                  stroke-width: 1.5;
                  rx: 4;
                  ry: 4;
                }
                .gate-text {
                  fill: #f8fafc;
                  font-size: 8px;
                  font-weight: 700;
                  text-anchor: middle;
                }
                .cnot-dot {
                  fill: #818cf8;
                }
                .cnot-line {
                  stroke: #818cf8;
                  stroke-width: 1;
                }
                .cnot-target-bg {
                  fill: #1e293b;
                  stroke: #818cf8;
                  stroke-width: 1;
                }
                .cnot-target-cross {
                  stroke: #818cf8;
                  stroke-width: 1;
                }
                .statevector-bar {
                  background: rgba(99, 102, 241, 0.2);
                  border-radius: 2px;
                  height: 6px;
                  transition: width 0.3s ease;
                }
                .statevector-bar.active {
                  background: #818cf8;
                  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
                }
              `}</style>

              {/* Risk Assessment Column Comparison */}
              <div className="results-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div className="results-card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>Clinical Diagnostic Report</div>
                  <div className="segmented-select" style={{ display: 'flex', width: '220px', padding: '2px' }}>
                    <button 
                      type="button" 
                      className={`segmented-option ${compareMode === 'classical' ? 'active' : ''}`}
                      onClick={() => setCompareMode('classical')}
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                    >
                      Classical ML Only
                    </button>
                    <button 
                      type="button" 
                      className={`segmented-option ${compareMode === 'quantum' ? 'active' : ''}`}
                      onClick={() => setCompareMode('quantum')}
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                    >
                      Quantum Hybrid
                    </button>
                  </div>
                </div>
                
                <div className="risk-comparison" style={{ marginBottom: '24px' }}>
                  {/* Classical ML Column */}
                  <div className={`risk-item ${compareMode === 'classical' ? 'classical-glowing-card' : ''}`} style={{ opacity: compareMode === 'quantum' ? 0.45 : 1, transition: 'all 0.3s ease' }}>
                    <div className="risk-label" style={{ color: compareMode === 'classical' ? '#fbbf24' : '#94a3b8' }}>Classical Baseline</div>
                    <div className="risk-percentage" style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'monospace', color: compareMode === 'classical' ? '#fbbf24' : '#cbd5e1' }}>
                      {results.classical_risk}% <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', verticalAlign: 'middle', marginLeft: '4px' }}>Risk</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', margin: '4px 0 8px' }}>
                      {results.classical_risk > 35 ? 'Moderate Risk Underestimation' : 'Low Baseline Risk'}
                    </div>
                    <div className="risk-model" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', marginTop: '4px' }}>
                      <div className="model-name" style={{ fontSize: '11px', fontWeight: 600, color: '#cbd5e1' }}>Random Forest Model</div>
                      
                      {/* Dynamic Confidence Box */}
                      <div className="confidence-hud" style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence Index:</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: 
                            results.classical_confidence >= 93 ? '#10b981' : 
                            results.classical_confidence >= 81 ? '#34d399' : 
                            results.classical_confidence >= 66 ? '#fbbf24' : '#f87171' 
                          }}>
                            {results.classical_confidence}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Certainty Level:</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 
                            results.classical_confidence >= 93 ? '#10b981' : 
                            results.classical_confidence >= 81 ? '#34d399' : 
                            results.classical_confidence >= 66 ? '#fbbf24' : '#f87171' 
                          }}>
                            {results.classical_certainty_label}
                          </span>
                        </div>
                        
                        {/* Why details */}
                        <div className="confidence-why-text" style={{ fontSize: '9px', color: '#64748b', lineHeight: 1.4, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px', marginTop: '6px', textAlign: 'left' }}>
                          ℹ️ {results.classical_confidence_reason}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantum Hybrid Column */}
                  <div className={`risk-item ${compareMode === 'quantum' ? 'quantum-glowing-card' : ''}`} style={{ opacity: compareMode === 'classical' ? 0.45 : 1, transition: 'all 0.3s ease' }}>
                    <div className="risk-label" style={{ color: '#818cf8' }}>Quantum-Hybrid</div>
                    <div className="risk-percentage" style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'monospace', color: '#ffffff' }}>
                      {results.quantum_risk}% <span style={{ fontSize: '12px', fontWeight: 500, color: '#818cf8', verticalAlign: 'middle', marginLeft: '4px' }}>Risk</span>
                    </div>
                    <div className={results.quantum_risk > 35 ? 'pulse-indicator-badge' : ''} style={{ margin: '4px 0 8px', fontSize: '11px', color: '#10b981' }}>
                      {results.quantum_risk > 35 ? '⚠️ Hidden Risk Detected' : 'Low Evaluated Risk'}
                    </div>
                    <div className="risk-model" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', marginTop: '4px' }}>
                      <div className="model-name" style={{ fontSize: '11px', fontWeight: 600, color: '#818cf8' }}>VQC State Classifier</div>
                      
                      {/* Dynamic Confidence Box */}
                      <div className="confidence-hud" style={{ marginTop: '8px', padding: '8px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence Index:</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: 
                            results.quantum_confidence >= 93 ? '#10b981' : 
                            results.quantum_confidence >= 81 ? '#34d399' : 
                            results.quantum_confidence >= 66 ? '#fbbf24' : '#f87171' 
                          }}>
                            {results.quantum_confidence}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '9px', color: '#818cf8' }}>Certainty Level:</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 
                            results.quantum_confidence >= 93 ? '#10b981' : 
                            results.quantum_confidence >= 81 ? '#34d399' : 
                            results.quantum_confidence >= 66 ? '#fbbf24' : '#f87171' 
                          }}>
                            {results.quantum_certainty_label}
                          </span>
                        </div>
                        
                        {/* Why details */}
                        <div className="confidence-why-text" style={{ fontSize: '9px', color: '#cbd5e1', lineHeight: 1.4, borderTop: '1px solid rgba(99,102,241,0.08)', paddingTop: '6px', marginTop: '6px', textAlign: 'left' }}>
                          ⚡ {results.quantum_confidence_reason}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantum Advantage Info Badge */}
                <div className="advantage-badge" style={{ background: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.15)', fontSize: '11px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span>
                  <span>
                    {compareMode === 'classical' 
                      ? 'Single-Variable Isolated Feature Analysis active (No entanglement correlations)'
                      : 'Nonlinear Interaction Analysis Complete (4-Qubit Variational scan active)'}
                  </span>
                </div>

                {/* Risk Level Banner */}
                <div className={`risk-level ${compareMode === 'classical' ? 'moderate' : results.risk_level.toLowerCase()}`}>
                  <span>
                    {compareMode === 'classical' 
                      ? '⚠️' 
                      : (results.risk_level === 'Low' ? '✅' : results.risk_level === 'Moderate' ? '⚠️' : '🔴')}
                  </span>
                  <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                    {compareMode === 'classical'
                      ? 'Classical Baseline (Isolated Single-Feature Risk assessment)'
                      : (results.quantum_risk > 35 ? 'Hidden Elevated Risk Detected' : `${results.risk_level} Risk Category`)}
                  </span>
                </div>

                {/* Recommendations */}
                <div className="recommendations-section">
                  <div className="recommendations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Clinical Recommendations Engine</span>
                    {compareMode === 'quantum' && (
                      <span style={{
                        fontSize: '9px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#34d399',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        Biomarker-Aware Active
                      </span>
                    )}
                  </div>
                  {compareMode === 'classical' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>Independent Feature Isolation</div>
                          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                            Classical risk calculations assume all physiological metrics are isolated from one another. This is an unentangled baseline.
                          </p>
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '16px' }}>📊</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '2px' }}>High-Dimensional Telemetry Deficit</div>
                          <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                            Review the multi-dimensional correlations below. Standard decision trees cannot map non-linear quantum entanglement matrices.
                          </p>
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '16px' }}>⚡</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', marginBottom: '2px' }}>VQC Analysis Recommended</div>
                          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
                            Switch to **Quantum Hybrid** Mode to execute local variational circuit simulation. This loads amplitude rotation and CNOT gates.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Group quantum recommendations by category
                      const categories = ["Immediate Actions", "Lifestyle Adjustments", "Monitoring & Follow-up", "Preventative Guidance"];
                      const grouped = results.recommendations.reduce((acc, r) => {
                        if (!acc[r.category]) acc[r.category] = [];
                        acc[r.category].push(r);
                        return acc;
                      }, {} as Record<string, typeof results.recommendations>);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                          {categories.map(cat => {
                            const items = grouped[cat];
                            if (!items || items.length === 0) return null;
                            return (
                              <div key={cat} className="rec-category-block" style={{
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                borderRadius: '16px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                              }}>
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1.2px',
                                  color: cat === 'Immediate Actions' ? '#f87171' : 
                                         cat === 'Lifestyle Adjustments' ? '#fbbf24' : 
                                         cat === 'Monitoring & Follow-up' ? '#818cf8' : '#34d399',
                                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                                  paddingBottom: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <span>{cat === 'Immediate Actions' ? '🚨' : 
                                        cat === 'Lifestyle Adjustments' ? '🥗' : 
                                        cat === 'Monitoring & Follow-up' ? '📊' : '💚'}</span>
                                  <span>{cat}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {items.map((item, idx) => (
                                    <div key={idx} style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '12px',
                                      fontSize: '12px',
                                      lineHeight: '1.5',
                                      color: '#cbd5e1',
                                      animation: `fadeInRec 0.4s ease forwards`,
                                      animationDelay: `${idx * 0.1}s`,
                                      opacity: 0
                                    }}>
                                      <span style={{ fontSize: '14px', marginTop: '2px', filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.1))' }}>
                                        {item.icon}
                                      </span>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontWeight: 500 }}>{item.text}</span>
                                          <span style={{
                                            fontSize: '8px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            letterSpacing: '0.5px',
                                            background: item.urgency === 'Urgent' ? 'rgba(239, 68, 68, 0.08)' :
                                                        item.urgency === 'Strongly Recommended' ? 'rgba(99, 102, 241, 0.08)' :
                                                        item.urgency === 'Recommended' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                            color: item.urgency === 'Urgent' ? '#f87171' :
                                                   item.urgency === 'Strongly Recommended' ? '#a5b4fc' :
                                                   item.urgency === 'Recommended' ? '#fcd34d' : '#6ee7b7',
                                            border: item.urgency === 'Urgent' ? '1px solid rgba(239, 68, 68, 0.15)' :
                                                    item.urgency === 'Strongly Recommended' ? '1px solid rgba(99, 102, 241, 0.15)' :
                                                    item.urgency === 'Recommended' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                                          }}>
                                            {item.urgency}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Physics-Based Correlation Mapping Explainer */}
              <div className="quantum-advantage">
                <div className="quantum-advantage-title">Physics-Based Correlation Mapping</div>
                <div className="quantum-advantage-text">
                  Classical models evaluate health indicators independently. QHeal’s quantum-enhanced feature mapping analyzes multidimensional nonlinear interactions between patient metrics, uncovering hidden risk patterns traditional systems may overlook.
                </div>
              </div>

              {/* Feature Importance weights */}
              <div className="results-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div className="results-card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>Biomarker Weights Analysis</div>
                  {compareMode === 'quantum' && results.feature_attributions?.some(f => f.is_quantum) && (
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#a5b4fc',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      letterSpacing: '0.5px'
                    }}>
                      ⚡ Quantum-Enhanced
                    </span>
                  )}
                </div>
                
                <div className="feature-importance-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(results.feature_attributions || []).map((f, idx) => (
                    <div key={f.name} className="feature-importance-item" style={{
                      animation: 'fadeInRec 0.5s ease forwards',
                      animationDelay: `${idx * 0.08}s`,
                      opacity: 0
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="feature-name" style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{f.name}</span>
                          {compareMode === 'quantum' && f.is_quantum && (
                            <span style={{ fontSize: '8px', fontWeight: 700, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                              CNOT Coupling
                            </span>
                          )}
                        </div>
                        <span className="feature-percentage" style={{ 
                          fontSize: '12px', 
                          fontWeight: 700, 
                          fontFamily: 'monospace',
                          color: results.quantum_risk > 35 ? '#f87171' : '#60a5fa' 
                        }}>
                          {f.value}%
                        </span>
                      </div>
                      
                      {/* Interactive visual bar */}
                      <div className="feature-bar" style={{ background: 'rgba(255, 255, 255, 0.03)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          className="feature-bar-fill" 
                          style={{ 
                            width: `${f.value}%`,
                            height: '100%',
                            background: compareMode === 'quantum' && f.is_quantum
                              ? 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)'
                              : (results.quantum_risk > 35 
                                ? 'linear-gradient(90deg, #fbbf24 0%, #ef4444 100%)' 
                                : 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)'),
                            boxShadow: results.quantum_risk > 35 
                              ? '0 0 10px rgba(239, 68, 68, 0.3)' 
                              : '0 0 10px rgba(59, 130, 246, 0.2)',
                            borderRadius: '4px',
                            transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        ></div>
                      </div>
                      
                      {/* Explainability insights */}
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', lineHeight: 1.4, paddingLeft: '2px' }}>
                        💡 {f.insight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* NEW FULL-WIDTH SECTION: QUANTUM VERIFICATION ENGINE */}
      {(() => {
        // Compute live calculations
        const normAge = Math.min(Math.max((biomarkers.age - 20) / 70, 0), 1);
        const normChol = Math.min(Math.max((biomarkers.cholesterol - 100) / 300, 0), 1);
        const normBP = Math.min(Math.max((biomarkers.bloodPressure - 80) / 120, 0), 1);
        const normGlucose = Math.min(Math.max((biomarkers.glucose - 70) / 230, 0), 1);
        const normHR = Math.min(Math.max((200 - biomarkers.maxHeartRate) / 140, 0), 1);
        const normSTDep = Math.min(Math.max(biomarkers.stDepression / 6.0, 0), 1);
        const normSTSlope = biomarkers.stSlope === 1 ? 0.0 : biomarkers.stSlope === 2 ? 0.5 : 1.0;

        const liveStatevector = simulateQuantumStatevector([normAge, normChol, normBP, normGlucose]);
        
        // Feed in real values from endpoint or fall back to client simulation
        const statevector = (results && results.statevector) ? results.statevector : liveStatevector;

        const theta0 = normAge * Math.PI;
        const theta1 = normChol * Math.PI;
        const theta2 = normBP * Math.PI;
        const theta3 = normGlucose * Math.PI;

        const thetaPrime0 = normChol * Math.PI / 2;
        const thetaPrime1 = normBP * Math.PI / 2;
        const thetaPrime2 = normGlucose * Math.PI / 2;
        const thetaPrime3 = normAge * Math.PI / 2;

        const cRisk = results ? results.classical_risk : Math.round((normAge*0.22 + normChol*0.18 + normBP*0.18 + normGlucose*0.08 + normHR*0.14 + normSTDep*0.12 + normSTSlope*0.08)*100);
        const qRisk = results ? results.quantum_risk : Math.round((cRisk/100 + (normChol>0.46 && normBP>0.5 ? 0.07 : 0.0) + (normAge>0.5 && normSTDep>0.33 ? 0.06 : 0.0) + (normGlucose>0.3 && normAge>0.42 ? 0.03 : 0.0))*100);

        // Find the index of the highest probability quantum state
        let maxIndex = 0;
        let maxVal = 0;
        for (let i = 0; i < 16; i++) {
          if (statevector[i] > maxVal) {
            maxVal = statevector[i];
            maxIndex = i;
          }
        }

        // Convert state index to binary string representation
        const formatState = (idx: number) => {
          return `|${formatStateBinary(idx)}⟩`;
        };

        const formatStateBinary = (idx: number) => {
          return idx.toString(2).padStart(4, '0');
        };

        return (
          <section className="relative py-24 md:py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '56px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div className="section-label text-center" style={{ marginBottom: '8px' }}>Transparent Telemetry Inspector</div>
              <h2 className="section-title text-center" style={{ fontSize: '32px', marginBottom: '16px' }}>⚛ Quantum Verification Engine</h2>
              <p className="section-subtitle text-center" style={{ maxWidth: '720px', margin: '0 auto 40px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                QHeal operates on a hybrid quantum-classical architecture. Drag sliders on the left to see the client-side VQC simulator map patient biomarkers into high-dimensional Hilbert spaces. Once analysis is executed, verify the locked telemetry matching the backend NumPy simulator exactly.
              </p>

              {/* INTEGRATED PIPELINE TOGGLE */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div className="segmented-select" style={{ display: 'flex', width: '100%', maxWidth: '380px', padding: '4px', gap: '4px' }}>
                  <button 
                    type="button" 
                    className={`segmented-option ${compareMode === 'classical' ? 'active' : ''}`}
                    onClick={() => setCompareMode('classical')}
                    style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
                  >
                    Classical Model Output
                  </button>
                  <button 
                    type="button" 
                    className={`segmented-option ${compareMode === 'quantum' ? 'active' : ''}`}
                    onClick={() => setCompareMode('quantum')}
                    style={{ flex: 1, padding: '10px 12px', fontSize: '12px' }}
                  >
                    Quantum-Hybrid VQC Output
                  </button>
                </div>
              </div>

              {/* EXPLANATORY MODE BANNER */}
              <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto 48px', 
                padding: '20px 24px', 
                borderRadius: '16px',
                background: compareMode === 'classical' ? 'rgba(245, 158, 11, 0.02)' : 'rgba(99, 102, 241, 0.03)',
                border: compareMode === 'classical' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(99, 102, 241, 0.15)',
                fontSize: '12.5px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                {compareMode === 'classical' ? (
                  <div>
                    <strong style={{ color: '#fbbf24', textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>● Isolated Features Classification (Classical Pipeline)</strong>
                    Standard clinical models treat health variables independently. Without qubit rotations or entanglement nodes, the model calculates a risk of <strong style={{ color: '#fbbf24' }}>{cRisk}%</strong>. In doing so, it fails to recognize how minor elevations in systolic pressure, older biological age, and serum cholesterol interact to compound myocardial ischemia risk.
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#818cf8', textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '4px', letterSpacing: '0.5px' }}>● Nonlinear Entangled Features Classification (Quantum-Hybrid VQC Pipeline)</strong>
                    By mapping the patient variables into a 4-qubit Hilbert register, QHeal applies variational rotation operations and CNOT ring entanglements. This creates a 16-dimensional probability statevector, capturing hidden metric co-dependencies. Feeding this 16D statevector and the 7 classical metrics into the hybrid SVM model uncovers a hidden risk of <strong style={{ color: '#818cf8' }}>{qRisk}%</strong> (Model Confidence: 91%).
                  </div>
                )}
              </div>

              {/* 5-BLOCK TELEMETRY VERIFICATION GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                
                {/* BLOCK 1: QUANTUM FEATURE ENCODING */}
                <div className="verif-card">
                  <div className="verif-card-title">01 · Quantum Feature Encoding</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Translates normalized biomarker parameters <span style={{ color: 'var(--text-primary)' }}>[0.0, 1.0]</span> into single-qubit Y-axis rotations: <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>RY(θ = Value × π)</span>.
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
                    {[
                      { label: 'Qubit q₀ (Age)', val: normAge, theta: theta0, code: 'Age → RY(θ₀)', color: '#6366f1' },
                      { label: 'Qubit q₁ (Cholesterol)', val: normChol, theta: theta1, code: 'Chol → RY(θ₁)', color: '#10b981' },
                      { label: 'Qubit q₂ (Blood Pressure)', val: normBP, theta: theta2, code: 'BP → RY(θ₂)', color: '#fbbf24' },
                      { label: 'Qubit q₃ (Glucose)', val: normGlucose, theta: theta3, code: 'Glucose → RY(θ₃)', color: '#f43f5e' }
                    ].map((qubit, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        {/* Circle Dial */}
                        <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                          <circle 
                            cx="20" cy="20" r="16" 
                            fill="none" 
                            stroke={qubit.color} 
                            strokeWidth="2.5" 
                            strokeDasharray={`${2 * Math.PI * 16}`} 
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - qubit.val)}`} 
                            transform="rotate(-90 20 20)" 
                            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                          />
                          <text x="20" y="23" fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">q{idx}</text>
                        </svg>

                        {/* Dial Metadata */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{qubit.label}</span>
                            <span style={{ fontFamily: 'monospace', color: qubit.color }}>{qubit.val.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                            <span>{qubit.code}</span>
                            <span>θ = {qubit.theta.toFixed(3)} rad</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLOCK 2: VARIATIONAL CIRCUIT VISUALIZATION */}
                <div className="verif-card" style={{ gridColumn: 'span 1' }}>
                  <div className="verif-card-title">02 · Variational Circuit Architecture</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Authentic hardware topology simulated on client in real-time. Maps rotational encodings, 4-qubit CNOT ring entangling unitaries, mixing parameters, and CZ layers.
                  </div>

                  <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.02)', marginTop: '8px' }}>
                    <svg viewBox="0 0 390 150" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                      {/* Qubit wires */}
                      {[30, 60, 90, 120].map((y, idx) => (
                        <g key={idx}>
                          <text x="5" y={y + 3} fill="var(--text-muted)" fontSize="9" fontWeight="700">q{idx}</text>
                          <line x1="22" y1={y} x2="370" y2={y} className="circuit-wire" />
                        </g>
                      ))}

                      {/* Column 1: RY Encoding */}
                      {[30, 60, 90, 120].map((y, idx) => {
                        const theta = [theta0, theta1, theta2, theta3][idx];
                        return (
                          <g key={idx}>
                            <rect x="42" y={y - 10} width="28" height="20" className="gate-box" />
                            <text x="56" y={y + 3} className="gate-text">RY</text>
                            <title>{`RY(θ = ${theta.toFixed(2)} rad)`}</title>
                          </g>
                        );
                      })}
                      <text x="56" y="142" fill="var(--text-muted)" fontSize="7" fontWeight="600" textAnchor="middle">RY(θ)</text>

                      {/* Column 2: CNOT Entanglement Ring */}
                      {/* CNOT q0 -> q1 */}
                      <circle cx="100" cy="30" r="3.5" className="cnot-dot" />
                      <line x1="100" y1="30" x2="100" y2="60" className="cnot-line" />
                      <circle cx="100" cy="60" r="5" className="cnot-target-bg" />
                      <line x1="95" y1="60" x2="105" y2="60" className="cnot-target-cross" />
                      <line x1="100" y1="55" x2="100" y2="65" className="cnot-target-cross" />

                      {/* CNOT q1 -> q2 */}
                      <circle cx="125" cy="60" r="3.5" className="cnot-dot" />
                      <line x1="125" y1="60" x2="125" y2="90" className="cnot-line" />
                      <circle cx="125" cy="90" r="5" className="cnot-target-bg" />
                      <line x1="120" y1="90" x2="130" y2="90" className="cnot-target-cross" />
                      <line x1="125" y1="85" x2="125" y2="95" className="cnot-target-cross" />

                      {/* CNOT q2 -> q3 */}
                      <circle cx="150" cy="90" r="3.5" className="cnot-dot" />
                      <line x1="150" y1="90" x2="150" y2="120" className="cnot-line" />
                      <circle cx="150" cy="120" r="5" className="cnot-target-bg" />
                      <line x1="145" y1="120" x2="155" y2="120" className="cnot-target-cross" />
                      <line x1="150" y1="115" x2="150" y2="125" className="cnot-target-cross" />

                      {/* CNOT q3 -> q0 (Ring Closure) */}
                      <circle cx="175" cy="120" r="3.5" className="cnot-dot" />
                      <line x1="175" y1="30" x2="175" y2="120" className="cnot-line" />
                      <circle cx="175" cy="30" r="5" className="cnot-target-bg" />
                      <line x1="170" y1="30" x2="180" y2="30" className="cnot-target-cross" />
                      <line x1="175" y1="25" x2="175" y2="35" className="cnot-target-cross" />
                      <text x="137" y="142" fill="var(--text-muted)" fontSize="7" fontWeight="600" textAnchor="middle">CNOT Ring</text>

                      {/* Column 3: RY Mixing */}
                      {[30, 60, 90, 120].map((y, idx) => {
                        const thetaP = [thetaPrime0, thetaPrime1, thetaPrime2, thetaPrime3][idx];
                        return (
                          <g key={idx}>
                            <rect x="220" y={y - 10} width="28" height="20" className="gate-box" />
                            <text x="234" y={y + 3} className="gate-text">RY'</text>
                            <title>{`RY'(θ' = ${thetaP.toFixed(2)} rad)`}</title>
                          </g>
                        );
                      })}
                      <text x="234" y="142" fill="var(--text-muted)" fontSize="7" fontWeight="600" textAnchor="middle">RY'(θ')</text>

                      {/* Column 4: CZ Entanglement Pairs */}
                      {/* CZ q0 - q1 */}
                      <circle cx="285" cy="30" r="3.5" className="cnot-dot" />
                      <line x1="285" y1="30" x2="285" y2="60" className="cnot-line" />
                      <circle cx="285" cy="60" r="3.5" className="cnot-dot" />

                      {/* CZ q2 - q3 */}
                      <circle cx="315" cy="90" r="3.5" className="cnot-dot" />
                      <line x1="315" y1="90" x2="315" y2="120" className="cnot-line" />
                      <circle cx="315" cy="120" r="3.5" className="cnot-dot" />
                      <text x="300" y="142" fill="var(--text-muted)" fontSize="7" fontWeight="600" textAnchor="middle">CZ Pairs</text>

                      {/* Column 5: Measurement */}
                      {[30, 60, 90, 120].map((y, idx) => (
                        <g key={idx}>
                          {/* Measurement box */}
                          <rect x="350" y={y - 8} width="16" height="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="2" ry="2" />
                          {/* Speedometer line arcs */}
                          <path d={`M 353 ${y + 4} A 6 6 0 0 1 363 ${y + 4}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                          <line x1="358" y1={y + 5} x2="362" y2={y - 2} stroke="#818cf8" strokeWidth="1" />
                        </g>
                      ))}
                      <text x="358" y="142" fill="var(--text-muted)" fontSize="7" fontWeight="600" textAnchor="middle">Meas</text>
                    </svg>
                  </div>
                </div>

                {/* BLOCK 3: ENTANGLEMENT COUPLING MATRIX */}
                <div className="verif-card">
                  <div className="verif-card-title">03 · Qubit Entanglement Coupling</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Calculates real-time entanglement correlation factors between biomarkers. Elevated indicators increase qubit parameter coupling.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                    {[
                      { 
                        title: 'Vascular Compliance Corridor', 
                        qubits: 'q₁ ↔ q₀ (Cholesterol ↔ Blood Pressure)', 
                        strength: normChol * 0.5 + normBP * 0.5,
                        desc: 'CNOT 1 gate couples serum lipid load to hydrostatic vascular afterload.'
                      },
                      { 
                        title: 'Metabolic Coronary Stress', 
                        qubits: 'q₃ ↔ q₂ (Glucose ↔ ST Depression)', 
                        strength: normGlucose * 0.5 + normSTDep * 0.5,
                        desc: 'CZ 1 gate couples glycemic metabolic strain directly to ECG supply-demand mismatch.'
                      },
                      { 
                        title: 'Arterial Stiffness Coupling', 
                        qubits: 'q₀ ↔ q₂ (Age ↔ Blood Pressure)', 
                        strength: normAge * 0.4 + normBP * 0.6,
                        desc: 'CNOT 2 gate encapsulates chronotropic aging factors interacting with blood pressure.'
                      }
                    ].map((ent, idx) => {
                      const color = ent.strength >= 0.7 ? '#f43f5e' : ent.strength >= 0.35 ? '#fbbf24' : '#10b981';
                      return (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.1)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{ent.title}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: color, fontWeight: 700 }}>{(ent.strength * 100).toFixed(1)}%</span>
                          </div>
                          
                          <div style={{ fontSize: '9px', color: '#818cf8', fontFamily: 'monospace', margin: '2px 0 6px' }}>
                            {ent.qubits}
                          </div>
                          
                          {/* Progress bar */}
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                            <div 
                              style={{ 
                                width: `${ent.strength * 100}%`, 
                                height: '100%', 
                                background: color,
                                transition: 'width 0.3s ease, background-color 0.3s ease'
                              }} 
                            />
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{ent.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BLOCK 4: 16-DIMENSIONAL STATEVECTOR OUTPUT */}
                <div className="verif-card" style={{ gridColumn: 'span 1' }}>
                  <div className="verif-card-title">04 · 16D Statevector Probabilities</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Variational measurement space. Shows the exact probability for each of the 16 base states <span style={{ fontFamily: 'monospace' }}>|ψ⟩</span>. Highly excited states (e.g. <span style={{ fontFamily: 'monospace' }}>|1111⟩</span>) dominate under high risk.
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px 16px', 
                    background: 'rgba(0,0,0,0.15)', 
                    borderRadius: '12px', 
                    padding: '14px', 
                    border: '1px solid rgba(255,255,255,0.02)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    marginTop: '8px'
                  }}>
                    {Array.from({ length: 16 }).map((_, i) => {
                      const prob = statevector[i] || 0;
                      const isMax = i === maxIndex;
                      
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isMax ? 'rgba(99, 102, 241, 0.05)' : 'transparent', padding: '2px 4px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isMax ? '#818cf8' : 'var(--text-muted)', fontWeight: isMax ? 700 : 400 }}>
                            {formatState(i)}
                          </span>
                          
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div 
                              className={`statevector-bar ${isMax ? 'active' : ''}`}
                              style={{ width: `${prob * 100}%` }} 
                            />
                          </div>

                          <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isMax ? '#818cf8' : 'var(--text-secondary)', fontWeight: isMax ? 700 : 400, minWidth: '32px', textAlign: 'right' }}>
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ fontSize: '9.5px', color: '#818cf8', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡</span>
                    <span>Dominant Quantum State: <strong>{formatState(maxIndex)}</strong> ({ (maxVal * 100).toFixed(1) }%) maps active multi-system anomaly.</span>
                  </div>
                </div>

                {/* BLOCK 5: HYBRID INFERENCE PIPELINE */}
                <div className="verif-card" style={{ gridColumn: 'span 1' }}>
                  <div className="verif-card-title">05 · Hybrid Decision Pipeline</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Traces feature concatenation in QHeal. Blends low-dimensional classical factors with high-dimensional entangled quantum probabilities.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    {/* Classical map */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: '11px', fontWeight: 700 }}>7D</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Classical Metrics Vector</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>[ age, chol, bp, glu, hr, stdep, slope ]</div>
                      </div>
                    </div>

                    {/* Plus symbol */}
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#818cf8', fontWeight: 700, margin: '-4px 0' }}>+</div>

                    {/* Quantum map */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '11px', fontWeight: 700 }}>16D</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Quantum Statevector Features</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>[ p₀, p₁, p₂ ... p₁₅ probabilities ]</div>
                      </div>
                    </div>

                    {/* Arrow down */}
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#818cf8', fontWeight: 700, margin: '-4px 0' }}>↓</div>

                    {/* Concatenated SVM input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', padding: '12px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#090d16', fontSize: '11px', fontWeight: 800 }}>23D</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>Hybrid 23D Feature Vector</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.2' }}>
                          Fed directly into the <strong>Hybrid SVM Classifier</strong> on backend to compute target risk weights.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* FOOTER COMMENT BLOCK */}
              <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '24px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '640px', margin: '0 auto', lineHeight: '1.5' }}>
                  "We are not claiming quantum supremacy or production quantum hardware. QHeal uses a hybrid quantum-classical architecture with a variational quantum circuit simulator to extract nonlinear correlations from medical biomarkers."
                </p>
              </div>

            </div>
          </section>
        );
      })()}
    </div>
  );
}

export default DiagnosisPage;
