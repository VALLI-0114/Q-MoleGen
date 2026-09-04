import React from 'react';
import BrandLogo from './BrandLogo';
import { 
  Atom, 
  Compass, 
  Layers, 
  BarChart2, 
  Cpu, 
  Database, 
  BookOpen, 
  Search, 
  Shield, 
  Microscope, 
  GraduationCap, 
  Home,
  User,
  LogOut,
  LogIn,
  Mail
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setTab, 
  userRole, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
  const isLanding = currentTab === 'landing';

  // Tabs strictly scoped to the active authenticated role
  const getNavItems = () => {
    if (isLanding) {
      return [];
    }

    const commonHome = { id: 'landing', label: 'Home Overview', icon: Home };
    const commonContact = { id: 'contact', label: 'Contact Us', icon: Mail };

    if (userRole === 'Admin') {
      return [
        commonHome,
        { id: 'admin_dashboard', label: 'Admin Center', icon: Shield },
        { id: 'dataset', label: 'ESOL Dataset', icon: Database },
        { id: 'comparison', label: 'Model Benchmark', icon: BarChart2 },
        { id: 'quantum', label: 'Quantum Analysis', icon: Cpu },
        commonContact,
      ];
    } else {
      // Researcher (Core Role)
      return [
        commonHome,
        { id: 'researcher_dashboard', label: 'Researcher Portal', icon: Microscope },
        { id: 'generator', label: 'Generate', icon: Compass },
        { id: 'results', label: 'Results', icon: Layers },
        { id: 'dataset', label: 'ESOL Dataset', icon: Database },
        { id: 'comparison', label: 'Model Benchmark', icon: BarChart2 },
        { id: 'quantum', label: 'Quantum Analysis', icon: Cpu },
        { id: 'analytics', label: 'Experiment Analytics', icon: BarChart2 },
        { id: 'inspector', label: 'SMILES Inspector', icon: Search },
        commonContact,
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <BrandLogo onClick={() => setTab('landing')} showTag={false} />
        {!isLanding && (
          <span className={`badge ${userRole === 'Admin' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.68rem' }}>
            {userRole}
          </span>
        )}
      </div>

      {/* Dynamic Nav Links (Only displayed when inside a role portal, NOT on Landing Page) */}
      {!isLanding && navItems.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#e0f2fe' : 'transparent',
                  color: isActive ? '#0369a1' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Auth Controls & Role Access Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isLanding ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenAuth('Researcher')}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Microscope size={14} color="#0284c7" /> Researcher Sign Up
            </button>
            <button
              onClick={() => onOpenAuth('Admin')}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Shield size={14} color="#7c3aed" /> Admin Sign Up
            </button>
          </div>
        ) : currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
            }}>
              <div style={{
                background: userRole === 'Admin' ? '#7c3aed' : '#0284c7',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}>
                {currentUser.name ? currentUser.name[0].toUpperCase() : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                  {currentUser.name || currentUser.username}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-outline"
              title="Sign Out to return to landing page"
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth(userRole)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogIn size={15} /> Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}
