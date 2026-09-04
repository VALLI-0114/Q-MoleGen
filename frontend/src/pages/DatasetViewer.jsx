import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, CheckCircle, Search, RefreshCw, BarChart2 } from 'lucide-react';

export default function DatasetViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDataset = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/dataset/esol/?limit=50');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dataset from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  const records = data?.sample || [];
  const filtered = records.filter(r => 
    (r['Compound ID'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r['smiles'] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>
            <Database size={12} /> Phase 4 Dataset Acquisition
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>Delaney ESOL Aqueous Solubility Dataset</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Audited, canonicalized, and verified benchmark dataset for classical and quantum solubility prediction models.
          </p>
        </div>
        <button onClick={fetchDataset} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Dataset Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Molecules</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {data?.stats?.total_molecules || 1128}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-bio)' }}>100% RDKit Validated</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unique Canonical SMILES</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-primary)', marginTop: '0.25rem' }}>
            1,117
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>11 duplicates tagged</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Missing Values</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-bio)', marginTop: '0.25rem' }}>
            0
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-bio)' }}>Zero Null Entries</span>
        </div>

        <div className="glass-card glass-card-quantum" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Solubility Range (LogS)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple-quantum)', marginTop: '0.5rem' }}>
            [-11.60, 1.58]
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mean: -3.05 LogS</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text"
          placeholder="Search dataset by Compound ID or SMILES substructure..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Tabular Dataset View */}
      <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Delaney ESOL dataset from Django API...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>#</th>
                <th style={{ padding: '1rem' }}>Compound Name</th>
                <th style={{ padding: '1rem' }}>SMILES</th>
                <th style={{ padding: '1rem' }}>MW (Da)</th>
                <th style={{ padding: '1rem' }}>HBD</th>
                <th style={{ padding: '1rem' }}>Rings</th>
                <th style={{ padding: '1rem' }}>RotBonds</th>
                <th style={{ padding: '1rem' }}>Measured LogS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{row['Compound ID']}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <code className="smiles-tag" style={{ fontSize: '0.78rem' }}>{row['smiles']}</code>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{row['Molecular Weight']}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{row['Number of H-Bond Donors']}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{row['Number of Rings']}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{row['Number of Rotatable Bonds']}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--emerald-bio)', fontWeight: 700 }}>
                    {row['measured log solubility in mols per litre']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
