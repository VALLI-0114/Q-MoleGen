import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import {
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  TrendingUp,
  Target,
  Database,
  HelpCircle,
  Activity,
  Info,
  ArrowRight,
  FlaskConical,
  RotateCw
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function Analytics() {
  const [experiments, setExperiments] = useState([
    {
      id: 'EXP-2026-001',
      title: 'Delaney ESOL Solubility Optimization Batch #1 (De Novo Q-MoleGen)',
      researcher: 'dr_curie_scientist',
      target: 'High Solubility (LogS > -2.0) + Drug-likeness',
      date: '2026-09-04 09:30 UTC',
      status: 'Completed',
    },
    {
      id: 'EXP-DELANEY-1128',
      title: 'Delaney ESOL Reference Dataset (1,128 Measured Compounds)',
      researcher: 'Delaney Reference Benchmark',
      target: 'Aqueous Solubility Population Baseline',
      date: 'Empirical Baseline',
      status: 'Audited',
    },
    {
      id: 'EXP-2026-002',
      title: 'Quantum Kernel ZZFeatureMap 4-Qubit Evaluation',
      researcher: 'dr_feynman_qml',
      target: 'Balanced Solubility + Quantum Kernel Mapping',
      date: '2026-09-04 10:15 UTC',
      status: 'Completed',
    },
    {
      id: 'EXP-EMPTY',
      title: 'New Unexecuted Experiment #003 (Empty Sandbox Run)',
      researcher: 'dr_curie_scientist',
      target: 'Pending Execution',
      date: 'Pending',
      status: 'Draft',
    },
  ]);

  const [selectedExperimentId, setSelectedExperimentId] = useState('EXP-2026-001');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch experiments list
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/analytics/experiments/')
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load experiments list')))
      .then((data) => {
        if (data && data.experiments) {
          setExperiments(data.experiments);
        }
      })
      .catch((err) => console.log('Notice: using fallback experiment list', err));
  }, []);

  // Fetch experiment analytics data whenever selection changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://127.0.0.1:8000/api/analytics/data/${selectedExperimentId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load experiment analytics:', err);
        setError('Failed to fetch dynamic analytics data. Please ensure the backend is running.');
        setLoading(false);
      });
  }, [selectedExperimentId]);

  const activeExp = experiments.find((e) => e.id === selectedExperimentId) || (analyticsData?.experiment) || {};

  // If loading
  if (loading && !analyticsData) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <RotateCw size={36} color="var(--cyan-primary)" className="spin-slow" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Loading Experiment Analytics...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Computing molecular property distributions and model benchmarks.</p>
      </div>
    );
  }

  // If no experiment data
  const hasData = analyticsData?.has_data;

  // 1. LogS Distribution Chart Config
  const logsHist = analyticsData?.logs_distribution?.histogram || { labels: [], counts: [] };
  const logsChartData = {
    labels: logsHist.labels,
    datasets: [
      {
        label: analyticsData?.logs_distribution?.label || 'Aqueous Solubility (LogS)',
        data: logsHist.counts,
        backgroundColor: analyticsData?.logs_distribution?.is_predicted
          ? 'rgba(21, 188, 223, 0.65)'
          : 'rgba(5, 150, 105, 0.65)',
        borderColor: analyticsData?.logs_distribution?.is_predicted ? '#15BCDF' : '#059669',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  // 2. Molecular Property Distribution Chart Configs
  const mwHist = analyticsData?.property_distributions?.molecular_weight || { labels: [], counts: [] };
  const logpHist = analyticsData?.property_distributions?.logp || { labels: [], counts: [] };
  const tpsaHist = analyticsData?.property_distributions?.tpsa || { labels: [], counts: [] };

  const mwChartData = {
    labels: mwHist.labels,
    datasets: [
      {
        label: 'Molecules',
        data: mwHist.counts,
        backgroundColor: 'rgba(124, 58, 237, 0.6)',
        borderColor: '#7c3aed',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const logpChartData = {
    labels: logpHist.labels,
    datasets: [
      {
        label: 'Molecules',
        data: logpHist.counts,
        backgroundColor: 'rgba(217, 119, 6, 0.6)',
        borderColor: '#d97706',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const tpsaChartData = {
    labels: tpsaHist.labels,
    datasets: [
      {
        label: 'Molecules',
        data: tpsaHist.counts,
        backgroundColor: 'rgba(6, 182, 212, 0.6)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  // 3. Lipinski Ro5 Doughnut Chart
  const ro5 = analyticsData?.lipinski_ro5 || { pass_count: 0, marginal_count: 0, fail_count: 0, compliance_rate: 0 };
  const ro5ChartData = {
    labels: [
      `Pass (0 Violations) - ${ro5.pass_count}`,
      `Acceptable (1 Violation) - ${ro5.marginal_count}`,
      `Fail (2+ Violations) - ${ro5.fail_count}`,
    ],
    datasets: [
      {
        data: [ro5.pass_count, ro5.marginal_count, ro5.fail_count],
        backgroundColor: ['#059669', '#d97706', '#e11d48'],
        borderWidth: 0,
      },
    ],
  };

  // 4. Optimization Progress Line Chart
  const optProgress = analyticsData?.optimization_progress?.iterations || [];
  const optProgressData = {
    labels: optProgress.map((p) => `Iteration ${p.iteration}`),
    datasets: [
      {
        label: 'Best Candidate Score',
        data: optProgress.map((p) => p.best_score),
        borderColor: '#15BCDF',
        backgroundColor: 'rgba(21, 188, 223, 0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#15BCDF',
        pointRadius: 5,
      },
      {
        label: 'Population Mean Score',
        data: optProgress.map((p) => p.mean_score),
        borderColor: '#7c3aed',
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
        pointBackgroundColor: '#7c3aed',
        pointRadius: 4,
      },
    ],
  };

  // 5. Validity / Novelty Analytics Compact Bar
  const molQuality = analyticsData?.molecule_quality || {};
  const qualityBarData = {
    labels: ['Generated', 'Valid', 'Invalid', 'Duplicate', 'Novel'],
    datasets: [
      {
        label: 'Candidate Count',
        data: [
          molQuality.total_generated || 0,
          molQuality.valid || 0,
          molQuality.invalid || 0,
          molQuality.duplicates_removed || 0,
          molQuality.novel || 0,
        ],
        backgroundColor: [
          '#64748b',
          '#059669',
          '#e11d48',
          '#d97706',
          '#15BCDF',
        ],
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { family: 'Outfit, sans-serif' },
        bodyFont: { family: 'Plus Jakarta Sans, sans-serif' },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-cyan">
            <BarChart2 size={13} style={{ marginRight: '4px' }} /> Experiment Analytics
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-Time In Silico Evaluation & Population Statistics
          </span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Experiment Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '900px' }}>
          Aggregate molecular properties, candidate quality, model performance, and optimization statistics for the selected Q-MoleGen experiment.
        </p>
      </div>

      {/* ANALYTICS WORKFLOW STEPPER */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.8rem 1.2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={14} color="var(--cyan-primary)" /> Workflow:
        </strong>
        {[
          'Dataset',
          'Molecule Generation',
          'RDKit Validation',
          'Feature Extraction',
          'Classical ML + Quantum ML',
          'Property Prediction',
          'Multi-Objective Optimization',
          'Candidate Ranking',
          'Experiment Analytics',
        ].map((step, idx, arr) => (
          <React.Fragment key={step}>
            <span
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                background: idx === arr.length - 1 ? 'rgba(21, 188, 223, 0.15)' : '#f8fafc',
                color: idx === arr.length - 1 ? '#0284c7' : 'inherit',
                fontWeight: idx === arr.length - 1 ? 700 : 500,
                border: idx === arr.length - 1 ? '1px solid #38bdf8' : '1px solid #e2e8f0',
              }}
            >
              {step}
            </span>
            {idx < arr.length - 1 && <ArrowRight size={11} color="#94a3b8" />}
          </React.Fragment>
        ))}
      </div>

      {/* 1. EXPERIMENT SELECTOR */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ minWidth: '320px', flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
            }}
          >
            SELECT EXPERIMENT
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedExperimentId}
              onChange={(e) => setSelectedExperimentId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: '#f8fafc',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.id}: {exp.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experiment Metadata Badges */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>RESEARCHER</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeExp.researcher || 'dr_curie_scientist'}
            </div>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-subtle)' }} />
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>TARGET PROFILE</div>
            <div style={{ fontWeight: 600, color: 'var(--cyan-primary)' }}>
              {activeExp.target || 'High Solubility + Ro5 Compliant'}
            </div>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-subtle)' }} />
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>EXECUTION DATE</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {activeExp.date || '2026-09-04 09:30 UTC'}
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE IF NO DATA IN EXPERIMENT */}
      {!hasData ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
          }}
        >
          <FlaskConical size={48} color="var(--amber-warn)" style={{ margin: '0 auto 1.25rem' }} />
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No experiment data available
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            This experiment run has not generated or audited candidate compounds yet. Please run a de novo campaign in the Generator or select an executed experiment above.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => setSelectedExperimentId('EXP-2026-001')}
              style={{ padding: '0.65rem 1.4rem' }}
            >
              Load Experiment #001 Batch
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedExperimentId('EXP-DELANEY-1128')}
              style={{ padding: '0.65rem 1.4rem' }}
            >
              View Delaney Reference Dataset
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. SUMMARY STATISTICS (4 KPI CARDS) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {/* Molecules Processed */}
            <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  MOLECULES PROCESSED
                </span>
                <Database size={18} color="#64748b" />
              </div>
              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '0.35rem',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {analyticsData.summary_statistics.molecules_processed?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Audited in selected experiment
              </div>
            </div>

            {/* Validity Rate */}
            <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  VALIDITY RATE
                </span>
                <ShieldCheck size={18} color="var(--emerald-bio)" />
              </div>
              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: 'var(--emerald-bio)',
                  marginTop: '0.35rem',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {analyticsData.summary_statistics.validity_rate?.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                RDKit chemical sanity check
              </div>
            </div>

            {/* Novelty Rate */}
            <div className="glass-card" style={{ padding: '1.35rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  NOVELTY RATE
                </span>
                <Sparkles size={18} color="var(--cyan-primary)" />
              </div>
              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: 'var(--cyan-primary)',
                  marginTop: '0.35rem',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {analyticsData.summary_statistics.novelty_rate?.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Ref: {analyticsData.summary_statistics.reference_dataset}
              </div>
            </div>

            {/* Average Optimization Score */}
            <div className="glass-card glass-card-quantum" style={{ padding: '1.35rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  AVG OPTIMIZATION SCORE
                </span>
                <Target size={18} color="var(--purple-quantum)" />
              </div>
              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: 'var(--purple-quantum)',
                  marginTop: '0.35rem',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {analyticsData.summary_statistics.average_optimization_score?.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Multi-objective composite average
              </div>
            </div>
          </div>

          {/* 3. LOGS DISTRIBUTION & 5. LIPINSKI RULE OF FIVE */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
              gap: '1.75rem',
              marginBottom: '2rem',
            }}
          >
            {/* 3. LogS Distribution */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Aqueous Solubility Distribution (LogS)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Frequency distribution of molecular solubility across the population.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    background: analyticsData.logs_distribution.is_predicted
                      ? 'rgba(21, 188, 223, 0.15)'
                      : 'rgba(5, 150, 105, 0.15)',
                    color: analyticsData.logs_distribution.is_predicted ? '#0284c7' : '#059669',
                    border: analyticsData.logs_distribution.is_predicted
                      ? '1px solid #38bdf8'
                      : '1px solid #34d399',
                  }}
                >
                  {analyticsData.logs_distribution.label}
                </span>
              </div>

              <div style={{ height: '240px', width: '100%', marginTop: 'auto' }}>
                <Bar
                  data={logsChartData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      x: {
                        ...chartOptions.scales.x,
                        title: { display: true, text: 'LogS Range (mol/L)', font: { size: 11, weight: 600 } },
                      },
                      y: {
                        ...chartOptions.scales.y,
                        title: { display: true, text: 'Number of Molecules', font: { size: 11, weight: 600 } },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* 5. Lipinski Rule of Five Compliance */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Lipinski Rule of Five Compliance
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Computational oral bioavailability heuristic breakdown.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: 'var(--emerald-bio)',
                    background: 'rgba(5, 150, 105, 0.1)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                  }}
                >
                  Compliance Rate: {ro5.compliance_rate}%
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  margin: '0.5rem 0',
                }}
              >
                <div style={{ height: '170px', width: '170px' }}>
                  <Doughnut
                    data={ro5ChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: chartOptions.plugins.tooltip,
                      },
                      cutout: '68%',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                    <span><strong>0 Violations (Pass):</strong> {ro5.pass_count}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }} />
                    <span><strong>1 Violation (Marginal):</strong> {ro5.marginal_count}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e11d48' }} />
                    <span><strong>2+ Violations (Fail):</strong> {ro5.fail_count}</span>
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Criteria: MW ≤ 500 Da · LogP ≤ 5 · HBD ≤ 5 · HBA ≤ 10
                  </div>
                </div>
              </div>

              {/* Lipinski Mandatory Disclaimer */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '0.6rem 0.85rem',
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px',
                  fontSize: '0.73rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                }}
              >
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Important Notice:</strong> This is a computational drug-likeness heuristic. Do NOT describe Lipinski compliance as proof that a molecule is a safe, effective, or approved drug.
                </span>
              </div>
            </div>
          </div>

          {/* 4. MOLECULAR PROPERTY DISTRIBUTIONS */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Molecular Property Distributions
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Key physiochemical descriptor histograms across the evaluated chemical population.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
              {/* Molecular Weight Distribution */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--purple-quantum)' }}>
                  Molecular Weight Distribution
                </div>
                <div style={{ height: '170px' }}>
                  <Bar
                    data={mwChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: { title: { display: true, text: 'Molecular Weight (Da)', font: { size: 10 } } },
                        y: { title: { display: true, text: 'Number of Molecules', font: { size: 10 } } },
                      },
                    }}
                  />
                </div>
              </div>

              {/* LogP Distribution */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--amber-warn)' }}>
                  LogP Distribution
                </div>
                <div style={{ height: '170px' }}>
                  <Bar
                    data={logpChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: { title: { display: true, text: 'LogP (Octanol/Water)', font: { size: 10 } } },
                        y: { title: { display: true, text: 'Number of Molecules', font: { size: 10 } } },
                      },
                    }}
                  />
                </div>
              </div>

              {/* TPSA Distribution */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0284c7' }}>
                  TPSA Distribution
                </div>
                <div style={{ height: '170px' }}>
                  <Bar
                    data={tpsaChartData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        x: { title: { display: true, text: 'TPSA (Å²)', font: { size: 10 } } },
                        y: { title: { display: true, text: 'Number of Molecules', font: { size: 10 } } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6. MOLECULE QUALITY STATISTICS & 7. CANDIDATE QUALITY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '1.75rem',
              marginBottom: '2rem',
            }}
          >
            {/* 6. Molecule Quality Statistics */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={20} color="var(--emerald-bio)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Molecule Quality Statistics
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Pipeline filtration, deduplication, and chemical novelty verification.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL GENERATED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {molQuality.total_generated}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>VALID</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-bio)', marginTop: '0.2rem' }}>
                    {molQuality.valid}
                  </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 700 }}>INVALID</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose-danger)', marginTop: '0.2rem' }}>
                    {molQuality.invalid}
                  </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700 }}>DUPLICATES REMOVED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-warn)', marginTop: '0.2rem' }}>
                    {molQuality.duplicates_removed}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>UNIQUE MOLECULES</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {molQuality.unique}
                  </div>
                </div>

                <div style={{ background: '#f0f9ff', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700 }}>NOVEL MOLECULES</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>
                    {molQuality.novel}
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Candidate Quality */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <TrendingUp size={20} color="var(--purple-quantum)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Candidate Quality & Pareto Ranks
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Evaluation scores across the multi-objective optimization Pareto frontier.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      TOP CANDIDATE SCORE
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      ID: <strong>{analyticsData.candidate_quality.top_candidate?.id}</strong> (SMILES:{' '}
                      <code style={{ color: 'var(--text-code)', fontSize: '0.78rem' }}>
                        {analyticsData.candidate_quality.top_candidate?.smiles}
                      </code>
                      )
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-primary)', fontFamily: 'var(--font-heading)' }}>
                    {analyticsData.candidate_quality.top_candidate_score}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      AVERAGE CANDIDATE SCORE
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Mean score across valid evaluated candidates
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple-quantum)', fontFamily: 'var(--font-heading)' }}>
                    {analyticsData.candidate_quality.average_candidate_score}
                  </div>
                </div>

                <div
                  style={{
                    background: analyticsData.candidate_quality.pareto_executed ? '#f0fdf4' : '#f8fafc',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '8px',
                    border: analyticsData.candidate_quality.pareto_executed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: analyticsData.candidate_quality.pareto_executed ? '#166534' : 'var(--text-muted)' }}>
                      PARETO-OPTIMAL CANDIDATES
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {analyticsData.candidate_quality.pareto_executed
                        ? 'Non-dominated multi-objective trade-off solutions'
                        : 'Pareto optimization not executed for baseline'}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: analyticsData.candidate_quality.pareto_executed ? 'var(--emerald-bio)' : '#94a3b8',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {analyticsData.candidate_quality.pareto_optimal_count}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 8. CLASSICAL VS QUANTUM PERFORMANCE */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={20} color="var(--purple-quantum)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Classical vs Quantum Performance Benchmark
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Empirical classification results on Delaney ESOL test partition (Classical ML Baselines vs QSVC Quantum Kernel).
                </p>
              </div>
              <span className="badge badge-purple">
                Rigorous Multi-Metric Evaluation
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Model Architecture</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>Paradigm</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>Accuracy</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>Precision</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>Recall</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>F1 Score</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>ROC-AUC</th>
                    <th style={{ padding: '0.75rem 0.8rem', fontWeight: 700 }}>Fit Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyticsData.benchmark_performance || []).map((model, i) => {
                    const isQuantum = model.category.includes('Quantum');
                    return (
                      <tr
                        key={model.name}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isQuantum ? 'rgba(124, 58, 237, 0.04)' : i % 2 === 0 ? '#ffffff' : '#fafafa',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: isQuantum ? 'var(--purple-quantum)' : 'var(--text-primary)' }}>
                          {model.name}
                        </td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: isQuantum ? 'rgba(124, 58, 237, 0.15)' : '#e2e8f0',
                              color: isQuantum ? '#7c3aed' : '#475569',
                            }}
                          >
                            {model.category}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {model.test_accuracy}%
                        </td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>{model.precision}%</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>{model.recall}%</td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>{model.f1}%</td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                          {model.roc_auc}
                        </td>
                        <td style={{ padding: '0.75rem 0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {model.fit_time_sec}s
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Benchmark Transparency:</strong> Classical ensemble models (Gradient Boosting 94.3% & Random Forest 93.4%) demonstrate top empirical accuracy on tabular chemical descriptors. The QSVC quantum kernel demonstrates effective 4-qubit Hilbert space encoding (89.8% test accuracy) for quantum-assisted solubility classification.
            </div>
          </div>

          {/* 9. OPTIMIZATION PROGRESS & 10. VALIDITY / NOVELTY ANALYTICS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: '1.75rem',
            }}
          >
            {/* 9. Optimization Progress */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Optimization Progress
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Evolutionary improvement of candidate scores across generational cycles.
                </p>
              </div>

              {analyticsData.optimization_progress.available ? (
                <div style={{ height: '220px', width: '100%', marginTop: 'auto' }}>
                  <Line
                    data={optProgressData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 10 } } },
                      },
                      scales: {
                        ...chartOptions.scales,
                        x: { title: { display: true, text: 'Iteration', font: { size: 10 } } },
                        y: { title: { display: true, text: 'Best Score', font: { size: 10 } }, min: 40, max: 85 },
                      },
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    padding: '1rem',
                  }}
                >
                  <div>
                    <AlertCircle size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                    <div><strong>Optimization data unavailable</strong></div>
                    <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      Evolutionary cycles are executed during de novo campaign generation.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 10. Validity / Novelty Analytics (Compact) */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Validity / Novelty Analytics
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Compact population audit comparing generation, validity, deduplication, and novelty.
                </p>
              </div>

              <div style={{ height: '220px', width: '100%', marginTop: 'auto' }}>
                <Bar
                  data={qualityBarData}
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: { ...chartOptions.scales.y, title: { display: true, text: 'Molecules', font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
