import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './src/config/config.js';

import authRoutes from './src/routes/authRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import hrRoutes from './src/routes/hrRoutes.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success:     true,
    status:      'ok',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/hr', hrRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
==================================================
 Server running successfully
 Environment : ${process.env.NODE_ENV}
 Port        : ${PORT}
==================================================
      `);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();