/**
 * TASK TRANSITION SERVICE
 * 
 * Handles automatic state transitions between task sections:
 * - PENDING → REMINDERS (1 day before deadline)
 * - REMINDERS → NOT_COMPLETED (deadline passes)
 * - ANY → COMPLETED (user marks complete)
 * - COMPLETED → DELETED (after 7 days)
 * 
 * Also handles dependent task warnings
 */

const Task = require('../../models/Task');

/**
 * SECTION DEFINITIONS
 */
const SECTIONS = {
  PENDING: 'pending',
  REMINDERS: 'reminders',
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not_completed',
  COMPLETED_LATE: 'completed_late'
};

const STATUSES = {
  PENDING: 'pending',
  REMINDER: 'reminder',
  COMPLETED: 'completed',
  NOT_COMPLETED: 'not_completed',
  COMPLETED_LATE: 'completed_late',
  DELETED: 'deleted'
};

/**
 * Get current section for a task based on its deadline and status
 */
function getCurrentSection(task, today = new Date()) {
  if (task.status === STATUSES.COMPLETED) {
    return task.completedLate ? SECTIONS.COMPLETED_LATE : SECTIONS.COMPLETED;
  }

  if (task.status === STATUSES.COMPLETED_LATE) {
    return SECTIONS.COMPLETED_LATE;
  }

  if (task.status === STATUSES.NOT_COMPLETED) {
    return SECTIONS.NOT_COMPLETED;
  }

  // For pending and reminder status, determine based on deadline
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const taskDate = new Date(task.deadline);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate <= tomorrow) {
    return SECTIONS.REMINDERS; // Due tomorrow or today
  }

  return SECTIONS.PENDING; // More than 1 day away
}

/**
 * MAIN: Auto-transition all tasks for a user
 * Run this periodically (e.g., every hour via cron job)
 */
async function syncTaskSections(userId) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 TASK TRANSITION: Syncing sections for user ${userId}`);
    console.log(`${'='.repeat(60)}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active tasks for user
    const allTasks = await Task.find({
      userId,
      status: { $ne: STATUSES.DELETED }
    });

    console.log(`📊 Found ${allTasks.length} active tasks`);

    const transitions = {
      toPending: [],
      toReminders: [],
      toNotCompleted: [],
      toCompleted: [],
      toDelete: []
    };

    // Process each task
    for (const task of allTasks) {
      const currentSection = getCurrentSection(task, today);
      const shouldDelete = task.scheduledForDeletion && new Date(task.scheduledForDeletion) <= today;

      // Handle deletion (7 days after completion)
      if (shouldDelete) {
        await Task.updateOne(
          { _id: task._id },
          {
            status: STATUSES.DELETED,
            section: 'deleted',
            updatedAt: new Date()
          }
        );
        transitions.toDelete.push({
          taskId: task.taskId,
          action: task.action,
          object: task.object
        });
        continue;
      }

      // PENDING → REMINDERS (1 day before deadline)
      if (currentSection === SECTIONS.REMINDERS && task.status === STATUSES.PENDING) {
        await Task.updateOne(
          { _id: task._id },
          {
            status: STATUSES.REMINDER,
            section: SECTIONS.REMINDERS,
            updatedAt: new Date()
          }
        );
        transitions.toReminders.push({
          taskId: task.taskId,
          action: task.action,
          object: task.object,
          daysUntilDue: 1
        });
      }

      // REMINDERS → NOT_COMPLETED (deadline passed)
      if (task.status === STATUSES.REMINDER && new Date(task.deadline) < today) {
        await Task.updateOne(
          { _id: task._id },
          {
            status: STATUSES.NOT_COMPLETED,
            section: SECTIONS.NOT_COMPLETED,
            updatedAt: new Date()
          }
        );
        transitions.toNotCompleted.push({
          taskId: task.taskId,
          action: task.action,
          object: task.object,
          daysOverdue: Math.floor((today - new Date(task.deadline)) / (1000 * 60 * 60 * 24))
        });
      }
    }

    console.log(`\n✅ TRANSITIONS SUMMARY:`);
    console.log(`  → To REMINDERS: ${transitions.toReminders.length} task(s)`);
    if (transitions.toReminders.length > 0) {
      transitions.toReminders.forEach(t => {
        console.log(`     • ${t.action} ${t.object}`);
      });
    }

    console.log(`  → To NOT_COMPLETED: ${transitions.toNotCompleted.length} task(s)`);
    if (transitions.toNotCompleted.length > 0) {
      transitions.toNotCompleted.forEach(t => {
        console.log(`     • ${t.action} ${t.object} (${t.daysOverdue} days overdue)`);
      });
    }

    console.log(`  → DELETED: ${transitions.toDelete.length} task(s)`);
    if (transitions.toDelete.length > 0) {
      transitions.toDelete.forEach(t => {
        console.log(`     • ${t.action} ${t.object}`);
      });
    }

    return transitions;
  } catch (error) {
    console.error('❌ Error syncing task sections:', error);
    throw error;
  }
}

/**
 * Mark task as complete (manual user action)
 * Determines if it's late or on-time based on deadline
 */
