const request = require('supertest');
const app = require('../index');

describe('GET /api/v1/countries', () => {
  it('should return list of countries', async () => {
    const res = await request(app).get('/api/v1/countries');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/v1/countries/:code', () => {
  it('should return a country when valid code provided', async () => {
    const res = await request(app).get('/api/v1/countries/US');
    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe('US');
  });

  it('should return 404 when country does not exist', async () => {
    const res = await request(app).get('/api/v1/countries/XX');
    expect(res.statusCode).toBe(404);
  });
});
