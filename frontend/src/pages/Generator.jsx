import React, { useState } from 'react';
import axios from 'axios';
import { Compass, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export default function Generator({ onGenerated }) {
  const [targetSol, setTargetSol] = useState('moderate');
  const [mwRange, setMwRange] = useState('150-450');
  const [batchSize, setBatchSize] = useState(4);
  const [evalMethod, setEvalMethod] = useState('hybrid');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/generate/', {
        target_solubility: targetSol,
        mw_range: mwRange,
        batch_size: batchSize,
        evaluation_method: evalMethod,
      });

      if (onGenerated) {
        onGenerated(res.data.candidates);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
          <Sliders size={12} /> Target Formulation
        </span>
        <h1 style={{ fontSize: '2.2rem' }}>Molecular Generator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Specify physicochemical target boundaries, sampling batch size, and quantum evaluation methods.
        </p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleGenerate}>
          {/* Section 1: Objectives */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--cyan-primary)', marginBottom: '1.25rem' }}>
            1. Target Physicochemical Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Aqueous Solubility Objective (LogS)
              </label>
              <select
                value={targetSol}
                onChange={(e) => setTargetSol(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="high">High Solubility (LogS &gt; -2.0)</option>
                <option value="moderate">Moderate Solubility (-4.0 to -2.0)</option>
                <option value="low">Low Solubility (Lipophilic Lead)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Molecular Weight Range (Da)
              </label>
              <input
                type="text"
                value={mwRange}
                onChange={(e) => setMwRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Section 2: Engine & Batch */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--purple-quantum)', marginBottom: '1.25rem' }}>
            2. Quantum Evaluation Engine & Sampling Size
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Batch Sampling Size
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value={4}>4 Candidates (Quick Preview)</option>
                <option value={10}>10 Candidates</option>
                <option value={25}>25 Candidates</option>
                <option value={50}>50 Candidates</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Property Evaluation Engine
              </label>
              <select
                value={evalMethod}
                onChange={(e) => setEvalMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="hybrid">Hybrid Classical-Quantum Consensus</option>
                <option value="quantum">Quantum Kernel (QSVC 4-Qubit AerSimulator)</option>
                <option value="classical">Classical Regressor (Random Forest + SVR)</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
            >
              <Sparkles size={18} />
              {loading ? 'Sampling & Computing QML Scores...' : 'Generate & Prioritize Candidates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
