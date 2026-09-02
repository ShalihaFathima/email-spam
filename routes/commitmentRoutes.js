/**
 * COMMITMENT TRACKING API ENDPOINTS
 * 
 * Integrate with CommitmentTrackerService
 * Add these routes to your server.js
 */

const express = require('express');
const router = express.Router();
const {
  processEmailForCommitments,
  generateTaskStatus,
  findMatchingTasks,
  markTaskCompleted,
  deleteTask
} = require('../commitment-tracker/services/CommitmentTrackerService');
const {
  syncTaskSections,
  markTaskComplete,
  getTasksBySection,
  getTasksWithDependencyWarnings
} = require('../commitment-tracker/services/TaskTransitionService');

/**
 * ==================== ENDPOINTS ====================
 */

/**
 * POST /api/commitments/process
 * Process email for commitments and completions
 * 
 * Body: { sender, subject, body, userId }
 */
router.post('/process', async (req, res) => {
  try {
    const { sender, subject, body, userId } = req.body;

    if (!sender || !subject || !body || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sender, subject, body, userId'
      });
    }

    const result = await processEmailForCommitments(
      { sender, subject, body },
      userId
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing email',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId
 * Get task overview with reminders for user
 * 
 * Returns: { pending, reminders, overdue, completed, summary }
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const status = await generateTaskStatus(userId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task status',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/reminders
 * Get only reminders and overdue tasks
 */
router.get('/:userId/reminders', async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await generateTaskStatus(userId);

    res.json({
      success: true,
      data: {
        reminders: status.reminders,
        overdue: status.overdue,
        count: status.reminders.length + status.overdue.length
      }
    });

  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reminders',
      error: error.message
    });
  }
});

/**
 * POST /api/commitments/:userId/match
 * Find tasks matching a query
 * 
 * Body: { query }
 */
router.post('/:userId/match', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'query is required'
      });
    }

    const result = await findMatchingTasks(query, userId);

    res.json({
      success: result.success,
      data: {
        matches: result.results,
        count: result.count
      }
    });

  } catch (error) {
    console.error('Error matching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error matching tasks',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/sections
 * Get all tasks organized by section (Pending, Reminders, Completed, Not Completed, Completed Late)
 */
router.get('/:userId/sections', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const sections = await getTasksBySection(userId);

    res.json({
      success: true,
      data: sections,
      summary: {
        pending: sections.pending.length,
        reminders: sections.reminders.length,
        completed: sections.completed.length,
        not_completed: sections.not_completed.length,
        completed_late: sections.completed_late.length,
        total: Object.values(sections).reduce((sum, arr) => sum + arr.length, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task sections',
      error: error.message
    });
  }
});

/**
 * POST /api/commitments/:userId/complete/:taskId
 * Mark a specific task as complete
 * User clicked "Done" button
 */
router.post('/:userId/complete/:taskId', async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    if (!userId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'userId and taskId are required'
      });
    }

    const result = await markTaskComplete(taskId, userId);

    res.json({
      success: true,
      message: `Task marked as ${result.isLate ? 'completed (late)' : 'completed (on time)'}`,
      data: {
        task: result.task,
        isLate: result.isLate,
        movedToSection: result.movedToSection,
        scheduledForDeletion: result.task.scheduledForDeletion
      }
    });

  } catch (error) {
    console.error('Error marking task complete:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking task complete',
      error: error.message
    });
  }
});

/**
 * POST /api/commitments/:userId/sync
 * Manually trigger task section sync
 * Normally runs automatically via cron job
 */
router.post('/:userId/sync', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const transitions = await syncTaskSections(userId);

    res.json({
      success: true,
      message: 'Task sections synchronized',
      data: transitions,
      summary: {
        toReminders: transitions.toReminders.length,
        toNotCompleted: transitions.toNotCompleted.length,
        toDelete: transitions.toDelete.length
      }
    });

  } catch (error) {
    console.error('Error syncing sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing task sections',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/warnings
 * Get all tasks with dependency warnings
 * Shows which tasks are blocked by overdue tasks
 */
router.get('/:userId/warnings', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const tasksWithWarnings = await getTasksWithDependencyWarnings(userId);

    // Filter to only tasks with blockers
    const blockedTasks = [
      ...tasksWithWarnings.pending,
      ...tasksWithWarnings.reminders,
      ...tasksWithWarnings.not_completed
    ].filter(t => t.blockerCount > 0);

    res.json({
      success: true,
      data: {
        blockedTasks,
        blockedCount: blockedTasks.length,
        totalTasks: [
          ...tasksWithWarnings.pending,
          ...tasksWithWarnings.reminders,
          ...tasksWithWarnings.not_completed
        ].length
      }
    });

  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task warnings',
      error: error.message
    });
  }
});

