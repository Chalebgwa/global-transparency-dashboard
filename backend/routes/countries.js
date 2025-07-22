const express = require('express');
const router = express.Router();
const countries = require('../data/countries.json');

/**
 * @swagger
 * /api/v1/countries:
 *   get:
 *     summary: List all countries
 *     responses:
 *       200:
 *         description: Array of country codes and names
 */
router.get('/', (req, res) => {
  const summary = countries.map(c => ({ code: c.code, name: c.name }));
  res.json(summary);
});

/**
 * @swagger
 * /api/v1/countries/{code}:
 *   get:
 *     summary: Get details for a specific country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Country object
 *       404:
 *         description: Country not found
 */
router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json(country);
});

// individual metric endpoints
/**
 * @swagger
 * /api/v1/countries/{code}/budget:
 *   get:
 *     summary: Get budget information
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Budget value
 */
router.get('/:code/budget', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.budget, currency: 'USD' });
});

/**
 * @swagger
 * /api/v1/countries/{code}/cpi:
 *   get:
 *     summary: Get CPI information
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: CPI score
 */
router.get('/:code/cpi', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.cpi });
});

/**
 * @swagger
 * /api/v1/countries/{code}/health:
 *   get:
 *     summary: Get health expenditure
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Health expenditure per capita
 */
router.get('/:code/health', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.health_exp, currency: 'USD' });
});

/**
 * @swagger
 * /api/v1/countries/{code}/education:
 *   get:
 *     summary: Get education expenditure
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Education expenditure per capita
 */
router.get('/:code/education', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.education_exp, currency: 'USD' });
});

module.exports = router;
