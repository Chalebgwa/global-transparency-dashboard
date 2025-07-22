const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Global Transparency Dashboard API',
      version: '0.1.0'
    }
  },
  apis: ['./routes/*.js', './index.js']
};

module.exports = swaggerJSDoc(options);
