# Supabase Database Schema for National Delivery Dashboard

## Overview
This document describes the database schema for the NDP 12 National Delivery Dashboard using Supabase (PostgreSQL).

## Core Tables

### 1. `projects`
Stores NDP 12 projects and initiatives

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ministry VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  budget_allocated DECIMAL(15, 2) NOT NULL,
  budget_spent DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- 'planning', 'ongoing', 'completed', 'delayed', 'cancelled'
  priority VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  region VARCHAR(100),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_ministry ON projects(ministry);
CREATE INDEX idx_projects_sector ON projects(sector);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_region ON projects(region);
```

### 2. `kpis`
Key Performance Indicators for NDP 12

```sql
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'economic', 'social', 'environmental', 'governance'
  unit VARCHAR(50) NOT NULL, -- 'percentage', 'number', 'BWP', 'MW', etc.
  target_value DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) DEFAULT 0,
  baseline_value DECIMAL(15, 2),
  baseline_year INTEGER,
  target_year INTEGER NOT NULL,
  responsible_ministry VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kpis_category ON kpis(category);
CREATE INDEX idx_kpis_ministry ON kpis(responsible_ministry);
```

### 3. `kpi_history`
Historical tracking of KPI values

```sql
CREATE TABLE kpi_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  value DECIMAL(15, 2) NOT NULL,
  measurement_date DATE NOT NULL,
  quarter INTEGER, -- 1, 2, 3, 4
  year INTEGER NOT NULL,
  source VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kpi_history_kpi_id ON kpi_history(kpi_id);
CREATE INDEX idx_kpi_history_year ON kpi_history(year);
```

### 4. `milestones`
Project milestones and deliverables

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_date DATE,
  status VARCHAR(50) NOT NULL, -- 'pending', 'in_progress', 'completed', 'delayed'
  completion_percentage INTEGER DEFAULT 0,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
```

### 5. `budget_allocations`
Budget allocations and spending by ministry/sector

```sql
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  allocated_amount DECIMAL(15, 2) NOT NULL,
  revised_amount DECIMAL(15, 2),
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  quarter INTEGER, -- 1, 2, 3, 4 for quarterly tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budget_ministry ON budget_allocations(ministry);
CREATE INDEX idx_budget_sector ON budget_allocations(sector);
CREATE INDEX idx_budget_year ON budget_allocations(financial_year);
```

### 6. `ministries`
Government ministries and departments

```sql
CREATE TABLE ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  minister_name VARCHAR(255),
  permanent_secretary VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ministries_code ON ministries(code);
```

### 7. `sectors`
Development sectors in NDP 12

```sql
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pillar VARCHAR(100), -- NDP 12 pillar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. `reports`
Generated M&E reports

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL, -- 'quarterly', 'annual', 'project', 'ministry'
  period VARCHAR(50) NOT NULL,
  ministry VARCHAR(100),
  sector VARCHAR(100),
  file_url TEXT,
  generated_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_ministry ON reports(ministry);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public read access for published data
CREATE POLICY "Public read access" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON kpis
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON kpi_history
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON ministries
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON sectors
  FOR SELECT USING (true);

-- Authenticated users can insert/update (implement auth later)
-- This is a placeholder - adjust based on actual authentication strategy
CREATE POLICY "Authenticated users can insert" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## Views

### Dashboard Summary View

```sql
CREATE VIEW dashboard_summary AS
SELECT 
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'ongoing' THEN p.id END) as ongoing_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'delayed' THEN p.id END) as delayed_projects,
  SUM(p.budget_allocated) as total_budget_allocated,
  SUM(p.budget_spent) as total_budget_spent,
  COUNT(DISTINCT p.ministry) as ministries_count,
  COUNT(DISTINCT p.sector) as sectors_count
FROM projects p;
```

### Ministry Performance View

```sql
CREATE VIEW ministry_performance AS
SELECT 
  m.name as ministry_name,
  COUNT(p.id) as total_projects,
  SUM(p.budget_allocated) as budget_allocated,
  SUM(p.budget_spent) as budget_spent,
  AVG(p.completion_percentage) as avg_completion,
  COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN p.status = 'delayed' THEN 1 END) as delayed_count
FROM ministries m
LEFT JOIN projects p ON p.ministry = m.code
GROUP BY m.id, m.name;
```

## Initial Seed Data

Example NDP 12 sectors:

```sql
INSERT INTO sectors (code, name, description, pillar) VALUES
  ('agriculture', 'Agriculture & Food Security', 'Agricultural development and food security initiatives', 'Economic Transformation'),
  ('health', 'Health & Wellness', 'Healthcare services and public health programs', 'Social Development'),
  ('education', 'Education & Skills', 'Education system and skills development', 'Human Capital Development'),
  ('energy', 'Energy & Renewables', 'Energy infrastructure and renewable energy projects', 'Infrastructure'),
  ('tourism', 'Tourism & Hospitality', 'Tourism development and promotion', 'Economic Diversification'),
  ('mining', 'Mining & Minerals', 'Mining sector development and value addition', 'Natural Resources'),
  ('ict', 'ICT & Digital Economy', 'Digital transformation and ICT infrastructure', 'Innovation & Technology'),
  ('governance', 'Governance & Transparency', 'Good governance and transparency initiatives', 'Governance');
```

## API Integration Notes

1. **Supabase Client**: Use the backend service role key for server-side operations
2. **Real-time**: Enable real-time subscriptions for live dashboard updates
3. **Storage**: Use Supabase Storage for project evidence files and reports
4. **Functions**: Consider Edge Functions for complex data aggregations
5. **Auth**: Implement Supabase Auth for ministry user authentication

## Migration Strategy

1. Create tables in order (sectors, ministries, projects, kpis, etc.)
2. Enable RLS policies
3. Create views and indexes
4. Import initial seed data
5. Migrate existing JSON data to Supabase tables
6. Test API endpoints with Supabase backend
