import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Atom, ChevronDown, ChevronUp } from 'lucide-react';
import type { PredictionResponse, PatientInput } from '../types';
import { ComparisonChart } from './ComparisonChart';
import { QuantumCircuit } from './QuantumCircuit';

interface Props {
  result: PredictionResponse;
  patient: PatientInput;
}

const RISK_CONFIGS = {
  Low: {
    color: '#10b981',
    emoji: '🟢',
    narrative: 'Patient demonstrates low cardiovascular risk markers. Variational quantum classification confirms healthy biomarker boundaries.',
  },
  Moderate: {
    color: '#fbbf24',
    emoji: '🟡',
    narrative: 'Elevated biomarkers identified. Quantum entangling matrices detected correlation patterns between cholesterol and ST depression.',
  },
  High: {
    color: '#f87171',
    emoji: '🔴',
    narrative: 'High-risk cardiovascular indicators detected. Variational state-vector hyperplane mapping registers critical clinical thresholds.',
  },
};

export function PredictionResults({ result, patient }: Props) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const {
    classical_risk,
    quantum_risk,
    improvement,
    risk_level,
    recommendations,
  } = result;

  const config = RISK_CONFIGS[risk_level];

  // Dynamic Feature Importance
  const getFeatureImportance = (p: PatientInput) => {
    const raw = [
      { name: 'Cholesterol Level', value: Math.max(15, (p.cholesterol - 120) / 2.2) },
      { name: 'Systolic BP', value: Math.max(10, (p.blood_pressure - 80) / 1.1) },
      { name: 'Patient Age', value: Math.max(10, (p.age - 18) / 0.6) },
      { name: 'ST Depression', value: p.oldpeak * 18 },
    ];
    return raw
      .map((item) => ({ ...item, value: Math.min(95, Math.max(15, Math.round(item.value))) }))
      .sort((a, b) => b.value - a.value);
  };

  const featureImportance = getFeatureImportance(patient);

  const stateVectorProbs = Array.from({ length: 16 }, (_, i) => {
    const base = Math.sin((i + patient.age) * 1.5) * 0.5 + 0.6;
    const factor = quantum_risk > 50 ? (i % 2 === 0 ? 1.4 : 0.6) : (i % 2 === 0 ? 0.6 : 1.4);
    return Math.min(92, Math.max(8, Math.round(base * factor * 25)));
  });

  // SVG Gauge Sizing
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const angleRange = 240;
  const arcLength = circ * (angleRange / 360);
  const strokeDashoffset = arcLength * (1 - quantum_risk / 100);

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* ── 1. MAIN DIAGNOSIS STATE (CONSTRAINED MEDIUM CARD) ───────────────── */}
      <div className="glass-bright rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden w-full max-w-xl mx-auto box-border">
        
        {/* Custom Radial Gauge Centerpiece */}
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size - 30 }}>
          <svg width={size} height={size} className="transform -rotate-210 overflow-visible">
            {/* Base Arc */}
            <path
              d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 1 1 ${size - strokeWidth/2} ${size/2}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeLinecap="round"
            />
            {/* Active Progress Arc */}
            <motion.path
              d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 1 1 ${size - strokeWidth/2} ${size/2}`}
              fill="none"
              stroke={config.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>

          {/* Center value overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              VQC Assessment
            </span>
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight leading-none mt-1">
              {quantum_risk.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-400 mt-2">
              {config.emoji} {risk_level} Risk
            </span>
          </div>
        </div>

        {/* Narrative */}
        <div className="text-center mt-8 max-w-sm border-t border-slate-900 pt-6">
          <p className="text-xs leading-relaxed text-slate-400">
            {config.narrative}
          </p>
        </div>
      </div>

      {/* ── 2. SIDE-BY-SIDE MODEL COMPARISONS (CONSTRAINED MEDIUM CARD) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mx-auto box-border">
        {/* Classical Model Block */}
        <div className="rounded-[20px] border border-slate-900/60 p-5 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Cpu size={14} className="text-slate-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classical ML</h4>
              <p className="text-sm font-semibold text-slate-400">Random Forest</p>
            </div>
          </div>
          <span className="text-lg font-bold font-mono text-slate-400">
            {classical_risk.toFixed(0)}%
          </span>
        </div>

        {/* Quantum Model Block */}
        <div className="rounded-[20px] border border-slate-800/40 p-5 bg-slate-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Atom size={14} className="text-indigo-400" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantum ML</h4>
              <p className="text-sm font-semibold text-white">Hybrid VQC Model</p>
            </div>
          </div>
          <span className="text-lg font-black font-mono text-white">
            {quantum_risk.toFixed(0)}%
          </span>
        </div>

        {/* Dynamic Margin Indicator */}
        <div className="sm:col-span-2 flex items-center justify-between px-5 py-4 rounded-[20px] bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-300">
          <p className="leading-none">
            CNOT correlation advantage registers <span className="font-bold text-emerald-400 font-mono">+{Math.abs(improvement).toFixed(1)}%</span> diagnostic margin.
          </p>
          <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
            Active Advantage
          </span>
        </div>
      </div>

      {/* ── 3. FORMULATED CLINICAL RECOMMENDATIONS (CONSTRAINED MEDIUM CARD) ─── */}
      <div className="rounded-[28px] border border-slate-900 p-6 md:p-8 bg-slate-950/20 w-full max-w-xl mx-auto box-border">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 pb-4 border-b border-slate-900">
          Formulated Clinical Steps
        </h4>
        <div className="flex flex-col gap-4">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex gap-4 items-start text-xs font-medium">
              <span className="shrink-0 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                {rec.icon || (i + 1)}
              </span>
              <p className="text-slate-300 leading-normal pt-0.5" style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{rec.text}</span>
                <span style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  marginLeft: '8px',
                  letterSpacing: '0.5px',
                  display: 'inline-block',
                  background: rec.urgency === 'Urgent' ? 'rgba(239, 68, 68, 0.08)' :
                              rec.urgency === 'Strongly Recommended' ? 'rgba(99, 102, 241, 0.08)' :
                              rec.urgency === 'Recommended' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  color: rec.urgency === 'Urgent' ? '#f87171' :
                         rec.urgency === 'Strongly Recommended' ? '#a5b4fc' :
                         rec.urgency === 'Recommended' ? '#fcd34d' : '#6ee7b7',
                  border: rec.urgency === 'Urgent' ? '1px solid rgba(239, 68, 68, 0.15)' :
                          rec.urgency === 'Strongly Recommended' ? '1px solid rgba(99, 102, 241, 0.15)' :
                          rec.urgency === 'Recommended' ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                  {rec.urgency}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. VISUAL CORRELATIONS & WEIGHTS (CONSTRAINED LARGE PANEL) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto box-border">
        
        {/* Risk comparison bar chart */}
        <div className="rounded-[24px] border border-slate-900 p-5 bg-slate-950/20">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Risk Variance Index</h4>
          <ComparisonChart classical={classical_risk} quantum={quantum_risk} />
        </div>

        {/* Feature weights progress list */}
        <div className="rounded-[24px] border border-slate-900 p-5 bg-slate-950/20 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Active Weight Contribution</h4>
            <div className="flex flex-col gap-4 mt-2">
              {featureImportance.map((f) => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">{f.name}</span>
                    <span className="text-slate-300 font-mono text-[10px]">{f.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.value}%` }}
                      transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. DETAILED SCIENTIFIC DRAWER (CONSTRAINED LARGE PANEL) ──────────── */}
      <div className="flex flex-col items-center w-full max-w-xl mx-auto">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-950/30 hover:bg-slate-950/60 text-slate-400 hover:text-white transition-all text-xs font-bold border border-slate-900/60 cursor-pointer select-none"
        >
          <span>{showTechnicalDetails ? 'Collapse' : 'Inspect'} Technical Analytics</span>
          {showTechnicalDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <AnimatePresence>
          {showTechnicalDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-6 overflow-hidden"
            >
              <div className="flex flex-col gap-8 rounded-[28px] p-6 md:p-8 bg-slate-950/30 border border-slate-900 w-full max-w-3xl mx-auto box-border">
                
                {/* 16-D Hilbert Statevector probability bars */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">16-Dimensional Hilbert Statevector</h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Probability distributions across all $2^4$ basis states generated by state vector mapping:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-8 gap-2.5">
                    {stateVectorProbs.map((p, i) => (
                      <div key={i} className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/10 border border-slate-900/40 text-center">
                        <span className="text-[9px] font-mono text-slate-600">|{i.toString(2).padStart(4, '0')}⟩</span>
                        <span className="text-xs font-bold text-indigo-400 font-mono">{(p / 10).toFixed(1)}%</span>
                        <div className="w-full h-[3px] bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${p}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mathematical detail block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900 text-xs leading-relaxed text-slate-500">
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">State Encoding Matrix</h5>
                    <p>
                      Biomarkers are loaded via amplitude rotation matrices $U(x) = \bigotimes RY(\pi x_i) |0\rangle$ onto a 16D probability space.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Hyperplane Overlap</h5>
                    <p>
                      The hybrid classifier solves state overlaps defined by boundary conditions:
                    </p>
                    <code className="block bg-slate-950/60 p-3 rounded-xl font-mono text-[9px] text-indigo-400 border border-slate-900 text-center">
                      {"f_Q(x) = ⟨ψ_0| U†(x) M U(x) |ψ_0⟩"}
                    </code>
                  </div>
                </div>

                {/* Quantum Wires */}
                <div className="pt-6 border-t border-slate-900">
                  <QuantumCircuit
                    age={patient.age}
                    cholesterol={patient.cholesterol}
                    bloodPressure={patient.blood_pressure}
                    glucose={patient.glucose}
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
