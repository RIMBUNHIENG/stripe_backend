const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RokKru Backend API Documentation',
      version: '1.0.0',
      description: 'API Documentation for RokKru - v5 DEMO Final with JWT Sessions',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        UserType: {
          type: 'object',
          properties: {
            user_type_id: {
              type: 'integer',
              description: 'The unique identifier for the user type'
            },
            user_type_name: {
              type: 'string',
              description: 'The name of the user type/role (e.g. Student, Mentor, Admin)'
            },
            create_date: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user type was created'
            },
            update_date: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user type was last updated'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/**/*.js', './app.js', './routes/v1/**/*.js'], // Paths to files with swagger comments
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📑 Swagger Documentation available at http://localhost:${port}/api-docs`);
}

module.exports = setupSwagger;
