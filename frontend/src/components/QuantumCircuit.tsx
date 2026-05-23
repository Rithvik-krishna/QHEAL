import { motion } from 'framer-motion';

interface Props {
  age: number;
  cholesterol: number;
  bloodPressure: number;
  glucose: number;
}

export function QuantumCircuit({ age, cholesterol, bloodPressure, glucose }: Props) {
  const rad = (val: number, max: number) => ((val / max) * Math.PI).toFixed(2);

  const angles = [
    rad(age, 90),
    rad(cholesterol, 400),
    rad(bloodPressure, 200),
    rad(glucose, 300),
  ];

  const particlePaths = [
    "M 50 40 L 550 40",
    "M 50 100 L 550 100",
    "M 50 160 L 550 160",
    "M 50 220 L 550 220",
  ];

  return (
    <div className="flex flex-col gap-4 w-full overflow-hidden">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Variational Quantum Circuit (VQC)</h4>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Vector representation of the 4-qubit unitary rotation operations</p>
      </div>

      <div className="relative rounded-2xl p-4 bg-slate-950/20 border border-slate-900/60 overflow-x-auto">
        <svg viewBox="0 0 600 260" className="w-full min-w-[500px] h-auto overflow-visible select-none" style={{ fontFamily: 'monospace' }}>
          <defs>
            <linearGradient id="ry-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
            <linearGradient id="wire-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Qubit wires (horizontal lines) */}
          {[40, 100, 160, 220].map((y, i) => (
            <g key={i}>
              <line x1="45" y1={y} x2="555" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1.5} />
              <text x="15" y={y + 4} fill="#64748b" fontSize="10" fontWeight="bold">Q{i}</text>
            </g>
          ))}

          {/* Animated Quantum State Particles moving along wires */}
          {particlePaths.map((path, i) => (
            <path
              key={`p-${i}`}
              d={path}
              fill="none"
              stroke="url(#wire-glow)"
              strokeWidth={2}
              strokeDasharray="30 180"
              style={{
                animation: `scan-line ${3.5 + i * 0.5}s linear infinite`,
              }}
            />
          ))}

          {/* LAYER 1: RY Parameter Encoding Gates */}
          <g>
            {[40, 100, 160, 220].map((y, i) => (
              <g key={`ry1-${i}`}>
                <motion.rect
                  x="70" y={y - 16} width="55" height="32" rx="8"
                  fill="url(#ry-grad)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1}
                  whileHover={{ scale: 1.05 }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="97" y={y - 2} fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">RY</text>
                <text x="97" y={y + 8} fill="#64748b" fontSize="8" textAnchor="middle">{angles[i]}</text>
              </g>
            ))}
          </g>

          {/* LAYER 2: CNOT Entanglement Ring */}
          <g>
            {/* CNOT 0 -> 1 */}
            <line x1="160" y1="40" x2="160" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx="160" cy="40" r="3" fill="#818cf8" />
            <circle cx="160" cy="100" r="6" fill="none" stroke="#818cf8" strokeWidth={1.5} />
            <line x1="156" y1="100" x2="164" y2="100" stroke="#818cf8" strokeWidth={1} />
            <line x1="160" y1="96" x2="160" y2="104" stroke="#818cf8" strokeWidth={1} />

            {/* CNOT 1 -> 2 */}
            <line x1="200" y1="100" x2="200" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx="200" cy="100" r="3" fill="#818cf8" />
            <circle cx="200" cy="160" r="6" fill="none" stroke="#818cf8" strokeWidth={1.5} />
            <line x1="196" y1="160" x2="204" y2="160" stroke="#818cf8" strokeWidth={1} />
            <line x1="200" y1="156" x2="200" y2="164" stroke="#818cf8" strokeWidth={1} />

            {/* CNOT 2 -> 3 */}
            <line x1="240" y1="160" x2="240" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx="240" cy="160" r="3" fill="#818cf8" />
            <circle cx="240" cy="220" r="6" fill="none" stroke="#818cf8" strokeWidth={1.5} />
            <line x1="236" y1="220" x2="244" y2="220" stroke="#818cf8" strokeWidth={1} />
            <line x1="240" y1="216" x2="240" y2="224" stroke="#818cf8" strokeWidth={1} />

            {/* CNOT 3 -> 0 (Ring Closure) */}
            <path d="M 280 220 C 305 220, 305 40, 280 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx="280" cy="220" r="3" fill="#818cf8" />
            <circle cx="280" cy="40" r="6" fill="none" stroke="#818cf8" strokeWidth={1.5} />
            <line x1="276" y1="40" x2="284" y2="40" stroke="#818cf8" strokeWidth={1} />
            <line x1="280" y1="36" x2="280" y2="44" stroke="#818cf8" strokeWidth={1} />
          </g>

          {/* LAYER 3: RY Parameter Mixing Gates */}
          <g>
            {[40, 100, 160, 220].map((y, i) => (
              <g key={`ry2-${i}`}>
                <motion.rect
                  x="330" y={y - 16} width="55" height="32" rx="8"
                  fill="url(#ry-grad)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={1}
                  whileHover={{ scale: 1.05 }}
                  style={{ cursor: 'pointer' }}
                />
                <text x="357" y={y - 2} fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">RY</text>
                <text x="357" y={y + 8} fill="#64748b" fontSize="8" textAnchor="middle">{((parseFloat(angles[(i + 1) % 4]) || 0) / 2).toFixed(2)}</text>
              </g>
            ))}
          </g>

          {/* LAYER 4: CZ Entanglement Pairs */}
          <g>
            {/* CZ 0 -> 1 */}
            <line x1="430" y1="40" x2="430" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx="430" cy="40" r="4" fill="#a78bfa" />
            <circle cx="430" cy="100" r="4" fill="#a78bfa" />

            {/* CZ 2 -> 3 */}
            <line x1="470" y1="160" x2="470" y2="220" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx="470" cy="160" r="4" fill="#a78bfa" />
            <circle cx="470" cy="220" r="4" fill="#a78bfa" />
          </g>

          {/* MEASUREMENT METERS */}
          <g>
            {[40, 100, 160, 220].map((y, i) => (
              <g key={`meter-${i}`}>
                <rect x="520" y={y - 10} width="20" height="20" rx="4" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <path d={`M 523 ${y + 5} A 8 8 0 0 1 537 ${y + 5}`} fill="none" stroke="#64748b" strokeWidth={1} />
                <line x1="530" y1="5" x2="534" y2="-3" transform={`translate(0, ${y})`} stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" />
              </g>
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-slate-900/60 text-[9px] font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
            <span>RY (Rotation)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>CNOT (Entangle)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
            <span>CZ Phase Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
