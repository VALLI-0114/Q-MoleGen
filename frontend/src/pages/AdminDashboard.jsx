import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Server, AlertOctagon, Cpu, Database, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/users/').then(res => setUsers(res.data.users));
    axios.get('http://127.0.0.1:8000/api/admin/models/').then(res => setModels(res.data.models));
    axios.get('http://127.0.0.1:8000/api/admin/system-stats/').then(res => setStats(res.data));
    axios.get('http://127.0.0.1:8000/api/admin/error-logs/').then(res => setLogs(res.data.logs));
  }, []);

  const handleToggleUser = (id) => {
    axios.post('http://127.0.0.1:8000/api/admin/users/toggle/', { user_id: id })
      .then(() => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
      });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
            <Shield size={12} /> Platform Governance & Control
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>🔐 Admin Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage platform users, RBAC roles, trained classical/quantum models, dataset repositories, and system error logs.
          </p>
        </div>
      </div>

      {/* System Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Users</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-primary)', marginTop: '0.25rem' }}>
            {stats?.total_users || 5}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Researchers, Reviewers, Admins</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active ML / QML Models</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple-quantum)', marginTop: '0.25rem' }}>
            {stats?.models_active || 5} Enabled
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-bio)' }}>100% Operational</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Database Records</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {stats?.database_records || 1128} Compounds
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delaney ESOL Benchmark</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantum Simulator</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-bio)', marginTop: '0.45rem' }}>
            Qiskit Aer
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Memory: {stats?.memory_usage || '142 MB'}</span>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
        >
          <Users size={15} /> Users & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`btn ${activeTab === 'models' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
        >
          <Cpu size={15} /> Models Management
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`btn ${activeTab === 'database' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
        >
          <Database size={15} /> Supabase Cloud DB
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
        >
          <AlertOctagon size={15} /> System &amp; Error Logs
        </button>
      </div>

      {/* Tab Content: Users */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>User ID</th>
                <th style={{ padding: '1rem' }}>Username</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Assigned Role</th>
                <th style={{ padding: '1rem' }}>Account Status</th>
                <th style={{ padding: '1rem' }}>Last Activity</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>USR-{u.id.toString().padStart(3, '0')}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'Admin' ? 'badge-purple' : u.role === 'Researcher' ? 'badge-cyan' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: u.status === 'Active' ? 'var(--emerald-bio)' : 'var(--rose-danger)', fontWeight: 600 }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.last_login}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Supabase Cloud Database */}
      {activeTab === 'database' && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: '0.35rem' }}>
                <CheckCircle2 size={12} /> Connected &amp; Synced
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Supabase PostgreSQL Cloud Database</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Live cloud persistence for user authentication, role policies, and molecular research logs.
              </p>
            </div>
            <a 
              href="https://supabase.com/dashboard/project/idhgdaovsxqfxlikimio" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              Open Supabase Dashboard
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project ID</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>idhgdaovsxqfxlikimio</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Engine</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--purple-quantum)' }}>PostgreSQL 15 (Supabase Cloud)</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cloud Region</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--emerald-bio)' }}>ap-south-1 (AWS Mumbai)</strong>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auth Provider</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text-primary)' }}>GoTrue RBAC (Active)</strong>
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
            Synchronized Schema Tables
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {['public.profiles', 'public.candidates', 'public.experiments', 'public.models', 'public.audit_logs'].map((table, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={15} color="var(--cyan-primary)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>{table}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Models */}
      {activeTab === 'models' && (
        <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Model Name</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Test R²</th>
                <th style={{ padding: '1rem' }}>Test MAE</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{m.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{m.type}</td>
                  <td style={{ padding: '1rem', color: 'var(--cyan-primary)', fontWeight: 700 }}>{m.r2}</td>
                  <td style={{ padding: '1rem', color: 'var(--emerald-bio)' }}>{m.mae}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-success">{m.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configured</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Error & Diagnostic Logs */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--amber-warn)' }}>Live Activity Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.map((log) => (
              <div key={log.id} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.88rem'
              }}>
                <div>
                  <span className={`badge ${log.level === 'WARN' ? 'badge-warn' : 'badge-cyan'}`} style={{ marginRight: '0.75rem' }}>
                    {log.level}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>[{log.source}]</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
