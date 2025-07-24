const express = require('express');
const router = express.Router();
const countries = require('../data/countries.json');
const budgetHistory = require('../data/budgetHistory.json');
const budgetBreakdowns = require('../data/budgetBreakdowns.json');
const cpiHistory = require('../data/cpiHistory.json');
const healthHistory = require('../data/healthHistory.json');
const educationHistory = require('../data/educationHistory.json');
const worldLeaderMeetings = require('../data/worldLeaderMeetings.json');

// Helper function to validate country code
function validateCountryCode(code) {
  return countries.find(c => c.code === code.toUpperCase());
}

// Helper function to filter data by year range
function filterByYearRange(data, startYear, endYear) {
  if (!startYear && !endYear) return data;
  return data.filter(item => {
    const year = item.year;
    if (startYear && year < parseInt(startYear)) return false;
    if (endYear && year > parseInt(endYear)) return false;
    return true;
  });
}

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
 *         description: Country object with all current metrics
 *       404:
 *         description: Country not found
 */
router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json(country);
});

/**
 * @swagger
 * /api/v1/countries/{code}/budget:
 *   get:
 *     summary: Get current budget information for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Budget information with metadata
 *       404:
 *         description: Country not found
 */
router.get('/:code/budget', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  // Get the latest budget data with metadata
  const history = budgetHistory[code];
  if (!history || history.length === 0) {
    return res.status(404).json({ error: 'Budget data not found' });
  }
  
  // Return the most recent budget data
  const latestBudget = history[history.length - 1];
  res.json(latestBudget);
});

/**
 * @swagger
 * /api/v1/countries/{code}/budget/history:
 *   get:
 *     summary: Get budget history for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: start_year
 *         schema:
 *           type: integer
 *         description: Start year for filtering (inclusive)
 *       - in: query
 *         name: end_year
 *         schema:
 *           type: integer
 *         description: End year for filtering (inclusive)
 *     responses:
 *       200:
 *         description: Array of yearly budget data with metadata
 *       404:
 *         description: Country not found
 */
router.get('/:code/budget/history', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = budgetHistory[code];
  if (!history) {
    return res.status(404).json({ error: 'Budget history not found' });
  }
  
  const { start_year, end_year } = req.query;
  const filteredHistory = filterByYearRange(history, start_year, end_year);
  res.json(filteredHistory);
});

/**
 * @swagger
 * /api/v1/countries/{code}/budget/breakdown:
 *   get:
 *     summary: Get current budget breakdown by sector for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Specific year (defaults to latest available)
 *     responses:
 *       200:
 *         description: Budget breakdown by sector with metadata
 *       404:
 *         description: Country or breakdown data not found
 */
router.get('/:code/budget/breakdown', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const breakdowns = budgetBreakdowns[code];
  if (!breakdowns) {
    return res.status(404).json({ error: 'Budget breakdown data not found' });
  }
  
  const { year } = req.query;
  let breakdown;
  
  if (year) {
    breakdown = breakdowns[year];
    if (!breakdown) {
      return res.status(404).json({ error: `Budget breakdown not found for year ${year}` });
    }
  } else {
    // Get the latest year available
    const years = Object.keys(breakdowns).sort((a, b) => b - a);
    breakdown = breakdowns[years[0]];
  }
  
  res.json(breakdown);
});

/**
 * @swagger
 * /api/v1/countries/{code}/budget/breakdown/history:
 *   get:
 *     summary: Get historical budget breakdown data for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: start_year
 *         schema:
 *           type: integer
 *         description: Start year for filtering (inclusive)
 *       - in: query
 *         name: end_year
 *         schema:
 *           type: integer
 *         description: End year for filtering (inclusive)
 *     responses:
 *       200:
 *         description: Array of yearly budget breakdown data
 *       404:
 *         description: Country not found
 */
router.get('/:code/budget/breakdown/history', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const breakdowns = budgetBreakdowns[code];
  if (!breakdowns) {
    return res.status(404).json({ error: 'Budget breakdown data not found' });
  }
  
  const { start_year, end_year } = req.query;
  
  // Convert to array format and filter by year range
  let data = Object.values(breakdowns);
  data = filterByYearRange(data, start_year, end_year);
  data.sort((a, b) => a.year - b.year);
  
  res.json(data);
});

/**
 * @swagger
 * /api/v1/countries/{code}/cpi:
 *   get:
 *     summary: Get current CPI (Corruption Perception Index) for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: CPI score with metadata
 *       404:
 *         description: Country not found
 */
