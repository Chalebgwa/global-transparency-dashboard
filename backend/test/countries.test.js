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
    const res = await request(app).get('/api/v1/countries/BW');
    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe('BW');
  });

  it('should return 404 when country does not exist', async () => {
    const res = await request(app).get('/api/v1/countries/XX');
    expect(res.statusCode).toBe(404);
  });
});

describe('Budget endpoints', () => {
  it('should return budget info with metadata', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget');
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toBeGreaterThan(0);
    expect(res.body.currency).toBe('BWD');
    expect(res.body.source).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.year).toBeDefined();
  });

  it('should return budget history', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter budget history by year range', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget/history?start_year=2022&end_year=2023');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(item => item.year >= 2022 && item.year <= 2023)).toBe(true);
  });

  it('should return budget breakdown', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget/breakdown');
    expect(res.statusCode).toBe(200);
    expect(res.body.sectors).toBeDefined();
    expect(res.body.sectors.health).toBeGreaterThan(0);
    expect(res.body.sectors.education).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('should return budget breakdown for specific year', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget/breakdown?year=2023');
    expect(res.statusCode).toBe(200);
    expect(res.body.year).toBe(2023);
    expect(res.body.sectors).toBeDefined();
  });

  it('should return budget breakdown history', async () => {
    const res = await request(app).get('/api/v1/countries/BW/budget/breakdown/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return 404 for unknown country', async () => {
    const res = await request(app).get('/api/v1/countries/XX/budget');
    expect(res.statusCode).toBe(404);
  });
});

describe('CPI endpoints', () => {
  it('should return cpi info with metadata', async () => {
    const res = await request(app).get('/api/v1/countries/BW/cpi');
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toBeGreaterThan(0);
    expect(res.body.source).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.year).toBeDefined();
  });

  it('should return cpi history', async () => {
    const res = await request(app).get('/api/v1/countries/BW/cpi/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter cpi history by year range', async () => {
    const res = await request(app).get('/api/v1/countries/BW/cpi/history?start_year=2022&end_year=2023');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(item => item.year >= 2022 && item.year <= 2023)).toBe(true);
  });
});

describe('Health endpoints', () => {
  it('should return health expenditure with metadata', async () => {
    const res = await request(app).get('/api/v1/countries/BW/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toBeGreaterThan(0);
    expect(res.body.currency).toBe('BWD');
    expect(res.body.source).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.year).toBeDefined();
  });

  it('should return health history', async () => {
    const res = await request(app).get('/api/v1/countries/BW/health/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('Education endpoints', () => {
  it('should return education expenditure with metadata', async () => {
    const res = await request(app).get('/api/v1/countries/BW/education');
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toBeGreaterThan(0);
    expect(res.body.currency).toBe('BWD');
    expect(res.body.source).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.year).toBeDefined();
  });

  it('should return education history', async () => {
    const res = await request(app).get('/api/v1/countries/BW/education/history');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
