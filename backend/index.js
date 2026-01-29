const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

const countriesRouter = require('./routes/countries');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const notImplemented = (message) => (req, res) => {
  res.status(501).json({ error: 'Not implemented', message });
};

// Middleware
app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /api/v1/ndp12/projects:
 *   get:
 *     summary: Get all NDP 12 projects
 *     tags: [NDP12]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, ongoing, completed, delayed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: ministry
 *         schema:
 *           type: string
 *         description: Filter by ministry
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by sector
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Array of NDP 12 projects
 */
app.get('/api/v1/ndp12/projects', notImplemented('NDP 12 project data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/ndp12/projects/{id}:
 *   get:
 *     summary: Get a specific NDP 12 project by ID
 *     tags: [NDP12]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
app.get('/api/v1/ndp12/projects/:id', notImplemented('NDP 12 project data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/ndp12/kpis:
 *   get:
 *     summary: Get all NDP 12 Key Performance Indicators
 *     tags: [NDP12]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [economic, social, environmental, governance]
 *         description: Filter by KPI category
 *     responses:
 *       200:
 *         description: Array of KPIs
 */
app.get('/api/v1/ndp12/kpis', notImplemented('NDP 12 KPI data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/ndp12/kpis/{code}:
 *   get:
 *     summary: Get a specific KPI by code
 *     tags: [NDP12]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: KPI code
 *     responses:
 *       200:
 *         description: KPI details
 *       404:
 *         description: KPI not found
 */
app.get('/api/v1/ndp12/kpis/:code', notImplemented('NDP 12 KPI data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/ndp12/dashboard:
 *   get:
 *     summary: Get dashboard summary statistics for NDP 12
 *     tags: [NDP12]
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
app.get('/api/v1/ndp12/dashboard', notImplemented('NDP 12 dashboard data is not available via public APIs yet.'));

app.use('/api/v1/countries', countriesRouter);

/**
 * @swagger
 * /api/v1/meetings:
 *   get:
 *     summary: Get all world leader meetings
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by meeting topic
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bilateral, multilateral]
 *         description: Filter by meeting type
 *     responses:
 *       200:
 *         description: Array of world leader meetings
 */
app.get('/api/v1/meetings', notImplemented('World leader meetings data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/relationships:
 *   get:
 *     summary: Get country relationship network data
 *     responses:
 *       200:
 *         description: Country relationships based on leader meetings
 */
app.get('/api/v1/relationships', notImplemented('Relationship network data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/corruption:
 *   get:
 *     summary: Get all corruption cases across countries
 *     parameters:
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
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country code
 *     responses:
 *       200:
 *         description: Array of corruption cases from all countries
 */
app.get('/api/v1/corruption', notImplemented('Corruption case data is not available via public APIs yet.'));

/**
 * @swagger
 * /api/v1/contracts:
 *   get:
 *     summary: Get all government contracts across countries
 *     parameters:
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
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country code
 *     responses:
 *       200:
 *         description: Array of government contracts from all countries
 */
app.get('/api/v1/contracts', notImplemented('Government contract data is not available via public APIs yet.'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
