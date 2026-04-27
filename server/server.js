import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import volunteerRoutes from './routes/volunteers.js';
import taskRoutes from './routes/tasks.js';
import assignmentRoutes from './routes/assignments.js';
import dataRoutes from './routes/data.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ── 404 for unmatched API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ── Serve Frontend (production) ──
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// ── Client-side routing fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ✦ VIRA API Server running on port ${PORT}`);
  console.log(`  ✦ Health check: /api/health`);
  console.log(`  ✦ Storage: In-memory (data resets on restart)\n`);
  console.log(`  ── Sample Credentials ──`);
  console.log(`  Admin:     admin@vira.org / admin123`);
  console.log(`  Volunteer: rahul@email.com / volunteer123\n`);
});
