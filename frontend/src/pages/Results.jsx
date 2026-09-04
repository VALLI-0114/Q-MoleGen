import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MoleculeCard from '../components/MoleculeCard';
import { Layers, RefreshCw, Compass } from 'lucide-react';

export default function Results({ candidates, setTab, onSelectMolecule }) {
  const [items, setItems] = useState(candidates || []);
  const [loading, setLoading] = useState(!candidates || candidates.length === 0);

  useEffect(() => {
    if (!candidates || candidates.length === 0) {
      axios.get('http://127.0.0.1:8000/api/candidates/')
        .then(res => setItems(res.data.candidates))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setItems(candidates);
      setLoading(false);
    }
  }, [candidates]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>
            Batch Generation Complete
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>Prioritized Molecular Candidates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ranked via multi-objective scoring balancing predicted aqueous solubility, drug-likeness, and quantum state alignment.
          </p>
        </div>
        <button onClick={() => setTab('generator')} className="btn btn-outline">
          <Compass size={16} /> New Generation Run
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Computing molecular graphs and rendering 2D structures...
        </div>
      ) : (
        <div className="molecule-grid">
          {items.map((cand) => (
            <MoleculeCard
              key={cand.id}
              cand={cand}
              onSelect={(m) => {
                if (onSelectMolecule) onSelectMolecule(m);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
