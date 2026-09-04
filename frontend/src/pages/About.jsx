import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Code, CheckCircle, Sparkles, Database, Layers, GitBranch, Award } from 'lucide-react';

export default function About() {
  const phases = [
    { num: '00', title: 'Project Charter & Setup', status: 'Completed', tag: 'Core' },
    { num: '01', title: 'Cheminformatics Foundation', status: 'Completed', tag: 'RDKit' },
    { num: '02', title: 'Dev Environment & Tooling', status: 'Completed', tag: 'Python' },
    { num: '03', title: 'React Single Page App & RBAC', status: 'Completed', tag: 'FullStack' },
    { num: '04', title: 'Delaney ESOL Dataset Acquisition', status: 'Completed', tag: 'Data' },
    { num: '05', title: 'Exploratory Data Analysis (EDA)', status: 'Completed', tag: 'Analytics' },
    { num: '06', title: 'RDKit Descriptors Pipeline', status: 'Completed', tag: 'Cheminformatics' },
    { num: '07', title: 'Molecular 2D Vector Rendering', status: 'Completed', tag: 'Graphics' },
    { num: '08', title: 'Classical ML Regression Baselines', status: 'Completed', tag: 'Scikit-Learn' },
    { num: '09', title: 'Model Diagnostics & XAI Importance', status: 'Completed', tag: 'XAI' },
    { num: '10', title: 'Morgan Fingerprints vs Descriptors', status: 'Completed', tag: 'Comparison' },
    { num: '11', title: 'Quantum Computing Formulation', status: 'Completed', tag: 'Theory' },
    { num: '12', title: 'Quantum Data Preparation & Scaling', status: 'Completed', tag: 'Encoding' },
    { num: '13', title: 'Qiskit QSVC & Quantum Kernels', status: 'Completed', tag: 'Qiskit' },
    { num: '14', title: 'Classical vs Quantum Benchmark', status: 'Completed', tag: 'Benchmark' },
    { num: '15', title: 'QM9 DFT Surrogate Energy Gaps', status: 'Completed', tag: 'DFT' },
    { num: '16', title: 'De Novo Bioisosteric Generator', status: 'Completed', tag: 'Generative AI' },
    { num: '17', title: 'Multi-Objective Pareto Optimization', status: 'Completed', tag: 'Optimization' },
    { num: '18', title: 'Integrated Closed-Loop Discovery', status: 'Completed', tag: 'Pipeline' },
    { num: '19', title: 'Atom-Level Substructure Attribution', status: 'Completed', tag: 'Explainable AI' },
    { num: '20', title: 'Final Capstone Report & Thesis Archive', status: 'Completed', tag: 'Capstone' },
  ];

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
          <Award size={12} /> B.Tech Capstone Project
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          Q-MolGen: Quantum-Enhanced Generative AI for De Novo Molecule Design
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Comprehensive final-year research architecture uniting classical cheminformatics, machine learning regressors, parameterized quantum circuits, and multi-objective Pareto optimization.
        </p>
      </div>

      {/* Key Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>20 / 20</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Phases Completed (100%)</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-bio)' }}>39 / 39</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Automated Unit Tests Passing</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple-quantum)' }}>0.875</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Gradient Boosting R² Score</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-warn)' }}>15</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Publication Figures Generated</div>
        </div>
      </div>

      {/* 20 Phases Roadmap Grid */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CheckCircle size={18} style={{ color: 'var(--emerald-bio)' }} />
          Full 20-Phase Master Implementation Ledger
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {phases.map((p) => (
            <div
              key={p.num}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cyan-primary)', fontSize: '0.85rem' }}>
                  P-{p.num}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {p.title}
                </span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Layers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '0.75rem' }}>1. Cheminformatics & Descriptors Engine (RDKit)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            Chemical structures are parsed from SMILES notation into attributed 2D molecular graphs. 18 continuous physicochemical descriptors (Molecular Weight, LogP, TPSA, HBD, HBA, Rotatable Bonds) and 1024-bit Morgan Circular Fingerprints are computed via RDKit to serve as input vectors for machine learning.
          </p>
        </div>

        <div className="glass-card glass-card-quantum">
          <h3 style={{ color: 'var(--purple-quantum)', marginBottom: '0.75rem' }}>2. Quantum Machine Learning & Quantum Kernels (Qiskit)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            Reduced molecular feature subsets are scaled into $[0, \pi]$ and encoded into quantum statevectors using a parameterized 4-qubit $ZZ\text{FeatureMap}$. Inner products evaluated in the resulting 16-dimensional Hilbert space construct quantum kernel matrices used by Quantum Support Vector Classifiers (QSVC) on the Qiskit AerSimulator.
          </p>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--emerald-bio)', marginBottom: '0.75rem' }}>3. Multi-Objective Pareto Optimization & Generative AI</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            De novo molecular generation combines bioisosteric chemical reactions with non-dominated Pareto frontier sorting across competing dimensions: aqueous solubility ($\text{LogS}$), drug-likeness ($\text{QED}$), synthetic accessibility ($\text{SA}$), and quantum fidelity probability.
          </p>
        </div>

        <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <h3 style={{ color: 'var(--amber-warn)', marginBottom: '0.75rem' }}>4. Academic Rigor & Ethical Research Disclaimers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
            This platform is strictly designed for in silico candidate prioritization. Computational predictions do not replace in vitro physical wet-lab assays or clinical pharmacology trials. Candidate molecules are prioritized based on predicted drug-like properties.
          </p>
        </div>

        <div className="glass-card" style={{ border: '1px solid rgba(21, 188, 223, 0.3)', background: 'rgba(15, 23, 42, 0.7)' }}>
          <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} /> Academic & Research Leadership
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Developed By
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                Pravallika Kundum
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                B.Tech Final-Year Capstone Project
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple-quantum)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project Guide
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                Dr. G. JayaSuma
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Professor of Information Technology Department
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
