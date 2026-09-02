/**
 * COMMITMENT TRACKER SERVICE WITH ADVANCED DATA STRUCTURES
 * 
 * Main orchestration layer for commitment tracking system
 * Uses advanced DS for fast queries:
 * - Priority Queue: O(1) get most urgent task
 * - AVL Tree: O(log n + k) date range queries
 * - Dependency Graph: O(n+m) blocker/critical path analysis
 * - HashMap: O(1) direct task access
 * 
 * Handles:
 * 1. Email processing (detect, extract, convert)
 * 2. Task storage (MongoDB via API)
 * 3. Status generation (pending, completed, reminders)
 * 4. Smart queries using advanced DS
 * 5. Task management (update, delete, dependencies)
 */

const detectCommitments = require('../../src/utils/commitmentDetector');
const extractTask = require('../../src/utils/taskExtractor');
const convertToDeadline = require('../../src/utils/deadlineConverter');
const detectCompletion = require('../../src/utils/completionDetector');
const checkReminders = require('../../src/utils/reminderChecker');
const { addTaskAPI, getOverviewAPI, updateTaskStatusAPI, deleteTaskAPI } = require('../../src/utils/taskStorageAPI');
const TaskDataStructureManager = require('./TaskDataStructureManager');

/**
 * Store per-user DS managers in memory
 * In production, could use Redis or session store
 */
const userDataStructures = new Map();

/**
 * Get or create DS manager for user
 */
function getUserDataStructureManager(userId) {
  if (!userDataStructures.has(userId)) {
    userDataStructures.set(userId, new TaskDataStructureManager());
  }
  return userDataStructures.get(userId);
}

/**
 * Clear user's DS (when logging out, etc.)
 */
function clearUserDataStructures(userId) {
  userDataStructures.delete(userId);
}

/**
 * ============================================
 * MAIN: Process Email for Commitments
 * ============================================
 * 
 * Complete workflow:
 * 1. Detect commitment phrases in email
 * 2. Extract task details (action, object, deadline)
 * 3. Store in MongoDB
 * 4. Check for completion status
 * 5. Return organized task data
 */
