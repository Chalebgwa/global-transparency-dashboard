const request = require('supertest');
const app = require('../index');

describe('NDP 12 Projects API', () => {
  describe('GET /api/v1/ndp12/projects', () => {
    it('should return not implemented status', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects');
      expect(res.statusCode).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/ndp12/projects/:id', () => {
    it('should return not implemented status', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects/ndp12-agr-001');
      expect(res.statusCode).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('NDP 12 KPIs API', () => {
  describe('GET /api/v1/ndp12/kpis', () => {
    it('should return not implemented status', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis');
      expect(res.statusCode).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/ndp12/kpis/:code', () => {
    it('should return not implemented status', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis/GDP_GROWTH');
      expect(res.statusCode).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });
});

describe('NDP 12 Dashboard API', () => {
  describe('GET /api/v1/ndp12/dashboard', () => {
    it('should return not implemented status', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(501);
      expect(res.body).toHaveProperty('error');
    });
  });
});
