import { Router } from 'express';
import db from '../data/store.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { findBestMatch, autoAssign } from '../utils/matchingEngine.js';

const router = Router();

// POST /api/assign-task — manually assign or auto-match a volunteer to a task
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { taskId, volunteerId, autoMatch } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required.' });
    }

    const task = db.tasks.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Cannot assign volunteers to a completed task.' });
    }

    // Auto-match: use the matching engine
    if (autoMatch) {
      const result = autoAssign(taskId);
      if (result.error) return res.status(400).json({ error: result.error });
      return res.json({
        message: `Task auto-assigned to ${result.assignedTo.name}.`,
        task: result.task,
        assignedTo: result.assignedTo,
      });
    }

    // Manual assignment
    if (!volunteerId) {
      return res.status(400).json({ error: 'volunteerId is required for manual assignment.' });
    }

    const volunteer = db.users.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ error: 'Volunteer not found.' });
    }

    const updated = db.tasks.update(taskId, {
      assignedVolunteerId: volunteerId,
      status: 'assigned',
    });

    // Create notification
    db.notifications.create({
      userId: volunteerId,
      message: `You have been assigned to "${updated.title}" in ${updated.location}.`,
      read: false,
    });

    res.json({
      message: `Task assigned to ${volunteer.name}.`,
      task: updated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Assignment failed.', details: err.message });
  }
});

// GET /api/assign-task/match/:taskId — get matching candidates for a task
router.get('/match/:taskId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = findBestMatch(req.params.taskId);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Matching failed.', details: err.message });
  }
});

export default router;
