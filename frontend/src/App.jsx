import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import Generator from './pages/Generator';
import Results from './pages/Results';
import DatasetViewer from './pages/DatasetViewer';
import Comparison from './pages/Comparison';
import QuantumAnalysis from './pages/QuantumAnalysis';
import Analytics from './pages/Analytics';
import SmilesInspector from './components/SmilesInspector';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Researcher');
  const [currentTab, setCurrentTab] = useState('landing');
  const [generatedCandidates, setGeneratedCandidates] = useState([]);
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState('Researcher');

  // Load persistent user session
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('qmolgen_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setUserRole(parsed.role === 'Admin' ? 'Admin' : 'Researcher');
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const handleOpenAuth = (role = 'Researcher') => {
    setAuthModalInitialRole(role === 'Admin' ? 'Admin' : 'Researcher');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    const assignedRole = user.role === 'Admin' ? 'Admin' : 'Researcher';
    setUserRole(assignedRole);
    if (assignedRole === 'Admin') {
      setCurrentTab('admin_dashboard');
    } else {
      setCurrentTab('researcher_dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qmolgen_user');
    localStorage.removeItem('qmolgen_token');
    setCurrentUser(null);
    setCurrentTab('landing');
  };

  const handleGenerated = (candidates) => {
    setGeneratedCandidates(candidates);
    setCurrentTab('results');
  };

  const handleSelectMolecule = (molecule) => {
    setSelectedMolecule(molecule);
    setCurrentTab('inspector');
  };

  // Strict Role Guard / Permission Check
  const renderRoleProtectedView = () => {
    // 1. Admin-Only Guard
    if (currentTab === 'admin_dashboard' && userRole !== 'Admin') {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--rose-danger)' }}>
          <ShieldAlert size={48} color="var(--rose-danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--rose-danger)' }}>403 Forbidden: Administrator Privilege Required</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
            Your current role (<strong>{userRole}</strong>) is not authorized to view or manage user accounts, ML model switches, or system error logs.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => setCurrentTab('researcher_dashboard')}
          >
            Return to Researcher Portal
          </button>
        </div>
      );
    }

    // Normal View Routing
    switch (currentTab) {
      case 'landing':
      case 'home':
        return (
          <LandingPage 
            setTab={setCurrentTab} 
            setUserRole={setUserRole} 
            onOpenAuth={handleOpenAuth} 
          />
        );
      case 'admin_dashboard':
        return <AdminDashboard />;
      case 'researcher_dashboard':
        return <ResearcherDashboard setTab={setCurrentTab} />;
      case 'generator':
        return <Generator onGenerated={handleGenerated} />;
      case 'results':
        return (
          <Results 
            candidates={generatedCandidates} 
            setTab={setCurrentTab}
            onSelectMolecule={handleSelectMolecule}
          />
        );
      case 'dataset':
        return <DatasetViewer />;
      case 'comparison':
        return <Comparison />;
      case 'quantum':
        return <QuantumAnalysis />;
      case 'analytics':
        return <Analytics />;
      case 'inspector':
        return <SmilesInspector />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact setTab={setCurrentTab} onOpenAuth={handleOpenAuth} />;
      default:
        return <LandingPage setTab={setCurrentTab} setUserRole={setUserRole} onOpenAuth={handleOpenAuth} />;
    }
  };

  if (currentTab === 'landing') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F2F1F0' }}>
        <LandingPage 
          setTab={setCurrentTab} 
          setUserRole={setUserRole} 
          onOpenAuth={handleOpenAuth} 
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialRole={authModalInitialRole}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        currentTab={currentTab} 
        setTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <DisclaimerBanner />
        {renderRoleProtectedView()}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.75rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginTop: 'auto'
      }}>
        <p>Q-MoleGen &bull; Quantum-Enhanced Generative AI for De Novo Molecule Design &bull; Final-Year Research Platform</p>
      </footer>

      {/* Role-Based Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalInitialRole}
      />
    </div>
  );
}
