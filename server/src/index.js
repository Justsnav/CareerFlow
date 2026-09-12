import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' })); app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok' })); app.use('/api/auth', authRoutes); app.use('/api/applications', applicationRoutes);
app.use((error, _, res, __) => { console.error(error); if (error.name === 'ValidationError') return res.status(400).json({ message: error.message }); res.status(500).json({ message: 'Something went wrong. Please try again.' }); });
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`))).catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
