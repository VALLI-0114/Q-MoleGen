import React from 'react';
import { Compass, BarChart2, Cpu, ShieldCheck, ArrowRight, Zap, Database } from 'lucide-react';

export default function Home({ setTab }) {
  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem 4rem 1rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '1.25rem' }}>
          <Zap size={14} /> Quantum-Enhanced Computational Chemistry
        </span>
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          maxWidth: '950px',
          margin: '0 auto 1.5rem auto',
          lineHeight: 1.15
        }}>
          Quantum-Enhanced Generative AI for{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--cyan-primary), var(--purple-quantum))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            De Novo Molecule Design
          </span>
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.7
        }}>
          An integrated classical-quantum research platform combining RDKit graph informatics, autoregressive SMILES generation, and simulator-based Parameterized Quantum Circuits (PQC) for candidate prioritization.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('generator')} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <Compass size={18} /> Launch Molecule Generator
          </button>
          <button onClick={() => setTab('dataset')} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>
            <Database size={18} /> Explore ESOL Dataset (Phase 4)
          </button>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card">
          <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>01. Cheminformatics</span>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>RDKit Graph Processing</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Automated valency perception, SMILES canonicalization, Lipinski Rule of 5 evaluation, and Morgan circular fingerprint extraction.
          </p>
        </div>

        <div className="glass-card glass-card-quantum">
          <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>02. Quantum ML</span>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Quantum Kernel QSVC</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            4-to-8 qubit ZZFeatureMap circuits mapping scaled physicochemical features into high-dimensional Hilbert space on Qiskit AerSimulator.
          </p>
        </div>

        <div className="glass-card">
          <span className="badge badge-success" style={{ marginBottom: '1rem' }}>03. Optimization</span>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Multi-Objective Steering</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Pareto ranking combining aqueous solubility (LogS), molecular weight constraints, and synthetic accessibility heuristics.
          </p>
        </div>
      </div>

      {/* Discovery Pipeline Steps */}
      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>End-to-End Computational Discovery Pipeline</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--border-highlight)', padding: '1.25rem', borderRadius: '10px' }}>
            <strong style={{ color: 'var(--cyan-primary)', display: 'block', marginBottom: '0.25rem' }}>1. Target Definition</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Solubility, MW, LogP, TPSA</span>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--border-highlight)', padding: '1.25rem', borderRadius: '10px' }}>
            <strong style={{ color: 'var(--cyan-primary)', display: 'block', marginBottom: '0.25rem' }}>2. Generative AI</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>SMILES Sequence Sampling</span>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid var(--border-quantum)', padding: '1.25rem', borderRadius: '10px' }}>
            <strong style={{ color: 'var(--purple-quantum)', display: 'block', marginBottom: '0.25rem' }}>3. Quantum Evaluation</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>ZZFeatureMap & QSVC</span>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '10px' }}>
            <strong style={{ color: 'var(--emerald-bio)', display: 'block', marginBottom: '0.25rem' }}>4. Prioritization</strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Multi-Objective Pareto Rank</span>
          </div>
        </div>
      </div>
    </div>
  );
}
