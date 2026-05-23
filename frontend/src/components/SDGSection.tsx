import { motion } from 'framer-motion';

const goals = [
  {
    icon: '🌍',
    title: 'Regional Accessibility',
    body: 'Designed to execute locally on standard clinic computers without active network dependencies, facilitating deployment in regional healthcare hubs.',
  },
  {
    icon: '🔬',
    title: 'Applied Physics',
    body: 'Integrates real Variational Quantum Classifier (VQC) architectures to capture exponential multi-variable risk thresholds from patient ECG records.',
  },
  {
    icon: '📊',
    title: 'Diagnostic Precision',
    body: 'Identifies cardiovascular risk indices years earlier, establishing new dimensions of preventative care that preserve patient outcomes.',
  },
  {
    icon: '🤝',
    title: 'Collaborative Core',
    body: 'The complete mathematical models, simulator pipelines, and training algorithms are open-access, supporting joint global scientific research.',
  },
];

export function SDGSection() {
  return (
    <div className="w-full">
      
      {/* ── Monumental Statistic Centerpiece (Centered, Constrained width) ──── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[32px] border border-slate-900/60 p-10 md:p-20 flex flex-col items-center text-center bg-slate-950/10 mb-28 relative overflow-hidden w-full max-w-4xl mx-auto box-border"
      >
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
          Global Cardiology Burden
        </span>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-8xl md:text-[11rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 leading-none tracking-tight my-8 text-center mx-auto"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          17.9M
        </motion.div>
        <h3 className="text-base md:text-lg font-bold text-slate-300 tracking-tight max-w-md mx-auto leading-relaxed text-center">
          lives lost annually to preventable cardiovascular conditions.
        </h3>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-4 leading-relaxed text-center">
          QHeal explores new physics-based diagnostic parameters to identify critical risk anomalies earlier and preserve patient health.
        </p>
      </motion.div>

      {/* ── UN SDG Goal 3 Context Header (Centered, Constrained width) ────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center mb-16 max-w-2xl mx-auto"
      >
        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-slate-900 border border-slate-800 text-slate-500">
          UN SDG Goal 3 Aligned
        </span>
        <h2
          className="text-2xl md:text-4xl font-extrabold mb-4 text-white tracking-tight mt-6 text-center"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Democratic Medical Analytics
        </h2>
        <p className="text-xs max-w-md text-center leading-relaxed text-slate-500 font-medium">
          Advancing early cardiac risk prediction frameworks that execute locally in regional medical clinics everywhere, bypassing expensive network requirements.
        </p>
      </motion.div>

      {/* ── Clinical Accessibility Grid (Centered, Constrained width) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 w-full max-w-5xl mx-auto box-border">
        {goals.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-950/10 border border-slate-900/60 rounded-[20px] p-6 flex flex-col gap-4 hover:border-slate-800 transition-colors"
          >
            <div className="text-xl">{g.icon}</div>
            <div>
              <h3
                className="font-bold text-xs text-white mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {g.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-medium">
                {g.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
