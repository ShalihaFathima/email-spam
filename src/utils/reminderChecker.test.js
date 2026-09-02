/**
 * Test cases for checkReminders function
 */

import checkReminders from './reminderChecker.js';

console.log('=== CHECK REMINDERS FUNCTION TESTS ===\n');

// Helper functions
function createDateAtMidnight(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getTodayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Test 1: Empty array
console.log('Test 1: Empty array');
const result1 = checkReminders([]);
console.log('Input: []');
console.log('Output:', result1);
console.log('Expected: []');
console.log('Pass:', Array.isArray(result1) && result1.length === 0);
console.log('---\n');

// Test 2: Null input
console.log('Test 2: Null input');
const result2 = checkReminders(null);
console.log('Input: null');
console.log('Output:', result2);
console.log('Expected: []');
console.log('Pass:', Array.isArray(result2) && result2.length === 0);
console.log('---\n');

// Test 3: Undefined input
console.log('Test 3: Undefined input');
const result3 = checkReminders(undefined);
console.log('Input: undefined');
console.log('Output:', result3);
console.log('Expected: []');
console.log('Pass:', Array.isArray(result3) && result3.length === 0);
console.log('---\n');

// Test 4: Missed deadline (past)
console.log('Test 4: Missed deadline (past)');
const result4 = checkReminders([
  {
    action: 'send',
    object: 'report',
    deadline: createDateAtMidnight(-2),
    status: 'pending',
  },
]);
console.log('Input: Task with deadline 2 days ago');
console.log('Output:', result4);
console.log('Expected: ["You missed: send report"]');
console.log('Pass:', result4[0] === 'You missed: send report');
console.log('---\n');

// Test 5: Due today
console.log('Test 5: Due today');
const result5 = checkReminders([
  {
    action: 'call',
    object: 'client',
    deadline: getTodayAtMidnight(),
    status: 'pending',
  },
]);
console.log('Input: Task with deadline today');
console.log('Output:', result5);
console.log('Expected: ["Reminder: call client today"]');
console.log('Pass:', result5[0] === 'Reminder: call client today');
console.log('---\n');

// Test 6: Future deadline (no reminder yet)
console.log('Test 6: Future deadline (no reminder yet)');
const result6 = checkReminders([
  {
    action: 'review',
    object: 'code',
    deadline: createDateAtMidnight(5),
    status: 'pending',
  },
]);
console.log('Input: Task with deadline 5 days from now');
console.log('Output:', result6);
console.log('Expected: []');
console.log('Pass:', result6.length === 0);
console.log('---\n');

// Test 7: Multiple tasks with different deadlines
console.log('Test 7: Multiple tasks with different deadlines');
const result7 = checkReminders([
  {
    action: 'send',
    object: 'email',
    deadline: createDateAtMidnight(-1),
    status: 'pending',
  },
  {
    action: 'complete',
    object: 'presentation',
    deadline: getTodayAtMidnight(),
    status: 'pending',
  },
  {
    action: 'attend',
    object: 'meeting',
    deadline: createDateAtMidnight(3),
    status: 'pending',
  },
]);
console.log('Input: 3 tasks (past, today, future)');
console.log('Output:', result7);
console.log('Expected: 2 reminders (missed + today)');
console.log('Pass:', result7.length === 2 && result7[0].includes('You missed') && result7[1].includes('Reminder'));
console.log('---\n');

// Test 8: Invalid task (missing fields)
console.log('Test 8: Invalid task (missing deadline)');
const result8 = checkReminders([
  {
    action: 'send',
    object: 'report',
    status: 'pending',
    // missing deadline
  },
]);
console.log('Input: Task without deadline');
console.log('Output:', result8);
console.log('Expected: []');
console.log('Pass:', result8.length === 0);
console.log('---\n');

// Test 9: Invalid task (missing action)
console.log('Test 9: Invalid task (missing action)');
const result9 = checkReminders([
  {
    object: 'report',
    deadline: getTodayAtMidnight(),
    status: 'pending',
    // missing action
  },
]);
console.log('Input: Task without action');
console.log('Output:', result9);
console.log('Expected: []');
console.log('Pass:', result9.length === 0);
console.log('---\n');

// Test 10: Invalid task (missing object)
console.log('Test 10: Invalid task (missing object)');
const result10 = checkReminders([
  {
    action: 'send',
    deadline: getTodayAtMidnight(),
    status: 'pending',
    // missing object
  },
]);
console.log('Input: Task without object');
console.log('Output:', result10);
console.log('Expected: []');
console.log('Pass:', result10.length === 0);
console.log('---\n');

// Test 11: Mixed valid and invalid tasks
console.log('Test 11: Mixed valid and invalid tasks');
const result11 = checkReminders([
  {
    action: 'send',
    object: 'email',
    deadline: getTodayAtMidnight(),
  },
  {
    action: 'call',
    // missing object
  },
  {
    action: 'review',
    object: 'code',
    deadline: createDateAtMidnight(-1),
  },
]);
console.log('Input: Mix of valid and invalid tasks');
console.log('Output:', result11);
console.log('Expected: 2 reminders (skipping invalid)');
console.log('Pass:', result11.length === 2);
console.log('---\n');

// Test 12: Return type is array
console.log('Test 12: Return type is array');
const result12 = checkReminders([
  {
    action: 'test',
    object: 'functionality',
    deadline: getTodayAtMidnight(),
  },
]);
console.log('Input: Any task');
console.log('Is array:', Array.isArray(result12));
console.log('Pass:', Array.isArray(result12));
console.log('---\n');

// Test 13: Multiple reminders returned in order
console.log('Test 13: Multiple reminders in order');
const result13 = checkReminders([
  {
    action: 'send',
    object: 'report',
    deadline: createDateAtMidnight(-3),
  },
  {
    action: 'call',
    object: 'manager',
    deadline: createDateAtMidnight(-1),
  },
  {
    action: 'review',
    object: 'proposal',
    deadline: getTodayAtMidnight(),
  },
]);
console.log('Input: Multiple past and today tasks');
console.log('Output:', result13);
console.log('Count:', result13.length);
console.log('Expected: 3 reminders in input order');
console.log('Pass:', result13.length === 3);
console.log('---\n');

// Test 14: Task with tomorrow's deadline (no reminder)
console.log('Test 14: Tomorrow\'s deadline (no reminder)');
const result14 = checkReminders([
  {
    action: 'prepare',
    object: 'presentation',
    deadline: createDateAtMidnight(1),
  },
]);
console.log('Input: Task with deadline tomorrow');
console.log('Output:', result14);
console.log('Expected: []');
console.log('Pass:', result14.length === 0);
console.log('---\n');

// Test 15: Null task in array
console.log('Test 15: Null task in array');
const result15 = checkReminders([
  null,
  {
    action: 'send',
    object: 'email',
    deadline: getTodayAtMidnight(),
  },
  undefined,
]);
console.log('Input: Array with null and undefined tasks');
console.log('Output:', result15);
console.log('Expected: 1 reminder (from valid task)');
console.log('Pass:', result15.length === 1);
console.log('---\n');

// Test 16: Large number of tasks
console.log('Test 16: Large number of tasks');
const largeTasks = [];
for (let i = 0; i < 100; i++) {
  if (i < 30) {
    // Past deadlines
    largeTasks.push({
      action: 'action' + i,
      object: 'object' + i,
      deadline: createDateAtMidnight(-1),
    });
  } else if (i < 50) {
    // Today
    largeTasks.push({
      action: 'action' + i,
      object: 'object' + i,
      deadline: getTodayAtMidnight(),
    });
  } else {
    // Future
    largeTasks.push({
      action: 'action' + i,
      object: 'object' + i,
      deadline: createDateAtMidnight(10),
    });
  }
}
const result16 = checkReminders(largeTasks);
console.log('Input: 100 tasks (30 past, 20 today, 50 future)');
console.log('Output count:', result16.length);
console.log('Expected: 50 reminders (30 + 20)');
console.log('Pass:', result16.length === 50);
console.log('---\n');

// Test 17: Message format for missed deadline
console.log('Test 17: Message format - missed deadline');
const result17 = checkReminders([
  {
    action: 'submit',
    object: 'assignment',
    deadline: createDateAtMidnight(-5),
  },
]);
console.log('Input: Past task');
console.log('Output:', result17[0]);
console.log('Format: "You missed: [action] [object]"');
console.log('Pass:', result17[0].startsWith('You missed:') && result17[0].includes('submit') && result17[0].includes('assignment'));
console.log('---\n');

// Test 18: Message format for today
console.log('Test 18: Message format - due today');
const result18 = checkReminders([
  {
    action: 'attend',
    object: 'conference',
    deadline: getTodayAtMidnight(),
  },
]);
console.log('Input: Today task');
console.log('Output:', result18[0]);
console.log('Format: "Reminder: [action] [object] today"');
console.log('Pass:', result18[0].startsWith('Reminder:') && result18[0].includes('attend') && result18[0].includes('conference') && result18[0].endsWith('today'));
console.log('---\n');

// Test 19: Exactly at midnight (today vs tomorrow boundary)
console.log('Test 19: Exact midnight boundary');
const midnight = new Date();
midnight.setHours(0, 0, 0, 0);
const result19 = checkReminders([
  {
    action: 'finalize',
    object: 'report',
    deadline: midnight,
  },
]);
console.log('Input: Task with deadline exactly at today midnight');
console.log('Output:', result19);
console.log('Expected: Reminder for today');
console.log('Pass:', result19[0]?.includes('Reminder') && result19[0]?.includes('today'));
console.log('---\n');

// Test 20: Completed task should still generate reminder
console.log('Test 20: Completed task still generates reminder');
const result20 = checkReminders([
  {
    action: 'send',
    object: 'email',
    deadline: createDateAtMidnight(-1),
    status: 'completed', // even though completed
  },
]);
console.log('Input: Completed task with past deadline');
console.log('Output:', result20);
console.log('Expected: Reminder still generated');
console.log('Pass:', result20.length === 1 && result20[0].includes('You missed'));
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
