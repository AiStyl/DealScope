-- DealScope Database Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Deals
CREATE TABLE deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    deal_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    target_value DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    industry VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Documents
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'uploading',
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Document Chunks for RAG
CREATE TABLE document_chunks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Findings
CREATE TABLE findings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id),
    agent_id VARCHAR(100) NOT NULL,
    finding_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    confidence DECIMAL(3, 2) NOT NULL,
    consensus_score DECIMAL(3, 2),
    models_agreed TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Audit Trail
CREATE TABLE audit_trail (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,
    actor_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    deal_id UUID REFERENCES deals(id),
    action VARCHAR(255) NOT NULL,
    input JSONB,
    output JSONB,
    confidence DECIMAL(3, 2),
    model_used VARCHAR(100),
    hash VARCHAR(64) NOT NULL,
    prev_hash VARCHAR(64)
);

-- Analysis Sessions
CREATE TABLE analysis_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    input JSONB NOT NULL,
    output JSONB,
    models_used TEXT[] NOT NULL,
    total_tokens INTEGER,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_findings_deal ON findings(deal_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Allow all for demo
CREATE POLICY "Allow all" ON deals FOR ALL USING (true);
CREATE POLICY "Allow all" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all" ON findings FOR ALL USING (true);
CREATE POLICY "Allow all" ON audit_trail FOR ALL USING (true);

-- Seed demo deals
INSERT INTO deals (name, company_name, deal_type, status, target_value, industry) VALUES
('Project Phoenix', 'TechFlow Solutions', 'acquisition', 'in_progress', 52000000, 'Technology'),
('Project Atlas', 'CloudNine Systems', 'merger', 'review', 128000000, 'Technology'),
('Project Neptune', 'DataStream Analytics', 'investment', 'draft', 15000000, 'Data Analytics');
