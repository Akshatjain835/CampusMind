import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'DepartmentAI Express Gateway',
    timestamp: new Date().toISOString()
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Centralized Express Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Process Level Exception Safety Net
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Promise Rejection]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

let PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (portToUse) => {
  const server = app.listen(portToUse, '0.0.0.0', () => {
    console.log(`[DepartmentAI Express Gateway] Running on port ${portToUse}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Conflict] Port ${portToUse} is in use. Trying port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('[Server Error]', err);
    }
  });
};

startServer(PORT);
