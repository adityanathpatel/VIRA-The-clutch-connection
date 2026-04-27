import { Router } from 'express';
import db from '../data/store.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/tasks — list tasks with optional filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, urgency, category, location } = req.query;

    let allTasks = db.tasks.findAll();

    // Apply filters
    if (status)   allTasks = allTasks.filter(t => t.status === status);
    if (urgency)  allTasks = allTasks.filter(t => t.urgency === urgency);
    if (category) allTasks = allTasks.filter(t => t.category === category);
    if (location) allTasks = allTasks.filter(t => t.location && t.location.toLowerCase().includes(location.toLowerCase()));

    // Sort: high urgency first, then by date
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    allTasks.sort((a, b) => {
      const uDiff = (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
      if (uDiff !== 0) return uDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Enrich with volunteer name if assigned
    const enriched = allTasks.map((task) => {
      let assignedVolunteer = null;
      if (task.assignedVolunteerId) {
        const vol = db.users.findById(task.assignedVolunteerId);
        if (vol) assignedVolunteer = { id: vol.id, name: vol.name, email: vol.email };
      }
      return {
        ...task,
        assignedVolunteer,
      };
    });

    res.json({ tasks: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.', details: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = db.tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    let assignedVolunteer = null;
    if (task.assignedVolunteerId) {
      const vol = db.users.findById(task.assignedVolunteerId);
      const profile = db.volunteerProfiles.findOne({ userId: task.assignedVolunteerId });
      if (vol) {
        assignedVolunteer = {
          id: vol.id,
          name: vol.name,
          email: vol.email,
          profile: profile ? { ...profile } : null,
        };
      }
    }

    const creator = db.users.findById(task.createdBy);

    res.json({
      task: {
        ...task,
        assignedVolunteer,
        createdByName: creator?.name || 'Unknown',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.', details: err.message });
  }
});

// POST /api/tasks — create a new task (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, description, category, location, urgency, requiredSkills } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Title, description, category, and location are required.' });
    }

    const task = db.tasks.create({
      title,
      description,
      category,
      location,
      urgency: urgency || 'medium',
      status: 'pending',
      requiredSkills: requiredSkills || [],
      assignedVolunteerId: null,
      createdBy: req.user.id,
    });

    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.', details: err.message });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = db.tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    // Volunteers can only update status of their assigned tasks
    if (req.user.role === 'volunteer') {
      if (task.assignedVolunteerId !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your assigned tasks.' });
      }
      const { status } = req.body;
      if (status && ['assigned', 'completed'].includes(status)) {
        const updated = db.tasks.update(req.params.id, { status });
        return res.json({ task: updated });
      }
      return res.status(400).json({ error: 'Volunteers can only update task status.' });
    }

    // Admin can update everything
    const updated = db.tasks.update(req.params.id, req.body);
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.', details: err.message });
  }
});

// DELETE /api/tasks/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const deleted = db.tasks.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.', task: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.', details: err.message });
  }
});

export default router;
