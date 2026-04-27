import { Router } from 'express';
import db from '../data/store.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// POST /api/data/upload — upload a new data report
router.post('/upload', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { type, title, content, location } = req.body;

    if (!type || !content || !location) {
      return res.status(400).json({ error: 'Type, content, and location are required.' });
    }

    const report = db.dataReports.create({
      type,
      title: title || `${type} — ${location}`,
      content,
      location,
      submittedBy: req.user.id,
    });

    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed.', details: err.message });
  }
});

// GET /api/data/reports — list all data reports
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const { type, location } = req.query;

    let reports = db.dataReports.findAll();

    // Apply filters
    if (type)     reports = reports.filter(r => r.type === type);
    if (location) reports = reports.filter(r => r.location && r.location.toLowerCase().includes(location.toLowerCase()));

    // Sort by createdAt descending
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich with submitter name
    const enriched = reports.map((r) => {
      const user = db.users.findById(r.submittedBy);
      return {
        ...r,
        submittedByName: user?.name || 'Unknown',
      };
    });

    res.json({ reports: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports.', details: err.message });
  }
});

// GET /api/data/analytics — aggregated analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const allTasks = db.tasks.findAll();
    const allVolunteers = db.users.findAll({ role: 'volunteer' });
    const allReports = db.dataReports.findAll();
    const profiles = db.volunteerProfiles.findAll();

    // Tasks by category
    const tasksByCategory = {};
    allTasks.forEach(t => {
      tasksByCategory[t.category] = (tasksByCategory[t.category] || 0) + 1;
    });

    // Tasks by urgency
    const tasksByUrgency = { high: 0, medium: 0, low: 0 };
    allTasks.forEach(t => {
      tasksByUrgency[t.urgency] = (tasksByUrgency[t.urgency] || 0) + 1;
    });

    // Tasks by status
    const tasksByStatus = { pending: 0, assigned: 0, completed: 0 };
    allTasks.forEach(t => {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    });

    // Tasks by location
    const tasksByLocation = {};
    allTasks.forEach(t => {
      tasksByLocation[t.location] = (tasksByLocation[t.location] || 0) + 1;
    });

    // Volunteers by location
    const volunteersByLocation = {};
    profiles.forEach(p => {
      volunteersByLocation[p.location] = (volunteersByLocation[p.location] || 0) + 1;
    });

    // Skills distribution
    const skillsDistribution = {};
    profiles.forEach(p => {
      p.skills.forEach(s => {
        skillsDistribution[s] = (skillsDistribution[s] || 0) + 1;
      });
    });

    res.json({
      summary: {
        totalTasks: allTasks.length,
        totalVolunteers: allVolunteers.length,
        totalReports: allReports.length,
        pendingTasks: tasksByStatus.pending,
        assignedTasks: tasksByStatus.assigned,
        completedTasks: tasksByStatus.completed,
        highUrgencyTasks: tasksByUrgency.high,
      },
      tasksByCategory,
      tasksByUrgency,
      tasksByStatus,
      tasksByLocation,
      volunteersByLocation,
      skillsDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.', details: err.message });
  }
});

export default router;
