/**
 * COMMITMENT TRACKER DEMO
 * 
 * Complete end-to-end demonstration of the commitment tracking system
 * Shows how emails are processed, commitments detected, and tasks tracked
 * 
 * Usage: node commitment-tracker-demo.js
 */

const {
  processEmailForCommitments,
  generateTaskStatus,
  markTaskCompleted,
  findMatchingTasks,
  getUserTaskOverview,
  
  // Advanced DS queries
  getMostUrgentTask,
  getNextReadyTask,
  getTasksForWeek,
  getCriticalPath,
  getTaskBlockers,
  getSmartRecommendations,
  getTaskInsights,
  addTaskDependency
} = require('./commitment-tracker/services/CommitmentTrackerService');

/**
 * Sample emails for testing
 */
const sampleEmails = [
  {
    sender: 'boss@company.com',
    subject: 'Q4 Financial Report Due',
    body: `Hi John,

I need you to complete the Q4 financial report for our board meeting.

I will:
1. Gather all Q4 financial data by Friday
2. Analyze the trends and compile insights by Monday
3. Prepare a comprehensive presentation for the board by Wednesday

Please make sure these are done on time as the board meeting is critical.

Thanks,
Your Boss`
  },
  {
    sender: 'client@enterprise.com',
    subject: 'Website Redesign Project',
    body: `Hello,

For the website redesign project, I commit to:
1. Review the design mockups by next Thursday
2. Provide detailed feedback by Friday
3. Approve the final design by next Monday

Looking forward to seeing the results!

Best regards,
Client`
  },
  {
    sender: 'colleague@company.com',
    subject: 'Team Meeting Notes',
    body: `Team,

Following up from today's meeting, I promise to:
- Send the meeting recording by tomorrow
- Summarize action items by end of week
- Create a task list for next sprint by Friday

Let's keep the momentum!

Regards,
Colleague`
  }
];

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Print section header
 */
function printHeader(title) {
  console.log('\n' + colors.bright + colors.cyan + '█'.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + '█  ' + title.padEnd(64) + '█' + colors.reset);
  console.log(colors.bright + colors.cyan + '█'.repeat(70) + colors.reset);
}

/**
 * Print subsection header
 */
function printSubheader(title) {
  console.log(colors.bright + colors.blue + '\n▶ ' + title + colors.reset);
  console.log(colors.dim + '─'.repeat(title.length + 2) + colors.reset);
}

/**
 * Print task list
 */
function printTasks(tasks, title) {
  if (!tasks || tasks.length === 0) {
    console.log(colors.dim + `  (No ${title.toLowerCase()})` + colors.reset);
    return;
  }

  console.log(colors.green + `\n  ${title}: ${tasks.length}` + colors.reset);
  tasks.slice(0, 5).forEach((task, i) => {
    const action = (task.action || 'Task').substring(0, 20).padEnd(20);
    const object = (task.object || task.description || 'No description').substring(0, 35);
    const deadline = task.deadline ? new Date(task.deadline).toDateString() : 'No deadline';
    console.log(colors.dim + `    ${i + 1}. ${action} • ${object}` + colors.reset);
    console.log(colors.dim + `       📅 ${deadline}` + colors.reset);
  });

  if (tasks.length > 5) {
    console.log(colors.dim + `    ... and ${tasks.length - 5} more` + colors.reset);
  }
}

/**
 * MAIN DEMO FUNCTION
 */
