import React, { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function SmilesInspector() {
  const [smilesInput, setSmilesInput] = useState('CC(=O)Oc1ccccc1C(=O)O'); // Aspirin
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInspect = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/parse-smiles/', { smiles: smilesInput });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse chemical SMILES');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const sampleSmiles = [
    { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
    { name: 'Caffeine', smiles: 'Cn1c(=O)c2c(ncn2C)n(C)c1=O' },
    { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(C(C)C(=O)O)cc1' },
    { name: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
          <Search size={12} /> Interactive RDKit Parser
        </span>
        <h1 style={{ fontSize: '2.2rem' }}>Live SMILES Inspector</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter any custom chemical SMILES string to dynamically render its 2D graph, calculate 1D descriptors, and test Lipinski's Rule of 5.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleInspect}>
          <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Input Molecular SMILES Notation
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={smilesInput}
              onChange={(e) => setSmilesInput(e.target.value)}
              placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
              style={{
                flex: 1,
                padding: '0.85rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
              <Sparkles size={16} /> Parse & Inspect
            </button>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Benchmark Presets:</span>
            {sampleSmiles.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSmilesInput(s.smiles)}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: '#ffe4e6',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          padding: '1rem',
          color: '#be123c',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Result Display */}
      {result?.descriptors && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.75rem' }}>
          {/* Left: 2D SVG */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '250px'
            }}>
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            </div>
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <div className="smiles-tag">{result.descriptors.canonical_smiles}</div>
            </div>
          </div>

          {/* Right: Descriptors Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--cyan-primary)', marginBottom: '1rem' }}>
              Calculated Descriptors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Molecular Weight</span>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{result.descriptors.molecular_weight} Da</strong>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>LogP</span>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{result.descriptors.logp}</strong>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TPSA</span>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{result.descriptors.tpsa} Å²</strong>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>HBD / HBA</span>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{result.descriptors.hbd} / {result.descriptors.hba}</strong>
              </div>
            </div>

            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: result.descriptors.ro5_compliant ? '#d1fae5' : '#fef3c7',
              border: `1px solid ${result.descriptors.ro5_compliant ? '#a7f3d0' : '#fde68a'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: result.descriptors.ro5_compliant ? '#065f46' : '#92400e' }}>
                <strong>Lipinski Ro5:</strong> {result.descriptors.ro5_compliant ? 'Compliant' : 'Violations Detected'}
              </span>
              <span className={`badge ${result.descriptors.ro5_compliant ? 'badge-success' : 'badge-warn'}`}>
                {result.descriptors.ro5_violations} Violations
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
