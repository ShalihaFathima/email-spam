const mongoose = require('mongoose');

/**
 * Task Schema - Stores user commitments/tasks
 */
const TaskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
  },
  object: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for user-specific queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Task', TaskSchema);
