/**
 * ADVANCED DATA STRUCTURES - COMPLETE IMPORT/EXPORT GUIDE
 * 
 * This file shows all the imports and exports available
 * Copy-paste these into your code to use the advanced data structures
 */

// ============================================================
// OPTION 1: Use Basic Manager (Recommended for most cases)
// ============================================================

const TaskDataStructureManager = require('./src/utils/TaskDataStructureManager');

// Create manager
const manager = new TaskDataStructureManager();

// Use all three DS:
manager.addTask(task);
manager.addDependency('task1', 'task2');
const urgent = manager.getMostUrgent();          // Priority Queue
const ready = manager.getNextReadyTask();        // Graph + PQ
const range = manager.getTasksInDateRange(...);  // AVL Tree
const stats = manager.getComprehensiveStats();

module.exports = { TaskDataStructureManager };

// ============================================================
// OPTION 2: Use Individual Data Structures (Advanced)
// ============================================================

const TaskGraph = require('./src/utils/TaskGraph');
const TaskAVLTree = require('./src/utils/TaskAVLTree');
const PriorityQueue = require('./PriorityQueue');

// Create individual DS
const graph = new TaskGraph();
const tree = new TaskAVLTree();
const pq = new PriorityQueue();

// Use independently:
graph.addTask(task);
graph.addDependency('a', 'b');
const blockers = graph.getBlockers('a');

tree.insert(task);
tree.delete('taskId');
const range = tree.getRange(start, end);

pq.insert(task);
const urgent = pq.getHighestPriority();

module.exports = { TaskGraph, TaskAVLTree, PriorityQueue };

// ============================================================
// OPTION 3: Use Enhanced Commitment System (With User Scoping)
// ============================================================

const CommitmentSystemEnhanced = require('./src/utils/CommitmentSystemEnhanced');

const system = new CommitmentSystemEnhanced();
const userId = 'user123';

// All TaskDataStructureManager methods, but per-user:
system.addTask(userId, task);
system.addTaskDependency(userId, 'a', 'b');
system.getNextReadyTask(userId);
system.getTasksInRange(userId, start, end);

// Plus enhanced features:
const dashboard = system.getDashboard(userId);      // Full analytics
const insights = system.getInsights(userId);        // Patterns
const rec = system.getSmartRecommendations(userId); // AI suggestions
const timeline = system.getTaskTimeline(userId);    // Schedule viz

module.exports = { CommitmentSystemEnhanced };

// ============================================================
// COMPLETE EXAMPLE: All three options in one file
// ============================================================

// Choose one approach based on your needs:

// Approach 1: Simple (use this for most cases)
{
  const TaskDataStructureManager = require('./src/utils/TaskDataStructureManager');
  const manager = new TaskDataStructureManager();
  
  manager.addTask({ taskId: '1', deadline: new Date('2026-04-15'), status: 'pending' });
  console.log(manager.getMostUrgent());
}

// Approach 2: Advanced (full control of each DS)
{
  const TaskGraph = require('./src/utils/TaskGraph');
  const TaskAVLTree = require('./src/utils/TaskAVLTree');
  
  const graph = new TaskGraph();
  const tree = new TaskAVLTree();
  
  // Work with each independently if needed
}

// Approach 3: System (user-scoped, ready for production)
{
  const CommitmentSystemEnhanced = require('./src/utils/CommitmentSystemEnhanced');
  const system = new CommitmentSystemEnhanced();
  
  system.addTask('user123', task);
  const dashboard = system.getDashboard('user123');
  console.log(dashboard);
}

// ============================================================
// API QUICK REFERENCE
// ============================================================

/*

PRIORITY QUEUE (from PriorityQueue.js or via manager)
────────────────────────────────────────────────────
pq.insert(task)
pq.getHighestPriority()              // O(1) - peek
pq.extractHighestPriority()          // O(log n) - remove

DEPENDENCY GRAPH (via TaskGraph or manager)
────────────────────────────────────────────────────
graph.addTask(task)
graph.addDependency(taskAId, taskBId)
graph.getBlockers(taskId)
graph.getBlockedTasks(taskId)
graph.getNextReadyTasks()
graph.findCriticalPath()
graph.topologicalSort()
graph.hasCircularDependency()
graph.completeTask(taskId)

AVL TREE (via TaskAVLTree or manager)
────────────────────────────────────────────────────
tree.insert(task)
tree.delete(taskId)
tree.search(taskId)
tree.getRange(startDate, endDate)
tree.getInOrder()
tree.getNext()                       // earliest deadline
tree.getLast()                       // latest deadline

TASK DATA STRUCTURE MANAGER (combines all 3)
────────────────────────────────────────────────────
// Core operations
manager.addTask(task)
manager.removeTask(taskId)
manager.addDependency(taskAId, taskBId)
manager.completeTask(taskId)

// Query operations
manager.getMostUrgent()              // Priority Queue
manager.getNextReadyTask()           // Graph + PQ
manager.getTasksByDeadline()         // AVL Tree
manager.getTasksInDateRange(s, e)   // AVL Tree
manager.getTaskBlockers(taskId)      // Graph
manager.getBlockedTasks(taskId)      // Graph

// Analysis
manager.findCriticalPath()
manager.hasCircularDependency()
manager.getComprehensiveStats()
manager.getSmartRecommendations()
manager.buildTaskTimeline()
manager.validateIntegrity()

COMMITMENT SYSTEM ENHANCED (with user scoping)
────────────────────────────────────────────────────
// All above methods + userId parameter:
system.addTask(userId, task)
system.getNextReadyTask(userId)
system.findCriticalPath(userId)

// Enhanced features:
system.getDashboard(userId)          // Full overview
system.getInsights(userId)           // Analytics
system.getSmartRecommendations(userId)
system.getTaskTimeline(userId)
system.loadTasksFromDatabase(userId, tasks)
system.exportStats(userId)

*/

