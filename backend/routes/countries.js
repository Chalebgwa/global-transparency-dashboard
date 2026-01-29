const express = require('express');
const router = express.Router();

const BOTSWANA_CODE = 'BW';
const BOTSWANA_ALPHA3 = 'BWA';
const RESTCOUNTRIES_URL = `https://restcountries.com/v3.1/alpha/${BOTSWANA_CODE}?fields=name,cca2,cca3,capital,region,subregion,population,currencies,flags`;
const WORLD_BANK_BASE_URL = `https://api.worldbank.org/v2/country/${BOTSWANA_CODE}/indicator`;
const WORLD_BANK_QUERY = 'format=json&per_page=60';

const INDICATORS = {
  budget: 'GC.XPN.TOTL.CD',
  health: 'SH.XPD.CHEX.PC.CD',
  education: 'SE.XPD.TOTL.PC.CD',
  corruption: 'CC.EST'
};

const WGI_MIN_VALUE = -2.5;
const WGI_RANGE = 5;
const NORMALIZED_MAX = 100;
const NORMALIZED_MIN = 0;

const normalizeCode = (code) => (typeof code === 'string' ? code.toUpperCase() : '');
const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch (error) {
    return 'unknown url';
  }
};
const isBotswanaCode = (code) => [BOTSWANA_CODE, BOTSWANA_ALPHA3].includes(normalizeCode(code));

const filterByYearRange = (data, startYear, endYear) => {
  if (!startYear && !endYear) return data;
  const start = startYear ? parseInt(startYear, 10) : null;
  const end = endYear ? parseInt(endYear, 10) : null;
  return data.filter(item => {
    if (!item.year) return false;
    const year = item.year;
    if (Number.isFinite(start) && year < start) return false;
    if (Number.isFinite(end) && year > end) return false;
    return true;
  });
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  const safeUrl = sanitizeUrl(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${safeUrl} with status ${response.status}`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Invalid JSON response from ${safeUrl}`);
  }
};

const fetchCountryProfile = async () => {
  const data = await fetchJson(RESTCOUNTRIES_URL);
  return Array.isArray(data) ? data[0] : data;
};

const parseWorldBankSeries = (payload) => {
  const series = Array.isArray(payload) ? payload[1] : [];
  if (!Array.isArray(series)) return [];

  return series
    .filter(entry => entry && entry.value !== null && entry.value !== undefined)
    .map(entry => ({
      year: Number(entry.date),
      value: entry.value,
      source: entry.indicator?.value || 'World Bank',
      indicator: entry.indicator?.id || ''
    }))
    .filter(entry => !Number.isNaN(entry.year))
    .sort((a, b) => a.year - b.year);
};

const fetchWorldBankSeries = async (indicator) => {
  const url = `${WORLD_BANK_BASE_URL}/${indicator}?${WORLD_BANK_QUERY}`;
  const payload = await fetchJson(url);
  return parseWorldBankSeries(payload);
};

const getLatestEntry = (series) => (series && series.length ? series[series.length - 1] : null);

/**
 * Normalize WGI Control of Corruption scores (-2.5 to +2.5) onto a 0-100 scale.
 */
const normalizeCorruptionScore = (value) => {
  if (!Number.isFinite(value)) return null;
  const score = ((value - WGI_MIN_VALUE) / WGI_RANGE) * NORMALIZED_MAX;
  return Math.max(NORMALIZED_MIN, Math.min(NORMALIZED_MAX, Math.round(score)));
};

const calculateBudgetSectors = (total, healthValue, educationValue, population) => {
  const safePopulation = Number.isFinite(population) ? population : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeHealthValue = Number.isFinite(healthValue) ? healthValue : 0;
  const safeEducationValue = Number.isFinite(educationValue) ? educationValue : 0;
  const healthTotal = safeHealthValue * safePopulation;
  const educationTotal = safeEducationValue * safePopulation;

  return {
    total: safeTotal,
    population: safePopulation,
    sectors: {
      health: healthTotal,
      education: educationTotal,
      other: Math.max(safeTotal - healthTotal - educationTotal, 0)
    }
  };
};

