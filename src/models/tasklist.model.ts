import mongoose from 'mongoose';

const TaskListSchema = new mongoose.Schema({
  data: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, required: true },
    url: { type: String, required: true },
    published: { type: Boolean, default: false }
  }],
  timestamp: { type: Date, default: Date.now },
  category: { type: String, required: true }
}, {
  timestamps: true
});

export const TaskList = mongoose.models.TaskList || mongoose.model('TaskList', TaskListSchema);