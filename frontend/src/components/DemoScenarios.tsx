import { motion } from 'framer-motion';
import { DEMO_SCENARIOS } from '../lib/scenarios';
import type { PatientInput } from '../types';

interface Props {
  onSelect: (values: PatientInput) => void;
}

export function DemoScenarios({ onSelect }: Props) {
  return (
    <div id="demo-scenarios" className="w-full border-b border-slate-900 pb-10">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
        <span>⚡</span> Presets & Clinical Scenarios
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_SCENARIOS.map((scenario, i) => (
          <motion.button
            key={scenario.id}
            id={`scenario-${scenario.id}`}
            onClick={() => onSelect(scenario.values)}
            whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255,255,255,0.01)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.06 }}
            className="w-full h-full text-left p-6 rounded-2xl cursor-pointer bg-slate-950/20 border border-slate-900 transition-all duration-300 flex flex-col justify-between box-border"
            style={{ minHeight: 140 }}
          >
            <div>
              <div className="text-2xl mb-3">{scenario.icon}</div>
              <h4 className="font-bold text-sm text-white mb-1.5 tracking-tight">
                {scenario.label}
              </h4>
              <p className="text-xs leading-relaxed text-slate-500 font-medium">
                {scenario.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
