import React, { useState } from 'react';
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
  Home,
  User,
  LogOut,
  LogIn,
  Mail,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setTab, 
  userRole, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLanding = currentTab === 'landing';

  // Tabs strictly scoped to the active authenticated role
  const getNavItems = () => {
    if (isLanding) {
      return [];
    }

    const commonHome = { id: 'landing', label: 'Overview', icon: Home };
    const commonContact = { id: 'contact', label: 'Contact', icon: Mail };

    if (userRole === 'Admin') {
      return [
        commonHome,
        { id: 'admin_dashboard', label: 'Admin Center', icon: Shield },
        { id: 'dataset', label: 'ESOL Data', icon: Database },
        { id: 'comparison', label: 'Benchmarks', icon: BarChart2 },
        { id: 'quantum', label: 'Quantum', icon: Cpu },
        commonContact,
      ];
    } else {
      // Researcher (Core Role)
      return [
        commonHome,
        { id: 'researcher_dashboard', label: 'Portal', icon: Microscope },
        { id: 'generator', label: 'Generate', icon: Compass },
        { id: 'results', label: 'Results', icon: Layers },
        { id: 'dataset', label: 'ESOL Data', icon: Database },
        { id: 'comparison', label: 'Benchmarks', icon: BarChart2 },
        { id: 'quantum', label: 'Quantum', icon: Cpu },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'inspector', label: 'SMILES', icon: Search },
        commonContact,
      ];
    }
  };

  const navItems = getNavItems();

  const handleMobileNavClick = (tabId) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className="main-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.05)',
        padding: '0.6rem clamp(0.75rem, 2vw, 1.5rem)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          gap: '0.75rem',
        }}
      >
        {/* Brand Logo & Active Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <BrandLogo onClick={() => { setTab('landing'); setMobileMenuOpen(false); }} showTag={false} />
          {!isLanding && (
            <span className={`badge ${userRole === 'Admin' ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.68rem', flexShrink: 0 }}>
              {userRole}
            </span>
          )}
        </div>

        {/* Desktop Nav Links (Hidden on mobile & small screens via CSS) */}
        {!isLanding && navItems.length > 0 && (
          <div 
            className="desktop-nav-links" 
            style={{ 
              display: 'flex', 
              gap: '0.2rem', 
              alignItems: 'center', 
              flex: '1 1 auto', 
              justifyContent: 'center',
              flexWrap: 'nowrap',
              minWidth: 0,
            }}
          >
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
                    gap: '0.3rem',
                    padding: '0.38rem 0.55rem',
                    borderRadius: '7px',
                    border: 'none',
                    background: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0369a1' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop Auth Controls & Buttons */}
        <div className="desktop-nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {isLanding ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => onOpenAuth('Researcher')}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Microscope size={14} color="#0284c7" /> Researcher Sign Up
              </button>
              <button
                onClick={() => onOpenAuth('Admin')}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Shield size={14} color="#7c3aed" /> Admin Sign Up
              </button>
            </div>
          ) : currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                flexShrink: 0,
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
                  flexShrink: 0,
                }}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
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
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth(userRole)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <LogIn size={15} /> Sign Up
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (Shown on mobile screens) */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          style={{
            background: mobileMenuOpen ? '#e0f2fe' : '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.45rem',
            cursor: 'pointer',
            display: 'none', // Overridden by CSS @media on mobile
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e2327',
            transition: 'all 0.2s ease',
          }}
        >
          {mobileMenuOpen ? <X size={20} color="#0284c7" /> : <Menu size={20} color="#1e2327" />}
        </button>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'slideDown 0.25s ease-out',
          }}
        >
          {/* Mobile User Profile Header (if logged in) */}
          {currentUser && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                marginBottom: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  background: userRole === 'Admin' ? '#7c3aed' : '#0284c7',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {currentUser.name || currentUser.username}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}

          {/* Navigation Links in Mobile Drawer */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#e0f2fe' : '#ffffff',
                  color: isActive ? '#0369a1' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Mobile Action Buttons when on Landing or Not Logged In */}
          {isLanding && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                onClick={() => { onOpenAuth('Researcher'); setMobileMenuOpen(false); }}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.6rem 1rem' }}
              >
                <Microscope size={15} /> Researcher Sign Up
              </button>
              <button
                onClick={() => { onOpenAuth('Admin'); setMobileMenuOpen(false); }}
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.88rem', padding: '0.6rem 1rem' }}
              >
                <Shield size={15} color="#7c3aed" /> Admin Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

