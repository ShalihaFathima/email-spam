/**
 * Test cases for task storage system
 */

import {
  taskStore,
  addTask,
  getTasks,
  getTasksByStatus,
  updateTaskStatus,
  removeTask,
  clearUserTasks,
  getStoreStats,
} from './taskStorage.js';

console.log('=== TASK STORAGE SYSTEM TESTS ===\n');

// Helper: Create test deadline
function createDeadline(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

// Test 1: Add single task
console.log('Test 1: Add single task');
const result1 = addTask(1, {
  action: 'send',
  object: 'report',
  deadline: createDeadline(1),
});
console.log('Add task for user 1');
console.log('Result:', result1.success ? '✅ Success' : '❌ Failed');
console.log('Message:', result1.message);
console.log('---\n');

// Test 2: Get tasks for user
console.log('Test 2: Get tasks for user');
const tasks1 = getTasks(1);
console.log('Get tasks for user 1');
console.log('Count:', tasks1.length);
console.log('Task:', tasks1[0]?.object);
console.log('Pass:', tasks1.length === 1 && tasks1[0]?.object === 'report');
console.log('---\n');

// Test 3: Add multiple tasks for same user
console.log('Test 3: Add multiple tasks for same user');
const result3a = addTask(1, {
  action: 'complete',
  object: 'presentation',
  deadline: createDeadline(2),
});
const result3b = addTask(1, {
  action: 'review',
  object: 'code',
  deadline: createDeadline(1),
});
const tasks3 = getTasks(1);
console.log('Add 2 more tasks to user 1');
console.log('Total tasks for user 1:', tasks3.length);
console.log('Pass:', tasks3.length === 3);
console.log('---\n');

// Test 4: Initialize empty array for new user
console.log('Test 4: Initialize empty array for new user');
const tasks4 = getTasks(2);
console.log('Get tasks for user 2 (new user)');
console.log('Tasks:', tasks4);
console.log('Pass:', Array.isArray(tasks4) && tasks4.length === 0);
console.log('---\n');

// Test 5: Add task to new user
console.log('Test 5: Add task to new user');
const result5 = addTask(2, {
  action: 'call',
  object: 'client',
  deadline: createDeadline(0),
});
const tasks5 = getTasks(2);
console.log('Add task to user 2');
console.log('Success:', result5.success);
console.log('Tasks count:', tasks5.length);
console.log('Pass:', result5.success && tasks5.length === 1);
console.log('---\n');

// Test 6: Duplicate prevention (same object + deadline)
console.log('Test 6: Duplicate prevention');
const deadline6 = createDeadline(1);
const result6a = addTask(3, {
  action: 'send',
  object: 'email',
  deadline: deadline6,
});
const result6b = addTask(3, {
  action: 'send',
  object: 'email',
  deadline: deadline6,
});
console.log('Try to add duplicate task (same object + deadline)');
console.log('First add success:', result6a.success);
console.log('Second add success:', result6b.success);
console.log('Duplicate detected:', !result6b.success);
console.log('Message:', result6b.message);
console.log('Pass:', result6a.success && !result6b.success);
console.log('---\n');

// Test 7: Different deadline allows same object
console.log('Test 7: Different deadline allows same object');
const result7a = addTask(4, {
  action: 'send',
  object: 'report',
  deadline: createDeadline(1),
});
const result7b = addTask(4, {
  action: 'send',
  object: 'report',
  deadline: createDeadline(2),
});
const tasks7 = getTasks(4);
console.log('Add same object with different deadlines');
console.log('First add success:', result7a.success);
console.log('Second add success:', result7b.success);
console.log('Total tasks:', tasks7.length);
console.log('Pass:', result7a.success && result7b.success && tasks7.length === 2);
console.log('---\n');

// Test 8: Update task status
console.log('Test 8: Update task status');
const task8 = getTasks(1)[0];
const result8 = updateTaskStatus(1, task8.id, 'completed');
console.log('Update task status to "completed"');
console.log('Success:', result8.success);
console.log('Task status updated:', result8.task?.status === 'completed');
console.log('Pass:', result8.success && result8.task?.status === 'completed');
console.log('---\n');

// Test 9: Get tasks by status
console.log('Test 9: Get tasks by status');
updateTaskStatus(1, getTasks(1)[0].id, 'completed');
updateTaskStatus(1, getTasks(1)[1].id, 'pending');
const pendingTasks = getTasksByStatus(1, 'pending');
const completedTasks = getTasksByStatus(1, 'completed');
console.log('Filter tasks by status');
console.log('Pending tasks:', pendingTasks.length);
console.log('Completed tasks:', completedTasks.length);
console.log('Pass:', pendingTasks.length > 0 && completedTasks.length > 0);
console.log('---\n');

// Test 10: Remove task
console.log('Test 10: Remove task');
const beforeRemove = getTasks(2).length;
const task10 = getTasks(2)[0];
const result10 = removeTask(2, task10.id);
const afterRemove = getTasks(2).length;
console.log('Remove task from user 2');
console.log('Before count:', beforeRemove);
console.log('After count:', afterRemove);
console.log('Remove success:', result10.success);
console.log('Pass:', result10.success && afterRemove === beforeRemove - 1);
console.log('---\n');

// Test 11: Clear all user tasks
console.log('Test 11: Clear all user tasks');
const beforeClear = getTasks(1).length;
const result11 = clearUserTasks(1);
const afterClear = getTasks(1).length;
console.log('Clear all tasks for user 1');
console.log('Before clear:', beforeClear);
console.log('After clear:', afterClear);
console.log('Message:', result11.message);
console.log('Pass:', result11.success && afterClear === 0);
console.log('---\n');

// Test 12: Invalid input - missing task field
console.log('Test 12: Invalid input - missing task field');
const result12 = addTask(5, {
  action: 'send',
  object: 'email',
  // missing deadline
});
console.log('Try to add task without deadline');
console.log('Success:', result12.success);
console.log('Message:', result12.message);
console.log('Pass:', !result12.success);
console.log('---\n');

// Test 13: Invalid input - no user ID
console.log('Test 13: Invalid input - no user ID');
const result13 = addTask(null, {
  action: 'send',
  object: 'email',
  deadline: createDeadline(1),
});
console.log('Try to add task with no user ID');
console.log('Success:', result13.success);
console.log('Message:', result13.message);
console.log('Pass:', !result13.success);
console.log('---\n');

// Test 14: Invalid input - invalid task object
console.log('Test 14: Invalid input - invalid task object');
const result14 = addTask(6, null);
console.log('Try to add null as task');
console.log('Success:', result14.success);
console.log('Message:', result14.message);
console.log('Pass:', !result14.success);
console.log('---\n');

// Test 15: Store statistics
console.log('Test 15: Store statistics');
// Add some tasks for stats test
addTask(10, { action: 'send', object: 'doc1', deadline: createDeadline(1) });
addTask(10, { action: 'send', object: 'doc2', deadline: createDeadline(2) });
addTask(11, { action: 'call', object: 'client', deadline: createDeadline(1) });

const stats = getStoreStats();
console.log('Get store statistics');
console.log('Total users:', stats.totalUsers);
console.log('Total tasks:', stats.totalTasks);
console.log('User stats:', stats.userStats);
console.log('Pass:', stats.totalUsers > 0 && stats.totalTasks > 0);
console.log('---\n');

// Test 16: Get tasks with invalid user ID
console.log('Test 16: Get tasks with invalid user ID');
const result16 = getTasks(null);
console.log('Get tasks with null user ID');
console.log('Result:', result16);
console.log('Pass:', Array.isArray(result16) && result16.length === 0);
console.log('---\n');

// Test 17: Task has required fields
console.log('Test 17: Added task has all required fields');
const newTask = addTask(12, {
  action: 'test',
  object: 'functionality',
  deadline: createDeadline(1),
});
const storedTask = getTasks(12)[0];
console.log('Check task structure');
console.log('Has id:', !!storedTask.id);
console.log('Has action:', !!storedTask.action);
console.log('Has object:', !!storedTask.object);
console.log('Has deadline:', !!storedTask.deadline);
console.log('Has status:', !!storedTask.status);
console.log('Has createdAt:', !!storedTask.createdAt);
console.log('Status is "pending":', storedTask.status === 'pending');
console.log('Pass:', storedTask.id && storedTask.action && storedTask.object && storedTask.deadline && storedTask.status === 'pending');
console.log('---\n');

// Test 18: Different users have separate task lists
console.log('Test 18: Different users have separate task lists');
addTask(20, { action: 'a', object: 'obj1', deadline: createDeadline(1) });
addTask(21, { action: 'b', object: 'obj2', deadline: createDeadline(1) });
const tasks20 = getTasks(20);
const tasks21 = getTasks(21);
console.log('Tasks for user 20:', tasks20.length);
console.log('Tasks for user 21:', tasks21.length);
console.log('Different tasks:', tasks20[0]?.object !== tasks21[0]?.object);
console.log('Pass:', tasks20[0]?.object === 'obj1' && tasks21[0]?.object === 'obj2');
console.log('---\n');

// Test 19: Remove non-existent task
console.log('Test 19: Remove non-existent task');
const result19 = removeTask(20, 'non_existent_id');
console.log('Try to remove non-existent task');
console.log('Success:', result19.success);
console.log('Message:', result19.message);
console.log('Pass:', !result19.success);
console.log('---\n');

// Test 20: Update non-existent task
console.log('Test 20: Update non-existent task');
const result20 = updateTaskStatus(20, 'non_existent_id', 'completed');
console.log('Try to update non-existent task');
console.log('Success:', result20.success);
console.log('Message:', result20.message);
console.log('Pass:', !result20.success);
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
