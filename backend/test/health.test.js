const request = require('supertest');
const app = require('../index');

describe('Health Check API', () => {
  describe('GET /api/v1/health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });

    it('should respond quickly', async () => {
      const startTime = Date.now();
      await request(app).get('/api/v1/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Health check should respond in less than 1 second
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
