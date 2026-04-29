import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import authRoutes from './routes/auth';
import configRoutes from './routes/configs';
import importRoutes from './routes/import';
import i18nRoutes from './routes/i18n';
import notificationRoutes from './routes/notifications';
import { dynamicRouter } from './routes/dynamic';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://forgaflow-ez8k.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Auth routes
app.use('/auth', authRoutes);

// Config routes
app.use('/configs', configRoutes);

// Import routes
app.use('/import', importRoutes);

// i18n routes
app.use('/i18n', i18nRoutes);

// Notification routes
app.use('/notifications', notificationRoutes);

// Dynamic routes (mounted dynamically)
app.use('/api', dynamicRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Sync database and start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
