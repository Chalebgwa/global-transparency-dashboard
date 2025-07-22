const request = require('supertest');
const app = require('../index');

describe('GET /docs', () => {
  it('should return swagger ui html', async () => {
    const res = await request(app).get('/docs/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Swagger UI');
  });
});
