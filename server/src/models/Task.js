import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  category: { type: String, enum: ['Work', 'Personal'], default: 'Work' },
  dueDate: { type: Date, default: null, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, title: 'text', description: 'text' });

export default mongoose.model('Task', taskSchema);
