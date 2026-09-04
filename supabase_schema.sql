-- ============================================================================
-- QGen (Q-MoleGen) - Supabase Cloud PostgreSQL 15 Master Database Schema
-- Project ID: idhgdaovsxqfxlikimio
-- Region: AWS Mumbai (ap-south-1)
-- ============================================================================

-- 1. PROFILES TABLE (User Roles & Accounts: Researcher, Student, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Researcher' CHECK (role IN ('Researcher', 'Student', 'Admin')),
    full_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    last_login VARCHAR(100) DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CANDIDATES TABLE (De Novo Generated Molecular Candidates)
CREATE TABLE IF NOT EXISTS public.candidates (
    id BIGSERIAL PRIMARY KEY,
    smiles TEXT NOT NULL,
    name VARCHAR(255),
    mw NUMERIC(10, 3),
    log_p NUMERIC(10, 3),
    qed NUMERIC(10, 4),
    sas NUMERIC(10, 4),
    hbd INT,
    hba INT,
    predicted_logs NUMERIC(10, 4),
    solubility_class VARCHAR(50),
    pareto_rank INT DEFAULT 1,
    composite_score NUMERIC(10, 2),
    quantum_energy_gap NUMERIC(10, 4),
    generation_method VARCHAR(100) DEFAULT 'Bioisosteric Generative Engine',
    created_by VARCHAR(100) DEFAULT 'Researcher',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPERIMENTS TABLE (Saved Simulation Campaigns & Benchmarks)
CREATE TABLE IF NOT EXISTS public.experiments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role VARCHAR(50) DEFAULT 'Researcher',
    model_type VARCHAR(100) DEFAULT 'Quantum Support Vector Classifier (QSVC)',
    feature_map VARCHAR(100) DEFAULT 'ZZFeatureMap (4 qubits, 2 reps)',
    candidates_count INT DEFAULT 0,
    best_score NUMERIC(10, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INQUIRIES TABLE (Contact Us & Research Collaboration Registry)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Researcher',
    organization VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Logged',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT_LOGS TABLE (Administrative Activity & Error Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(50) DEFAULT 'INFO',
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public & Service Access for App Operations
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read on candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on candidates" ON public.candidates FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on experiments" ON public.experiments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on experiments" ON public.experiments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SEED INITIAL MOCK & DEMO DATA
-- ============================================================================
-- Seed Profiles
INSERT INTO public.profiles (username, email, role, full_name, status)
VALUES 
    ('admin', 'admin@qgen.org', 'Admin', 'Chief System Administrator', 'Active'),
    ('marie_curie', 'marie@qgen.org', 'Researcher', 'Dr. Marie Curie (Senior Chemist)', 'Active'),
    ('student_alex', 'student@qgen.org', 'Student', 'Alex Vance (Graduate Student)', 'Active')
ON CONFLICT (username) DO NOTHING;

-- Seed Candidates
INSERT INTO public.candidates (smiles, name, mw, log_p, qed, sas, hbd, hba, predicted_logs, solubility_class, pareto_rank, composite_score, quantum_energy_gap)
VALUES
    ('CC(=O)Oc1ccccc1C(=O)O', 'Aspirin Analog (Q-Gen-01)', 180.16, 1.31, 0.654, 1.85, 1, 3, -1.95, 'Moderate', 1, 82.4, 0.452),
    ('CC(C)Cc1ccc(cc1)C(C)C(=O)O', 'Ibuprofen Quantum Derivative', 206.28, 3.07, 0.720, 2.10, 1, 2, -3.12, 'Moderate', 1, 78.8, 0.518),
    ('CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'Caffeine Bioisostere', 194.19, -0.07, 0.540, 2.45, 0, 6, -0.92, 'High', 1, 74.6, 0.623),
    ('c1ccccc1NC(=O)C', 'Acetanilide Lead', 135.17, 1.16, 0.589, 1.42, 1, 1, -1.88, 'Moderate', 2, 71.0, 0.485)
ON CONFLICT DO NOTHING;

-- Seed Sample Inquiry
INSERT INTO public.inquiries (name, email, role, organization, message, status)
VALUES
    ('Dr. Sarah Lin', 'sarah.lin@oxford.ac.uk', 'Researcher', 'Oxford Molecular Sciences', 'Interested in benchmarking the QSVC quantum kernel against our DFT solvation dataset.', 'Logged')
ON CONFLICT DO NOTHING;
