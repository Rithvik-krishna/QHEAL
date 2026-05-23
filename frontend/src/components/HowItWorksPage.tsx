import '../styles/QHEAL_ENTERPRISE_SAAS.css';

export default function HowItWorksPage() {
  return (
    <section className="page-section how-it-works-section fade-in-up">
      <div className="container">
        <div className="max-w-2xl text-center mx-auto" style={{ marginBottom: '60px' }}>
          <span className="section-label">Core Methodology</span>
          <h1 className="section-title">Methodology & Architecture</h1>
          <p className="section-subtitle">
            QHeal applies Variational Quantum Classifiers (VQC) to map clinical metrics into a high-dimensional state space, identifying subtle cardiac correlations.
          </p>
        </div>

        {/* Visual Timeline */}
        <div className="timeline">
          <div className="timeline-item" data-step="01">
            <div className="timeline-item-icon">📊</div>
            <div className="timeline-item-title">Biomarker Encoding</div>
            <div className="timeline-item-description">
              Clinical indicators are normalized and encoded as quantum states to prepare metrics for multi-dimensional operations.
            </div>
          </div>

          <div className="timeline-item" data-step="02">
            <div className="timeline-item-icon">⚛</div>
            <div className="timeline-item-title">State Superposition</div>
            <div className="timeline-item-description">
              Patient data is mapped via amplitude-based unitary rotations across an active 4-qubit register to explore curved spaces.
            </div>
          </div>

          <div className="timeline-item" data-step="03">
            <div className="timeline-item-icon">🔗</div>
            <div className="timeline-item-title">Entanglement Layer</div>
            <div className="timeline-item-description">
              Entangling matrices couple active qubits simultaneously, mapping complex metric intersections in parallel.
            </div>
          </div>

          <div className="timeline-item" data-step="04">
            <div className="timeline-item-icon">🎯</div>
            <div className="timeline-item-title">Classification Hyperplane</div>
            <div className="timeline-item-description">
              A hybrid classical-quantum optimizer measures statevector probabilities to determine high-accuracy classification boundaries.
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="features-grid" style={{ marginTop: '80px' }}>
          <div className="feature-box">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6366f1', fontWeight: '700', marginBottom: '16px', letterSpacing: '1px' }}>Classical Baseline</div>
            <div className="feature-title">Random Forest Classifier</div>
            <div className="feature-description">
              Analyzes clinical metrics as independent coordinates. Misses multi-variable cardiovascular thresholds where overlapping metrics double true clinical risk.
            </div>
          </div>

          <div className="feature-box">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '700', marginBottom: '16px', letterSpacing: '1px' }}>Quantum-Hybrid</div>
            <div className="feature-title">Variational Quantum Classifier</div>
            <div className="feature-description">
              Maps patient profiles into a 16-dimensional quantum coordinate system. Leverages quantum state superposition to resolve multi-variable risk dimensions.
            </div>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="stat-section">
          <div className="stat-label">Global Cardiology Burden</div>
          <div className="stat-number">17.9M</div>
          <div className="stat-description" style={{ fontSize: '14px', color: '#64748b' }}>
            lives lost annually to preventable cardiovascular conditions. QHeal explores new physics-based diagnostic parameters to identify critical risk anomalies earlier and preserve patient health.
          </div>
          <div style={{ marginTop: '24px', fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            UN SDG Goal 3 Prototype Research Preview
          </div>
        </div>
      </div>
    </section>
  );
}
