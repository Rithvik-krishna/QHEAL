interface NavigationBarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function NavigationBar({ currentPage, setCurrentPage }: NavigationBarProps) {
  return (
    <nav className="navbar">
      <a 
        href="#home" 
        className="navbar-brand"
        onClick={(e) => {
          e.preventDefault();
          setCurrentPage('home');
        }}
      >
        <div className="navbar-brand-icon">⚛</div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>QHeal</span>
        <span style={{ 
          fontSize: '9px', 
          color: '#64748b', 
          border: '1px solid rgba(255,255,255,0.06)', 
          borderRadius: '4px', 
          padding: '2px 6px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginLeft: '4px'
        }}>
          Research Preview
        </span>
      </a>

      <ul className="navbar-nav">
        <li className="navbar-nav-item">
          <button 
            className={`navbar-nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
        </li>
        <li className="navbar-nav-item">
          <button 
            className={`navbar-nav-link ${currentPage === 'diagnosis' ? 'active' : ''}`}
            onClick={() => setCurrentPage('diagnosis')}
          >
            Diagnosis
          </button>
        </li>
        <li className="navbar-nav-item">
          <button 
            className={`navbar-nav-link ${currentPage === 'why-quantum' ? 'active' : ''}`}
            onClick={() => setCurrentPage('why-quantum')}
            style={currentPage === 'why-quantum' ? {} : {
              position: 'relative',
            }}
          >
            Why Quantum
            {currentPage !== 'why-quantum' && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                fontSize: '7px',
                fontWeight: 800,
                background: 'linear-gradient(135deg,#6366f1,#10b981)',
                color: '#fff',
                borderRadius: '4px',
                padding: '1px 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
              }}>NEW</span>
            )}
          </button>
        </li>
        <li className="navbar-nav-item">
          <button 
            className={`navbar-nav-link ${currentPage === 'how-it-works' ? 'active' : ''}`}
            onClick={() => setCurrentPage('how-it-works')}
          >
            How It Works
          </button>
        </li>
        <li className="navbar-nav-item">
          <button 
            className={`navbar-nav-link ${currentPage === 'impact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('impact')}
          >
            Impact
          </button>
        </li>
      </ul>

      <div className="navbar-right">
        <a 
          href="https://github.com/Rithvik-krishna/QHEAL" 
          className="btn-github" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '11px', color: '#94a3b8' }}
        >
          <span>Star on GitHub</span>
        </a>
      </div>
    </nav>
  );
}

