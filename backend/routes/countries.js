const express = require('express');
const router = express.Router();
const countries = require('../data/countries.json');

router.get('/', (req, res) => {
  const summary = countries.map(c => ({ code: c.code, name: c.name }));
  res.json(summary);
});

router.get('/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json(country);
});

// individual metric endpoints
router.get('/:code/budget', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.budget, currency: 'USD' });
});

router.get('/:code/cpi', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.cpi });
});

router.get('/:code/health', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.health_exp, currency: 'USD' });
});

router.get('/:code/education', (req, res) => {
  const code = req.params.code.toUpperCase();
  const country = countries.find(c => c.code === code);
  if (!country) {
    return res.status(404).json({ error: 'Country not found' });
  }
  res.json({ year: 2024, value: country.education_exp, currency: 'USD' });
});

module.exports = router;
