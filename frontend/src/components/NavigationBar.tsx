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
          href="https://github.com" 
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
