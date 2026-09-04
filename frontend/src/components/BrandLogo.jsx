import React from 'react';

export default function BrandLogo({ size = 'default', light = false, onClick }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 38 : 34;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        background: 'transparent',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Transparent Quantum-Molecular Icon */}
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="qgenOrbitalGrad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="60%" stopColor="#15BCDF" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="qgenCoreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Cross Orbital Ring (Secondary) */}
          <ellipse
            cx="14"
            cy="14"
            rx="10"
            ry="4.8"
            transform="rotate(40 14 14)"
            stroke="#64748b"
            strokeWidth="1.6"
            strokeDasharray="4 2"
            opacity="0.6"
          />

          {/* Primary Quantum Orbital Ring */}
          <ellipse
            cx="14"
            cy="14"
            rx="10"
            ry="4.8"
            transform="rotate(-28 14 14)"
            stroke="url(#qgenOrbitalGrad)"
            strokeWidth="2.2"
          />

          {/* Orbiting Quantum Particle / Electron */}
          <circle cx="21.5" cy="9.8" r="1.8" fill="#15BCDF" filter="url(#qgenCoreGlow)" />

          {/* Central Atomic Nucleus */}
          <circle cx="14" cy="14" r="3.4" fill="url(#qgenOrbitalGrad)" />
          <circle cx="14" cy="14" r="1.5" fill="#ffffff" />

          {/* Dynamic Q-Tail */}
          <path
            d="M18 18L24 24"
            stroke="url(#qgenOrbitalGrad)"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text: Q-MoleGen */}
      <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
        <span
          style={{
            fontSize: isLarge ? '28px' : '24px',
            fontWeight: 900,
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            color: '#15BCDF',
            letterSpacing: '-0.02em',
          }}
        >
          Q-Mole
        </span>
        <span
          style={{
            fontSize: isLarge ? '28px' : '24px',
            fontWeight: 800,
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            color: light ? '#ffffff' : '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          Gen
        </span>
      </div>
    </div>
  );
}
