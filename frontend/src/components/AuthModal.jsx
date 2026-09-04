import React, { useState } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Microscope, 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  X,
  Database
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'Researcher' }) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  
  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const endpoint = 'http://127.0.0.1:8000/api/auth/register/';
    const payload = { username, name: name || username, email, password, role: selectedRole };

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data.status === 'success') {
        const userData = res.data.user;
        const token = res.data.token;
        
        // Persist session
        localStorage.setItem('qmolgen_user', JSON.stringify(userData));
        localStorage.setItem('qmolgen_token', token);

        setSuccessMsg(res.data.message);
        setTimeout(() => {
          onAuthSuccess(userData);
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Account registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role, demoName, demoUser, demoEmail, demoPass) => {
    setSelectedRole(role);
    setName(demoName);
    setUsername(demoUser);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '0.75rem',
    }}>
      <div 
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
          padding: '1.4rem 1.6rem',
          borderRadius: '14px',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.9rem',
            right: '0.9rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '0.9rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#e0f2fe',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            color: '#0369a1',
            fontSize: '0.72rem',
            fontWeight: 700,
            marginBottom: '0.35rem',
          }}>
            <Database size={11} /> Supabase &amp; Q-MolGen Cloud Auth
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
            Create {selectedRole} Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>
            Sign up to access your isolated role-based workstation &amp; tools
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.35rem',
          marginBottom: '0.9rem',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: '8px',
        }}>
          <button
            type="button"
            onClick={() => setSelectedRole('Researcher')}
            style={{
              padding: '0.45rem 0.25rem',
              borderRadius: '6px',
              border: 'none',
              background: selectedRole === 'Researcher' ? '#0284c7' : 'transparent',
              color: selectedRole === 'Researcher' ? '#ffffff' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Microscope size={14} /> Researcher
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('Admin')}
            style={{
              padding: '0.45rem 0.25rem',
              borderRadius: '6px',
              border: 'none',
              background: selectedRole === 'Admin' ? '#7c3aed' : 'transparent',
              color: selectedRole === 'Admin' ? '#ffffff' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div style={{
            background: '#ffe4e6',
            border: '1px solid #fecdd3',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            color: '#be123c',
            fontSize: '0.78rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            color: '#065f46',
            fontSize: '0.78rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <CheckCircle size={14} /> {successMsg}
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Marie Curie"
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.65rem 0.55rem 2rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              Username *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. curie_scientist"
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.65rem 0.55rem 2rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@research.org"
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.65rem 0.55rem 2rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.65rem 0.55rem 2rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.7rem',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginTop: '0.35rem',
            }}
          >
            {loading ? 'Creating Account...' : `Sign Up as ${selectedRole}`}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Registration Autofill */}
        <div style={{
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
        }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textAlign: 'center' }}>
            🧪 Quick 1-Click Demo Profiles:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('Researcher', 'Dr. Marie Curie', 'm_curie', 'm.curie@research.org', 'password123')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Demo Researcher
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Admin', 'System Admin', 'sysadmin', 'admin@qmolgen.org', 'password123')}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
