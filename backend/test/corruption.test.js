const request = require('supertest');
const app = require('../index');

describe('Corruption Cases API', () => {
  describe('GET /api/v1/corruption', () => {
    it('should return all corruption cases from all countries', async () => {
      const res = await request(app).get('/api/v1/corruption');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      // Check that each case has the required properties
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0]).toHaveProperty('severity');
      expect(res.body[0]).toHaveProperty('country_code');
    });

    it('should filter corruption cases by status', async () => {
      const res = await request(app).get('/api/v1/corruption?status=ongoing');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.status).toBe('ongoing');
      });
    });

    it('should filter corruption cases by severity', async () => {
      const res = await request(app).get('/api/v1/corruption?severity=high');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.severity).toBe('high');
      });
    });

    it('should filter corruption cases by country', async () => {
      const res = await request(app).get('/api/v1/corruption?country=BW');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.country_code).toBe('BW');
      });
    });

    it('should filter corruption cases by multiple parameters', async () => {
      const res = await request(app).get('/api/v1/corruption?status=ongoing&severity=high');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.status).toBe('ongoing');
        expect(caseItem.severity).toBe('high');
      });
    });

    it('should sort cases by most recent date first', async () => {
      const res = await request(app).get('/api/v1/corruption');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Check if sorted in descending order by date
      if (res.body.length > 1) {
        for (let i = 0; i < res.body.length - 1; i++) {
          const currentDate = new Date(res.body[i].date_reported);
          const nextDate = new Date(res.body[i + 1].date_reported);
          expect(currentDate >= nextDate).toBe(true);
        }
      }
    });
  });

  describe('GET /api/v1/countries/:code/corruption', () => {
    it('should return corruption cases for a specific country', async () => {
      const res = await request(app).get('/api/v1/countries/BW/corruption');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 for non-existent country', async () => {
      const res = await request(app).get('/api/v1/countries/INVALID/corruption');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should filter country corruption cases by status', async () => {
      const res = await request(app).get('/api/v1/countries/BW/corruption?status=ongoing');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.status).toBe('ongoing');
      });
    });

    it('should filter country corruption cases by severity', async () => {
      const res = await request(app).get('/api/v1/countries/BW/corruption?severity=high');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(caseItem => {
        expect(caseItem.severity).toBe('high');
      });
    });
  });
});
