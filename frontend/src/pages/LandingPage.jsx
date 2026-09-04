import React, { useState, useEffect, useRef } from 'react';
import BrandLogo from '../components/BrandLogo';

export default function LandingPage({ setTab, setUserRole, onOpenAuth }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactHover, setContactHover] = useState(false);
  const [heroCtaHover, setHeroCtaHover] = useState(false);
  const [aboutCtaHover, setAboutCtaHover] = useState(false);
  const [formCtaHover, setFormCtaHover] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [contactRole, setContactRole] = useState('Researcher');
  const [contactMessage, setContactMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const heroVideoRef = useRef(null);
  const aboutVideoRef = useRef(null);

  // Responsive breakpoint tracking at 700px
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Robust video autoplay retry logic
  useEffect(() => {
    const tryPlay = (videoEl) => {
      if (videoEl) {
        videoEl.muted = true;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay was prevented, will retry on click/interval
          });
        }
      }
    };

    // Retry every 1s
    const interval = setInterval(() => {
      if (heroVideoRef.current && heroVideoRef.current.paused) {
        tryPlay(heroVideoRef.current);
      }
      if (aboutVideoRef.current && aboutVideoRef.current.paused) {
        tryPlay(aboutVideoRef.current);
      }
    }, 1000);

    // Trigger on first document click / touchstart
    const handleUserInteraction = () => {
      tryPlay(heroVideoRef.current);
      tryPlay(aboutVideoRef.current);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    tryPlay(heroVideoRef.current);
    tryPlay(aboutVideoRef.current);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const handleNavClick = (targetId) => {
    setMobileMenuOpen(false);
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetId === 'about') {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (targetId === 'contact') {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAction = () => {
    if (onOpenAuth) {
      onOpenAuth('Researcher');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          organization: contactOrg,
          role: contactRole,
          message: contactMessage,
        }),
      });
      setFormSent(true);
      setTimeout(() => {
        setContactName('');
        setContactEmail('');
        setContactOrg('');
        setContactMessage('');
        setTimeout(() => setFormSent(false), 5000);
      }, 500);
    } catch (err) {
      setFormSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F2F1F0',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      color: '#1e2327',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
    }}>
      {/* =========================================================================
          SECTION 1 — HERO
          ========================================================================= */}
      <section
        id="hero"
        style={{
          minHeight: '100svh',
          backgroundColor: '#F2F1F0',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Background Video */}
        <video
          ref={heroVideoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260823_050407_500d0339-ab28-41c1-9688-132a74a3b5aa.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            objectFit: 'contain',
            height: 'auto',
            zIndex: 0,
            top: 0,
            ...(isMobile
              ? { left: '-12%', width: '119%' }
              : { right: '-20%', width: '99%' }),
          }}
        />

        {/* Desktop Left Scrim Overlay (Left 70%) */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '70%',
              height: '100%',
              background:
                'linear-gradient(90deg, #F2F1F0 0%, #F2F1F0 55%, rgba(242,241,240,0.85) 78%, rgba(242,241,240,0) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* NAVBAR */}
        <nav
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(20px, 5vw, 56px)',
            padding: 'clamp(20px, 3vw, 38px) clamp(20px, 4vw, 48px) 0',
          }}
        >
          {/* Brand Logo */}
          <BrandLogo onClick={() => handleNavClick('home')} />

          {/* Desktop Nav Links */}
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '34px',
                whiteSpace: 'nowrap',
              }}
            >
              <a
                href="#hero"
                onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 2.4vw, 15px)',
                  letterSpacing: '0.06em',
                  color: '#3a3a3a',
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3a3a3a')}
              >
                HOME
              </a>
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 2.4vw, 15px)',
                  letterSpacing: '0.06em',
                  color: '#3a3a3a',
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3a3a3a')}
              >
                ABOUT
              </a>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 2.4vw, 15px)',
                  letterSpacing: '0.06em',
                  color: '#3a3a3a',
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3a3a3a')}
              >
                CONTACT US
              </a>
            </div>
          )}

          {/* Desktop Right-Aligned "Contact us" Button */}
          {!isMobile && (
            <button
              onClick={() => handleNavClick('contact')}
              onMouseEnter={() => setContactHover(true)}
              onMouseLeave={() => setContactHover(false)}
              style={{
                background: contactHover ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                border: 'none',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '14px 26px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                clipPath:
                  'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                transition: 'background-color 0.2s ease',
              }}
            >
              {/* Mail envelope SVG (17x13, stroke-width 1.4) */}
              <svg
                width="17"
                height="13"
                viewBox="0 0 17 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.7"
                  y="0.7"
                  width="15.6"
                  height="11.6"
                  rx="1"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                />
                <path
                  d="M1.5 1.5L8.5 7.5L15.5 1.5"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Contact us
            </button>
          )}

          {/* Mobile Hamburger Button */}
          {isMobile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  padding: '8px',
                }}
              >
                <span
                  style={{
                    width: '22px',
                    height: '2px',
                    backgroundColor: '#ffffff',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    width: '22px',
                    height: '2px',
                    backgroundColor: '#ffffff',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    width: '22px',
                    height: '2px',
                    backgroundColor: '#ffffff',
                    display: 'block',
                  }}
                />
              </button>

              {/* Stacked Mobile Menu */}
              {mobileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: '#F2F1F0',
                    border: '1px solid #0fa3c2',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '20px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    zIndex: 100,
                    minWidth: '170px',
                  }}
                >
                  <a
                    href="#hero"
                    onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
                    style={{
                      color: '#1a1c1e',
                      fontWeight: 700,
                      fontSize: '15px',
                      textDecoration: 'none',
                      letterSpacing: '0.06em',
                    }}
                  >
                    HOME
                  </a>
                  <a
                    href="#about"
                    onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
                    style={{
                      color: '#1a1c1e',
                      fontWeight: 700,
                      fontSize: '15px',
                      textDecoration: 'none',
                      letterSpacing: '0.06em',
                    }}
                  >
                    ABOUT
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}
                    style={{
                      color: '#1a1c1e',
                      fontWeight: 700,
                      fontSize: '15px',
                      textDecoration: 'none',
                      letterSpacing: '0.06em',
                    }}
                  >
                    CONTACT US
                  </a>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* HEADLINE */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '850px',
            ...(isMobile
              ? {
                  marginTop: '320px',
                  padding: '0 24px 24px 24px',
                }
              : {
                  padding:
                    'min(clamp(40px, 8vw, 100px), 8vh) 24px min(clamp(20px, 3vw, 36px), 4vh) clamp(24px, 7vw, 90px)',
                }),
          }}
        >
          <h1
            style={{
              margin: 0,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
              color: '#1e2327',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: isMobile
                ? 'clamp(32px, 8.5vw, 44px)'
                : 'clamp(38px, 4.8vw, 62px)',
            }}
          >
            <div style={{ display: 'block' }}>DESIGNING THE MOLECULES</div>
            <div style={{ display: 'block', marginTop: '0.15em' }}>
              FOR YOUR <span style={{ color: '#15BCDF', textShadow: '0 0 25px rgba(21, 188, 223, 0.3)' }}>FUTURE</span>
            </div>
          </h1>

          <p
            style={{
              margin: '20px 0 0 0',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              lineHeight: 1.65,
              color: '#5a6268',
              maxWidth: '560px',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 400,
            }}
          >
            Quantum-enhanced generative AI for de novo molecular design, multi-objective Pareto optimization, and accelerated physicochemical property prediction.
          </p>
        </div>

        {/* CTA BUTTON */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            paddingLeft: isMobile ? '24px' : 'clamp(24px, 7vw, 90px)',
            paddingBottom: 'min(clamp(32px, 5vw, 70px), 6vh)',
          }}
        >
          <button
            onClick={handleAction}
            onMouseEnter={() => setHeroCtaHover(true)}
            onMouseLeave={() => setHeroCtaHover(false)}
            style={{
              backgroundColor: heroCtaHover ? '#3fd0ef' : '#15BCDF',
              border: '1px solid #0fa3c2',
              color: '#111827',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '16px 32px',
              fontSize: 'clamp(13px, 1.8vw, 15px)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              clipPath:
                'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
              boxShadow: heroCtaHover
                ? '0 0 0 2px rgba(21, 188, 223, 0.5), 0 15px 35px -10px rgba(15, 163, 194, 0.8)'
                : '0 0 0 1px rgba(21, 188, 223, 0.35), 0 10px 30px -12px rgba(15, 163, 194, 0.6)',
              transition: 'all 0.25s ease',
            }}
          >
            <span>EXPLORE Q-MOLEGEN</span>
            {/* Trailing 20px line */}
            <span
              style={{
                width: '20px',
                height: '1.5px',
                backgroundColor: '#111827',
                display: 'inline-block',
              }}
            />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — ABOUT
          ========================================================================= */}
      <section
        id="about"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '40px',
          background: 'linear-gradient(180deg, #F2F1F0 0%, #F7F6F8 18%, #F7F6F8 100%)',
          padding: 'clamp(60px, 8vw, 120px) 0 clamp(30px, 5vw, 70px) clamp(24px, 7vw, 90px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Column */}
        <div
          style={{
            flex: '1 1 420px',
            minWidth: '300px',
          }}
        >
          {/* h2: "ABOUT Q-MOLEGEN" in Outfit font with cyan Q-MOLEGEN */}
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 4.8vw, 54px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
              color: '#1e2327',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            }}
          >
            <div>ABOUT</div>
            <div style={{ color: '#15BCDF' }}>Q-MOLEGEN</div>
          </h2>

          {/* Paragraph text */}
          <p
            style={{
              maxWidth: '540px',
              margin: '22px 0 0 0',
              fontSize: 'clamp(14px, 1.4vw, 16.5px)',
              lineHeight: 1.7,
              color: '#5a6268',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            }}
          >
            Q-MoleGen is a computational molecular design platform that combines generative AI, cheminformatics, classical machine learning, and quantum machine learning to generate, evaluate, and prioritize molecular candidates with desired properties.
          </p>

          {/* EXPLORE Q-MOLEGEN button */}
          <button
            onClick={handleAction}
            onMouseEnter={() => setAboutCtaHover(true)}
            onMouseLeave={() => setAboutCtaHover(false)}
            style={{
              margin: '28px 0 0 0',
              backgroundColor: aboutCtaHover ? '#3fd0ef' : '#15BCDF',
              border: '1px solid #0fa3c2',
              color: '#111827',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '16px 32px',
              fontSize: 'clamp(13px, 1.8vw, 15px)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              clipPath:
                'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
              boxShadow: aboutCtaHover
                ? '0 0 0 2px rgba(21, 188, 223, 0.5), 0 15px 35px -10px rgba(15, 163, 194, 0.8)'
                : '0 0 0 1px rgba(21, 188, 223, 0.35), 0 10px 30px -12px rgba(15, 163, 194, 0.6)',
              transition: 'all 0.25s ease',
            }}
          >
            <span>EXPLORE Q-MOLEGEN</span>
            {/* Trailing 20px line */}
            <span
              style={{
                width: '20px',
                height: '1.5px',
                backgroundColor: '#111827',
                display: 'inline-block',
              }}
            />
          </button>
        </div>

        {/* Right Column: Flush Video with #15BCDF mix-blend-mode: hue overlay */}
        <div
          style={{
            flex: '1 1 360px',
            minWidth: '280px',
            justifyContent: 'flex-end',
            position: 'relative',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <video
            ref={aboutVideoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260823_063501_2e2c8971-de1e-473a-8611-a0c9ae7ee186.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              width: '100%',
              maxWidth: '644px',
              height: 'auto',
              display: 'block',
            }}
          />

          {/* Overlay rectangle exactly covering the video in #15BCDF with mix-blend-mode: hue */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '644px',
              height: '100%',
              backgroundColor: '#15BCDF',
              mixBlendMode: 'hue',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — CONTACT US
          ========================================================================= */}
      <section
        id="contact"
        style={{
          background: 'linear-gradient(180deg, #F7F6F8 0%, #F2F1F0 100%)',
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 7vw, 90px)',
          position: 'relative',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        {/* Section Heading */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 4.8vw, 54px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
              color: '#1e2327',
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            }}
          >
            <div>CONTACT</div>
            <div style={{ color: '#15BCDF' }}>Q-MOLEGEN</div>
          </h2>
          <p
            style={{
              maxWidth: '620px',
              margin: '18px 0 0 0',
              fontSize: 'clamp(14px, 1.4vw, 16.5px)',
              lineHeight: 1.7,
              color: '#5a6268',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            }}
          >
            Connect with our research team for academic collaboration, quantum simulation benchmarking, computational campaign access, or peer review inquiries.
          </p>
        </div>

        {/* Contact Grid: Form & Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          {/* Form Box */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: 'clamp(24px, 4vw, 36px)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
            }}
          >
            <h3
              style={{
                margin: '0 0 1.25rem 0',
                fontSize: '1.3rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#1e2327',
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                letterSpacing: '0.02em',
              }}
            >
              Send Research Inquiry
            </h3>

            {formSent ? (
              <div
                style={{
                  background: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                <strong>Thank you for contacting Q-MoleGen!</strong>
                <p style={{ margin: '0.5rem 0 0' }}>
                  Your inquiry has been logged into our research coordination registry. A team member will respond shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Marie Curie"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: '#F2F1F0',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#1e2327',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="scientist@institute.edu"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: '#F2F1F0',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#1e2327',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      Persona / Role
                    </label>
                    <select
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: '#F2F1F0',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#1e2327',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Researcher">Researcher / Scientist</option>
                      <option value="Reviewer">Peer Reviewer / Academic</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={contactOrg}
                    onChange={(e) => setContactOrg(e.target.value)}
                    placeholder="Department of AI & Computational Chemistry"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: '#F2F1F0',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#1e2327',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Inquiry Details / Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your research objective, benchmark questions, or quantum platform interest..."
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      background: '#F2F1F0',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#1e2327',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  onMouseEnter={() => setFormCtaHover(true)}
                  onMouseLeave={() => setFormCtaHover(false)}
                  style={{
                    backgroundColor: formCtaHover ? '#3fd0ef' : '#15BCDF',
                    border: '1px solid #0fa3c2',
                    color: '#111827',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '16px 30px',
                    fontSize: '14px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '14px',
                    clipPath:
                      'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                    boxShadow: formCtaHover
                      ? '0 0 0 2px rgba(21, 188, 223, 0.5), 0 12px 28px -8px rgba(15, 163, 194, 0.8)'
                      : '0 0 0 1px rgba(21, 188, 223, 0.35), 0 8px 24px -10px rgba(15, 163, 194, 0.6)',
                    transition: 'all 0.25s ease',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>{submitting ? 'LOGGING INQUIRY...' : 'SEND INQUIRY'}</span>
                  <span
                    style={{
                      width: '18px',
                      height: '1.5px',
                      backgroundColor: '#111827',
                      display: 'inline-block',
                    }}
                  />
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Direct Gateway */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Academic & Research Facilities Attribution Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15BCDF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Academic &amp; Research Facilities
              </span>
              <h4 style={{ margin: '0.4rem 0 0.75rem 0', fontSize: '1.2rem', color: '#1e2327', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>
                Academic Project Leadership
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Developer */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Developed By
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", marginTop: '2px' }}>
                    Pravallika Kundum
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    B.Tech Final-Year Capstone Project
                  </div>
                </div>

                {/* Project Guide */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Project Guide
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", marginTop: '2px' }}>
                    Dr. G. JayaSuma
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px', fontWeight: 600 }}>
                    Professor of Information Technology Department
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#475569' }}>
                <strong>Direct Contact:</strong>{' '}
                <a href="mailto:contact@qmolegen.org" style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 600 }}>
                  contact@qmolegen.org
                </a>
              </div>
            </div>

            {/* Direct Portal Logins */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Direct Persona Gateway
              </span>
              <h4 style={{ margin: '0.4rem 0 1rem 0', fontSize: '1.15rem', color: '#1e2327', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
                Access Your Role Portal
              </h4>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('Researcher')}
                  style={{
                    padding: '0.55rem 1rem',
                    background: '#15BCDF',
                    border: '1px solid #0fa3c2',
                    borderRadius: '6px',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  🔬 Researcher Sign Up
                </button>
                <button
                  onClick={() => onOpenAuth && onOpenAuth('Admin')}
                  style={{
                    padding: '0.55rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '6px',
                    color: '#6b21a8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  🔐 Admin Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
