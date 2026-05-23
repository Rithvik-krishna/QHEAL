import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface Props {
  classical: number;
  quantum: number;
}

const COLORS = { 
  classical: '#475569', // Muted slate 
  quantum: '#6366f1' // Premium Indigo
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl text-xs font-semibold">
      <p style={{ color: 'var(--text-secondary)' }} className="mb-0.5">{payload[0].name}</p>
      <p style={{ color: '#ffffff', fontWeight: 800 }}>
        {payload[0].value.toFixed(1)}% Risk
      </p>
    </div>
  );
};

export function ComparisonChart({ classical, quantum }: Props) {
  const data = [
    { name: 'Classical ML', risk: classical, fill: COLORS.classical },
    { name: 'Quantum VQC', risk: quantum, fill: COLORS.quantum },
  ];

  return (
    <div style={{ width: '100%', height: 180 }} className="select-none">
      <ResponsiveContainer>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
          <Bar dataKey="risk" radius={[6, 6, 0, 0]} maxBarSize={55}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="risk"
              position="top"
              formatter={(v: any) => `${Number(v).toFixed(1)}%`}
              style={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
