# Supabase Setup Guide for National Delivery Dashboard

This guide will help you set up Supabase as the backend database for the National Delivery Dashboard.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic knowledge of SQL and PostgreSQL

## Step 1: Create a Supabase Project

1. Log in to your Supabase account at [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `ndp12-dashboard` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to Botswana (e.g., South Africa)
4. Click "Create new project" and wait for the setup to complete

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, navigate to **Settings** > **API**
2. You'll need two keys:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: For client-side operations
   - **Service Role Key**: For server-side operations (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query and run the following SQL to set up the database:

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sectors table
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pillar VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ministries table
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

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ministry VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  budget_allocated DECIMAL(15, 2) NOT NULL,
  budget_spent DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  region VARCHAR(100),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kpis table
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  target_value DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) DEFAULT 0,
  baseline_value DECIMAL(15, 2),
  baseline_year INTEGER,
  target_year INTEGER NOT NULL,
  responsible_ministry VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kpi_history table
CREATE TABLE kpi_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  value DECIMAL(15, 2) NOT NULL,
  measurement_date DATE NOT NULL,
  quarter INTEGER,
  year INTEGER NOT NULL,
  source VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completion_date DATE,
  status VARCHAR(50) NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_allocations table
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  financial_year VARCHAR(20) NOT NULL,
  allocated_amount DECIMAL(15, 2) NOT NULL,
  revised_amount DECIMAL(15, 2),
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  quarter INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_ministry ON projects(ministry);
CREATE INDEX idx_projects_sector ON projects(sector);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_kpis_category ON kpis(category);
CREATE INDEX idx_kpi_history_kpi_id ON kpi_history(kpi_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_budget_ministry ON budget_allocations(ministry);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON kpis FOR SELECT USING (true);
CREATE POLICY "Public read access" ON kpi_history FOR SELECT USING (true);
CREATE POLICY "Public read access" ON milestones FOR SELECT USING (true);
CREATE POLICY "Public read access" ON budget_allocations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ministries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sectors FOR SELECT USING (true);
```

### Insert Seed Data

```sql
-- Insert sectors
INSERT INTO sectors (code, name, description, pillar) VALUES
  ('agriculture', 'Agriculture & Food Security', 'Agricultural development and food security initiatives', 'Economic Transformation'),
  ('health', 'Health & Wellness', 'Healthcare services and public health programs', 'Social Development'),
  ('education', 'Education & Skills', 'Education system and skills development', 'Human Capital Development'),
  ('energy', 'Energy & Renewables', 'Energy infrastructure and renewable energy projects', 'Infrastructure'),
  ('tourism', 'Tourism & Hospitality', 'Tourism development and promotion', 'Economic Diversification'),
  ('mining', 'Mining & Minerals', 'Mining sector development and value addition', 'Natural Resources'),
  ('ict', 'ICT & Digital Economy', 'Digital transformation and ICT infrastructure', 'Innovation & Technology'),
  ('governance', 'Governance & Transparency', 'Good governance and transparency initiatives', 'Governance');

-- Insert sample ministries
INSERT INTO ministries (code, name, description) VALUES
  ('MOA', 'Ministry of Agriculture', 'Responsible for agricultural development and food security'),
  ('MOH', 'Ministry of Health', 'Provides healthcare services and public health programs'),
  ('MOESD', 'Ministry of Education and Skills Development', 'Oversees education system and skills training'),
  ('MMGE', 'Ministry of Mineral Resources, Green Technology and Energy Security', 'Manages energy and mining sectors');
```

## Step 5: Migrate Existing Data (Optional)

If you have existing data in JSON files, you can import it using the Supabase dashboard:

1. Go to **Table Editor** in your Supabase dashboard
2. Select the table you want to import data into
3. Click **Insert** > **Import data** > **CSV**
4. Convert your JSON data to CSV format and upload

Alternatively, you can use the Supabase JavaScript client to programmatically insert data from your JSON files.

## Step 6: Update Backend Code

The backend is already configured to use Supabase. The main integration point is in `backend/config/supabase.js`.

To use Supabase in your routes, import the client:

```javascript
const supabase = require('../config/supabase');

// Example: Fetch projects
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'ongoing');
```

## Step 7: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test the Supabase connection by accessing your API endpoints:
   ```bash
   curl http://localhost:8080/api/v1/ndp12/dashboard
   ```

## Step 8: Deploy to Production

When deploying to production:

1. Set environment variables on your hosting platform (Vercel, Heroku, etc.)
2. Use the **Service Role Key** for server-side operations
3. Use the **Anon Key** for client-side operations
4. Enable **Row Level Security** policies for data protection
5. Set up **Realtime** subscriptions if you need live updates

## Security Best Practices

1. **Never commit** your `.env` file or API keys to version control
2. Use **Row Level Security (RLS)** to control data access
3. Use the **Service Role Key** only on the backend
4. Enable **SSL/TLS** for database connections in production
5. Regularly rotate your API keys
6. Monitor database usage and set up alerts

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema Reference](./supabase-schema.md)

## Support

For issues or questions about the National Delivery Dashboard:
- Email: chalebgwa.bc@gmail.com
- GitHub: [chalebgwa/global-transparency-dashboard](https://github.com/chalebgwa/global-transparency-dashboard)
