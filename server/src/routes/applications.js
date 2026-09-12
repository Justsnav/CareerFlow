import { Router } from 'express';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import { auth } from '../middleware/auth.js';

const router = Router(); router.use(auth);
const clean = body => { const allowed = ['company','jobTitle','location','workMode','employmentType','status','appliedDate','deadline','nextFollowup','source','jobUrl','salary','contacts','notes','archived']; const out = {}; allowed.forEach(key => { if (body[key] !== undefined) out[key] = body[key] || (['deadline','nextFollowup'].includes(key) ? null : body[key]); }); return out; };

router.get('/', async (req, res, next) => { try {
  const { status, search, archived = 'false' } = req.query; const filter = { user: req.userId, archived: archived === 'true' };
  if (status && status !== 'All') filter.status = status;
  if (search) filter.$text = { $search: search };
  const applications = await Application.find(filter).sort({ appliedDate: -1, createdAt: -1 }); res.json(applications);
} catch (error) { next(error); } });

router.get('/summary', async (req, res, next) => { try {
  const base = { user: req.userId, archived: false }; const today = new Date(); today.setHours(0,0,0,0); const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate()+7);
  const [total, offers, active, deadlines] = await Promise.all([
    Application.countDocuments(base), Application.countDocuments({ ...base, status: 'Offer' }),
    Application.countDocuments({ ...base, status: { $nin: ['Offer','Rejected','Withdrawn'] } }), Application.countDocuments({ ...base, deadline: { $gte: today, $lte: nextWeek } })
  ]); res.json({ total, offers, active, deadlines });
} catch (error) { next(error); } });

router.post('/', async (req, res, next) => { try { const item = clean(req.body); if (!item.company?.trim() || !item.jobTitle?.trim()) return res.status(400).json({ message: 'Company and job title are required.' }); item.user = req.userId; item.timeline = [{ status: item.status || 'Applied', note: 'Application created' }]; res.status(201).json(await Application.create(item)); } catch (error) { next(error); } });
router.put('/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid application ID.' }); const existing = await Application.findOne({ _id: req.params.id, user: req.userId }); if (!existing) return res.status(404).json({ message: 'Application not found.' }); const updates = clean(req.body); if (updates.status && updates.status !== existing.status) existing.timeline.push({ status: updates.status, note: req.body.statusNote || 'Status updated' }); Object.assign(existing, updates); res.json(await existing.save()); } catch (error) { next(error); } });
router.delete('/:id', async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid application ID.' }); const result = await Application.deleteOne({ _id: req.params.id, user: req.userId }); if (!result.deletedCount) return res.status(404).json({ message: 'Application not found.' }); res.status(204).end(); } catch (error) { next(error); } });
export default router;
