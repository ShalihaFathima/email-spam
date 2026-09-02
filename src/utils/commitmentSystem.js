/**
 * Commitment Management System - Master Orchestrator
 * 
 * Combines all utilities into a unified workflow:
 * 1. Detect commitments in email
 * 2. Extract task details
 * 3. Convert time text to deadlines
 * 4. Add tasks to database
 * 5. Detect completion status
 * 6. Check for reminders
 * 
 * Returns organized task data with pending, completed, and reminders
 */

import detectCommitments from './commitmentDetector.js';
import extractTask from './taskExtractor.js';
import convertToDeadline from './deadlineConverter.js';
import detectCompletion from './completionDetector.js';
import checkReminders from './reminderChecker.js';
import { addTaskAPI, getOverviewAPI, updateTaskStatusAPI } from './taskStorageAPI.js';

/**
 * Main function: Run the complete commitment management system
 * Uses MongoDB for persistence via API
 * 
 * @param {string} emailText - Email content to analyze
 * @param {string|number} userId - User identifier
 * @returns {object} Result with {pending, completed, reminders, stats}
 */
async function runCommitmentSystem(emailText, userId) {
  try {
    // Input validation
    if (!emailText || typeof emailText !== 'string') {
      return {
        pending: [],
        completed: [],
        reminders: [],
        stats: { newTasks: 0, completedTasks: 0, totalTasks: 0 },
        error: 'Invalid email text',
      };
    }

    console.log('\n========== COMMITMENT SYSTEM START ==========');

    // ==================== STEP 1: DETECT COMMITMENTS ====================
    console.log('Step 1: Detecting commitments...');
    const commitments = detectCommitments(emailText);
    console.log(`Found ${commitments.length} commitment(s):`);
    commitments.forEach(c => console.log(`  - "${c.substring(0, 60)}..."`));

    // ==================== STEP 2: EXTRACT TASKS ====================
    console.log('\nStep 2: Extracting tasks...');
    const extractedTasks = [];
    for (const commitment of commitments) {
      const extracted = extractTask(commitment);
      if (extracted) {
        extractedTasks.push(extracted);
        console.log(`  ✅ ${extracted.action} | ${extracted.object} | ${extracted.timeText}`);
      }
    }

    // ==================== STEP 3: CONVERT DEADLINES ====================
    console.log('\nStep 3: Converting deadlines...');
    const tasksWithDeadlines = extractedTasks.map(task => ({
      ...task,
      deadline: convertToDeadline(task.timeText),
      status: 'pending',
    }));

    tasksWithDeadlines.forEach(t => {
      console.log(`  ✅ ${t.object} → ${t.deadline.toLocaleDateString()}`);
    });

    // ==================== STEP 4: ADD TO DATABASE ====================
    console.log('\nStep 4: Adding tasks to database...');
    let newTasksCount = 0;
    for (const task of tasksWithDeadlines) {
      try {
        const result = await addTaskAPI(userId, task);
        if (result.success) {
          console.log(`✅ Task added: ${task.action} ${task.object}`);
          newTasksCount++;
        } else {
          console.log(`⚠️  ${result.message}`);
        }
      } catch (err) {
        console.error(`Error adding task:`, err.message);
      }
    }

    // ==================== STEP 5: GET LATEST DATA FROM DB ====================
    console.log('\nStep 5: Fetching updated data from database...');
    const overview = await getOverviewAPI(userId);
    const allTasks = [...(overview.pending || []), ...(overview.completed || [])];

    console.log(`Pending: ${overview.pending?.length || 0}, Completed: ${overview.completed?.length || 0}`);

    // ==================== STEP 6: DETECT COMPLETION ====================
    console.log('\nStep 6: Checking for completion keywords...');
    const completedFromEmail = detectCompletion(emailText, allTasks);
    let completedCount = 0;

    // Update completed tasks in database
    for (const task of completedFromEmail) {
      if (task.status === 'completed' && (overview.pending || []).find(t => t._id === task._id)) {
        try {
          await updateTaskStatusAPI(task._id, 'completed');
          completedCount++;
          console.log(`✅ Marked complete: ${task.action} ${task.object}`);
        } catch (err) {
          console.error('Error updating task:', err);
        }
      }
    }

    // ==================== STEP 7: CHECK REMINDERS ====================
    console.log('\nStep 7: Generating reminders...');
    const reminders = checkReminders(overview.pending || []);
    console.log(`Generated ${reminders.length} reminder(s)`);
    reminders.slice(0, 3).forEach(r => console.log(`  - ${r}`));

    // ==================== FINAL RESULT ====================
    const result = {
      pending: overview.pending || [],
      completed: overview.completed || [],
      reminders: reminders,
      stats: {
        newTasks: newTasksCount,
        completedTasks: completedCount,
        totalTasks: (overview.pending?.length || 0) + (overview.completed?.length || 0),
        pendingCount: overview.pending?.length || 0,
      },
    };

    console.log('\n📊 SYSTEM SUMMARY:');
    console.log(`  New tasks added: ${newTasksCount}`);
    console.log(`  Tasks marked complete: ${completedCount}`);
    console.log(`  Total tasks: ${result.stats.totalTasks}`);
    console.log(`  Pending: ${result.stats.pendingCount}`);
    console.log(`  Completed: ${overview.completed?.length || 0}`);
    console.log(`  Reminders: ${reminders.length}`);
    console.log('========== COMMITMENT SYSTEM END ==========\n');

    return result;
  } catch (err) {
    console.error(`❌ Error in commitment system: ${err.message}`);
    return {
      pending: [],
      completed: [],
      reminders: [],
      stats: { newTasks: 0, completedTasks: 0, totalTasks: 0 },
      error: err.message,
    };
  }
}

/**
 * Get user's complete task overview from database
 * @param {string|number} userId - User identifier
 * @returns {object} - Complete task overview
 */
async function getUserTaskOverview(userId) {
  try {
    const overview = await getOverviewAPI(userId);
    const reminders = checkReminders(overview.pending || []);

    return {
      pending: overview.pending || [],
      completed: overview.completed || [],
      reminders: reminders,
      stats: overview.stats || {
        totalTasks: 0,
        pendingCount: 0,
        completedCount: 0,
      },
    };
  } catch (err) {
    console.error('Error getting overview:', err);
    return {
      pending: [],
      completed: [],
      reminders: [],
      stats: { totalTasks: 0, pendingCount: 0, completedCount: 0 },
    };
  }
}

export {
  runCommitmentSystem,
  getUserTaskOverview,
};
