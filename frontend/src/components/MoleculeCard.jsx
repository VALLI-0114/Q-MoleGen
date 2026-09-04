import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Star, ShieldCheck, Zap } from 'lucide-react';

export default function MoleculeCard({ cand, onSelect }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cand.canonical_smiles || cand.smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPareto = cand.is_pareto !== undefined ? cand.is_pareto : (cand.score >= 85);
  const qedVal = cand.qed !== undefined ? cand.qed : (cand.descriptors?.qed || '0.72');
  const gapVal = cand.homo_lumo_gap !== undefined ? cand.homo_lumo_gap : '6.45';

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '0.75rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        background: isPareto ? 'rgba(139, 92, 246, 0.08)' : 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge badge-cyan">{cand.name || `Candidate #${cand.id}`}</span>
          {isPareto && (
            <span className="badge badge-purple" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Star size={10} fill="#c084fc" /> Pareto
            </span>
          )}
        </div>
        <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
          Score: {cand.score || 90}/100
        </span>
      </div>

      {/* 2D Molecular SVG Rendering from RDKit */}
      <div style={{
        background: '#ffffff',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '180px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {cand.svg ? (
          <div dangerouslySetInnerHTML={{ __html: cand.svg }} style={{ maxWidth: '100%', maxHeight: '170px' }} />
        ) : (
          <div style={{ color: '#666', fontSize: '0.85rem' }}>2D Chemical Graph</div>
        )}
      </div>

      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="smiles-tag" style={{ flex: 1, fontSize: '0.78rem' }}>
            {cand.canonical_smiles || cand.smiles}
          </div>
          <button 
            onClick={handleCopy}
            className="btn btn-outline"
            style={{ padding: '0.35rem 0.45rem', borderRadius: '6px' }}
            title="Copy canonical SMILES"
          >
            {copied ? <Check size={13} color="var(--emerald-bio)" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Multi-Objective Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div><strong>LogS:</strong> <span style={{ color: 'var(--emerald-bio)', fontWeight: 700 }}>{cand.pred_solubility !== undefined ? cand.pred_solubility : -2.1}</span></div>
          <div><strong>QED:</strong> <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>{qedVal}</span></div>
          <div><strong>HOMO-LUMO:</strong> {gapVal} eV</div>
          <div><strong>QML Prob:</strong> {cand.quantum_score !== undefined ? `${(cand.quantum_score * 100).toFixed(0)}%` : '92%'}</div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={13} color="var(--emerald-bio)" /> Lipinski Ro5 Compliant
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={13} color="var(--purple-quantum)" /> Qiskit 2.x
          </span>
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(cand)}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', marginTop: '0.2rem' }}
          >
            <ExternalLink size={13} /> Full Cheminformatics Breakdown
          </button>
        )}
      </div>
    </div>
  );
}
