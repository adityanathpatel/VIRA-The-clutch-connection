import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import volunteerRoutes from './routes/volunteers.js';
import taskRoutes from './routes/tasks.js';
import assignmentRoutes from './routes/assignments.js';
import dataRoutes from './routes/data.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── API Routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/volunteers',  volunteerRoutes);
app.use('/api/tasks',       taskRoutes);
app.use('/api/assign-task', assignmentRoutes);
app.use('/api/data',        dataRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'VIRA API', version: '1.0.0', uptime: process.uptime() });
});

// ── 404 Handler ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server (no DB connection needed) ──
app.listen(PORT, () => {
  console.log(`\n  ✦ VIRA API Server running on http://localhost:${PORT}`);
  console.log(`  ✦ Health check: http://localhost:${PORT}/api/health`);
  console.log(`  ✦ Storage: In-memory (data resets on restart)\n`);
  console.log(`  ── Sample Credentials ──`);
  console.log(`  Admin:     admin@vira.org / admin123`);
  console.log(`  Volunteer: rahul@email.com / volunteer123\n`);
});
