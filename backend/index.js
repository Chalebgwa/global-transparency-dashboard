const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const countriesRouter = require('./routes/countries');

app.get('/api/v1/health', (req, res) => {
  res.json({status: 'ok'});
});

app.use('/api/v1/countries', countriesRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
