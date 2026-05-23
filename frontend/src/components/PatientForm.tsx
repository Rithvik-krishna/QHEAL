import * as React from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Zap, TrendingUp, BarChart2, Heart } from 'lucide-react';
import type { PatientInput } from '../types';

interface FieldConfig {
  key: keyof PatientInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  description: string;
  warningThreshold?: number;
}

const BASELINE_FIELDS: FieldConfig[] = [
  {
    key: 'age', label: 'Patient Age Profile', unit: 'years',
    min: 18, max: 90, step: 1,
    icon: Activity,
    description: 'Patient age in chronological years.',
  }
];

const METABOLIC_FIELDS: FieldConfig[] = [
  {
    key: 'cholesterol', label: 'Total Serum Cholesterol', unit: 'mg/dL',
    min: 100, max: 400, step: 5,
    icon: BarChart2,
    description: 'Total serum lipid concentration.',
    warningThreshold: 240,
  },
  {
    key: 'glucose', label: 'Fasting Blood Glucose', unit: 'mg/dL',
    min: 70, max: 300, step: 5,
    icon: Thermometer,
    description: 'Fasting blood sugar concentration indices.',
    warningThreshold: 126,
  }
];

const HEMODYNAMIC_FIELDS: FieldConfig[] = [
  {
    key: 'blood_pressure', label: 'Resting Systolic BP', unit: 'mmHg',
    min: 80, max: 200, step: 1,
    icon: TrendingUp,
    description: 'Resting hemodynamic blood pressure.',
    warningThreshold: 140,
  },
  {
    key: 'max_heart_rate', label: 'Peak Exercise Heart Rate', unit: 'bpm',
    min: 60, max: 220, step: 1,
    icon: Heart,
    description: 'Maximum heart rate recorded under stress.',
  },
  {
    key: 'oldpeak', label: 'Exercise ST Depression', unit: 'mm',
    min: 0, max: 6, step: 0.1,
    icon: Zap,
    description: 'Exercise-induced electrocardiogram ST segment deviation.',
    warningThreshold: 2.0,
  }
];

const ST_SLOPE_OPTIONS = [
  { value: 1, label: 'Upsloping', sublabel: 'Normal recovery curve' },
  { value: 2, label: 'Flat',      sublabel: 'Ischemic risk state' },
  { value: 3, label: 'Downsloping', sublabel: 'Significant blockage indicator' },
];

interface Props {
  values: PatientInput;
  onChange: (v: PatientInput) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function PatientForm({ values, onChange, onSubmit, loading }: Props) {
  const set = (key: keyof PatientInput, val: number) =>
    onChange({ ...values, [key]: val });

  const pct = (f: FieldConfig) =>
    ((values[f.key] as number) - f.min) / (f.max - f.min) * 100;

  const renderField = (field: FieldConfig, _index: number) => {
    const val = values[field.key] as number;
    const isWarning = field.warningThreshold !== undefined && val >= field.warningThreshold;
    
    return (
      <div
        key={field.key}
        className="rounded-[20px] p-6 transition-all duration-300 border border-slate-900 bg-slate-950/20 hover:border-slate-800/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <field.icon size={13} className={isWarning ? 'text-amber-400' : 'text-slate-500'} />
              <span className="text-sm font-bold text-white tracking-tight">
                {field.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">
              {field.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {isWarning && (
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Elevated
              </span>
            )}
            <span className="text-base font-black font-mono text-white">
              {field.step < 1 ? val.toFixed(1) : Math.round(val)}{' '}
              <span className="text-[10px] font-semibold text-slate-500 font-sans">
                {field.unit}
              </span>
            </span>
          </div>
        </div>

        <input
          id={`slider-${field.key}`}
          type="range"
          className="q-slider"
          min={field.min}
          max={field.max}
          step={field.step}
          value={val}
          style={{
            background: `linear-gradient(90deg, ${isWarning ? 'var(--risk-moderate)' : 'var(--quantum-purple)'} ${pct(field)}%, rgba(255, 255, 255, 0.05) ${pct(field)}%)`,
          }}
          onChange={e => set(field.key, parseFloat(e.target.value))}
        />

        <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-mono">
          <span>{field.min}</span>
          <span>{field.max}</span>
        </div>
      </div>
    );
  };

  return (
    <motion.section
      id="patient-form"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-bright rounded-[32px] p-8 md:p-12 flex flex-col gap-10 w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 pb-8 border-b border-slate-900/80">
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} className="shrink-0">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Biomarker Diagnostics
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure clinical markers for quantum mapping simulation.
          </p>
        </div>
      </div>

      {/* Group 1: Demographic Baseline */}
      <div className="flex flex-col gap-5">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          01 · Demographic baseline
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {BASELINE_FIELDS.map((f, i) => renderField(f, i))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-slate-900/80" />

      {/* Group 2: Metabolic Indices */}
      <div className="flex flex-col gap-5">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          02 · Metabolic Indicators
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {METABOLIC_FIELDS.map((f, i) => renderField(f, i))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-slate-900/80" />

      {/* Group 3: Hemodynamics */}
      <div className="flex flex-col gap-5">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          03 · Hemodynamic Profiles
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {HEMODYNAMIC_FIELDS.map((f, i) => renderField(f, i))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-slate-900/80" />

      {/* Segmented Option: ST Slope */}
      <div className="flex flex-col gap-5 pb-4">
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          04 · Electrocardiogram ST Slope Curve
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ST_SLOPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              id={`st-slope-${opt.value}`}
              onClick={() => set('st_slope', opt.value)}
              className="rounded-[20px] p-4 text-left cursor-pointer transition-all duration-300"
              style={{
                background: values.st_slope === opt.value
                  ? 'rgba(255, 255, 255, 0.02)'
                  : 'transparent',
                border: `1px solid ${values.st_slope === opt.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255,255,255,0.03)'}`,
                boxShadow: values.st_slope === opt.value ? 'inset 0 1px 0 rgba(255,255,255,0.03)' : 'none',
              }}
            >
              <div className={`font-bold text-xs tracking-tight ${values.st_slope === opt.value ? 'text-white' : 'text-slate-500'}`}>
                {opt.label}
              </div>
              <div className="text-[10px] mt-1 text-slate-500 font-medium leading-normal">{opt.sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Diagnose Trigger Button */}
      <motion.button
        id="predict-btn"
        onClick={onSubmit}
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.01, y: -1 }}
        whileTap={loading ? {} : { scale: 0.99 }}
        className="btn-quantum w-full py-4 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer border-none"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin-slow" />
            Executing local VQC matrix…
          </>
        ) : (
          <>
            <span>⚛️</span> Run Quantum ML Analysis
          </>
        )}
      </motion.button>
    </motion.section>
  );
}
