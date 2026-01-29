const request = require('supertest');
const app = require('../index.js');

describe('World Leader Meetings API', () => {
  test('GET /api/v1/meetings should return not implemented', async () => {
    const response = await request(app)
      .get('/api/v1/meetings')
      .expect(501);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/v1/relationships should return not implemented', async () => {
    const response = await request(app)
      .get('/api/v1/relationships')
      .expect(501);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/v1/countries/:code/meetings should return not implemented', async () => {
    const response = await request(app)
      .get('/api/v1/countries/BW/meetings')
      .expect(501);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/v1/countries/:code/relationships should return not implemented', async () => {
    const response = await request(app)
      .get('/api/v1/countries/BW/relationships')
      .expect(501);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/v1/countries/:code/meetings should return 404 for invalid country', async () => {
    await request(app)
      .get('/api/v1/countries/INVALID/meetings')
      .expect(404);
  });
});
