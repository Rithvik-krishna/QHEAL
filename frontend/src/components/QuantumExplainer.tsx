import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Compounding Biomarkers',
    body: 'Random Forests assess indicators along flat axes, failing to identify exponential interactions between co-occurring anomalies.',
    icon: '📊',
  },
  {
    step: '02',
    title: 'Superposition Mapping',
    body: 'Biomarkers are loaded as rotation unitaries on 4 qubits, mapping data indices onto a 16-dimensional probability sphere.',
    icon: '⚛️',
  },
  {
    step: '03',
    title: 'CNOT Ring Entanglement',
    body: 'Physics-based gates entangle all active qubits simultaneously, capturing hidden medical correlations in parallel.',
    icon: '🔗',
  },
  {
    step: '04',
    title: 'Decision Hyperplanes',
    body: 'A support vector classifier reads the 16D Hilbert probabilities, drawing decision borders classical models cannot achieve.',
    icon: '🎯',
  },
];

export function QuantumExplainer() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* Header section with constrained text widths and centring */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center flex flex-col items-center mb-16"
      >
        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-500">
          Core Methodology
        </span>
        <h2
          className="text-3xl md:text-5xl font-black mb-6 text-white tracking-tight mt-6 text-center max-w-2xl"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Compounding Medical Correlations
        </h2>
        <p className="text-xs text-slate-500 max-w-xl text-center leading-relaxed font-medium">
          Traditional neural networks analyze biomarkers flatly. Quantum states explore curved high-dimensional surfaces where exponential disease patterns reside.
        </p>
      </motion.div>

      {/* Spacious Horizontal Grid Timeline (Centered Columns, Max Card Width Constraints) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative mt-16 pb-6 w-full">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4 relative group w-full max-w-[290px] mx-auto box-border"
          >
            {/* Elegant Horizontal Connector Rule */}
            <div className="hidden md:block absolute left-0 right-0 top-0 h-[1px] bg-slate-900 z-0 group-hover:bg-slate-850 transition-colors" />
            
            <div className="flex items-center justify-between md:pt-6 relative z-10">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[9px] font-bold font-mono text-slate-600">
                STEP {s.step}
              </span>
            </div>
            
            <div className="mt-2">
              <h3
                className="font-bold text-sm text-white mb-2 tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {s.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-medium">
                {s.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison visual cards (Centered constrained row) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mt-24 rounded-[32px] bg-slate-950/10 border border-slate-900 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl mx-auto box-border"
      >
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 block mb-2">
            01 · Classical Framework
          </span>
          <h4 className="font-extrabold text-base text-slate-400 mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Linear Flat Diagnostics
          </h4>
          <p className="text-xs leading-relaxed text-slate-500 font-medium">
            Assesses patient profiles as independent flat variables. Fails to identify compound cardiovascular thresholds where normal values co-occur with Flat ECG slopes to double true clinical risk.
          </p>
        </div>
        <div className="md:border-l md:border-slate-900 md:pl-16">
          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 block mb-2">
            02 · Quantum Framework
          </span>
          <h4 className="font-extrabold text-base text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Hilbert Space Kernel Mapping
          </h4>
          <p className="text-xs leading-relaxed text-slate-400 font-medium">
            Encodes patients into a unified 16-dimensional quantum coordinate system. Evaluates entire metric intersections simultaneously via physical entangling matrices to catch hidden anomalies.
          </p>
        </div>
      </motion.div>

    </div>
  );
}
