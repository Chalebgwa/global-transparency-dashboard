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

module.exports = router;
