import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../data/store.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization, skills, location, availability, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = db.users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const validRole = role === 'admin' ? 'admin' : 'volunteer';
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = db.users.create({
      name,
      email,
      password: hashedPassword,
      role: validRole,
      organization: validRole === 'admin' ? (organization || null) : null,
    });

    // If volunteer, create profile
    if (validRole === 'volunteer') {
      db.volunteerProfiles.create({
        userId: user.id,
        skills: skills || [],
        location: location || '',
        availability: availability || 'weekends',
        phone: phone || '',
      });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const safeUser = { ...user };
    delete safeUser.password;

    // Attach profile for volunteers
    if (user.role === 'volunteer') {
      const profile = db.volunteerProfiles.findOne({ userId: user.id });
      safeUser.profile = profile ? { ...profile } : null;
    }

    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.', details: err.message });
  }
});

export default router;
