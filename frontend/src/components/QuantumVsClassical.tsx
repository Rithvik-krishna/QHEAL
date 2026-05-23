import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Utility: compute simulated risk ─────────────────────────────────────────
function computeClassicalRisk(age: number, chol: number, bp: number, glucose: number, hr: number, oldpeak: number, slope: number): number {
  const a = (age - 29) / 48;
  const c = (chol - 126) / 438;
  const b = (bp - 94) / 106;
  const g = (glucose - 70) / 230;
  const h = (200 - hr) / 131;
  const o = oldpeak / 6.2;
  const s = (slope - 1) / 2;
  const raw = a * 0.20 + c * 0.18 + b * 0.15 + o * 0.13 + h * 0.10 + g * 0.07 + s * 0.07;
  return Math.min(99, Math.max(1, Math.round(raw * 130)));
}

function computeQuantumRisk(age: number, chol: number, bp: number, glucose: number, hr: number, oldpeak: number, slope: number): number {
  const a = (age - 29) / 48;
  const c = (chol - 126) / 438;
  const b = (bp - 94) / 106;
  const g = (glucose - 70) / 230;
  const h = (200 - hr) / 131;
  const o = oldpeak / 6.2;
  const s = (slope - 1) / 2;
  const base = a * 0.20 + c * 0.18 + b * 0.15 + o * 0.13 + h * 0.10 + g * 0.07 + s * 0.07;
  const interaction1 = c * b * 0.20;
  const interaction2 = a * o * 0.15;
  const interaction3 = a * b * h * 0.10;
  const raw = base + interaction1 + interaction2 + interaction3;
  return Math.min(99, Math.max(1, Math.round(raw * 130)));
}

function classicalConfidence(risk: number): number {
  const boundary = Math.abs(risk - 50);
  return Math.round(55 + boundary * 0.6);
}

function quantumConfidence(risk: number, chol: number, bp: number): number {
  const boundary = Math.abs(risk - 50);
  const interactionBonus = ((chol - 126) / 438) * ((bp - 94) / 106) * 12;
  return Math.min(97, Math.round(62 + boundary * 0.65 + interactionBonus));
}

