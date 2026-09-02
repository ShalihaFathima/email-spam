/**
 * Task Storage API - Uses backend MongoDB database
 * Replaces localStorage with persistent database storage
 */

// Detect if running in Node.js or Browser
const isNodeJS = typeof window === 'undefined';
const API_BASE_URL = isNodeJS ? 'http://localhost:3001/api' : '/api';

/**
 * Add a task via API
 */
async function addTaskAPI(userId, task) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId.toString(),
        action: task.action,
        object: task.object,
        deadline: new Date(task.deadline).toISOString(),
        status: task.status || 'pending',
        sourceEmail: task.sourceEmail || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('⚠️  Task add warning:', error.message);
      return {
        success: false,
        message: error.message,
      };
    }

    const result = await response.json();
    console.log('✅ Task saved to database:', { action: task.action, object: task.object });
    return {
      success: result.success,
      message: result.message,
      taskId: result.task?._id || result.task?.taskId,
      task: result.task,
    };
  } catch (err) {
    console.error('❌ Error adding task:', err);
    return {
      success: false,
      message: err.message,
    };
  }
}

/**
 * Get all tasks for user via API
 */
async function getTasksAPI(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    const tasks = (data.tasks || []).map(task => ({
      ...task,
      deadline: new Date(task.deadline),
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    }));

    return tasks;
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
    return [];
  }
}

/**
 * Get overview (pending, completed, stats) via API
 */
async function getOverviewAPI(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${userId}/overview`);

    if (!response.ok) {
      throw new Error('Failed to fetch overview');
    }

    const data = await response.json();

    const pending = (data.pending || []).map(task => ({
      ...task,
      deadline: new Date(task.deadline),
      createdAt: new Date(task.createdAt),
    }));

    const completed = (data.completed || []).map(task => ({
      ...task,
      deadline: new Date(task.deadline),
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    }));

    console.log(`✅ Loaded overview from DB: Pending: ${pending.length}, Completed: ${completed.length}`);

    // Get reminders (tasks due soon - next 3 days)
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const reminders = pending.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= threeDaysLater;
    });

    return {
      pending,
      completed,
      reminders,
      stats: data.stats || {},
    };
  } catch (err) {
    console.error('❌ Error fetching overview:', err);
    return {
      pending: [],
      completed: [],
      reminders: [],
      stats: {},
    };
  }
}

/**
 * Update task status via API
 */
async function updateTaskStatusAPI(taskId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const result = await response.json();
    console.log('✅ Task status updated:', { status });
    return result.task;
  } catch (err) {
    console.error('❌ Error updating task:', err);
    throw err;
  }
}

/**
 * Delete task via API
 */
async function deleteTaskAPI(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    console.log('✅ Task deleted');
    return true;
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    throw err;
  }
}

/**
 * Clear all tasks for user via API
 */
async function clearUserTasksAPI(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${userId}/clear`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear tasks');
    }

    const result = await response.json();
    console.log('✅ All user tasks cleared');
    return result;
  } catch (err) {
    console.error('❌ Error clearing tasks:', err);
    throw err;
  }
}

// Export functions
module.exports = {
  addTaskAPI,
  getTasksAPI,
  getOverviewAPI,
  updateTaskStatusAPI,
  deleteTaskAPI,
  clearUserTasksAPI,
};