// ============================================================
// USAGE PATTERNS
// ============================================================

/*

Pattern 1: Add task and check what's ready
────────────────────────────────────────────
const manager = new TaskDataStructureManager();

manager.addTask(task1);
manager.addTask(task2);
manager.addTask(task3);

manager.addDependency('task1', 'task2');  // task1 blocks task2
manager.addDependency('task2', 'task3');  // task2 blocks task3

const ready = manager.getNextReadyTask();
// Returns: task1 (earliest, unblocked)


Pattern 2: Find tasks in specific date range
────────────────────────────────────────────
const manager = new TaskDataStructureManager();

manager.addTask({ taskId: '1', deadline: new Date('2026-04-10'), ... });
manager.addTask({ taskId: '2', deadline: new Date('2026-04-15'), ... });
manager.addTask({ taskId: '3', deadline: new Date('2026-04-20'), ... });

const start = new Date('2026-04-12');
const end = new Date('2026-04-18');
const results = manager.getTasksInDateRange(start, end);
// Returns: [task2] (only April 15 is in range)


Pattern 3: Create task dependency chain
────────────────────────────────────────
const manager = new TaskDataStructureManager();

// Create linear dependency: A → B → C → D
['a','b','c','d'].forEach(id => {
  manager.addTask({ taskId: id, deadline: new Date(...), ... });
});

manager.addDependency('a', 'b');
manager.addDependency('b', 'c');
manager.addDependency('c', 'd');

const critical = manager.findCriticalPath();
// Returns: [a, b, c, d] all critical


Pattern 4: Per-user task management
────────────────────────────────────
const system = new CommitmentSystemEnhanced();

const user1 = 'john@example.com';
const user2 = 'jane@example.com';

system.addTask(user1, task1);
system.addTask(user2, task2);

// Each user has isolated data:
system.getNextReadyTask(user1);  // user1's next task
system.getNextReadyTask(user2);  // user2's next task


Pattern 5: Detect and prevent circular dependencies
────────────────────────────────────────────────────
const manager = new TaskDataStructureManager();

manager.addTask(ta);
manager.addTask(tb);
manager.addTask(tc);

manager.addDependency('a', 'b');  // a → b ✅
manager.addDependency('b', 'c');  // b → c ✅

const result = manager.addDependency('c', 'a');  // c → a ?
// Returns: false (prevented!)
// System detected: a → b → c → a is circular

console.log(manager.hasCircularDependency());  // false (still safe)

*/

// ============================================================
// TESTING
// ============================================================

/*

Run all demos to see everything in action:

    node src/utils/AdvancedDataStructuresDemo.js

This will show:
  ✅ DEMO 1: Basic usage of all three DS
  ✅ DEMO 2: Date range queries
  ✅ DEMO 3: Circular dependency detection
  ✅ DEMO 4: Smart recommendations
  ✅ DEMO 5: Enhanced commitment system
  ✅ DEMO 6: Performance metrics

*/

// ============================================================
// WHICH OPTION TO CHOOSE?
// ============================================================

/*

OPTION 1: TaskDataStructureManager
Use if: You need all three DS with simple interface
Best for: Most use cases
Features: Orchestrates PQ + Graph + AVL
Example:
  const manager = new TaskDataStructureManager();
  manager.addTask(task);
  manager.addDependency('a', 'b');
  manager.getNextReadyTask();

OPTION 2: Individual DS (TaskGraph, TaskAVLTree, PriorityQueue)
Use if: You need specific control over each data structure
Best for: Advanced use cases
Features: Direct access to each DS
Example:
  const graph = new TaskGraph();
  const tree = new TaskAVLTree();
  // Use each independently

OPTION 3: CommitmentSystemEnhanced
Use if: You have multiple users, need per-user isolation
Best for: Production systems
Features: User scoping, dashboards, insights
Example:
  const system = new CommitmentSystemEnhanced();
  system.addTask(userId, task);
  system.getDashboard(userId);

*/

module.exports = {
  // Exports for all three options
  TaskDataStructureManager: require('./src/utils/TaskDataStructureManager'),
  CommitmentSystemEnhanced: require('./src/utils/CommitmentSystemEnhanced'),
  TaskGraph: require('./src/utils/TaskGraph'),
  TaskAVLTree: require('./src/utils/TaskAVLTree'),
  PriorityQueue: require('./PriorityQueue')
};
