import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();
const tokenFor = user => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const profile = user => ({ id: user._id, name: user.name, email: user.email });

router.post('/register', async (req, res, next) => { try {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Enter your name, a valid email, and a password of at least 8 characters.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account already exists for this email.' });
  const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: tokenFor(user), user: profile(user) });
} catch (error) { next(error); } });

router.post('/login', async (req, res, next) => { try {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: tokenFor(user), user: profile(user) });
} catch (error) { next(error); } });
router.get('/me', auth, async (req, res, next) => { try { const user = await User.findById(req.userId); res.json(profile(user)); } catch (error) { next(error); } });
export default router;
