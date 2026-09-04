import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, Zap, Activity, CheckCircle, AlertCircle, Play, Layers, Compass, Sparkles } from 'lucide-react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const SAMPLE_MOLECULES = [
  { name: 'Aspirin (Painkiller)', smiles: 'CC(=O)Oc1ccccc1C(=O)O', target: 'Soluble' },
  { name: 'Caffeine (Stimulant)', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C', target: 'Soluble' },
  { name: 'Paracetamol (Analgesic)', smiles: 'CC(=O)Nc1ccc(O)cc1', target: 'Soluble' },
  { name: 'Picene (Aromatic Hydrocarbon)', smiles: 'c1ccc2c(c1)ccc1c2ccc2c3ccccc3ccc21', target: 'Insoluble' },
  { name: 'Estradiol (Hormone)', smiles: 'CC12CCC3c4ccc(O)cc4CCC3C1CCC2O', target: 'Insoluble' },
];

export default function QuantumAnalysis() {
  const [circuitData, setCircuitData] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [selectedSmiles, setSelectedSmiles] = useState('CC(=O)Oc1ccccc1C(=O)O');
  const [customSmiles, setCustomSmiles] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);

  useEffect(() => {
    // Fetch Quantum Circuit specs
    axios.get('http://127.0.0.1:8000/api/quantum/circuit/')
      .then(res => setCircuitData(res.data))
      .catch(err => console.error('Circuit error:', err));

    // Fetch Classical vs Quantum Benchmark
    axios.get('http://127.0.0.1:8000/api/quantum/benchmark/')
      .then(res => {
        if (res.data.status === 'success') {
          setBenchmarkData(res.data.data);
        }
      })
      .catch(err => console.error('Benchmark error:', err));

    // Initial prediction for Aspirin
    handleEvaluateSmiles('CC(=O)Oc1ccccc1C(=O)O');
  }, []);

  const handleEvaluateSmiles = async (smilesToEval) => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const resp = await axios.post('http://127.0.0.1:8000/api/quantum/predict/', {
        smiles: smilesToEval,
      });
      if (resp.data.status === 'success') {
        setPredictionResult(resp.data);
      } else {
        setEvalError(resp.data.error || 'Evaluation failed.');
      }
    } catch (err) {
      setEvalError(err.response?.data?.error || err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Radar Chart Data for Qubit Angles
  const radarData = predictionResult?.qubit_angles_rad ? {
    labels: ['q[0]: LogP', 'q[1]: MW', 'q[2]: TPSA', 'q[3]: Molar Refractivity'],
    datasets: [{
      label: 'Qubit State Angle θ ∈ [0, π]',
      data: [
        predictionResult.qubit_angles_rad.q0_logp,
        predictionResult.qubit_angles_rad.q1_mw,
        predictionResult.qubit_angles_rad.q2_tpsa,
        predictionResult.qubit_angles_rad.q3_mr,
      ],
      backgroundColor: 'rgba(139, 92, 246, 0.25)',
      borderColor: '#8b5cf6',
      pointBackgroundColor: '#38bdf8',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#8b5cf6',
    }],
  } : null;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Main Interactive Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Left: Interactive Quantum Prediction Console */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--purple-quantum)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} /> Live Quantum Kernel Prediction
            </h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>Interactive Sandbox</span>
          </div>

          {/* Quick Pre-Selected Molecules */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Select Pre-Configured Compound:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SAMPLE_MOLECULES.map((mol, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSmiles(mol.smiles);
                    handleEvaluateSmiles(mol.smiles);
                  }}
                  className={`btn-tag ${selectedSmiles === mol.smiles ? 'btn-tag-active' : ''}`}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedSmiles === mol.smiles ? 'var(--purple-quantum)' : '#ffffff',
                    border: selectedSmiles === mol.smiles ? '1px solid var(--purple-quantum)' : '1px solid #cbd5e1',
                    color: selectedSmiles === mol.smiles ? '#fff' : '#475569',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {mol.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SMILES Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Or Enter Custom SMILES String:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={customSmiles}
                onChange={(e) => setCustomSmiles(e.target.value)}
                placeholder="e.g. c1ccccc1O (Phenol)"
                style={{
                  flex: 1,
                  padding: '0.65rem 0.9rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                }}
              />
              <button
                onClick={() => {
                  if (customSmiles.trim()) {
                    setSelectedSmiles(customSmiles.trim());
                    handleEvaluateSmiles(customSmiles.trim());
                  }
                }}
                disabled={isEvaluating || !customSmiles.trim()}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
              >
                <Play size={14} /> Evaluate
              </button>
            </div>
          </div>

          {evalError && (
            <div style={{ padding: '0.75rem 1rem', background: '#ffe4e6', border: '1px solid #fecdd3', borderRadius: '6px', color: '#be123c', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {evalError}
            </div>
          )}

          {/* Result Box */}
          {predictionResult && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.25rem', alignItems: 'center' }}>
                <div
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: predictionResult.svg }}
                />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>QSVC Predicted Solubility</span>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: predictionResult.predicted_solubility_class.includes('High') ? 'var(--emerald-bio)' : '#e11d48',
                    marginTop: '0.2rem',
                    marginBottom: '0.4rem',
                  }}>
                    {predictionResult.predicted_solubility_class}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Soluble Prob: <strong>{(predictionResult.soluble_probability * 100).toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>Confidence: <strong>{predictionResult.quantum_confidence_pct}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Physicochemical & Quantum Angles Matrix */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
                  Quantum State Rotation Angles (Angle Embedding θ_i ∈ [0, π])
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>q[0] (LogP)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-quantum)' }}>
                      {predictionResult.qubit_angles_rad.q0_logp} rad
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Val: {predictionResult.descriptors.logp.toFixed(2)}</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>q[1] (MW)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-quantum)' }}>
                      {predictionResult.qubit_angles_rad.q1_mw} rad
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Val: {predictionResult.descriptors.molecular_weight.toFixed(1)}</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>q[2] (TPSA)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-quantum)' }}>
                      {predictionResult.qubit_angles_rad.q2_tpsa} rad
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Val: {predictionResult.descriptors.tpsa.toFixed(1)}</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>q[3] (MR)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-quantum)' }}>
                      {predictionResult.qubit_angles_rad.q3_mr} rad
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Val: {predictionResult.descriptors.molar_refractivity.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Qubit Angle Radar & Qubit Assignments */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} /> Qubit Bloch Angle Radar
            </h3>
            {radarData ? (
              <div style={{ maxHeight: '230px', display: 'flex', justifyContent: 'center' }}>
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: 'var(--text-secondary)', font: { size: 11 } },
                        ticks: { display: false, max: 3.1416, min: 0 },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Loading Radar Visualization...
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Qubit Register Allocation
            </span>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div>• <strong>q[0]</strong>: Lipophilicity (LogP) → Primary hydrophobic phase partitioning</div>
              <div>• <strong>q[1]</strong>: Molecular Weight → Solute cavity formation volume</div>
              <div>• <strong>q[2]</strong>: TPSA → Polar hydration & hydrogen-bonding</div>
              <div>• <strong>q[3]</strong>: Molar Refractivity → Electronic dispersion polarizability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Classical vs Quantum Comparative Benchmark Table */}
      {benchmarkData && (
        <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Empirical Classical vs. Quantum Benchmark
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Evaluated on the Delaney ESOL dataset ({benchmarkData.num_train_samples} Train / {benchmarkData.num_test_samples} Test molecules).
              </p>
            </div>
            <span className="badge badge-emerald">Verified Execution</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Model</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Test Accuracy</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Precision</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Recall</th>
                  <th style={{ padding: '0.85rem 1rem' }}>F1-Score</th>
                  <th style={{ padding: '0.85rem 1rem' }}>ROC-AUC</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Fit Time</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.results.map((r, idx) => {
                  const isQ = r.model_name.includes('QSVC');
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isQ ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: isQ ? 'var(--purple-quantum)' : 'var(--text-primary)' }}>
                        {r.model_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {r.category}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--emerald-bio)' }}>
                        {(r.test_accuracy * 100).toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                        {(r.test_precision * 100).toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)' }}>
                        {(r.test_recall * 100).toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
                        {r.test_f1.toFixed(4)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--purple-quantum)' }}>
                        {r.test_roc_auc.toFixed(4)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {r.fit_time_sec}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
