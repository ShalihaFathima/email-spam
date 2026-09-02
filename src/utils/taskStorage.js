/**
 * Task Storage System using JavaScript Map + LocalStorage
 * 
 * Stores tasks per user with duplicate prevention and persistent storage
 */

// Initialize task store
const taskStore = new Map();
const STORAGE_KEY = 'email_commitments_tasks';

/**
 * Initialize storage from localStorage on module load
 */
function initializeFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tasksData = JSON.parse(stored);
      for (const userId in tasksData) {
        const userTasks = tasksData[userId].map(task => ({
          ...task,
          deadline: new Date(task.deadline), // Restore Date objects
          createdAt: new Date(task.createdAt),
        }));
        taskStore.set(userId, userTasks);
      }
      console.log('✅ Tasks loaded from localStorage:', { users: Object.keys(tasksData).length, tasks: Object.values(tasksData).flat().length });
    }
  } catch (err) {
    console.error('Error initializing from localStorage:', err);
  }
}

/**
 * Save current store state to localStorage
 */
function saveToLocalStorage() {
  try {
    const tasksData = {};
    for (const [userId, tasks] of taskStore.entries()) {
      tasksData[userId] = tasks;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Initialize on module load
initializeFromLocalStorage();

/**
 * Adds a task for a user
 * 
 * @param {string|number} userId - User identifier
 * @param {object} task - Task object with {action, object, deadline, status}
 * @returns {object} Result object with {success, message, taskId}
 * 
 * Example:
 * addTask(1, {action: 'send', object: 'report', deadline: new Date()})
 */
function addTask(userId, task) {
  try {
    // Validate inputs
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    if (!task || typeof task !== 'object') {
      return { success: false, message: 'Task must be an object' };
    }

    // Validate required task fields
    if (!task.action || !task.object || !task.deadline) {
      return { success: false, message: 'Task must have action, object, and deadline' };
    }

    // Initialize user's task array if not exists
    if (!taskStore.has(userId)) {
      taskStore.set(userId, []);
    }

    // Get user's tasks
    const userTasks = taskStore.get(userId);

    // Check for duplicates (same object + deadline)
    const isDuplicate = userTasks.some(
      (existingTask) =>
        existingTask.object === task.object &&
        existingTask.deadline.getTime() === task.deadline.getTime()
    );

    if (isDuplicate) {
      return { 
        success: false, 
        message: `Duplicate task detected: "${task.object}" with same deadline` 
      };
    }

    // Create task with default status
    const newTask = {
      id: generateTaskId(),
      action: task.action,
      object: task.object,
      deadline: task.deadline,
      status: task.status || 'pending',
      createdAt: new Date(),
    };

    // Add task to user's array
    userTasks.push(newTask);

    // Save to localStorage
    saveToLocalStorage();

    return {
      success: true,
      message: 'Task added successfully',
      taskId: newTask.id,
      task: newTask,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error adding task: ${err.message}`,
    };
  }
}

/**
 * Gets all tasks for a user
 * 
 * @param {string|number} userId - User identifier
 * @returns {array} Array of tasks or empty array if user not found
 * 
 * Example:
 * getTasks(1) // Returns all tasks for user 1
 */
function getTasks(userId) {
  try {
    // Validate input
    if (!userId) {
      return [];
    }

    // Return user's tasks or empty array
    if (taskStore.has(userId)) {
      return taskStore.get(userId);
    }

    return [];
  } catch (err) {
    console.error(`Error getting tasks: ${err.message}`);
    return [];
  }
}

/**
 * Gets tasks for a user filtered by status
 * 
 * @param {string|number} userId - User identifier
 * @param {string} status - Filter by status (e.g., "pending", "completed")
 * @returns {array} Array of tasks matching status
 */
function getTasksByStatus(userId, status) {
  try {
    if (!userId || !status) {
      return [];
    }

    const userTasks = getTasks(userId);
    return userTasks.filter((task) => task.status === status);
  } catch (err) {
    console.error(`Error filtering tasks: ${err.message}`);
    return [];
  }
}

/**
 * Updates task status
 * 
 * @param {string|number} userId - User identifier
 * @param {string} taskId - Task ID
 * @param {string} newStatus - New status
 * @returns {object} Result object
 */
function updateTaskStatus(userId, taskId, newStatus) {
  try {
    if (!userId || !taskId || !newStatus) {
      return { success: false, message: 'User ID, task ID, and status are required' };
    }

    const userTasks = getTasks(userId);
    const task = userTasks.find((t) => t.id === taskId);

    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    task.status = newStatus;
    
    // Save to localStorage
    saveToLocalStorage();
    
    return { 
      success: true, 
      message: `Task status updated to "${newStatus}"`,
      task: task,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error updating task: ${err.message}`,
    };
  }
}

/**
 * Removes a task for a user
 * 
 * @param {string|number} userId - User identifier
 * @param {string} taskId - Task ID to remove
 * @returns {object} Result object
 */
function removeTask(userId, taskId) {
  try {
    if (!userId || !taskId) {
      return { success: false, message: 'User ID and task ID are required' };
    }

    const userTasks = getTasks(userId);
    const taskIndex = userTasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return { success: false, message: 'Task not found' };
    }

    const removedTask = userTasks.splice(taskIndex, 1)[0];
    
    // Save to localStorage
    saveToLocalStorage();
    
    return { 
      success: true, 
      message: 'Task removed successfully',
      task: removedTask,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error removing task: ${err.message}`,
    };
  }
}

/**
 * Clears all tasks for a user
 * 
 * @param {string|number} userId - User identifier
 * @returns {object} Result object
 */
function clearUserTasks(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    if (taskStore.has(userId)) {
      const count = taskStore.get(userId).length;
      taskStore.delete(userId);
      
      // Save to localStorage
      saveToLocalStorage();
      
      return { 
        success: true, 
        message: `Cleared ${count} tasks for user ${userId}` 
      };
    }

    return { 
      success: true, 
      message: 'User has no tasks to clear' 
    };
  } catch (err) {
    return {
      success: false,
      message: `Error clearing tasks: ${err.message}`,
    };
  }
}

/**
 * Gets store statistics
 * 
 * @returns {object} Statistics about the task store
 */
function getStoreStats() {
  try {
    let totalUsers = 0;
    let totalTasks = 0;
    const userStats = {};

    for (const [userId, tasks] of taskStore.entries()) {
      totalUsers++;
      const count = tasks.length;
      totalTasks += count;
      userStats[userId] = count;
    }

    return {
      totalUsers,
      totalTasks,
      userStats,
    };
  } catch (err) {
    console.error(`Error getting stats: ${err.message}`);
    return {};
  }
}

/**
 * Generates unique task ID
 */
function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export functions
export {
  taskStore,
  addTask,
  getTasks,
  getTasksByStatus,
  updateTaskStatus,
  removeTask,
  clearUserTasks,
  getStoreStats,
  initializeFromLocalStorage,
  saveToLocalStorage,
};
