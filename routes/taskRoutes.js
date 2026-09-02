/**
 * Task/Commitment Routes
 * Handles all task-related API endpoints
 * 
 * Database: email-spam-db
 * Collection: tasks
 * 
 * Task Schema:
 * {
 *   taskId: String (unique),
 *   userId: String,
 *   action: String,
 *   object: String,
 *   deadline: Date,
 *   status: String ('pending' or 'completed'),
 *   createdAt: Date,
 *   updatedAt: Date,
 *   sourceEmail: {sender: String, subject: String}
 * }
 */

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

/**
 * ==================== TASK API ENDPOINTS ====================
 * 
 * All endpoints use email-spam-db:tasks collection
 * All responses include validation and error handling
 */

/**
 * POST /api/tasks
 * Add a new task from email extraction
 * 
 * Body: {taskId, userId, action, object, deadline, status?, sourceEmail?}
 * Returns: {success, message, task}
 */
router.post('/', async (req, res) => {
  try {
    const { taskId, userId, action, object, deadline, status, sourceEmail } = req.body;

    // Validate required fields
    if (!taskId || !userId || !action || !object || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, userId, action, object, deadline',
      });
    }

    // Check for duplicate task (same user, action, object, deadline)
    const existingTask = await Task.findOne({
      userId,
      action: action.toLowerCase(),
      object: object.toLowerCase(),
      deadline: new Date(deadline),
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate task detected - task already exists',
        existingTask
      });
    }

    // Create new task
    const task = new Task({
      taskId,
      userId,
      action: action.trim(),
      object: object.trim(),
      deadline: new Date(deadline),
      status: status || 'pending',
      sourceEmail: sourceEmail || {},
    });

    // Save to database
    await task.save();

    console.log(`✅ Task saved: ${action} ${object} (${taskId}) for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Task saved successfully',
      task,
    });

  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving task',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:userId
 * Get all tasks for a specific user
 * 
 * Params: userId
 * Returns: {success, tasks[], count}
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    const tasks = await Task.find({ userId })
      .sort({ deadline: 1 })
      .lean();

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:userId/status/:status
 * Get tasks by status for a user
 * 
 * Params: userId, status ('pending' or 'completed')
 * Returns: {success, tasks[], count, status}
 */
router.get('/:userId/status/:status', async (req, res) => {
  try {
    const { userId, status } = req.params;

    // Validate inputs
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "pending" or "completed"',
      });
    }

    const tasks = await Task.find({ userId, status })
      .sort({ deadline: 1 })
      .lean();

    res.json({
      success: true,
      count: tasks.length,
      status,
      tasks,
    });

  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:userId/overview
 * Get complete overview: pending, completed, and stats
 * 
 * Params: userId
 * Returns: {success, pending[], completed[], stats}
 */
router.get('/:userId/overview', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    const pendingTasks = await Task.find({ userId, status: 'pending' })
      .sort({ deadline: 1 })
      .lean();

    const completedTasks = await Task.find({ userId, status: 'completed' })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      pending: pendingTasks,
      completed: completedTasks,
      stats: {
        totalTasks: pendingTasks.length + completedTasks.length,
        pendingCount: pendingTasks.length,
        completedCount: completedTasks.length,
        completionRate: pendingTasks.length + completedTasks.length > 0 
          ? ((completedTasks.length / (pendingTasks.length + completedTasks.length)) * 100).toFixed(1) + '%'
          : '0%'
      },
    });

  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overview',
      error: error.message,
    });
  }
});

/**
 * PUT /api/tasks/:taskId
 * Update task status
 * 
 * Params: taskId
 * Body: {status: 'pending' or 'completed'}
 * Returns: {success, message, task}
 */
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "pending" or "completed"',
      });
    }

    // Update task
    const task = await Task.findOneAndUpdate(
      { taskId },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    console.log(`✅ Task updated: ${task.action} ${task.object} → ${status}`);

    res.json({
      success: true,
      message: 'Task updated successfully',
      task,
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a single task
 * 
 * Params: taskId
 * Returns: {success, message, task}
 */
router.delete('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOneAndDelete({ taskId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    console.log(`✅ Task deleted: ${task.action} ${task.object}`);

    res.json({
      success: true,
      message: 'Task deleted successfully',
      task,
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/tasks/:userId/clear
 * Clear all tasks for a specific user
 * WARNING: This will delete all tasks for the user
 * 
 * Params: userId
 * Returns: {success, message, deletedCount}
 */
router.delete('/:userId/clear', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    const result = await Task.deleteMany({ userId });

    console.log(`✅ Cleared ${result.deletedCount} tasks for user ${userId}`);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} tasks for user ${userId}`,
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error('Error clearing tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing tasks',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:userId/upcoming
 * Get upcoming tasks (pending tasks with deadline in next N days)
 * 
 * Query: days=7 (default)
 * Returns: {success, tasks[], count}
 */
router.get('/:userId/upcoming', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    // Validate inputs
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    const daysNum = parseInt(days) || 7;
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysNum * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      userId,
      status: 'pending',
      deadline: {
        $gte: today,
        $lte: futureDate
      }
    })
      .sort({ deadline: 1 })
      .lean();

    res.json({
      success: true,
      count: tasks.length,
      daysAhead: daysNum,
      tasks,
    });

  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming tasks',
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:userId/overdue
 * Get overdue tasks (pending tasks with deadline in past)
 * 
 * Returns: {success, tasks[], count}
 */
router.get('/:userId/overdue', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      userId,
      status: 'pending',
      deadline: { $lt: today }
    })
      .sort({ deadline: 1 })
      .lean();

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue tasks',
      error: error.message,
    });
  }
});

module.exports = router;
