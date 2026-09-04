import React, { useState } from 'react';
import { AlertTriangle, Pause, Play, Sparkles } from 'lucide-react';

export default function DisclaimerBanner() {
  const [isPaused, setIsPaused] = useState(false);

  const noticeItems = [
    'Research Notice: Q-MolGen is a computational molecular design and candidate prioritization system.',
    'All predictions, LogS descriptors, and quantum scores are simulated in silico and require experimental wet-lab validation.',
    'Supervised by Dr. G. JayaSuma (Professor of Information Technology Department)',
    'Developed by Pravallika Kundum',
    'Benchmark Reference: Delaney ESOL Empirical Dataset (1,128 Compounds)',
    '4-Qubit NISQ ZZ-FeatureMap Hilbert Space Simulation',
  ];

  const fullTextSegment = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.25rem', paddingRight: '1.25rem' }}>
      {noticeItems.map((item, index) => (
        <React.Fragment key={index}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {index === 0 && <AlertTriangle size={13} color="#d97706" style={{ flexShrink: 0 }} />}
            {index === 1 && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d97706' }} />}
            {index === 2 && <Sparkles size={12} color="#7c3aed" style={{ flexShrink: 0 }} />}
            {index === 3 && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#15BCDF' }} />}
            {index >= 4 && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b' }} />}
            <span style={{ fontWeight: index === 0 ? 700 : index === 2 || index === 3 ? 600 : 500 }}>
              {item}
            </span>
          </span>
          <span style={{ color: '#d97706', opacity: 0.6, fontSize: '0.75rem' }}>◆</span>
        </React.Fragment>
      ))}
    </span>
  );

  return (
    <div
      className="ticker-container"
      style={{
        background: '#fffdf5',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        height: '36px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(217, 119, 6, 0.06)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Fixed Notice Badge on Left */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#fef3c7',
          color: '#92400e',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '0 10px',
          height: '100%',
          borderRight: '1px solid #fde68a',
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        <AlertTriangle size={13} color="#d97706" />
        <span>Notice</span>
      </div>

      {/* Marquee Scroller Area */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.82rem',
          color: '#78350f',
          maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
        }}
        onClick={() => setIsPaused(!isPaused)}
        title={isPaused ? 'Click to resume scrolling' : 'Click to pause scrolling (or hover)'}
      >
        <div
          className="ticker-track"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {fullTextSegment}
          {fullTextSegment}
        </div>
      </div>

      {/* Play/Pause indicator on Right */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b45309',
          opacity: 0.7,
          height: '100%',
          flexShrink: 0,
          zIndex: 2,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
        aria-label={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
      >
        {isPaused ? <Play size={11} /> : <Pause size={11} />}
      </button>
    </div>
  );
}