/**
 * ==================== NEW ENDPOINTS FOR DATA STRUCTURE VISUALIZATIONS ====================
 */

/**
 * GET /api/commitments/:userId/daterange
 * Query AVL Tree - Get tasks in date range
 * Query params: start=YYYY-MM-DD&end=YYYY-MM-DD
 */
router.get('/:userId/daterange', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    if (!userId || !start || !end) {
      return res.status(400).json({
        success: false,
        message: 'userId, start date, and end date are required'
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    try {
      const sections = await getTasksBySection(userId);
      const allTasks = Object.values(sections || {}).flat();
      const tasksInRange = allTasks.filter(task => {
        const taskDate = new Date(task.deadline);
        return taskDate >= startDate && taskDate <= endDate;
      });

      res.json({
        success: true,
        data: {
          tasks: tasksInRange,
          count: tasksInRange.length,
          range: { start: start, end: end }
        }
      });
    } catch (dbError) {
      console.error('Database error in daterange:', dbError);
      // Return empty result instead of error
      res.json({
        success: true,
        data: {
          tasks: [],
          count: 0,
          range: { start: start, end: end },
          message: 'No tasks found or database error'
        }
      });
    }

  } catch (error) {
    console.error('Error fetching date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks in date range',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/task/:taskId/related
 * Query Dependency Graph - Get related tasks
 * Returns tasks that block this task and tasks blocked by this task
 */
router.get('/:userId/task/:taskId/related', async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    if (!userId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'userId and taskId are required'
      });
    }

    try {
      const sections = await getTasksBySection(userId);
      const allTasks = Object.values(sections || {}).flat();
      const task = allTasks.find(t => t._id && t._id.toString() === taskId);

      if (!task) {
        return res.json({
          success: true,
          data: {
            blockedBy: [],
            blocks: [],
            totalRelated: 0,
            message: 'Task not found'
          }
        });
      }

      const blockedBy = task.blockers ? allTasks.filter(t => 
        task.blockers.includes(t._id.toString())
      ) : [];
      
      const blocks = allTasks.filter(t => 
        t.blockers && t.blockers.includes(taskId)
      );

      res.json({
        success: true,
        data: {
          blockedBy: blockedBy || [],
          blocks: blocks || [],
          totalRelated: (blockedBy?.length || 0) + (blocks?.length || 0)
        }
      });
    } catch (dbError) {
      console.error('Database error in related tasks:', dbError);
      res.json({
        success: true,
        data: {
          blockedBy: [],
          blocks: [],
          totalRelated: 0
        }
      });
    }

  } catch (error) {
    console.error('Error fetching related tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related tasks',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/priority/next
 * Query Priority Queue - Get most urgent task (O(1))
 */
router.get('/:userId/priority/next', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    try {
      const sections = await getTasksBySection(userId);
      const allTasks = Object.values(sections || {}).flat();
      
      // Get pending and reminder tasks only (not completed)
      const activeTasks = allTasks.filter(t => 
        t.status === 'pending' || t.status === 'reminder' || t.status === 'not_completed'
      );

      if (activeTasks.length === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No pending tasks'
        });
      }

      // Sort by deadline and return earliest
      const nextAction = activeTasks.sort((a, b) => 
        new Date(a.deadline) - new Date(b.deadline)
      )[0];

      const daysUntilDue = Math.ceil((new Date(nextAction.deadline) - new Date()) / (1000 * 60 * 60 * 24));

      res.json({
        success: true,
        data: {
          taskId: nextAction._id || nextAction.id,
          action: nextAction.action,
          object: nextAction.object,
          deadline: nextAction.deadline,
          daysUntilDue: daysUntilDue
        }
      });
    } catch (dbError) {
      console.error('Database error in priority/next:', dbError);
      res.json({
        success: true,
        data: null,
        message: 'No pending tasks or database error'
      });
    }

  } catch (error) {
    console.error('Error fetching priority next:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching next action',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/sortedSections
 * Get sections with optional priority sorting
 * Query param: sortByPriority=true|false
 */
router.get('/:userId/sortedSections', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sortByPriority } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    try {
      const sections = await getTasksBySection(userId);

      if (sortByPriority === 'true') {
        const allTasks = Object.values(sections || {}).flat();
        const sortedByPriority = allTasks.sort((a, b) => 
          new Date(a.deadline) - new Date(b.deadline)
        );

        const sortedSections = {
          pending: [],
          reminders: [],
          completed: [],
          not_completed: [],
          completed_late: []
        };

        sortedByPriority.forEach(task => {
          const originalSection = Object.keys(sections || {}).find(key =>
            (sections[key] || []).some(t => t._id === task._id)
          );
          if (originalSection && sortedSections[originalSection]) {
            sortedSections[originalSection].push(task);
          }
        });

        return res.json({
          success: true,
          data: sortedSections,
          summary: {
            pending: sortedSections.pending.length,
            reminders: sortedSections.reminders.length,
            completed: sortedSections.completed.length,
            not_completed: sortedSections.not_completed.length,
            completed_late: sortedSections.completed_late.length,
            total: Object.values(sortedSections).reduce((sum, arr) => sum + arr.length, 0)
          },
          sortedByPriority: true
        });
      }

      res.json({
        success: true,
        data: sections || { pending: [], reminders: [], completed: [], not_completed: [], completed_late: [] },
        summary: {
          pending: (sections?.pending || []).length,
          reminders: (sections?.reminders || []).length,
          completed: (sections?.completed || []).length,
          not_completed: (sections?.not_completed || []).length,
          completed_late: (sections?.completed_late || []).length,
          total: Object.values(sections || {}).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0)
        }
      });
    } catch (dbError) {
      console.error('Database error in sorted sections:', dbError);
      const emptySection = { pending: [], reminders: [], completed: [], not_completed: [], completed_late: [] };
      res.json({
        success: true,
        data: emptySection,
        summary: {
          pending: 0,
          reminders: 0,
          completed: 0,
          not_completed: 0,
          completed_late: 0,
          total: 0
        }
      });
    }

  } catch (error) {
    console.error('Error fetching sorted sections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task sections',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/task/:taskId/dependencies
 * Get detailed dependency information for a specific task
 * Shows blockers, dependent tasks, and readiness status
 */
router.get('/:userId/task/:taskId/dependencies', async (req, res) => {
  try {
    const { userId, taskId } = req.params;

    if (!userId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'userId and taskId are required'
      });
    }

    const sections = await getTasksBySection(userId);
    const allTasks = Object.values(sections || {}).flat();
    const task = allTasks.find(t => t._id && (t._id.toString() === taskId || t.taskId === taskId));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get tasks that block this task (blockers)
    const blockingTasks = allTasks.filter(t => {
      const tId = t.taskId || t._id?.toString();
      const blockedByIds = task.blockedBy || [];
      
      // Check if this task's ID is in the blockedBy array
      return blockedByIds.includes(tId);
    }).map(t => ({
      taskId: t.taskId || t._id?.toString(),
      action: t.action,
      object: t.object,
      deadline: t.deadline,
      status: t.status,
      isCompleted: t.status === 'completed'
    }));

    // Get tasks that depend on this task (dependent tasks)
    const currentTaskId = task.taskId || task._id?.toString();
    const dependentTasks = allTasks.filter(t => {
      const tBlockedBy = t.blockedBy || [];
      return tBlockedBy.includes(currentTaskId);
    }).map(t => ({
      taskId: t.taskId || t._id?.toString(),
      action: t.action,
      object: t.object,
      deadline: t.deadline,
      status: t.status,
      isBlocked: !((t.blockedBy || []).every(id => {
        const blocker = allTasks.find(bt => (bt.taskId || bt._id?.toString()) === id);
        return blocker && blocker.status === 'completed';
      }))
    }));

    // Check if task is ready to start (no blockers or all blockers completed)
    const isReady = blockingTasks.length === 0 || blockingTasks.every(b => b.isCompleted);

    // Calculate days until due
    const now = new Date();
    const deadline = new Date(task.deadline);
    const daysUntilDue = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        task: {
          taskId: task._id?.toString() || task.taskId,
          action: task.action,
          object: task.object,
          deadline: task.deadline,
          status: task.status,
          daysUntilDue: daysUntilDue,
          isOverdue: daysUntilDue < 0
        },
        blockers: {
          tasks: blockingTasks,
          count: blockingTasks.length,
          allCompleted: blockingTasks.length === 0 || blockingTasks.every(b => b.isCompleted)
        },
        dependents: {
          tasks: dependentTasks,
          count: dependentTasks.length,
          blockedCount: dependentTasks.filter(d => d.isBlocked).length
        },
        readiness: {
          isReady: isReady,
          canStart: isReady && task.status !== 'completed',
          reason: !isReady ? `Blocked by ${blockingTasks.length} task(s)` : 'Ready to start'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task dependencies',
      error: error.message
    });
  }
});

/**
 * GET /api/commitments/:userId/graph/dependencies
 * Get the entire task dependency graph
 * Shows all tasks and their dependency relationships
 */
router.get('/:userId/graph/dependencies', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const sections = await getTasksBySection(userId);
    const allTasks = Object.values(sections || {}).flat();

    // Build nodes
    const nodes = allTasks.map(t => ({
      id: t.taskId || t._id?.toString(), // Consistent ID
      taskId: t.taskId,
      label: `${t.action} ${t.object}`,
      status: t.status,
      deadline: t.deadline,
      section: t.section,
      blockedBy: t.blockedBy || [],
      color: t.status === 'completed' ? '#4CAF50' : 
             t.status === 'not_completed' ? '#F44336' :
             t.status === 'reminder' ? '#FF9800' : '#2196F3'
    }));

    // Build edges (dependencies)
    const edges = [];
    const edgeSet = new Set();
    
    console.log(`\n📊 BUILDING GRAPH EDGES:`);
    console.log(`   Total nodes: ${nodes.length}`);
    
    allTasks.forEach(task => {
      const taskId = task.taskId || task._id?.toString();
      const blockedBy = task.blockedBy || [];
      
      if (blockedBy.length > 0) {
        console.log(`   📌 Task "${task.object.substring(0, 30)}" is blocked by ${blockedBy.length} task(s)`);
        
        blockedBy.forEach(blockerId => {
          const edgeKey = `${blockerId}->${taskId}`;
          
          if (!edgeSet.has(edgeKey)) {
            edges.push({
              source: blockerId,
              target: taskId,
              type: 'dependency',
              label: 'blocks'
            });
            edgeSet.add(edgeKey);
            console.log(`      🔗 Edge: ${blockerId.substring(0, 15)}... → ${taskId.substring(0, 15)}...`);
          }
        });
      }
    });
    
    console.log(`   ✅ Total edges created: ${edges.length}\n`);

    // Calculate graph statistics
    const readyTasks = nodes.filter(n => 
      n.blockedBy.length === 0 && n.status !== 'completed'
    );

    const blockedTasks = nodes.filter(n => 
      n.blockedBy.length > 0 && n.status !== 'completed'
    );

    const criticalPath = findCriticalPath(allTasks);

    res.json({
      success: true,
      data: {
        nodes: nodes,
        edges: edges,
        statistics: {
          totalTasks: nodes.length,
          totalDependencies: edges.length,
          readyTasks: readyTasks.length,
          blockedTasks: blockedTasks.length,
          completedTasks: nodes.filter(n => n.status === 'completed').length,
          overdueTasks: nodes.filter(n => {
            const now = new Date();
            return new Date(n.deadline) < now && n.status !== 'completed';
          }).length
        },
        criticalPath: criticalPath,
        visualization: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          layout: 'force-directed'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dependency graph:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dependency graph',
      error: error.message
    });
  }
});

/**
 * Helper function to find critical path
 */
function findCriticalPath(allTasks) {
  // Find tasks with longest chain of dependencies
  const taskMap = new Map();
  allTasks.forEach(t => {
    taskMap.set(t._id?.toString() || t.taskId, t);
  });

  let longestPath = [];
  const visited = new Set();

  function dfs(taskId, path) {
    if (visited.has(taskId)) return path;
    visited.add(taskId);

    const task = taskMap.get(taskId);
    if (!task || !task.blockedBy || task.blockedBy.length === 0) {
      return path;
    }

    let maxPath = path;
    task.blockedBy.forEach(blockerId => {
      const newPath = dfs(blockerId, [...path, blockerId]);
      if (newPath.length > maxPath.length) {
        maxPath = newPath;
      }
    });

    return maxPath;
  }

  allTasks.forEach(t => {
    const path = dfs(t._id?.toString() || t.taskId, []);
    if (path.length > longestPath.length) {
      longestPath = path;
    }
  });

  return longestPath.map(id => {
    const task = taskMap.get(id);
    return {
      taskId: id,
      action: task?.action,
      object: task?.object
    };
  });
}

module.exports = router;

/**
 * ==================== INTEGRATION ====================
 * 
 * Add to server.js:
 * 
 * const commitmentRoutes = require('./routes/commitmentRoutes');
 * app.use('/api/commitments', commitmentRoutes);
 * 
 * ==================== EXAMPLE USAGE ====================
 * 
 * 1. Process email with commitment:
 *    POST /api/commitments/process
 *    {
 *      "sender": "john@company.com",
 *      "subject": "Project Report",
 *      "body": "I will send the financial report by Friday",
 *      "userId": "user123"
 *    }
 * 
 * 2. Get all task statuses with reminders:
 *    GET /api/commitments/user123
 * 
 * 3. Get only reminders:
 *    GET /api/commitments/user123/reminders
 * 
 * 4. Check if email matches pending tasks:
 *    POST /api/commitments/user123/match
 *    {
 *      "subject": "RE: Project Report",
 *      "body": "Here is the financial report you requested"
 *    }
 */
