import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { sequelize } from './models/index.js';
import setupSwagger from './config/swagger.js';
import authRoutes from './routes/v1/auth/auth.js';
import userTypesRouter from './routes/v1/userTypes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Swagger UI Documentation
setupSwagger(app);

// Standard Security & Utility Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to specific frontend domains if necessary
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RokKru Backend API Server!',
    status: 'Running',
    timestamp: new Date()
  });
});

// Health check and database connectivity verification route
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'UP',
      database: 'Connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: error.message
    });
  }
});
// API Routes
app.use('/api/v1/user-types', userTypesRouter);

// Auth
app.use('/api/auth', authRoutes);

// Connect to Database and start server
async function startServer() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('Synchronizing database models (creating tables)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection issue:', error);
    process.exit(1);
  }
}

startServer();

