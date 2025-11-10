const request = require('supertest');
const app = require('../index');

describe('Edge Cases and Error Handling', () => {
  describe('Invalid Query Parameters', () => {
    it('should handle invalid year format in budget history gracefully', async () => {
      const res = await request(app).get('/api/v1/countries/BW/budget/history?start_year=invalid&end_year=abc');
      expect(res.statusCode).toBe(200);
      // Should return empty array or all data when year format is invalid
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle negative minimum amount in contracts', async () => {
      const res = await request(app).get('/api/v1/contracts?min_amount=-1000');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle invalid date format in meetings filter', async () => {
      const res = await request(app).get('/api/v1/meetings?start_date=not-a-date&end_date=also-not-a-date');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Empty Results', () => {
    it('should return empty array when filtering results in no matches', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?status=nonexistent');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return empty array when no corruption cases match filters', async () => {
      const res = await request(app).get('/api/v1/countries/BW/corruption?status=nonexistent');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return empty array when no contracts match filters', async () => {
      const res = await request(app).get('/api/v1/countries/BW/contracts?status=nonexistent');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('Case Sensitivity', () => {
    it('should handle lowercase country codes', async () => {
      const res = await request(app).get('/api/v1/countries/bw');
      expect(res.statusCode).toBe(200);
      expect(res.body.code).toBe('BW');
    });

    it('should handle lowercase KPI codes', async () => {
      const res = await request(app).get('/api/v1/ndp12/kpis/gdp_growth');
      expect(res.statusCode).toBe(200);
      expect(res.body.kpi_code).toBe('GDP_GROWTH');
    });

    it('should handle mixed case in topic filtering', async () => {
      const res = await request(app).get('/api/v1/meetings?topic=TrAdE');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle year range with start_year > end_year', async () => {
      const res = await request(app).get('/api/v1/countries/BW/budget/history?start_year=2025&end_year=2020');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle future years in budget history', async () => {
      const res = await request(app).get('/api/v1/countries/BW/budget/history?start_year=2050');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should handle very large minimum amount for contracts', async () => {
      const res = await request(app).get('/api/v1/contracts?min_amount=999999999999');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Multiple Filters Combination', () => {
    it('should handle multiple filters on projects endpoint', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?status=ongoing&priority=high&sector=health');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(project => {
        expect(project.status).toBe('ongoing');
        expect(project.priority).toBe('high');
      });
    });

    it('should handle multiple filters on corruption endpoint', async () => {
      const res = await request(app).get('/api/v1/corruption?status=ongoing&severity=high&country=BW');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle multiple filters on contracts endpoint', async () => {
      const res = await request(app).get('/api/v1/contracts?status=ongoing&min_amount=1000000&country=BW');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Special Characters in Filters', () => {
    it('should handle special characters in ministry filter', async () => {
      const res = await request(app).get('/api/v1/ndp12/projects?ministry=Health%20%26%20Wellness');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should handle special characters in topic filter', async () => {
      const res = await request(app).get('/api/v1/meetings?topic=Trade%20%26%20Investment');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should ensure dashboard summary adds up correctly', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      
      const { total_projects, ongoing_projects, completed_projects, delayed_projects } = res.body;
      
      // Total projects should be at least the sum of categorized projects
      expect(total_projects).toBeGreaterThanOrEqual(ongoing_projects + completed_projects + delayed_projects);
    });

    it('should ensure budget spent does not exceed budget allocated', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      
      expect(res.body.total_budget_spent).toBeLessThanOrEqual(res.body.total_budget_allocated);
    });

    it('should ensure all KPIs have valid category counts', async () => {
      const res = await request(app).get('/api/v1/ndp12/dashboard');
      expect(res.statusCode).toBe(200);
      
      const { total_kpis, kpis_by_category } = res.body;
      const categorySum = Object.values(kpis_by_category).reduce((sum, count) => sum + count, 0);
      
      expect(categorySum).toBe(total_kpis);
    });
  });
});
