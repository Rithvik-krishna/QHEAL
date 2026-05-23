import '../styles/QHEAL_ENTERPRISE_SAAS.css';

interface ImpactPageProps {
  setCurrentPage: (page: string) => void;
}

export default function ImpactPage({ setCurrentPage }: ImpactPageProps) {
  return (
    <section className="page-section impact-section fade-in-up">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center" style={{ marginBottom: '80px' }}>
          <span className="section-label">Clinical Impact & Deployment</span>
          <h1 className="section-title">Decentralized Cardiac Analytics</h1>
          <p className="section-subtitle">
            Enabling decentralized cardiac risk screening. QHeal runs locally on standard clinical equipment, offering rapid diagnostics without server dependencies.
          </p>
        </div>

        {/* Impact Cards */}
        <div className="impact-grid">
          <div className="impact-item">
            <div className="impact-icon">🌍</div>
            <div className="impact-title">Local Computation</div>
            <div className="impact-description">
              Executes locally on standard consumer devices. No high-bandwidth network requirement is needed after initialization, enabling regional clinical deployments.
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">🏥</div>
            <div className="impact-title">Early Screening</div>
            <div className="impact-description">
              Aims to identify multi-variable cardiac risk profiles early, helping clinicians prioritize high-risk patients for further analysis.
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">⚛</div>
            <div className="impact-title">Applied Physics Research</div>
            <div className="impact-description">
              Integrates real Variational Quantum Classifier (VQC) architectures to map overlapping biomarker dimensions in simulation.
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">🔓</div>
            <div className="impact-title">Open Source Framework</div>
            <div className="impact-description">
              The full model parameters, circuit structure, and training pipeline are open-access to encourage clinical and scientific peer-review.
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">👨‍⚕️</div>
            <div className="impact-title">Low-Resource Optimization</div>
            <div className="impact-description">
              Engineered with simple mathematical structures to run efficiently without requiring expensive high-performance computing setups.
            </div>
          </div>

          <div className="impact-item">
            <div className="impact-icon">🎓</div>
            <div className="impact-title" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Accessible Diagnostics</div>
            <div className="impact-description">
              Designed as a transparent prototype to demonstrate the practical clinical utility of quantum machine learning in healthcare.
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          marginTop: '80px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Explore Cardiac Diagnostics?
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
            Deploy quantum-enhanced disease risk prediction framework in a test setting. Local. Lightweight. Accessible.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentPage('diagnosis')}
          >
            Launch Medical Workstation
          </button>
        </div>
      </div>
    </section>
  );
}
