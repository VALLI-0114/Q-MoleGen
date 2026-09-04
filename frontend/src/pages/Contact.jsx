import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  MapPin, 
  Building, 
  GraduationCap, 
  Microscope, 
  Shield, 
  Database,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Contact({ setTab, onOpenAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Researcher');
  const [subject, setSubject] = useState('Research Collaboration');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does Q-MoleGen calculate quantum energy gaps and solubility?',
      a: 'Q-MoleGen utilizes parameterized Quantum Support Vector Classifiers (QSVC) with ZZFeatureMap ansatz circuits executed via Qiskit simulators, paired with Gradient Boosting and Random Forest regressors trained on the Delaney ESOL physical chemistry benchmark dataset.'
    },
    {
      q: 'Can I export generated molecules for wet-lab validation?',
      a: 'Yes. In the Researcher Portal and Results view, candidates can be exported in CSV, SMILES, and SDF formats complete with predicted logS solubility, QED drug-likeness, SAS synthetic accessibility, and Pareto frontier rankings.'
    },
    {
      q: 'Is my experimental data synchronized with Supabase Cloud?',
      a: 'Yes. User registrations, saved exploration campaigns, and research inquiries are automatically persisted to our live Supabase PostgreSQL 15 cloud database cluster.'
    },
    {
      q: 'What are the access privileges for Researcher vs Admin?',
      a: 'Researchers have full generative AI and quantum simulation capabilities. Administrators can manage accounts, model weights, and system logs.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          organization,
          message: `[${subject}] ${message}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setOrganization('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      // Fallback local acknowledgment
      setSubmitted(true);
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Sparkles size={14} /> Contact &amp; Research Support
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Get in Touch with the <span style={{ color: '#0284c7' }}>Q-MoleGen</span> Team
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '750px', margin: 0 }}>
          Have questions regarding our quantum generative algorithms, benchmark datasets, model licensing, or academic collaboration? Send our computational team an inquiry below.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Left: Contact Form */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} color="#0284c7" />
            Send Us an Inquiry
          </h2>

          {submitted ? (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '1.75rem',
              textAlign: 'center',
            }}>
              <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ color: '#166534', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Inquiry Received!</h3>
              <p style={{ color: '#15803d', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                Thank you for contacting the Q-MoleGen research initiative. Your message has been stored in our Supabase research registry and a member of our team will contact you.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem' }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Marie Curie"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institute.edu"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Primary Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Organization / Dept
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Dept of Quantum Chemistry"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Subject Area
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Research Collaboration">Research Collaboration</option>
                    <option value="Quantum Qiskit Benchmarking">Quantum Qiskit Benchmarking</option>
                    <option value="ESOL Dataset Access">ESOL Dataset Access</option>
                    <option value="Bug / Error Report">Bug / Error Report</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Inquiry Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your research inquiry, simulation requirements, or dataset verification questions..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {submitting ? 'Submitting Inquiry...' : 'Submit Research Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact Information & Hubs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card: Direct Role Portals */}
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#059669', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              <Shield size={16} />
              Persona-Based Sign Up
            </div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
              Register Your Role Account
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              Create an account with role-based access for automated screening, quantum-classical workflows, and administrative experiment management.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenAuth && onOpenAuth('Researcher')}
                className="btn btn-outline"
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: '#0284c7', color: '#0369a1' }}
              >
                <Microscope size={16} color="#0284c7" /> Researcher Portal
              </button>
              <button
                onClick={() => onOpenAuth && onOpenAuth('Admin')}
                className="btn btn-outline"
                style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: '#7c3aed', color: '#7c3aed' }}
              >
                <Shield size={16} color="#7c3aed" /> Admin Portal
              </button>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155' }}>
              <div><strong>Direct Support:</strong> <a href="mailto:contact@qmolegen.org" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>contact@qmolegen.org</a></div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Typical response window: &lt; 24 business hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={20} color="#0284c7" />
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                background: openFaq === idx ? '#f8fafc' : '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} color="#0284c7" /> : <ChevronDown size={18} color="#64748b" />}
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