router.get('/:code/cpi', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = cpiHistory[code];
  if (!history || history.length === 0) {
    return res.status(404).json({ error: 'CPI data not found' });
  }
  
  // Return the most recent CPI data
  const latestCPI = history[history.length - 1];
  res.json(latestCPI);
});

/**
 * @swagger
 * /api/v1/countries/{code}/cpi/history:
 *   get:
 *     summary: Get CPI history for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: start_year
 *         schema:
 *           type: integer
 *         description: Start year for filtering (inclusive)
 *       - in: query
 *         name: end_year
 *         schema:
 *           type: integer
 *         description: End year for filtering (inclusive)
 *     responses:
 *       200:
 *         description: Array of yearly CPI data
 *       404:
 *         description: Country not found
 */
router.get('/:code/cpi/history', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = cpiHistory[code];
  if (!history) {
    return res.status(404).json({ error: 'CPI history not found' });
  }
  
  const { start_year, end_year } = req.query;
  const filteredHistory = filterByYearRange(history, start_year, end_year);
  res.json(filteredHistory);
});

/**
 * @swagger
 * /api/v1/countries/{code}/health:
 *   get:
 *     summary: Get current health expenditure for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Health expenditure per capita with metadata
 *       404:
 *         description: Country not found
 */
router.get('/:code/health', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = healthHistory[code];
  if (!history || history.length === 0) {
    return res.status(404).json({ error: 'Health data not found' });
  }
  
  // Return the most recent health data
  const latestHealth = history[history.length - 1];
  res.json(latestHealth);
});

/**
 * @swagger
 * /api/v1/countries/{code}/health/history:
 *   get:
 *     summary: Get health expenditure history for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: start_year
 *         schema:
 *           type: integer
 *         description: Start year for filtering (inclusive)
 *       - in: query
 *         name: end_year
 *         schema:
 *           type: integer
 *         description: End year for filtering (inclusive)
 *     responses:
 *       200:
 *         description: Array of yearly health expenditure data
 *       404:
 *         description: Country not found
 */
router.get('/:code/health/history', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = healthHistory[code];
  if (!history) {
    return res.status(404).json({ error: 'Health history not found' });
  }
  
  const { start_year, end_year } = req.query;
  const filteredHistory = filterByYearRange(history, start_year, end_year);
  res.json(filteredHistory);
});

/**
 * @swagger
 * /api/v1/countries/{code}/education:
 *   get:
 *     summary: Get current education expenditure for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Education expenditure per capita with metadata
 *       404:
 *         description: Country not found
 */
router.get('/:code/education', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = educationHistory[code];
  if (!history || history.length === 0) {
    return res.status(404).json({ error: 'Education data not found' });
  }
  
  // Return the most recent education data
  const latestEducation = history[history.length - 1];
  res.json(latestEducation);
});

/**
 * @swagger
 * /api/v1/countries/{code}/education/history:
 *   get:
 *     summary: Get education expenditure history for a country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: start_year
 *         schema:
 *           type: integer
 *         description: Start year for filtering (inclusive)
 *       - in: query
 *         name: end_year
 *         schema:
 *           type: integer
 *         description: End year for filtering (inclusive)
 *     responses:
 *       200:
 *         description: Array of yearly education expenditure data
 *       404:
 *         description: Country not found
 */
router.get('/:code/education/history', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const history = educationHistory[code];
  if (!history) {
    return res.status(404).json({ error: 'Education history not found' });
  }
  
  const { start_year, end_year } = req.query;
  const filteredHistory = filterByYearRange(history, start_year, end_year);
  res.json(filteredHistory);
});

/**
 * @swagger
 * /api/v1/countries/{code}/meetings:
 *   get:
 *     summary: Get meetings involving a specific country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Array of meetings involving the country
 *       404:
 *         description: Country not found
 */
router.get('/:code/meetings', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const countryMeetings = worldLeaderMeetings.meetings.filter(meeting =>
    meeting.countries.includes(code)
  );
  
  res.json(countryMeetings);
});

/**
 * @swagger
 * /api/v1/countries/{code}/relationships:
 *   get:
 *     summary: Get relationships for a specific country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *     responses:
 *       200:
 *         description: Relationships involving the country
 *       404:
 *         description: Country not found
 */
router.get('/:code/relationships', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = validateCountryCode(code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  
  const countryRelationships = {};
  Object.keys(worldLeaderMeetings.relationships).forEach(relationshipKey => {
    if (relationshipKey.includes(code)) {
      countryRelationships[relationshipKey] = worldLeaderMeetings.relationships[relationshipKey];
    }
  });
  
  res.json(countryRelationships);
});

module.exports = router;