const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

const countriesRouter = require('./routes/countries');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

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
app.get('/api/v1/meetings', (req, res) => {
  const worldLeaderMeetings = require('./data/worldLeaderMeetings.json');
  let meetings = worldLeaderMeetings.meetings;
  
  const { start_date, end_date, topic, type } = req.query;
  
  // Filter by date range
  if (start_date || end_date) {
    meetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      if (start_date && meetingDate < new Date(start_date)) return false;
      if (end_date && meetingDate > new Date(end_date)) return false;
      return true;
    });
  }
  
  // Filter by topic
  if (topic) {
    meetings = meetings.filter(meeting => 
      meeting.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }
  
  // Filter by type
  if (type) {
    meetings = meetings.filter(meeting => meeting.type === type);
  }
  
  res.json(meetings);
});

/**
 * @swagger
 * /api/v1/relationships:
 *   get:
 *     summary: Get country relationship network data
 *     responses:
 *       200:
 *         description: Country relationships based on leader meetings
 */
app.get('/api/v1/relationships', (req, res) => {
  const worldLeaderMeetings = require('./data/worldLeaderMeetings.json');
  res.json(worldLeaderMeetings.relationships);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