async function processEmailForCommitments(email, userId) {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('📧 COMMITMENT TRACKER: Processing Email');
    console.log('='.repeat(60));
    console.log(`From: ${email.sender || 'Unknown'}`);
    console.log(`Subject: ${email.subject || 'No subject'}`);
    console.log('');

    // ========== STEP 1: DETECT COMMITMENTS ==========
    console.log('📝 STEP 1: Detecting commitment phrases...');
    const commitments = detectCommitments(email.body);
    console.log(`✅ Found ${commitments.length} commitment(s):\n`);
    commitments.forEach((c, i) => {
      console.log(`   ${i + 1}. "${c.substring(0, 70)}${c.length > 70 ? '...' : ''}"`);
    });

    // ========== STEP 2: EXTRACT TASKS ==========
    console.log('\n🔍 STEP 2: Extracting task details...');
    const extractedTasks = [];
    commitments.forEach((commitment, idx) => {
      const extracted = extractTask(commitment);
      if (extracted) {
        extractedTasks.push(extracted);
        console.log(`   Task ${idx + 1}: ${extracted.action} → ${extracted.object}`);
        console.log(`              When: ${extracted.timeText}`);
      }
    });

    // ========== STEP 3: CONVERT DEADLINES ==========
    console.log('\n⏰ STEP 3: Converting deadlines...');
    const tasksWithDeadlines = extractedTasks.map((task, idx) => {
      const deadline = convertToDeadline(task.timeText);
      console.log(`   Task ${idx + 1}: "${task.timeText}" → ${deadline.toDateString()}`);
      return {
        userId,
        action: task.action,
        object: task.object,
        description: `${task.action} ${task.object}`,
        deadline,
        timeText: task.timeText,
        source: 'email',
        sender: email.sender || 'unknown',
        status: 'pending',
        createdAt: new Date(),
        type: 'commitment'
      };
    });

    // ========== STEP 4: STORE IN DATABASE ==========
    console.log('\n💾 STEP 4: Storing tasks in database...');
    const savedTasks = [];
    for (const task of tasksWithDeadlines) {
      try {
        const saved = await addTaskAPI(userId, task);
        savedTasks.push(saved);
        console.log(`   ✅ Saved: ${task.action} - ${task.object}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to save task: ${error.message}`);
      }
    }

    // ========== STEP 5: GENERATE OVERVIEW ==========
    console.log('\n📊 STEP 5: Generating task overview...');
    const overview = await generateTaskStatus(userId);

    // ========== STEP 6: LOAD INTO ADVANCED DATA STRUCTURES ==========
    console.log('\n⚡ STEP 6: Loading into advanced data structures...');
    const dsManager = getUserDataStructureManager(userId);
    
    // Add all saved tasks to DS
    for (const task of savedTasks) {
      dsManager.addTask(task);
    }
    
    console.log(`   ✅ Loaded ${savedTasks.length} tasks into DS`);
    
    // Create dependencies between related tasks if auto-detected
    // (You can enhance this with NLP to detect relationships)
    console.log(`   📊 DS Summary:`);
    console.log(`      Total tasks in DS: ${dsManager.getSummary().totalTasks}`);
    console.log(`      Most urgent: ${dsManager.getMostUrgent()?.action || 'None'}`);
    console.log(`      Next ready: ${dsManager.getNextReadyTask()?.action || 'None'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ PROCESSING COMPLETE');
    console.log('='.repeat(60));
    console.log(`📌 Total new tasks: ${savedTasks.length}`);
    console.log(`⏳ Pending tasks: ${overview.pending.length}`);
    console.log(`✓ Completed tasks: ${overview.completed.length}`);
    console.log(`⚡ Reminders needed: ${overview.reminders.length}`);
    console.log('');

    return {
      success: true,
      newTasks: savedTasks,
      overview,
      insights: dsManager.getInsights(),
      email: {
        sender: email.sender,
        subject: email.subject,
        body: email.body
      }
    };

  } catch (error) {
    console.error('❌ Error processing email:', error.message);
    return {
      success: false,
      error: error.message,
      newTasks: [],
      overview: { pending: [], completed: [], reminders: [], stats: {} },
      insights: null
    };
  }
}

/**
 * ============================================
 * Get Task Status Overview for User
 * ============================================
 * 
 * Returns: {
 *   pending: [tasks],
 *   completed: [tasks],
 *   reminders: [tasks],
 *   stats: { totalTasks, pendingCount, etc }
 * }
 */
async function generateTaskStatus(userId) {
  try {
    console.log(`📋 Fetching tasks for user ${userId}...`);
    const overview = await getOverviewAPI(userId);
    return overview || {
      pending: [],
      completed: [],
      reminders: [],
      stats: { totalTasks: 0, pendingCount: 0, completedCount: 0, reminderCount: 0 }
    };
  } catch (error) {
    console.error('Error generating task status:', error);
    return {
      pending: [],
      completed: [],
      reminders: [],
      stats: { totalTasks: 0, pendingCount: 0, completedCount: 0, reminderCount: 0 },
      error: error.message
    };
  }
}

/**
 * ============================================
 * Mark Task as Completed
 * ============================================
 */
async function markTaskCompleted(taskId, userId) {
  try {
    console.log(`✓ Marking task ${taskId} as completed...`);
    const updated = await updateTaskStatusAPI(taskId, 'completed', userId);
    console.log(`✅ Task marked as completed`);
    return { success: true, task: updated };
  } catch (error) {
    console.error('Error marking task complete:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * Delete Task
 * ============================================
 */
async function deleteTask(taskId, userId) {
  try {
    console.log(`🗑️  Deleting task ${taskId}...`);
    const result = await deleteTaskAPI(taskId, userId);
    console.log(`✅ Task deleted`);
    return { success: true, result };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================
 * Find Matching/Related Tasks
 * ============================================
 * Finds tasks related to a specific commitment
 */
async function findMatchingTasks(query, userId) {
  try {
    const overview = await generateTaskStatus(userId);
    const allTasks = [...overview.pending, ...overview.completed];
    
    const matching = allTasks.filter(task => {
      const description = `${task.action || ''} ${task.object || ''}`.toLowerCase();
      return description.includes(query.toLowerCase());
    });

    return {
      success: true,
      results: matching,
      count: matching.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: [],
      count: 0
    };
  }
}

/**
 * ============================================
 * Get User Task Overview
 * ============================================
 * Quick helper to get just the overview
 */
async function getUserTaskOverview(userId) {
  return generateTaskStatus(userId);
}

/**
 * ============================================
 * ADVANCED DATA STRUCTURE METHODS
 * ============================================
 */

/**
 * Get most urgent task (earliest deadline)
 * Time: O(1)
 */
function getMostUrgentTask(userId) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getMostUrgent();
}

/**
 * Get next ready task (urgency + no blockers)
 * Time: O(k log n)
 */
function getNextReadyTask(userId) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getNextReadyTask();
}

/**
 * Get all tasks for this week
 * Time: O(log n + k)
 */
function getTasksForWeek(userId, referenceDate = new Date()) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getTasksForWeek(referenceDate);
}

/**
 * Get critical path (longest dependency chain)
 * Time: O(n+m)
 */
function getCriticalPath(userId) {
  const dsManager = getUserDataStructureManager(userId);
  const path = dsManager.findCriticalPath();
  return {
    path,
    length: path.length,
    bottleneck: path.length > 0 ? path[Math.floor(path.length / 2)] : null
  };
}

/**
 * Get tasks blocking a specific task
 * Time: O(k)
 */
function getTaskBlockers(userId, taskId) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getTaskBlockers(taskId);
}

/**
 * Get smart recommendations
 */
function getSmartRecommendations(userId) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getSmartRecommendations();
}

/**
 * Get comprehensive insights
 */
function getTaskInsights(userId) {
  const dsManager = getUserDataStructureManager(userId);
  return dsManager.getInsights();
}

/**
 * Add dependency between two tasks
 */
function addTaskDependency(userId, taskAId, taskBId) {
  const dsManager = getUserDataStructureManager(userId);
  const success = dsManager.addDependency(taskAId, taskBId);
  
  if (success) {
    console.log(`✅ Added dependency: ${taskAId} → ${taskBId}`);
  } else {
    console.log(`⚠️  Could not add dependency (circular or missing task)`);
  }
  
  return { success };
}

/**
 * ============================================
 * EXPORTS
 * ============================================
 */
module.exports = {
  processEmailForCommitments,
  generateTaskStatus,
  markTaskCompleted,
  deleteTask,
  findMatchingTasks,
  getUserTaskOverview,
  
  // Advanced DS methods
  getMostUrgentTask,
  getNextReadyTask,
  getTasksForWeek,
  getCriticalPath,
  getTaskBlockers,
  getSmartRecommendations,
  getTaskInsights,
  addTaskDependency,
  getUserDataStructureManager,
  clearUserDataStructures
};

