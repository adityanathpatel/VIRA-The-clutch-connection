import { Router } from 'express';
import db from '../data/store.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/volunteers — list all volunteers (admin) or own profile (volunteer)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const allUsers = db.users.findAll({ role: 'volunteer' });

    const result = allUsers.map((v) => {
      const profile = db.volunteerProfiles.findOne({ userId: v.id });
      const safeUser = { ...v };
      delete safeUser.password;
      return {
        ...safeUser,
        profile: profile ? { ...profile } : null,
      };
    });

    // If volunteer, filter to only self
    if (req.user.role === 'volunteer') {
      const self = result.find(v => v.id === req.user.id);
      return res.json({ volunteers: self ? [self] : [] });
    }

    res.json({ volunteers: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteers.', details: err.message });
  }
});

// GET /api/volunteers/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = db.users.findById(req.params.id);
    if (!user || user.role !== 'volunteer') {
      return res.status(404).json({ error: 'Volunteer not found.' });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    const profile = db.volunteerProfiles.findOne({ userId: user.id });
    const profileData = profile ? { ...profile } : null;

    // Get task history
    const allTasks = db.tasks.findAll();
    const assignedTasks = allTasks.filter(t => t.assignedVolunteerId === user.id);

    res.json({ volunteer: { ...safeUser, profile: profileData }, tasks: assignedTasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteer.', details: err.message });
  }
});

// PUT /api/volunteers/profile — update own volunteer profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { skills, location, availability, phone, name } = req.body;

    // Update user name if provided
    if (name) {
      db.users.update(req.user.id, { name });
    }

    let profile = db.volunteerProfiles.findOne({ userId: req.user.id });
    if (!profile) {
      // Create profile if doesn't exist
      const newProfile = db.volunteerProfiles.create({
        userId: req.user.id,
        skills: skills || [],
        location: location || '',
        availability: availability || 'weekends',
        phone: phone || '',
      });
      return res.json({ profile: newProfile });
    }

    // Build update object
    const updateData = {};
    if (skills)       updateData.skills = skills;
    if (location)     updateData.location = location;
    if (availability) updateData.availability = availability;
    if (phone)        updateData.phone = phone;

    const updated = db.volunteerProfiles.update(profile.id, updateData);
    res.json({ profile: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
});

// GET /api/volunteers/notifications/me — get notifications for current user
router.get('/notifications/me', authMiddleware, async (req, res) => {
  try {
    const allNotifs = db.notifications.findAll({ userId: req.user.id });

    // Sort by createdAt descending
    allNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications: allNotifs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

export default router;
