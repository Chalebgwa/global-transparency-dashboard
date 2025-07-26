const request = require('supertest');
const app = require('../index.js');

describe('World Leader Meetings API', () => {
  test('GET /api/v1/meetings should return all meetings', async () => {
    const response = await request(app)
      .get('/api/v1/meetings')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    const meeting = response.body[0];
    expect(meeting).toHaveProperty('id');
    expect(meeting).toHaveProperty('date');
    expect(meeting).toHaveProperty('countries');
    expect(meeting).toHaveProperty('type');
    expect(meeting).toHaveProperty('topic');
    expect(meeting).toHaveProperty('leaders');
  });

  test('GET /api/v1/meetings should filter by topic', async () => {
    const response = await request(app)
      .get('/api/v1/meetings?topic=trade')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(meeting => {
      expect(meeting.topic.toLowerCase()).toContain('trade');
    });
  });

  test('GET /api/v1/meetings should filter by type', async () => {
    const response = await request(app)
      .get('/api/v1/meetings?type=bilateral')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(meeting => {
      expect(meeting.type).toBe('bilateral');
    });
  });

  test('GET /api/v1/relationships should return relationship data', async () => {
    const response = await request(app)
      .get('/api/v1/relationships')
      .expect(200);
    
    expect(typeof response.body).toBe('object');
    
    const relationshipKeys = Object.keys(response.body);
    expect(relationshipKeys.length).toBeGreaterThan(0);
    
    const relationship = response.body[relationshipKeys[0]];
    expect(relationship).toHaveProperty('meeting_count');
    expect(relationship).toHaveProperty('relationship_strength');
    expect(relationship).toHaveProperty('common_topics');
  });

  test('GET /api/v1/countries/:code/meetings should return country meetings', async () => {
    const response = await request(app)
      .get('/api/v1/countries/BW/meetings')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(meeting => {
      expect(meeting.countries).toContain('BW');
    });
  });

  test('GET /api/v1/countries/:code/relationships should return country relationships', async () => {
    const response = await request(app)
      .get('/api/v1/countries/BW/relationships')
      .expect(200);
    
    expect(typeof response.body).toBe('object');
    
    const relationshipKeys = Object.keys(response.body);
    relationshipKeys.forEach(key => {
      expect(key).toContain('BW');
    });
  });

  test('GET /api/v1/countries/:code/meetings should return 404 for invalid country', async () => {
    await request(app)
      .get('/api/v1/countries/INVALID/meetings')
      .expect(404);
  });
});