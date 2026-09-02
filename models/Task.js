const mongoose = require('mongoose');

/**
 * Task Schema for MongoDB
 * Stores commitment tasks extracted from emails
 */

const taskSchema = new mongoose.Schema({
  // Task identification
  taskId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },

  // Task details
  action: {
    type: String,
    required: true,
    trim: true,
  },
  object: {
    type: String,
    required: true,
    trim: true,
  },

  // Deadline
  deadline: {
    type: Date,
    required: true,
  },

  // Status (workflow state)
  status: {
    type: String,
    enum: ['pending', 'reminder', 'completed', 'not_completed', 'completed_late', 'deleted'],
    default: 'pending',
  },

  // Section (UI organization)
  section: {
    type: String,
    enum: ['pending', 'reminders', 'completed', 'not_completed', 'completed_late'],
    default: 'pending',
  },

  // Completion tracking
  completedAt: {
    type: Date,
    default: null,
  },

  completedLate: {
    type: Boolean,
    default: false,
  },

  // Dependencies
  blockedBy: {
    type: [String], // Array of task IDs
    default: [],
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Scheduled for deletion
  scheduledForDeletion: {
    type: Date,
    default: null, // Set to current date + 7 days when task is completed
  },

  // Source email
  sourceEmail: {
    sender: String,
    subject: String,
  },
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, section: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ taskId: 1 });
taskSchema.index({ scheduledForDeletion: 1 }); // For cleanup queries

// Auto-update updatedAt on save
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
