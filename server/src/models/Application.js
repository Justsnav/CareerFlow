import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({ name: String, title: String, email: String }, { _id: false });
const timelineSchema = new mongoose.Schema({ status: String, note: String, date: { type: Date, default: Date.now } }, { _id: true });

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  jobTitle: { type: String, required: true, trim: true, maxlength: 160 },
  location: { type: String, trim: true, default: '' },
  workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Not specified'], default: 'Not specified' },
  employmentType: { type: String, enum: ['Full-time', 'Internship', 'Contract', 'Part-time', 'Freelance', 'Not specified'], default: 'Not specified' },
  status: { type: String, enum: ['Wishlist', 'Applied', 'Online Assessment', 'Assignment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'], default: 'Applied', index: true },
  appliedDate: { type: Date, default: Date.now },
  deadline: Date,
  nextFollowup: Date,
  source: { type: String, trim: true, default: '' },
  jobUrl: { type: String, trim: true, default: '' },
  salary: { type: String, trim: true, default: '' },
  contacts: { type: [contactSchema], default: [] },
  notes: { type: String, trim: true, default: '' },
  timeline: { type: [timelineSchema], default: [] },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

applicationSchema.index({ user: 1, company: 'text', jobTitle: 'text', location: 'text' });
export default mongoose.model('Application', applicationSchema);
