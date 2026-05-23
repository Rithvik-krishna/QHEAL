import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
    >
      {/* ── Abstract Bloch Sphere Representation (Cinematic Quantum Visual) ──── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="relative opacity-25"
          style={{ width: 480, height: 480 }}
        >
          {/* Subtle radial cloud */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-indigo-500/10 via-sky-500/5 to-transparent blur-3xl" />
          
          {/* Latitudes & Longitudes */}
          <div className="absolute inset-0 border border-slate-800/40 rounded-full" />
          <div className="absolute inset-x-0 inset-y-12 border border-slate-800/30 rounded-full transform rotateX(60deg)" />
          <div className="absolute inset-x-12 inset-y-0 border border-slate-800/30 rounded-full transform rotateY(60deg)" />
          
          {/* Wires */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/50 to-transparent" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-slate-800/50 to-transparent" />
        </motion.div>
      </div>

      {/* Content wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-4xl"
      >
        {/* Sleek single tag pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/60 text-xs font-semibold tracking-wider uppercase text-slate-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          PennyLane VQC Simulator
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95] text-white"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400">QUANTUM-DRIVEN</span>
          <br />
          <span>DISEASE ANALYSIS</span>
        </motion.h1>

        {/* Cinematic Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-400 font-medium"
        >
          Mapping cardiac profiles into a <span className="text-white font-semibold">16-dimensional quantum state space</span> to diagnose critical anomalies that classical neural networks overlook.
        </motion.p>

        {/* Minimal CTA Cluster */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-2"
        >
          <a
            href="#patient-form"
            className="btn-quantum font-semibold text-sm no-underline flex items-center gap-2 group"
          >
            Run Clinical Diagnosis
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-slate-900/10 hover:bg-slate-900/40 text-slate-300 hover:text-white transition-all text-sm font-semibold no-underline"
          >
            How It Works
          </a>
        </motion.div>
      </motion.div>

      {/* ── Premium Minimalist Stats Grid ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-28 w-full max-w-3xl border-t border-slate-900/80 pt-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 items-center">
          {[
            { value: '16D', label: 'Quantum Space Mapping' },
            { value: '+8.4%', label: 'Risk Accuracy Advantage' },
            { value: '4 Qubits', label: 'Variational CNOT Ring' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center relative">
              {/* Divider for desktop grid columns */}
              {i > 0 && (
                <div className="hidden sm:block absolute left-[-8px] top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-900" />
              )}
              <div
                className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-mono tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-2 text-center">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