async function runDemo() {
  try {
    printHeader('COMMITMENT TRACKER - COMPLETE DEMO');
    console.log(colors.yellow + `
This demo shows the complete workflow:
1. Process email with commitments
2. Detect commitment phrases
3. Extract task details
4. Store in database
5. View and manage tasks
${colors.reset}`);

    const userId = 'demo-user-001';

    // ============================================================================
    // PHASE 1: PROCESS EMAILS WITH COMMITMENTS
    // ============================================================================
    printHeader('PHASE 1: Processing Emails with Commitments');

    const results = [];
    for (let i = 0; i < sampleEmails.length; i++) {
      const email = sampleEmails[i];
      console.log(colors.yellow + `\n📧 Email ${i + 1}/${sampleEmails.length}` + colors.reset);
      console.log(`From: ${email.sender}`);
      console.log(`Subject: ${email.subject}`);

      const result = await processEmailForCommitments(email, userId);
      results.push(result);

      if (result.success) {
        console.log(
          colors.green +
          `✅ Processed: ${result.newTasks.length} new tasks detected\n` +
          colors.reset
        );
      } else {
        console.log(colors.red + `❌ Error: ${result.error}\n` + colors.reset);
      }

      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // ============================================================================
    // PHASE 2: VIEW OVERALL STATUS
    // ============================================================================
    printHeader('PHASE 2: Overall Task Status');

    const overview = await getUserTaskOverview(userId);

    printSubheader('Summary');
    console.log(`${colors.green}Total Tasks:${colors.reset} ${overview.stats.totalTasks || 0}`);
    console.log(`${colors.yellow}Pending:${colors.reset} ${overview.pending.length}`);
    console.log(`${colors.green}Completed:${colors.reset} ${overview.completed.length}`);
    console.log(`${colors.red}Reminders:${colors.reset} ${overview.reminders.length}`);

    printTasks(overview.pending, 'Pending Tasks');
    printTasks(overview.completed, 'Completed Tasks');
    printTasks(overview.reminders, 'Tasks Needing Reminders');

    // ============================================================================
    // PHASE 3: DEMONSTRATE SEARCH/MATCH
    // ============================================================================
    printHeader('PHASE 3: Search & Match Tasks');

    printSubheader('Searching for tasks related to "financial"');
    const searchResult = await findMatchingTasks('financial', userId);
    if (searchResult.results.length > 0) {
      console.log(colors.green + `Found ${searchResult.results.length} matching task(s):` + colors.reset);
      searchResult.results.forEach((task, i) => {
        console.log(
          `  ${i + 1}. ${task.action} ${task.object}` +
          ` ${colors.dim}(${new Date(task.deadline).toDateString()})${colors.reset}`
        );
      });
    } else {
      console.log(colors.dim + '  No matching tasks found' + colors.reset);
    }

    // ============================================================================
    // PHASE 4: ADVANCED DATA STRUCTURE QUERIES
    // ============================================================================
    printHeader('PHASE 4: Advanced Data Structure Queries');

    printSubheader('Most Urgent Task (Priority Queue)');
    const mostUrgent = getMostUrgentTask(userId);
    if (mostUrgent) {
      console.log(`${colors.green}▸ ${mostUrgent.action} ${mostUrgent.object}${colors.reset}`);
      console.log(`  📅 Deadline: ${new Date(mostUrgent.deadline).toDateString()}`);
      console.log(`  ${colors.dim}(Priority Queue: O(1) access)${colors.reset}`);
    }

    printSubheader('Next Ready Task (No Blockers)');
    const nextReady = getNextReadyTask(userId);
    if (nextReady) {
      console.log(`${colors.green}▸ ${nextReady.action} ${nextReady.object}${colors.reset}`);
      console.log(`  📅 Deadline: ${new Date(nextReady.deadline).toDateString()}`);
      console.log(`  ${colors.dim}(Graph + Priority Queue: O(k log n) access)${colors.reset}`);
    } else {
      console.log(colors.dim + '  All ready tasks are blocked' + colors.reset);
    }

    printSubheader('Tasks This Week (AVL Tree Range Query)');
    const weekTasks = getTasksForWeek(userId);
    if (weekTasks.length > 0) {
      console.log(`${colors.green}Found ${weekTasks.length} task(s) this week:${colors.reset}`);
      weekTasks.forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.action} ${task.object}`);
        console.log(`     📅 ${new Date(task.deadline).toDateString()}`);
      });
      console.log(`  ${colors.dim}(AVL Tree: O(log n + k) range query)${colors.reset}`);
    } else {
      console.log(colors.dim + '  No tasks scheduled for this week' + colors.reset);
    }

    printSubheader('Critical Path Analysis (Dependency Graph)');
    const critPath = getCriticalPath(userId);
    if (critPath.path.length > 0) {
      console.log(`${colors.green}Critical Path: ${critPath.length} tasks${colors.reset}`);
      critPath.path.forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.action} ${task.object}`);
      });
      console.log(`  ${colors.dim}(Graph: O(n+m) topological analysis)${colors.reset}`);
    } else {
      console.log(colors.dim + '  No dependencies defined' + colors.reset);
    }

    printSubheader('Smart Recommendations');
    const recommendation = getSmartRecommendations(userId);
    if (recommendation) {
      console.log(`${colors.green}Recommendation:${colors.reset} ${recommendation.reason}`);
      console.log(`${colors.yellow}Urgency:${colors.reset} ${recommendation.urgency}`);
      console.log(`${colors.bright}Task:${colors.reset} ${recommendation.task.action} ${recommendation.task.object}`);
      console.log(`  📅 ${new Date(recommendation.task.deadline).toDateString()}`);
    } else {
      console.log(colors.dim + '  No recommendations available' + colors.reset);
    }

    printSubheader('Comprehensive Insights');
    const insights = getTaskInsights(userId);
    console.log(`${colors.green}Progress:${colors.reset} ${insights.completionRate}% complete`);
    console.log(`${colors.yellow}Pending:${colors.reset} ${insights.pendingCount} tasks`);
    console.log(`${colors.yellow}Blocked:${colors.reset} ${insights.blockedTasksCount} tasks (waiting on others)`);
    console.log(`${colors.yellow}Ready:${colors.reset} ${insights.readyTasksCount} tasks (can start now)`);
    console.log(`${colors.red}Critical Path:${colors.reset} ${insights.criticalPathLength} tasks`);
    if (insights.hasCircularDependency) {
      console.log(`${colors.red}⚠️  WARNING: Circular dependency detected!${colors.reset}`);
    }

    // ============================================================================
    // PHASE 5: FEATURE SUMMARY
    // ============================================================================
    printHeader('PHASE 5: Advanced Data Structures - Performance');

    const dsPerformance = `
${colors.bright}Time Complexity Comparison${colors.reset}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${colors.green}Priority Queue (Min Heap)${colors.reset}
  • Most urgent task: ${colors.bright}O(1)${colors.reset} - Peek instantly
  • Insert new task: O(log n) - Maintain heap order
  • Best for: "What should I do FIRST?"
  
${colors.green}AVL Tree (Self-Balancing BST)${colors.reset}
  • Date range query: ${colors.bright}O(log n + k)${colors.reset} - Find all tasks this week
  • Insert/Delete: O(log n) - Auto-balanced with rotations
  • Best for: "Show me tasks between Monday-Friday"
  
${colors.green}Dependency Graph (DAG)${colors.reset}
  • Critical path: ${colors.bright}O(n+m)${colors.reset} - Find bottleneck tasks
  • Find blockers: O(k) - What's preventing this task?
  • Detect cycles: O(n+m) - Prevent deadlocks
  • Best for: "What's blocking this task?"
  
${colors.green}HashMap (Direct Access)${colors.reset}
  • Get task by ID: ${colors.bright}O(1)${colors.reset} - Instant lookup
  • Update task: O(1) - Change status, update deadline
  • Best for: "Update task #42"

${colors.bright}Combined Power${colors.reset}
  • Next ready task: O(k log n) - Combine graph + priority queue
  • Smart recommendations: O(n+m) - Analyze all structures
  • Full integrity check: O(n) - Validate consistency
    `;

    console.log(dsPerformance);

    // ============================================================================
    // PHASE 6: FEATURE SUMMARY
    // ============================================================================
    printHeader('PHASE 6: System Features Summary');

    const features = [
      {
        title: 'Email Processing',
        description: 'Automatically detect commitment phrases from incoming emails'
      },
      {
        title: 'Task Extraction',
        description: 'Extract action, object, and deadline from commitment text'
      },
      {
        title: 'Deadline Conversion',
        description: 'Convert natural language dates to actual deadlines'
      },
      {
        title: 'Database Storage',
        description: 'Persist all tasks in MongoDB for long-term tracking'
      },
      {
        title: 'Priority Queue (DS)',
        description: 'O(1) access to most urgent task - no scanning needed'
      },
      {
        title: 'AVL Tree (DS)',
        description: 'O(log n + k) date range queries - show week/month view instantly'
      },
      {
        title: 'Dependency Graph (DS)',
        description: 'O(n+m) find critical path, blockers, and detect cycles'
      },
      {
        title: 'Smart Recommendations',
        description: 'Analyze all DS to suggest the best next action'
      },
      {
        title: 'Status Tracking',
        description: 'View pending, completed, and reminder tasks anytime'
      },
      {
        title: 'Task Search',
        description: 'Find and match tasks by keywords and content'
      },
      {
        title: 'Task Dependencies',
        description: 'Define task relationships and track critical paths'
      },
      {
        title: 'Real-time Updates',
        description: 'Get instant notifications for overdue or upcoming tasks'
      }
    ];

    features.forEach((feature, i) => {
      console.log(`${colors.green}✓${colors.reset} ${colors.bright}${feature.title}${colors.reset}`);
      console.log(`  ${colors.dim}${feature.description}${colors.reset}\n`);
    });

    // ============================================================================
    // PHASE 7: INTEGRATION GUIDE
    // ============================================================================
    printHeader('PHASE 7: Integration with Frontend');

    const integrationGuide = `
${colors.bright}API ENDPOINTS${colors.reset}

1. Process Email:
   POST /api/commitments/process
   Body: { sender, subject, body, userId }

2. Get Task Status:
   GET /api/commitments/:userId
   Returns: { pending, completed, reminders, stats }

3. Search Tasks:
   POST /api/commitments/:userId/match
   Body: { query }

4. Mark Task Complete:
   POST /api/commitments/:userId/complete/:taskId

5. Get Reminders:
   GET /api/commitments/:userId/reminders

${colors.bright}FRONTEND USAGE${colors.reset}

// When user enters email with commitments:
const result = await fetch('/api/commitments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: email.from,
    subject: email.subject,
    body: email.body,
    userId: currentUser.id
  })
});

// Display results in CommitmentTracker component
const data = await result.json();
setTrackerData(data.data.overview);
    `;

    console.log(integrationGuide);

    // ============================================================================
    // PHASE 8: COMPLETION
    // ============================================================================
    printHeader('✅ DEMO COMPLETE - WITH ADVANCED DATA STRUCTURES');

    const summary = `
${colors.green}Summary${colors.reset}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📧 Emails Processed: ${sampleEmails.length}
  ✅ Successful: ${results.filter(r => r.success).length}
  ❌ Failed: ${results.filter(r => !r.success).length}
  
  📋 Total Tasks Created: ${overview.stats.totalTasks || 0}
  ⏳ Pending: ${overview.pending.length}
  ✓ Completed: ${overview.completed.length}
  ⚡ Reminders: ${overview.reminders.length}

${colors.bright}Data Structures Enabled:${colors.reset}
  ✓ Priority Queue (Min Heap) - O(1) most urgent
  ✓ AVL Tree (Self-Balancing BST) - O(log n + k) range queries
  ✓ Dependency Graph (DAG) - O(n+m) critical path analysis
  ✓ HashMap - O(1) direct task access

${colors.dim}
The commitment tracker with advanced data structures is now ready!

You can use these features:
  • getMostUrgentTask(userId) - What's most urgent? O(1)
  • getNextReadyTask(userId) - What can I start now? O(k log n)
  • getTasksForWeek(userId) - Week view? O(log n + k)
  • getCriticalPath(userId) - What's the bottleneck? O(n+m)
  • getTaskBlockers(userId, taskId) - What's blocking this? O(k)
  • getSmartRecommendations(userId) - What should I do? O(n+m)
  • getTaskInsights(userId) - Full analysis? O(n)

Files Created:
  • commitment-tracker/services/CommitmentTrackerService.js
  • commitment-tracker/services/PriorityQueue.js
  • commitment-tracker/services/AVLTree.js
  • commitment-tracker/services/TaskGraph.js
  • commitment-tracker/services/TaskDataStructureManager.js
  • commitment-tracker/ARCHITECTURE.md
  • commitment-tracker/README.md
  • commitment-tracker-demo.js
  • Updated: routes/commitmentRoutes.js

Run this demo anytime:
  node commitment-tracker-demo.js
${colors.reset}
    `;

    console.log(summary);

  } catch (error) {
    console.error(colors.red + '❌ Demo Error:' + colors.reset, error.message);
    console.error(error.stack);
  }
}

// Run the demo
if (require.main === module) {
  runDemo().then(() => {
    console.log(colors.dim + '\nDemo finished.' + colors.reset);
    process.exit(0);
  }).catch(error => {
    console.error(colors.red + 'Fatal error:' + colors.reset, error);
    process.exit(1);
  });
}

module.exports = { runDemo };