async function markTaskComplete(taskId, userId) {
  try {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      throw new Error('Task not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    const isLate = today > deadline;

    // Calculate scheduled deletion date (7 days from now)
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 7);

    const section = isLate ? SECTIONS.COMPLETED_LATE : SECTIONS.COMPLETED;
    const status = isLate ? STATUSES.COMPLETED_LATE : STATUSES.COMPLETED;

    const updated = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        section,
        completedAt: new Date(),
        completedLate: isLate,
        scheduledForDeletion: deleteDate,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`\n✅ TASK COMPLETED:`);
    console.log(`   Action: ${task.action}`);
    console.log(`   Object: ${task.object}`);
    console.log(`   Section: ${section}`);
    if (isLate) {
      const daysLate = Math.floor((today - deadline) / (1000 * 60 * 60 * 24));
      console.log(`   ⚠️  LATE by ${daysLate} day(s)`);
    } else {
      console.log(`   ✓ On time!`);
    }

    return {
      success: true,
      task: updated,
      isLate,
      movedToSection: section
    };
  } catch (error) {
    console.error('❌ Error marking task complete:', error);
    throw error;
  }
}

/**
 * Get all tasks organized by section
 */
async function getTasksBySection(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First sync sections to ensure latest state
    await syncTaskSections(userId);

    // Get tasks grouped by section
    const tasks = await Task.find({
      userId,
      status: { $ne: STATUSES.DELETED }
    }).sort({ deadline: 1 });

    const sections = {
      pending: [],
      reminders: [],
      completed: [],
      not_completed: [],
      completed_late: []
    };

    for (const task of tasks) {
      const section = task.section || getCurrentSection(task, today);
      
      // Map status to section if section is not set
      let taskSection = section;
      if (!task.section) {
        taskSection = getCurrentSection(task, today);
      }

      sections[taskSection].push({
        _id: task._id,
        taskId: task.taskId,
        action: task.action,
        object: task.object,
        deadline: task.deadline,
        status: task.status,
        completedAt: task.completedAt,
        completedLate: task.completedLate,
        createdAt: task.createdAt
      });
    }

    // Sort each section
    Object.keys(sections).forEach(key => {
      sections[key].sort((a, b) => {
        if (key === 'reminders' || key === 'pending') {
          // Sort by deadline (urgent first)
          return new Date(a.deadline) - new Date(b.deadline);
        }
        // Sort by completion/creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    console.log(`\n📊 TASKS BY SECTION (userId: ${userId}):`);
    console.log(`  PENDING: ${sections.pending.length}`);
    console.log(`  REMINDERS: ${sections.reminders.length}`);
    console.log(`  COMPLETED: ${sections.completed.length}`);
    console.log(`  NOT COMPLETED: ${sections.not_completed.length}`);
    console.log(`  COMPLETED LATE: ${sections.completed_late.length}`);

    return sections;
  } catch (error) {
    console.error('❌ Error getting tasks by section:', error);
    throw error;
  }
}

/**
 * Get all tasks with warnings for dependencies
 */
async function getTasksWithDependencyWarnings(userId) {
  try {
    const sections = await getTasksBySection(userId);

    // Check for blocked tasks
    const allTasks = [
      ...sections.pending,
      ...sections.reminders,
      ...sections.not_completed
    ];

    const tasksWithWarnings = allTasks.map(task => {
      const blockers = sections.not_completed.filter(t => 
        task.blockedBy && task.blockedBy.includes(t.taskId)
      );

      return {
        ...task,
        blockerCount: blockers.length,
        blockers: blockers.map(b => ({
          taskId: b.taskId,
          action: b.action,
          object: b.object,
          daysOverdue: Math.floor((new Date() - new Date(b.deadline)) / (1000 * 60 * 60 * 24))
        }))
      };
    });

    return {
      ...sections,
      pending: sections.pending.map(t => {
        const withWarning = tasksWithWarnings.find(tw => tw._id.equals(t._id));
        return withWarning || t;
      }),
      reminders: sections.reminders.map(t => {
        const withWarning = tasksWithWarnings.find(tw => tw._id.equals(t._id));
        return withWarning || t;
      }),
      not_completed: sections.not_completed.map(t => {
        const withWarning = tasksWithWarnings.find(tw => tw._id.equals(t._id));
        return withWarning || t;
      })
    };
  } catch (error) {
    console.error('❌ Error getting tasks with warnings:', error);
    throw error;
  }
}

/**
 * Manual transition: Move task to specific section
 * (For admin/testing purposes)
 */
async function moveTaskToSection(taskId, userId, targetSection) {
  try {
    const validSections = Object.values(SECTIONS);
    if (!validSections.includes(targetSection)) {
      throw new Error(`Invalid section: ${targetSection}`);
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw new Error('Task not found');
    }

    // Map section to status
    const sectionToStatus = {
      [SECTIONS.PENDING]: STATUSES.PENDING,
      [SECTIONS.REMINDERS]: STATUSES.REMINDER,
      [SECTIONS.COMPLETED]: STATUSES.COMPLETED,
      [SECTIONS.NOT_COMPLETED]: STATUSES.NOT_COMPLETED,
      [SECTIONS.COMPLETED_LATE]: STATUSES.COMPLETED_LATE
    };

    const newStatus = sectionToStatus[targetSection];

    const updated = await Task.findByIdAndUpdate(
      taskId,
      {
        section: targetSection,
        status: newStatus,
        updatedAt: new Date()
      },
      { new: true }
    );

    return updated;
  } catch (error) {
    console.error('❌ Error moving task:', error);
    throw error;
  }
}

module.exports = {
  syncTaskSections,
  markTaskComplete,
  getTasksBySection,
  getTasksWithDependencyWarnings,
  moveTaskToSection,
  getCurrentSection,
  SECTIONS,
  STATUSES
};
