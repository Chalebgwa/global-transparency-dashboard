const request = require('supertest');
const app = require('../index');

describe('NDP 12 Projects API', () => {
  describe('GET /api/v1/ndp12/projects', () => {
    it('should return all NDP 12 projects', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('sector');
      expect(res.body[0]).toHaveProperty('status');
    });

    it('should filter projects by status', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?status=ongoing');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(project => {
        expect(project.status).toBe('ongoing');
      });
    });

    it('should filter projects by priority', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?priority=high');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(project => {
        expect(project.priority).toBe('high');
      });
    });

    it('should filter projects by sector', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?sector=education');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(project => {
        expect(project.sector.toLowerCase()).toContain('education');
      });
    });
  });

  describe('GET /api/v1/ndp12/projects/:id', () => {
    it('should return a specific project by ID', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects/ndp12-agr-001');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('ndp12-agr-001');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('budget_allocated');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects/invalid-id');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('NDP 12 KPIs API', () => {
  describe('GET /api/v1/ndp12/kpis', () => {
    it('should return all KPIs', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('kpi_code');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('target_value');
      expect(res.body[0]).toHaveProperty('current_value');
    });

    it('should filter KPIs by category', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis?category=economic');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(kpi => {
        expect(kpi.category).toBe('economic');
      });
    });
  });

  describe('GET /api/v1/ndp12/kpis/:code', () => {
    it('should return a specific KPI by code', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis/GDP_GROWTH');
      expect(res.statusCode).toBe(200);
      expect(res.body.kpi_code).toBe('GDP_GROWTH');
      expect(res.body).toHaveProperty('target_value');
    });

    it('should return 404 for non-existent KPI', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis/INVALID_CODE');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('NDP 12 Dashboard API', () => {
  describe('GET /api/v1/ndp12/dashboard', () => {
    it('should return dashboard summary statistics', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('total_projects');
      expect(res.body).toHaveProperty('ongoing_projects');
      expect(res.body).toHaveProperty('completed_projects');
      expect(res.body).toHaveProperty('total_budget_allocated');
      expect(res.body).toHaveProperty('total_budget_spent');
      expect(res.body).toHaveProperty('total_kpis');
      expect(res.body).toHaveProperty('kpis_by_category');
      expect(typeof res.body.total_projects).toBe('number');
      expect(typeof res.body.total_budget_allocated).toBe('number');
    });

    it('should calculate budget statistics correctly', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.total_budget_allocated).toBeGreaterThan(0);
      expect(res.body.total_budget_spent).toBeGreaterThan(0);
      expect(res.body.total_budget_spent).toBeLessThanOrEqual(res.body.total_budget_allocated);
    });

    it('should categorize KPIs correctly', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.kpis_by_category).toHaveProperty('economic');
      expect(res.body.kpis_by_category).toHaveProperty('social');
      expect(res.body.kpis_by_category).toHaveProperty('environmental');
      expect(res.body.kpis_by_category).toHaveProperty('governance');
    });
  });
});