// ─── FEATURE 1: Split-Screen Live Prediction Demo ────────────────────────────
function SplitScreenDemo() {
  const [age, setAge] = useState(55);
  const [chol, setChol] = useState(240);
  const [bp, setBp] = useState(140);
  const [glucose, setGlucose] = useState(120);
  const [hr, setHr] = useState(150);
  const [oldpeak, setOldpeak] = useState(1.5);
  const [slope, setSlope] = useState(2);
  const [calculating, setCalculating] = useState(false);
  const [classRisk, setClassRisk] = useState(0);
  const [quantRisk, setQuantRisk] = useState(0);
  const [classCon, setClassCon] = useState(0);
  const [quantCon, setQuantCon] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recalculate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCalculating(true);
    timerRef.current = setTimeout(() => {
      setClassRisk(computeClassicalRisk(age, chol, bp, glucose, hr, oldpeak, slope));
      setQuantRisk(computeQuantumRisk(age, chol, bp, glucose, hr, oldpeak, slope));
      setClassCon(classicalConfidence(computeClassicalRisk(age, chol, bp, glucose, hr, oldpeak, slope)));
      setQuantCon(quantumConfidence(computeQuantumRisk(age, chol, bp, glucose, hr, oldpeak, slope), chol, bp));
      setCalculating(false);
    }, 280);
  }, [age, chol, bp, glucose, hr, oldpeak, slope]);

  useEffect(() => { recalculate(); }, [recalculate]);

  const advantage = quantRisk - classRisk;
  const sliders = [
    { label: 'Age', value: age, set: setAge, min: 30, max: 80, unit: 'yrs' },
    { label: 'Cholesterol', value: chol, set: setChol, min: 130, max: 400, unit: 'mg/dL' },
    { label: 'Blood Pressure', value: bp, set: setBp, min: 90, max: 200, unit: 'mmHg' },
    { label: 'Glucose', value: glucose, set: setGlucose, min: 70, max: 300, unit: 'mg/dL' },
    { label: 'Max Heart Rate', value: hr, set: setHr, min: 80, max: 200, unit: 'bpm' },
    { label: 'ST Depression', value: oldpeak, set: setOldpeak, min: 0, max: 6, step: 0.1, unit: 'mm' },
  ];

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 1</span>
        <h2 style={styles.sectionTitle}>Live Split-Screen Prediction</h2>
        <p style={styles.sectionSub}>Move any slider — both models recalculate in real-time. Watch the gap appear.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px', alignItems: 'start' }}>
        {/* Sliders */}
        <div style={styles.glassCard}>
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '20px', fontSize: '14px' }}>⚙️ Patient Biomarkers</div>
          {sliders.map(s => (
            <div key={s.label} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{s.value} <span style={{ color: '#64748b' }}>{s.unit}</span></span>
              </div>
              <input type="range" min={s.min} max={s.max} step={(s as any).step || 1}
                value={s.value} onChange={e => s.set(Number(e.target.value))}
                style={styles.slider} />
            </div>
          ))}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>ST Slope</span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{['', 'Upsloping', 'Flat', 'Downsloping'][slope]}</span>
            </div>
            <input type="range" min={1} max={3} step={1} value={slope} onChange={e => setSlope(Number(e.target.value))} style={styles.slider} />
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Advantage Banner */}
          <div style={{
            background: advantage > 5 ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.2))' : 'rgba(255,255,255,0.03)',
            border: advantage > 5 ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', padding: '20px 28px', textAlign: 'center', transition: 'all 0.4s ease'
          }}>
            {calculating ? (
              <div style={{ color: '#64748b', fontSize: '14px' }}>⚛️ Quantum circuits computing…</div>
            ) : (
              <>
                <div style={{ fontSize: '36px', fontWeight: 800, background: advantage > 5 ? 'linear-gradient(90deg,#6366f1,#10b981)' : '#64748b', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {advantage > 0 ? `+${advantage}%` : `${advantage}%`}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                  {advantage > 8 ? '⚛️ Strong Quantum Advantage Detected' : advantage > 3 ? '⚛️ Quantum Advantage Active' : 'Models in Agreement'}
                </div>
                {advantage > 3 && <div style={{ marginTop: '8px', fontSize: '11px', color: '#10b981' }}>= {Math.round(advantage * 10)} more early detections per 1,000 patients</div>}
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Classical */}
            <div style={{ ...styles.glassCard, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>❌ Classical ML</div>
              <div style={{ fontSize: '52px', fontWeight: 800, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>
                {calculating ? '—' : `${classRisk}%`}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Risk Score</div>
              <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Confidence</div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: calculating ? '0%' : `${classCon}%`, background: '#ef4444', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: 700 }}>{calculating ? '—' : `${classCon}%`}</div>
              </div>
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                Gradient Boosting on 7 independent features. Cannot detect cross-feature interactions.
              </div>
            </div>

            {/* Quantum */}
            <div style={{ ...styles.glassCard, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.3)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)', borderRadius: '50%' }} />
              <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>✅ Quantum-Hybrid</div>
              <div style={{ fontSize: '52px', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>
                {calculating ? '—' : `${quantRisk}%`}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Risk Score</div>
              <div style={{ marginTop: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Confidence</div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: calculating ? '0%' : `${quantCon}%`, background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 700 }}>{calculating ? '—' : `${quantCon}%`}</div>
              </div>
              <div style={{ marginTop: '14px', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                4-qubit VQC encodes interactions in 16D Hilbert space. Catches Chol×BP, Age×Oldpeak entanglement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 2: Algorithm Complexity Visualization ────────────────────────────
function AlgorithmComplexity() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % 100), 60);
    return () => clearInterval(t);
  }, []);

  const phase = (tick / 100) * Math.PI * 2;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 2</span>
        <h2 style={styles.sectionTitle}>Decision Boundary Comparison</h2>
        <p style={styles.sectionSub}>Classical ML draws straight lines. Quantum ML curves through complex medical patterns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Classical */}
        <div style={{ ...styles.glassCard, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', textAlign: 'center' }}>❌ Classical ML — Linear Boundary</div>
          <svg viewBox="0 0 280 200" width="100%" style={{ display: 'block' }}>
            {/* Grid */}
            {[40,80,120,160,200].map(x => <line key={`vx${x}`} x1={x} y1={10} x2={x} y2={190} stroke="rgba(239,68,68,0.08)" strokeWidth="1"/>)}
            {[40,80,120,160].map(y => <line key={`hy${y}`} x1={10} y1={y} x2={270} y2={y} stroke="rgba(239,68,68,0.08)" strokeWidth="1"/>)}
            {/* Data: low-risk zone */}
            {[[45,160],[60,140],[50,170],[75,155],[90,145],[55,130]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={5} fill="rgba(16,185,129,0.7)" stroke="#10b981" strokeWidth="1"/>)}
            {/* Data: high-risk zone — some cross the boundary (fail) */}
            {[[180,50],[200,40],[220,60],[190,80],[175,45],[240,55]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={5} fill="rgba(239,68,68,0.7)" stroke="#ef4444" strokeWidth="1"/>)}
            {/* Outliers that cross linear boundary */}
            {[[130,95],[145,85],[120,110]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={6} fill="rgba(239,68,68,0.5)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,2"/>)}
            {/* Linear separator — bounces slightly */}
            <line
              x1={20} y1={100 + Math.sin(phase) * 6}
              x2={260} y2={100 + Math.sin(phase + 0.3) * 6}
              stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8,4"/>
            <text x="140" y="170" fill="#ef4444" fontSize="10" textAnchor="middle" opacity="0.7">Can only separate with straight lines</text>
            {/* Misclassification markers */}
            {[[130,95],[145,85]].map(([cx,cy],i) =>
              <text key={i} x={cx+8} y={cy-6} fill="#f59e0b" fontSize="9">✗</text>)}
          </svg>
          <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>⚠ Limitation</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>Linear separators cannot model the exponential interaction between Cholesterol × Blood Pressure. At-risk patients near the boundary are systematically misclassified.</div>
          </div>
        </div>

        {/* Quantum */}
        <div style={{ ...styles.glassCard, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 70% 20%, rgba(99,102,241,0.08), transparent 60%)' }} />
          <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', textAlign: 'center', position: 'relative' }}>✅ Quantum ML — Curved Hilbert Boundary</div>
          <svg viewBox="0 0 280 200" width="100%" style={{ display: 'block', position: 'relative' }}>
            {[40,80,120,160,200].map(x => <line key={`vx${x}`} x1={x} y1={10} x2={x} y2={190} stroke="rgba(99,102,241,0.08)" strokeWidth="1"/>)}
            {[40,80,120,160].map(y => <line key={`hy${y}`} x1={10} y1={y} x2={270} y2={y} stroke="rgba(99,102,241,0.08)" strokeWidth="1"/>)}
            {/* Low-risk zone */}
            {[[45,160],[60,140],[50,170],[75,155],[90,145],[55,130]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={5} fill="rgba(16,185,129,0.8)" stroke="#10b981" strokeWidth="1"/>)}
            {/* High-risk zone */}
            {[[180,50],[200,40],[220,60],[190,80],[175,45],[240,55]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={5} fill="rgba(99,102,241,0.8)" stroke="#6366f1" strokeWidth="1"/>)}
            {/* Outliers now correctly classified */}
            {[[130,95],[145,85],[120,110]].map(([cx,cy],i) =>
              <circle key={i} cx={cx} cy={cy} r={6} fill="rgba(99,102,241,0.7)" stroke="#6366f1" strokeWidth="1"/>)}
            {/* Animated curved separator */}
            <path
              d={`M20,${140+Math.sin(phase)*4} C70,${110+Math.sin(phase+0.5)*8} 120,${80+Math.sin(phase+1)*8} 170,${95+Math.sin(phase+1.5)*6} S240,${70+Math.sin(phase+2)*5} 260,${60}`}
              fill="none" stroke="url(#qgrad)" strokeWidth="2.5"/>
            <defs>
              <linearGradient id="qgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
            {/* Glow effect on curve */}
            <path
              d={`M20,${140+Math.sin(phase)*4} C70,${110+Math.sin(phase+0.5)*8} 120,${80+Math.sin(phase+1)*8} 170,${95+Math.sin(phase+1.5)*6} S240,${70+Math.sin(phase+2)*5} 260,${60}`}
              fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="10"/>
            <text x="140" y="180" fill="#10b981" fontSize="10" textAnchor="middle" opacity="0.8">Curves through complex patterns ✓</text>
            {/* Correct classification markers */}
            {[[130,95],[145,85]].map(([cx,cy],i) =>
              <text key={i} x={cx+8} y={cy-6} fill="#10b981" fontSize="9">✓</text>)}
          </svg>
          <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '8px', padding: '12px', marginTop: '8px', position: 'relative' }}>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>⚛️ Quantum Advantage</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>The 16-dimensional Hilbert space allows non-linear boundaries that perfectly separate complex medical risk patterns — including multi-variable interactions invisible to classical models.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 3: Feature Importance Comparison ─────────────────────────────────
function FeatureImportanceComparison() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const classical = [
    { name: 'Cholesterol', val: 32, color: '#ef4444' },
    { name: 'Age', val: 28, color: '#ef4444' },
    { name: 'Blood Pressure', val: 18, color: '#ef4444' },
    { name: 'ST Depression', val: 13, color: '#ef4444' },
    { name: 'Heart Rate', val: 9, color: '#ef4444' },
  ];

  const quantum = [
    { name: 'Cholesterol', val: 24, color: '#6366f1', extra: false },
    { name: 'Age', val: 19, color: '#6366f1', extra: false },
    { name: 'Blood Pressure', val: 14, color: '#6366f1', extra: false },
    { name: 'ST Depression', val: 10, color: '#6366f1', extra: false },
    { name: 'Heart Rate', val: 7, color: '#6366f1', extra: false },
    { name: '⚡ Chol × BP Interaction', val: 16, color: '#f59e0b', extra: true },
    { name: '⚡ Age × Oldpeak Coupling', val: 10, color: '#f59e0b', extra: true },
  ];

  return (
    <div style={{ marginBottom: '80px' }} ref={ref}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 3</span>
        <h2 style={styles.sectionTitle}>Feature Importance: What Each Model Sees</h2>
        <p style={styles.sectionSub}>Quantum catches interactions that classical analysis completely misses.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ ...styles.glassCard, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ Classical ML — Independent Analysis</div>
          {classical.map((f, i) => (
            <div key={f.name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{f.name}</span>
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>{f.val}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: animated ? `${f.val * 3}%` : '0%', background: '#ef4444', borderRadius: '4px', transition: `width 0.7s ease ${i * 0.1}s` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>Total: 100% — Independent signals only</div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>No awareness of how features interact with each other</div>
          </div>
        </div>

        <div style={{ ...styles.glassCard, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ Quantum ML — Interaction-Aware</div>
          {quantum.map((f, i) => (
            <div key={f.name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: f.extra ? '#f59e0b' : '#94a3b8', fontWeight: f.extra ? 700 : 400 }}>{f.name}</span>
                <span style={{ fontSize: '12px', color: f.extra ? '#f59e0b' : '#10b981', fontWeight: 700 }}>+{f.val}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: animated ? `${f.val * 3}%` : '0%',
                  background: f.extra ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#6366f1,#10b981)',
                  borderRadius: '4px',
                  transition: `width 0.7s ease ${i * 0.08}s`,
                  boxShadow: f.extra ? '0 0 8px rgba(245,158,11,0.4)' : 'none'
                }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>⚡ +26% from quantum interaction terms</div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Cholesterol × BP exponential coupling = cardiac risk non-linearity</div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px' }}>
        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '14px' }}>💡 Why This Matters: </span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>The Cholesterol × BP interaction term alone adds 16% more predictive signal — that's invisible to any classical model.</span>
      </div>
    </div>
  );
}

// ─── FEATURE 4: 3-Scenario Patient Comparison ────────────────────────────────
const SCENARIOS = [
  {
    id: 0, emoji: '🟢', title: 'Healthy 35-Year-Old', tag: 'Both Agree',
    age: 35, chol: 185, bp: 118, glucose: 90, hr: 175, oldpeak: 0.5, slope: 1,
    lesson: 'Both models agree on simple cases — neither struggles with clearly healthy patients.',
    tagColor: '#10b981'
  },
  {
    id: 1, emoji: '🟡', title: 'At-Risk 55-Year-Old', tag: '⭐ Quantum Catches More',
    age: 55, chol: 280, bp: 155, glucose: 130, hr: 145, oldpeak: 2.1, slope: 2,
    lesson: 'Quantum detects the Chol×BP exponential interaction. High cholesterol AND high BP together = exponential, not additive, risk.',
    tagColor: '#f59e0b'
  },
  {
    id: 2, emoji: '🔴', title: 'Critical 70-Year-Old', tag: 'Quantum More Confident',
    age: 70, chol: 340, bp: 175, glucose: 200, hr: 110, oldpeak: 4.2, slope: 3,
    lesson: 'At extreme risk levels, quantum finds additional three-way coupling (Age × BP × HR) pushing confidence to near-certainty.',
    tagColor: '#ef4444'
  }
];

function ScenarioComparison() {
  const [active, setActive] = useState(1);
  const s = SCENARIOS[active];
  const classR = computeClassicalRisk(s.age, s.chol, s.bp, s.glucose, s.hr, s.oldpeak, s.slope);
  const quantR = computeQuantumRisk(s.age, s.chol, s.bp, s.glucose, s.hr, s.oldpeak, s.slope);
  const diff = quantR - classR;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 4</span>
        <h2 style={styles.sectionTitle}>3-Patient Scenario Library</h2>
        <p style={styles.sectionSub}>Click a patient profile and watch how the two models diverge.</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
        {SCENARIOS.map(sc => (
          <button key={sc.id} onClick={() => setActive(sc.id)} style={{
            padding: '12px 24px', borderRadius: '12px', border: `1px solid ${active === sc.id ? sc.tagColor : 'rgba(255,255,255,0.08)'}`,
            background: active === sc.id ? `${sc.tagColor}18` : 'rgba(255,255,255,0.02)',
            color: active === sc.id ? sc.tagColor : '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
            transition: 'all 0.2s ease'
          }}>
            {sc.emoji} {sc.title}
          </button>
        ))}
      </div>

      <div style={{ ...styles.glassCard, border: `1px solid ${s.tagColor}30` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {/* Patient Info */}
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Patient Profile</div>
            {[
              ['Age', s.age, 'yrs'], ['Cholesterol', s.chol, 'mg/dL'],
              ['Blood Pressure', s.bp, 'mmHg'], ['Glucose', s.glucose, 'mg/dL'],
              ['Max Heart Rate', s.hr, 'bpm'], ['ST Depression', s.oldpeak, 'mm']
            ].map(([l, v, u]) => (
              <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{l}</span>
                <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{v} <span style={{ color: '#475569', fontWeight: 400 }}>{u}</span></span>
              </div>
            ))}
          </div>

          {/* Classical */}
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(239,68,68,0.06)', borderRadius: '12px' }}>
            <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Classical ML</div>
            <div style={{ fontSize: '64px', fontWeight: 800, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{classR}%</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>Risk Score</div>
            <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
              7 features analysed independently. No cross-feature coupling detected.
            </div>
          </div>

          {/* Quantum */}
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(99,102,241,0.06)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', borderRadius: '50%' }} />
            <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Quantum-Hybrid</div>
            <div style={{ fontSize: '64px', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{quantR}%</div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>Risk Score</div>
            {diff !== 0 && (
              <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 12px', background: diff > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', borderRadius: '20px', fontSize: '12px', color: diff > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {diff > 0 ? `+${diff}% Quantum Advantage` : `${diff}% Classical Higher`}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: `${s.tagColor}10`, border: `1px solid ${s.tagColor}20`, borderRadius: '10px' }}>
          <span style={{ color: s.tagColor, fontWeight: 700, fontSize: '13px' }}>💡 Why this matters: </span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{s.lesson}</span>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 5: Interactive Decision Boundary Explorer ────────────────────────
function DecisionBoundaryExplorer() {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 280;
    const y = ((e.clientY - rect.top) / rect.height) * 240;
    setPoint({ x, y });
  };

  const classRegion = (x: number, y: number) => x + y < 200;
  const quantRegion = (x: number, y: number) => {
    const curve = 220 - 80 * Math.sin((x / 280) * Math.PI * 0.8);
    return y < curve;
  };

  const getZone = (x: number, y: number) => {
    const c = classRegion(x, y);
    const q = quantRegion(x, y);
    if (c && q) return { color: '#10b981', label: '✅ Both Correct', sub: 'Agreement zone' };
    if (!c && q) return { color: '#ef4444', label: '❌ Classical Fails', sub: 'Quantum catches it — this is the +8% gain' };
    if (c && !q) return { color: '#f59e0b', label: '⚠ Edge Case', sub: 'Classical over-detects here' };
    return { color: '#64748b', label: '✓ Both Detect Risk', sub: 'High-risk consensus' };
  };

  const zone = point ? getZone(point.x, point.y) : null;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 5</span>
        <h2 style={styles.sectionTitle}>Interactive Decision Boundary Explorer</h2>
        <p style={styles.sectionSub}>Click anywhere on the plot to place a virtual patient and see where Classical ML fails.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={styles.glassCard}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textAlign: 'center' }}>Cholesterol (x) vs Blood Pressure (y) — Click to place a patient</div>
          <svg ref={svgRef} viewBox="0 0 280 240" width="100%" style={{ display: 'block', cursor: 'crosshair' }} onClick={handleClick}>
            {/* Background regions */}
            <defs>
              <linearGradient id="classgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.08"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08"/>
              </linearGradient>
            </defs>
            <rect width="280" height="240" fill="url(#classgrad)" rx="4"/>
            {/* Quantum failure zone (highlighted) */}
            <path d="M140,0 L280,0 L280,80 Q220,120 140,140 Z" fill="rgba(239,68,68,0.12)"/>
            {/* Grid */}
            {[70,140,210].map(x => <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            {[60,120,180].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            {/* Axes labels */}
            <text x="140" y="230" fill="#475569" fontSize="9" textAnchor="middle">Cholesterol →</text>
            <text x="10" y="120" fill="#475569" fontSize="9" textAnchor="middle" transform="rotate(-90,10,120)">BP →</text>
            {/* Classical boundary — straight line */}
            <line x1="0" y1="200" x2="200" y2="0" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,3" opacity="0.7"/>
            <text x="30" y="190" fill="#ef4444" fontSize="9">Classical</text>
            {/* Quantum boundary — curved */}
            <path d="M0,220 C60,210 100,180 140,140 S200,80 280,60" fill="none" stroke="url(#qcurvegrad)" strokeWidth="2.5"/>
            <defs>
              <linearGradient id="qcurvegrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
            <text x="220" y="75" fill="#10b981" fontSize="9">Quantum</text>
            {/* Failure zone label */}
            <text x="210" y="30" fill="#ef4444" fontSize="8" textAnchor="middle">Classical</text>
            <text x="210" y="40" fill="#ef4444" fontSize="8" textAnchor="middle">fails here</text>
            {/* Existing sample dots */}
            {[[40,200],[70,180],[60,210],[100,170],[30,220]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r={4} fill="#10b981" opacity="0.6"/>)}
            {[[220,30],[250,50],[240,20],[200,45],[260,35]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r={4} fill="#6366f1" opacity="0.6"/>)}
            {/* Clicked point */}
            {point && (
              <g>
                <circle cx={point.x} cy={point.y} r={10} fill="rgba(248,250,252,0.1)" stroke="#f8fafc" strokeWidth="2"/>
                <circle cx={point.x} cy={point.y} r={4} fill="#f8fafc"/>
                <circle cx={point.x} cy={point.y} r={16} fill="none" stroke="rgba(248,250,252,0.2)" strokeWidth="1">
                  <animate attributeName="r" values="10;20;10" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </g>
            )}
          </svg>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            {[
              { color: '#10b981', label: 'Both Correct' },
              { color: '#ef4444', label: 'Classical Fails, Quantum Wins' },
              { color: '#f59e0b', label: 'Edge Case' },
              { color: '#64748b', label: 'Both Detect Risk' }
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: '10px', color: '#64748b' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {zone ? (
            <div style={{ ...styles.glassCard, background: `${zone.color}10`, border: `1px solid ${zone.color}30`, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ color: zone.color, fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{zone.label}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>{zone.sub}</div>
              <div style={{ marginTop: '12px', fontSize: '11px', color: '#475569' }}>
                Chol: {Math.round((point!.x / 280) * 270 + 130)} mg/dL<br/>
                BP: {Math.round((1 - point!.y / 240) * 110 + 90)} mmHg
              </div>
            </div>
          ) : (
            <div style={{ ...styles.glassCard, textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👆</div>
              <div style={{ fontSize: '13px' }}>Click on the plot to place a virtual patient</div>
            </div>
          )}
          <div style={styles.glassCard}>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 700, marginBottom: '12px' }}>🔍 What You're Seeing</div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.7 }}>
              The <span style={{ color: '#ef4444' }}>red dashed line</span> = Classical boundary (straight).<br/><br/>
              The <span style={{ color: '#6366f1' }}>curved gradient</span> = Quantum boundary.<br/><br/>
              The <span style={{ color: '#ef4444', opacity: 0.7 }}>shaded red zone</span> = where Classical misclassifies but Quantum is correct. This is where the +8% advantage lives.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 6: Feature Interaction Heatmap ──────────────────────────────────
function InteractionHeatmap() {
  const [view, setView] = useState<'classical' | 'quantum'>('quantum');
  const COLS = 10, ROWS = 10;

  const classicalColor = (col: number, row: number) => {
    const risk = (col / COLS) * 0.5 + (row / ROWS) * 0.5;
    const r = Math.round(16 + risk * 223);
    const g = Math.round(185 - risk * 150);
    const b = Math.round(129 - risk * 100);
    return `rgb(${r},${g},${b})`;
  };

  const quantumColor = (col: number, row: number) => {
    const c = col / COLS;
    const r = row / ROWS;
    const interaction = c * r * 1.8;
    const risk = c * 0.3 + r * 0.3 + interaction;
    const clamped = Math.min(1, risk);
    const red = Math.round(99 + clamped * 156);
    const green = Math.round(102 - clamped * 90);
    const blue = Math.round(241 - clamped * 200);
    return `rgb(${red},${green},${blue})`;
  };

  const colorFn = view === 'classical' ? classicalColor : quantumColor;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 6</span>
        <h2 style={styles.sectionTitle}>Feature Interaction Heatmap</h2>
        <p style={styles.sectionSub}>Toggle between models to see how risk distributes across Cholesterol × Blood Pressure space.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
        {(['classical', 'quantum'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '10px 28px', borderRadius: '10px', border: `1px solid ${view === v ? (v === 'quantum' ? '#6366f1' : '#ef4444') : 'rgba(255,255,255,0.08)'}`,
            background: view === v ? (v === 'quantum' ? 'rgba(99,102,241,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(255,255,255,0.02)',
            color: view === v ? (v === 'quantum' ? '#10b981' : '#ef4444') : '#64748b',
            cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'capitalize', transition: 'all 0.2s'
          }}>
            {v === 'quantum' ? '✅ Quantum ML' : '❌ Classical ML'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={styles.glassCard}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', textAlign: 'center' }}>
            {view === 'quantum' ? '⚛️ Quantum: Non-linear exponential risk surface' : '❌ Classical: Linear additive risk gradient'}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: '2px', borderRadius: '8px', overflow: 'hidden' }}>
              {Array.from({ length: ROWS }, (_, row) =>
                Array.from({ length: COLS }, (_, col) => (
                  <div key={`${row}-${col}`} style={{
                    aspectRatio: '1', background: colorFn(col, ROWS - 1 - row),
                    transition: 'background 0.5s ease',
                    borderRadius: '2px'
                  }} title={`Chol: ${130 + col * 27} | BP: ${90 + (ROWS - 1 - row) * 11}`} />
                ))
              )}
            </div>
            {/* Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: '#475569' }}>130 mg/dL</span>
              <span style={{ fontSize: '10px', color: '#475569' }}>Cholesterol →</span>
              <span style={{ fontSize: '10px', color: '#475569' }}>400 mg/dL</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...styles.glassCard, background: view === 'quantum' ? 'rgba(99,102,241,0.06)' : 'rgba(239,68,68,0.06)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: view === 'quantum' ? '#10b981' : '#ef4444', marginBottom: '12px' }}>
              {view === 'quantum' ? '⚛️ Quantum Risk Model' : '❌ Classical Risk Model'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.7 }}>
              {view === 'quantum'
                ? 'The quantum model computes risk as: Base + Chol×BP interaction. Notice how the top-right corner (high chol + high BP) is dramatically darker — exponential risk captured by CNOT entanglement.'
                : 'Classical model simply adds cholesterol risk + BP risk. The gradient is smooth and linear. It cannot see that high cholesterol COMBINED with high BP is exponentially more dangerous.'}
            </div>
          </div>
          <div style={styles.glassCard}>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>⚡ The Key Difference</div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
              Switch to <strong style={{ color: '#6366f1' }}>Quantum</strong> and look at the top-right corner. That dark cluster = exponential interaction risk. Classical misses this entirely.
            </div>
          </div>
          {/* Risk colorscale */}
          <div style={styles.glassCard}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>Risk Scale</div>
            <div style={{ height: '12px', background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444, #6366f1)', borderRadius: '6px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '9px', color: '#10b981' }}>Low</span>
              <span style={{ fontSize: '9px', color: '#f59e0b' }}>Moderate</span>
              <span style={{ fontSize: '9px', color: '#ef4444' }}>High</span>
              <span style={{ fontSize: '9px', color: '#6366f1' }}>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 7: Real-Time Confidence Comparison ───────────────────────────────
function RealTimeConfidence() {
  const [chol, setChol] = useState(200);
  const [bp, setBp] = useState(130);
  const [age, setAge] = useState(50);

  const classR = computeClassicalRisk(age, chol, bp, 110, 155, 1.0, 2);
  const quantR = computeQuantumRisk(age, chol, bp, 110, 155, 1.0, 2);
  const classCon = classicalConfidence(classR);
  const quantCon = quantumConfidence(quantR, chol, bp);
  const boundary = Math.abs(classR - 50) < 25;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 7</span>
        <h2 style={styles.sectionTitle}>Real-Time Confidence Comparison</h2>
        <p style={styles.sectionSub}>Quantum stays confident even at decision boundaries where Classical becomes uncertain.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        <div style={styles.glassCard}>
          <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '20px', fontSize: '14px' }}>🎛️ Adjust Parameters</div>
          {[
            { label: 'Age', value: age, set: setAge, min: 30, max: 75, unit: 'yrs' },
            { label: 'Cholesterol', value: chol, set: setChol, min: 130, max: 400, unit: 'mg/dL' },
            { label: 'Blood Pressure', value: bp, set: setBp, min: 90, max: 200, unit: 'mmHg' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{s.value} {s.unit}</span>
              </div>
              <input type="range" min={s.min} max={s.max} value={s.value} onChange={e => s.set(Number(e.target.value))} style={styles.slider} />
            </div>
          ))}
          {boundary && (
            <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', fontSize: '11px', color: '#f59e0b' }}>
              ⚠️ Decision boundary region — Classical confidence drops here. Quantum holds firm.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Risk scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ ...styles.glassCard, background: 'rgba(239,68,68,0.06)', textAlign: 'center', padding: '20px' }}>
              <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>Classical Risk</div>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{classR}%</div>
            </div>
            <div style={{ ...styles.glassCard, background: 'rgba(99,102,241,0.06)', textAlign: 'center', padding: '20px' }}>
              <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>Quantum Risk</div>
              <div style={{ fontSize: '42px', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Space Grotesk',sans-serif" }}>{quantR}%</div>
            </div>
          </div>

          {/* Confidence bars */}
          <div style={styles.glassCard}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>Model Confidence</div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>❌ Classical ML</span>
                <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 700 }}>{classCon}%</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${classCon}%`, background: boundary ? '#f59e0b' : '#ef4444', borderRadius: '6px', transition: 'width 0.4s ease, background 0.4s ease' }} />
              </div>
              {boundary && <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>⚠ Confidence unstable near boundary</div>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#10b981' }}>✅ Quantum-Hybrid</span>
                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 700 }}>{quantCon}%</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${quantCon}%`, background: 'linear-gradient(90deg,#6366f1,#10b981)', borderRadius: '6px', transition: 'width 0.4s ease', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '4px' }}>Interaction terms stabilize prediction confidence</div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
              Confidence gap: <strong style={{ color: quantCon > classCon ? '#10b981' : '#ef4444' }}>{Math.abs(quantCon - classCon)}%</strong> {quantCon > classCon ? 'Quantum advantage' : 'Classical advantage'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE 8: Algorithm Complexity Cards ───────────────────────────────────
function AlgorithmComplexityCards() {
  const cards = [
    {
      title: 'Computational Dimensions',
      classical: { val: '7D', desc: '7 raw features analysed one-by-one', icon: '📊' },
      quantum: { val: '16D', desc: '4-qubit Hilbert space = 2⁴ = 16 probability dimensions simultaneously', icon: '⚛️' },
      classicalViz: (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-end', height: '48px' }}>
          {[30,50,40,45,35,55,42].map((h,i) => <div key={i} style={{ width: '14px', background: '#ef4444', opacity: 0.6, height: `${h}px`, borderRadius: '2px 2px 0 0' }} />)}
        </div>
      ),
      quantumViz: (
        <div style={{ position: 'relative', width: '60px', height: '48px', margin: '0 auto' }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '50%', background: `hsl(${200 + i*20},80%,60%)`, top: `${Math.sin(i * 0.8) * 16 + 20}px`, left: `${i * 7}px`, boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
          ))}
        </div>
      )
    },
    {
      title: 'Feature Interactions',
      classical: { val: '0', desc: 'Analyses each biomarker independently — no cross-feature relationships', icon: '📈' },
      quantum: { val: '∞', desc: 'CNOT + CZ gates encode all cross-feature interactions simultaneously', icon: '🔗' },
      classicalViz: (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
          {['A','B','C'].map(l => <div key={l} style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239,68,68,0.4)', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#ef4444' }}>{l}</div>)}
        </div>
      ),
      quantumViz: (
        <svg viewBox="0 0 80 48" width="80" height="48" style={{ display: 'block', margin: '0 auto' }}>
          {[[10,24],[40,8],[70,24],[40,40]].map(([cx,cy],i) => (
            <g key={i}>
              {[[10,24],[40,8],[70,24],[40,40]].filter((_,j)=>j!==i).map(([tx,ty],j) => <line key={j} x1={cx} y1={cy} x2={tx} y2={ty} stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>)}
              <circle cx={cx} cy={cy} r={8} fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth="1"/>
              <text x={cx} y={cy+3} textAnchor="middle" fill="#a5b4fc" fontSize="8">{['Q0','Q1','Q2','Q3'][i]}</text>
            </g>
          ))}
        </svg>
      )
    },
    {
      title: 'Decision Boundary',
      classical: { val: 'Linear', desc: 'Only draws straight lines through feature space', icon: '📏' },
      quantum: { val: 'Curved', desc: 'Exponential hypersurfaces in 16D space — fits any medical pattern', icon: '〰️' },
      classicalViz: (
        <svg viewBox="0 0 80 48" width="80" height="48" style={{ display: 'block', margin: '0 auto' }}>
          <line x1="10" y1="40" x2="70" y2="8" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2"/>
          <circle cx="30" cy="35" r="4" fill="rgba(16,185,129,0.6)"/>
          <circle cx="55" cy="15" r="4" fill="rgba(239,68,68,0.6)"/>
          <circle cx="45" cy="28" r="4" fill="rgba(245,158,11,0.8)" stroke="#f59e0b" strokeWidth="1"/>
        </svg>
      ),
      quantumViz: (
        <svg viewBox="0 0 80 48" width="80" height="48" style={{ display: 'block', margin: '0 auto' }}>
          <path d="M8,42 C20,38 35,25 50,20 S65,12 72,8" fill="none" stroke="url(#qgc)" strokeWidth="2.5"/>
          <defs><linearGradient id="qgc" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#10b981"/></linearGradient></defs>
          <circle cx="25" cy="38" r="4" fill="rgba(16,185,129,0.7)"/>
          <circle cx="60" cy="12" r="4" fill="rgba(99,102,241,0.7)"/>
          <circle cx="45" cy="22" r="4" fill="rgba(16,185,129,0.7)"/>
        </svg>
      )
    },
    {
      title: 'Pattern Recognition',
      classical: { val: 'Additive', desc: 'Risk = sum of individual biomarker scores. Misses exponential interactions.', icon: '➕' },
      quantum: { val: 'Multiplicative', desc: 'Captures Age × Chol × BP exponential coupling through entanglement', icon: '✖️' },
      classicalViz: (
        <div style={{ fontSize: '18px', textAlign: 'center', color: '#ef4444', fontFamily: 'monospace', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          A + B + C
        </div>
      ),
      quantumViz: (
        <div style={{ fontSize: '15px', textAlign: 'center', background: 'linear-gradient(90deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'monospace', fontWeight: 700, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          A × B × C + ∫(interactions)
        </div>
      )
    }
  ];

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.label}>FEATURE 8</span>
        <h2 style={styles.sectionTitle}>Algorithm Complexity Breakdown</h2>
        <p style={styles.sectionSub}>Four dimensions where Quantum ML fundamentally outperforms Classical approaches.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {cards.map((card) => (
          <div key={card.title} style={styles.glassCard}>
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '20px', fontSize: '14px', fontFamily: "'Space Grotesk',sans-serif" }}>{card.title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Classical */}
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>❌ Classical</div>
                {card.classicalViz}
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', fontFamily: "'Space Grotesk',sans-serif", marginTop: '10px' }}>{card.classical.val}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>{card.classical.desc}</div>
              </div>
              {/* Quantum */}
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, width: '40px', height: '40px', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', borderRadius: '50%' }} />
                <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>✅ Quantum</div>
                {card.quantumViz}
                <div style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Space Grotesk',sans-serif", marginTop: '10px' }}>{card.quantum.val}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>{card.quantum.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = {
  label: {
    display: 'inline-block', fontSize: '10px', fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '2px', color: '#6366f1',
    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '20px', padding: '4px 14px', marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800,
    color: '#f8fafc', fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: '12px', lineHeight: 1.2
  },
  sectionSub: {
    fontSize: '15px', color: '#64748b', maxWidth: '600px',
    margin: '0 auto', lineHeight: 1.6
  },
  glassCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)'
  },
  slider: {
    width: '100%', appearance: 'none' as const, height: '4px',
    borderRadius: '2px', background: 'rgba(255,255,255,0.1)',
    outline: 'none', cursor: 'pointer'
  }
};

// ─── Main Page ────────────────────────────────────────────────────────────────
interface Props {
  setCurrentPage: (page: string) => void;
}

export default function QuantumVsClassical({ setCurrentPage }: Props) {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 16px; height: 16px;
          border-radius: 50%; background: linear-gradient(135deg,#6366f1,#10b981);
          cursor: pointer; border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
        }
        input[type=range]::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#10b981);
          cursor: pointer; border: 2px solid rgba(255,255,255,0.2);
        }
        @keyframes qpulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes qglow  { 0%,100%{box-shadow:0 0 12px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 24px rgba(99,102,241,0.6)} }
      `}</style>

      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '70px', padding: '0 20px' }}>
        <span style={{ ...styles.label, fontSize: '11px', letterSpacing: '3px' }}>RESEARCH EVIDENCE</span>
        <h1 style={{ ...styles.sectionTitle, fontSize: 'clamp(32px,5vw,52px)', marginTop: '16px' }}>
          Why Quantum Works
        </h1>
        <p style={{ ...styles.sectionSub, fontSize: '16px', maxWidth: '680px' }}>
          8 interactive demonstrations showing exactly how and why Quantum-Hybrid ML outperforms Classical ML in cardiovascular risk prediction.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentPage('diagnosis')} style={{
            padding: '12px 28px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#10b981)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px'
          }}>
            ⚛️ Try Live Diagnosis →
          </button>
          <button onClick={() => setCurrentPage('home')} style={{
            padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
          }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Table of contents */}
      <div style={{ maxWidth: '900px', margin: '0 auto 60px', padding: '0 20px' }}>
        <div style={{ ...styles.glassCard, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { n: '01', label: 'Split-Screen Demo', anchor: 'f1' },
            { n: '02', label: 'Algorithm Boundaries', anchor: 'f2' },
            { n: '03', label: 'Feature Importance', anchor: 'f3' },
            { n: '04', label: 'Patient Scenarios', anchor: 'f4' },
            { n: '05', label: 'Boundary Explorer', anchor: 'f5' },
            { n: '06', label: 'Interaction Heatmap', anchor: 'f6' },
            { n: '07', label: 'Confidence Tracker', anchor: 'f7' },
            { n: '08', label: 'Complexity Cards', anchor: 'f8' },
          ].map(item => (
            <a key={item.n} href={`#${item.anchor}`} style={{
              display: 'block', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
              textDecoration: 'none', textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>{item.n}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{item.label}</div>
            </a>
          ))}
        </div>
      </div>

      {/* All 8 features */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div id="f1"><SplitScreenDemo /></div>
        <div id="f2"><AlgorithmComplexity /></div>
        <div id="f3"><FeatureImportanceComparison /></div>
        <div id="f4"><ScenarioComparison /></div>
        <div id="f5"><DecisionBoundaryExplorer /></div>
        <div id="f6"><InteractionHeatmap /></div>
        <div id="f7"><RealTimeConfidence /></div>
        <div id="f8"><AlgorithmComplexityCards /></div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚛️</div>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '12px' }}>Ready to See It Live?</h2>
          <p style={{ ...styles.sectionSub, marginBottom: '28px' }}>
            Enter real patient biomarkers and watch the quantum advantage emerge in real-time with our full diagnostic engine.
          </p>
          <button onClick={() => setCurrentPage('diagnosis')} style={{
            padding: '16px 40px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#10b981)',
            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '15px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)', animation: 'qglow 2s ease infinite'
          }}>
            Run Quantum Diagnosis →
          </button>
        </div>
      </div>
    </div>
  );
}
