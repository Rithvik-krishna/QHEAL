import { motion } from 'framer-motion';

interface Props {
  recommendations: string[];
  riskLevel: 'Low' | 'Moderate' | 'High';
}

const RISK_CONFIG = {
  Low:      { color: 'var(--risk-low)',      bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)',  badge: 'badge-low' },
  Moderate: { color: 'var(--risk-moderate)', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', badge: 'badge-moderate' },
  High:     { color: 'var(--risk-high)',     bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.2)',  badge: 'badge-high' },
};

export function RecommendationsPanel({ recommendations, riskLevel }: Props) {
  const cfg = RISK_CONFIG[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl p-6"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {riskLevel === 'Low' ? '✅' : riskLevel === 'Moderate' ? '⚠️' : '🚨'} {riskLevel} Risk
        </div>
        <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          AI Recommendations
        </h3>
      </div>

      <ul className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="flex items-start gap-3 text-sm"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            <span
              className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${cfg.color}25`, color: cfg.color }}
            >
              {i + 1}
            </span>
            {rec}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
