const request = require('supertest');
const app = require('../index');

describe('Government Contracts API', () => {
  describe('GET /api/v1/contracts', () => {
    it('should return all government contracts from all countries', async () => {
      const res = await request(app).get('/api/v1/contracts');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      // Check that each contract has the required properties
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0]).toHaveProperty('amount');
      expect(res.body[0]).toHaveProperty('country_code');
    });

    it('should filter contracts by status', async () => {
      const res = await request(app).get('/api/v1/contracts?status=ongoing');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.status).toBe('ongoing');
      });
    });

    it('should filter contracts by minimum amount', async () => {
      const minAmount = 10000000;
      const res = await request(app).get(`/api/v1/contracts?min_amount=${minAmount}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.amount).toBeGreaterThanOrEqual(minAmount);
      });
    });

    it('should filter contracts by country', async () => {
      const res = await request(app).get('/api/v1/contracts?country=BW');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.country_code).toBe('BW');
      });
    });

    it('should filter contracts by multiple parameters', async () => {
      const res = await request(app).get('/api/v1/contracts?status=ongoing&min_amount=5000000');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.status).toBe('ongoing');
        expect(contract.amount).toBeGreaterThanOrEqual(5000000);
      });
    });

    it('should sort contracts by largest amount first', async () => {
      const res = await request(app).get('/api/v1/contracts');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Check if sorted in descending order by amount
      if (res.body.length > 1) {
        for (let i = 0; i < res.body.length - 1; i++) {
          expect(res.body[i].amount >= res.body[i + 1].amount).toBe(true);
        }
      }
    });
  });

  describe('GET /api/v1/countries/:code/contracts', () => {
    it('should return contracts for a specific country', async () => {
      const res = await request(app).get('/api/v1/countries/BW/contracts');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 for non-existent country', async () => {
      const res = await request(app).get('/api/v1/countries/INVALID/contracts');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should filter country contracts by status', async () => {
      const res = await request(app).get('/api/v1/countries/BW/contracts?status=ongoing');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.status).toBe('ongoing');
      });
    });

    it('should filter country contracts by minimum amount', async () => {
      const minAmount = 5000000;
      const res = await request(app).get(`/api/v1/countries/BW/contracts?min_amount=${minAmount}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.amount).toBeGreaterThanOrEqual(minAmount);
      });
    });

    it('should filter country contracts by procurement method', async () => {
      const res = await request(app).get('/api/v1/countries/BW/contracts?procurement_method=tender');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(contract => {
        expect(contract.procurement_method.toLowerCase()).toContain('tender');
      });
    });
  });
});