const buildIndicatorResponse = (entry, overrides = {}) => {
  if (!entry) return null;
  return {
    value: entry.value,
    year: entry.year,
    source: entry.source,
    indicator: entry.indicator,
    timestamp: new Date().toISOString(),
    ...overrides
  };
};

const buildCorruptionIndicator = (entry) => {
  if (!entry) return null;
  const value = normalizeCorruptionScore(entry.value);
  if (value === null) return null;
  return {
    value,
    raw_value: entry.value,
    year: entry.year,
    source: entry.source,
    indicator: entry.indicator,
    scale: '0-100 (normalized from WGI Control of Corruption estimate)',
    timestamp: new Date().toISOString()
  };
};

const buildBudgetBreakdown = (budgetEntry, healthEntry, educationEntry, population) => {
  if (!budgetEntry) return null;
  const total = budgetEntry.value || 0;
  const sectorData = calculateBudgetSectors(total, healthEntry?.value, educationEntry?.value, population);

  return {
    year: budgetEntry.year,
    currency: 'USD',
    ...sectorData,
    source: 'World Bank indicators and RestCountries population',
    notes: 'Sector totals are derived from per-capita indicators where available.'
  };
};

const buildBudgetBreakdownHistory = (budgetSeries, healthSeries, educationSeries, population) => {
  const healthMap = new Map(healthSeries.map(entry => [entry.year, entry.value]));
  const educationMap = new Map(educationSeries.map(entry => [entry.year, entry.value]));

  return budgetSeries.map(entry => {
    const healthValue = healthMap.get(entry.year);
    const educationValue = educationMap.get(entry.year);
    const total = entry.value || 0;
    const sectorData = calculateBudgetSectors(total, healthValue, educationValue, population);
    return {
      year: entry.year,
      currency: 'USD',
      ...sectorData,
      source: 'World Bank indicators and RestCountries population'
    };
  });
};

const buildCorruptionSeries = (series) => series
  .map(entry => ({
    year: entry.year,
    value: normalizeCorruptionScore(entry.value),
    raw_value: entry.value,
    source: entry.source,
    scale: '0-100 (normalized from WGI Control of Corruption estimate)',
    indicator: entry.indicator
  }))
  .filter(entry => entry.value !== null);

const buildPerCapitaSeries = (series) => series.map(entry => ({
  year: entry.year,
  value: entry.value,
  source: entry.source,
  currency: 'USD',
  unit: 'per_capita',
  indicator: entry.indicator
}));

const buildBudgetSeries = (series) => series.map(entry => ({
  year: entry.year,
  value: entry.value,
  source: entry.source,
  currency: 'USD',
  unit: 'total',
  indicator: entry.indicator
}));

const notImplementedResponse = {
  error: 'Not implemented',
  message: 'Public data sources are not yet available for this endpoint.'
};

/**
 * @swagger
 * /api/v1/countries:
 *   get:
 *     summary: List all countries
 *     responses:
 *       200:
 *         description: Array of country codes and names
 */
