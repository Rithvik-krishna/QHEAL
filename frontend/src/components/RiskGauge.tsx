import { motion } from 'framer-motion';

interface Props {
  value: number;       // 0-100
  label: string;
  color: string;
  size?: number;
}

/** Animated circular gauge for risk percentage */
export function RiskGauge({ value, label, color, size = 140 }: Props) {
  const radius = (size - 20) / 2;
  const circ   = Math.PI * radius; // half circle
  const offset = circ * (1 - value / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', width: size, height: size / 2 + 20, overflow: 'hidden' }}>
        {/* Track */}
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={`gauge-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="rgba(148,163,184,0.1)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* Animated value arc */}
          <motion.path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>

        {/* Center value */}
        <div style={{
          position: 'absolute',
          bottom: 2,
          left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontSize: size * 0.22,
              fontWeight: 800,
              color,
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1,
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          >
            {value.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  );
}
