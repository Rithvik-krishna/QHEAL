import { useState } from 'react';
import { QuantumBackground } from './components/QuantumBackground';
import NavigationBar from './components/NavigationBar';
import HomePage from './components/HomePage';
import DiagnosisPage from './components/DiagnosisPage';
import HowItWorksPage from './components/HowItWorksPage';
import ImpactPage from './components/ImpactPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'diagnosis':
        return <DiagnosisPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'impact':
        return <ImpactPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <main className="relative overflow-hidden bg-[#0f172a] min-h-screen">
      {/* Animated quantum background */}
      <QuantumBackground />

      {/* Professional Sticky Navbar */}
      <NavigationBar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Dynamic Page Router */}
      <div className="relative z-10">
        {renderPage()}
      </div>

      {/* Consolidated Premium Footer */}
      <footer className="relative z-10 text-center py-20 border-t border-slate-900/60 bg-[#020617] mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span>⚛️</span>
            <span className="font-bold text-white text-sm tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              QHeal
            </span>
            <span className="text-slate-500 font-medium">· Quantum Medicine Initiative</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-slate-500 font-medium text-xs">
            Built with PennyLane, FastAPI, and React. Powered by local 4-qubit variational simulation.
          </p>
          <p className="mt-3 text-[10px] tracking-wider uppercase text-slate-600 font-semibold">
            UN SDG Goal 3 Project · Prototype not for clinical applications
          </p>
        </div>
      </footer>
    </main>
  );
}