router.get('/', async (req, res) => {
  try {
    const profile = await fetchCountryProfile();
    res.json([{ code: BOTSWANA_CODE, name: profile?.name?.common || 'Botswana' }]);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load Botswana profile from public sources.' });
  }
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
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found', message: 'Only Botswana (BW) is supported.' });
  }

  try {
    const [profile, budgetSeries, healthSeries, educationSeries, corruptionSeries] = await Promise.all([
      fetchCountryProfile(),
      fetchWorldBankSeries(INDICATORS.budget),
      fetchWorldBankSeries(INDICATORS.health),
      fetchWorldBankSeries(INDICATORS.education),
      fetchWorldBankSeries(INDICATORS.corruption)
    ]);

    const latestBudget = getLatestEntry(budgetSeries);
    const latestHealth = getLatestEntry(healthSeries);
    const latestEducation = getLatestEntry(educationSeries);
    const latestCorruption = getLatestEntry(corruptionSeries);

    const currencyEntries = profile?.currencies ? Object.entries(profile.currencies) : [];
    const [currencyCode, currencyInfo] = currencyEntries[0] || [];

    res.json({
      code: BOTSWANA_CODE,
      name: profile?.name?.common || 'Botswana',
      capital: profile?.capital?.[0] || 'Gaborone',
      region: profile?.region || 'Africa',
      subregion: profile?.subregion || 'Southern Africa',
      population: profile?.population,
      flag: profile?.flags?.svg,
      local_currency: currencyCode ? {
        code: currencyCode,
        name: currencyInfo?.name,
        symbol: currencyInfo?.symbol
      } : null,
      indicators: {
        budget: buildIndicatorResponse(latestBudget, { currency: 'USD', unit: 'total' }),
        health: buildIndicatorResponse(latestHealth, { currency: 'USD', unit: 'per_capita' }),
        education: buildIndicatorResponse(latestEducation, { currency: 'USD', unit: 'per_capita' }),
        corruption: buildCorruptionIndicator(latestCorruption)
      }
    });
  } catch (error) {
    res.status(502).json({ error: 'Unable to load Botswana metrics from public sources.' });
  }
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
router.get('/:code/budget', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = await fetchWorldBankSeries(INDICATORS.budget);
    const latestBudget = getLatestEntry(series);
    const response = buildIndicatorResponse(latestBudget, { currency: 'USD', unit: 'total' });

    if (!response) {
      return res.status(404).json({ error: 'Budget data not found' });
    }

    res.json(response);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load budget data from public sources.' });
  }
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
router.get('/:code/budget/history', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = buildBudgetSeries(await fetchWorldBankSeries(INDICATORS.budget));
    const { start_year, end_year } = req.query;
    const filteredHistory = filterByYearRange(series, start_year, end_year);

    if (!filteredHistory.length) {
      return res.status(404).json({ error: 'Budget history not found' });
    }

    res.json(filteredHistory);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load budget history from public sources.' });
  }
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
router.get('/:code/budget/breakdown', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const [profile, budgetSeries, healthSeries, educationSeries] = await Promise.all([
      fetchCountryProfile(),
      fetchWorldBankSeries(INDICATORS.budget),
      fetchWorldBankSeries(INDICATORS.health),
      fetchWorldBankSeries(INDICATORS.education)
    ]);

    const history = buildBudgetBreakdownHistory(budgetSeries, healthSeries, educationSeries, profile?.population);
    const { year } = req.query;

    if (!history.length) {
      return res.status(404).json({ error: 'Budget breakdown data not found' });
    }

    if (year) {
      const selected = history.find(entry => entry.year === parseInt(year, 10));
      if (!selected) {
        return res.status(404).json({ error: `Budget breakdown not found for year ${year}` });
      }
      return res.json(selected);
    }

    const latestBudget = getLatestEntry(budgetSeries);
    const latestHealth = getLatestEntry(healthSeries);
    const latestEducation = getLatestEntry(educationSeries);
    const breakdown = buildBudgetBreakdown(latestBudget, latestHealth, latestEducation, profile?.population);

    if (!breakdown) {
      return res.status(404).json({ error: 'Budget breakdown data not found' });
    }

    res.json(breakdown);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load budget breakdown from public sources.' });
  }
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
router.get('/:code/budget/breakdown/history', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const [profile, budgetSeries, healthSeries, educationSeries] = await Promise.all([
      fetchCountryProfile(),
      fetchWorldBankSeries(INDICATORS.budget),
      fetchWorldBankSeries(INDICATORS.health),
      fetchWorldBankSeries(INDICATORS.education)
    ]);

    const history = buildBudgetBreakdownHistory(budgetSeries, healthSeries, educationSeries, profile?.population);
    const { start_year, end_year } = req.query;
    const filtered = filterByYearRange(history, start_year, end_year);

    if (!filtered.length) {
      return res.status(404).json({ error: 'Budget breakdown history not found' });
    }

    res.json(filtered);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load budget breakdown history from public sources.' });
  }
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
router.get('/:code/cpi', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = await fetchWorldBankSeries(INDICATORS.corruption);
    const latest = getLatestEntry(series);
    const response = buildCorruptionIndicator(latest);

    if (!response) {
      return res.status(404).json({ error: 'Governance data not found' });
    }

    res.json(response);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load governance data from public sources.' });
  }
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
router.get('/:code/cpi/history', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = buildCorruptionSeries(await fetchWorldBankSeries(INDICATORS.corruption));
    const { start_year, end_year } = req.query;
    const filteredHistory = filterByYearRange(series, start_year, end_year);

    if (!filteredHistory.length) {
      return res.status(404).json({ error: 'Governance history not found' });
    }

    res.json(filteredHistory);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load governance history from public sources.' });
  }
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
router.get('/:code/health', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = await fetchWorldBankSeries(INDICATORS.health);
    const latestHealth = getLatestEntry(series);
    const response = buildIndicatorResponse(latestHealth, { currency: 'USD', unit: 'per_capita' });

    if (!response) {
      return res.status(404).json({ error: 'Health data not found' });
    }

    res.json(response);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load health data from public sources.' });
  }
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
router.get('/:code/health/history', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = buildPerCapitaSeries(await fetchWorldBankSeries(INDICATORS.health));
    const { start_year, end_year } = req.query;
    const filteredHistory = filterByYearRange(series, start_year, end_year);

    if (!filteredHistory.length) {
      return res.status(404).json({ error: 'Health history not found' });
    }

    res.json(filteredHistory);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load health history from public sources.' });
  }
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
router.get('/:code/education', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = await fetchWorldBankSeries(INDICATORS.education);
    const latestEducation = getLatestEntry(series);
    const response = buildIndicatorResponse(latestEducation, { currency: 'USD', unit: 'per_capita' });

    if (!response) {
      return res.status(404).json({ error: 'Education data not found' });
    }

    res.json(response);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load education data from public sources.' });
  }
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
router.get('/:code/education/history', async (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  try {
    const series = buildPerCapitaSeries(await fetchWorldBankSeries(INDICATORS.education));
    const { start_year, end_year } = req.query;
    const filteredHistory = filterByYearRange(series, start_year, end_year);

    if (!filteredHistory.length) {
      return res.status(404).json({ error: 'Education history not found' });
    }

    res.json(filteredHistory);
  } catch (error) {
    res.status(502).json({ error: 'Unable to load education history from public sources.' });
  }
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
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  res.status(501).json(notImplementedResponse);
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
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  res.status(501).json(notImplementedResponse);
});

/**
 * @swagger
 * /api/v1/countries/{code}/corruption:
 *   get:
 *     summary: Get corruption cases for a specific country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, resolved, closed]
 *         description: Filter by case status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity level
 *     responses:
 *       200:
 *         description: Array of corruption cases
 *       404:
 *         description: Country not found
 */
router.get('/:code/corruption', (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  res.status(501).json(notImplementedResponse);
});

/**
 * @swagger
 * /api/v1/countries/{code}/contracts:
 *   get:
 *     summary: Get government contracts for a specific country
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO country code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, completed, cancelled]
 *         description: Filter by contract status
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         description: Minimum contract amount
 *       - in: query
 *         name: procurement_method
 *         schema:
 *           type: string
 *         description: Filter by procurement method
 *     responses:
 *       200:
 *         description: Array of government contracts
 *       404:
 *         description: Country not found
 */
router.get('/:code/contracts', (req, res) => {
  const code = req.params.code;
  if (!isBotswanaCode(code)) {
    return res.status(404).json({ error: 'Country not found' });
  }

  res.status(501).json(notImplementedResponse);
});

module.exports = router;
