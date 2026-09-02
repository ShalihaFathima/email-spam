/**
 * Test cases for the complete Commitment Management System
 */

import {
  runCommitmentSystem,
  processMultipleEmails,
  getUserTaskOverview,
} from './commitmentSystem.js';
import { clearUserTasks } from './taskStorage.js';

console.log('=== COMMITMENT MANAGEMENT SYSTEM TESTS ===\n');

// Test 1: Basic workflow - commitment detection through reminder
console.log('Test 1: Complete workflow (commitment → task → reminder)');
clearUserTasks(1); // Clean start
const result1 = await runCommitmentSystem(
  "I will send the report today. Let me prepare it.",
  1
);
console.log('Input: "I will send the report today. Let me prepare it."');
console.log('Result:');
console.log('  Pending tasks:', result1.pending.length);
console.log('  Completed tasks:', result1.completed.length);
console.log('  Reminders:', result1.reminders);
console.log('  New tasks:', result1.stats.newTasks);
console.log('Expected: 2 pending tasks, reminders generated');
console.log('Pass:', result1.pending.length >= 2 && result1.reminders.length > 0);
console.log('---\n');

// Test 2: Completion detection
console.log('Test 2: Commitment → Task → Completion');
clearUserTasks(2);
const result2a = await runCommitmentSystem(
  "I promise to call the client today.",
  2
);
console.log('Email 1: "I promise to call the client today."');
console.log('Pending after email 1:', result2a.pending.length);

const result2b = await runCommitmentSystem(
  "Done! I completed the client call.",
  2
);
console.log('Email 2: "Done! I completed the client call."');
console.log('Pending after email 2:', result2b.pending.length);
console.log('Completed:', result2b.completed.length);
console.log('Expected: 1 completed task');
console.log('Pass:', result2b.completed.length >= 1);
console.log('---\n');

// Test 3: Multiple commitments
console.log('Test 3: Multiple commitments in one email');
clearUserTasks(3);
const result3 = await runCommitmentSystem(
  "I will submit the proposal today. I'll review the code tomorrow. Let me also prepare the presentation.",
  3
);
console.log('Input: 3 commitments');
console.log('New tasks:', result3.stats.newTasks);
console.log('Total tasks:', result3.stats.totalTasks);
console.log('Expected: Multiple tasks created');
console.log('Pass:', result3.stats.newTasks > 1);
console.log('---\n');

// Test 4: Null/empty input handling
console.log('Test 4: Empty email input');
const result4 = await runCommitmentSystem('', 4);
console.log('Input: ""');
console.log('Result:', result4);
console.log('Expected: Safe return with no errors');
console.log('Pass:', result4.error === 'Invalid email text' || result4.stats.newTasks === 0);
console.log('---\n');

// Test 5: No commitments in email
console.log('Test 5: Email with no commitments');
clearUserTasks(5);
const result5 = await runCommitmentSystem(
  "This is just a regular email with no promises.",
  5
);
console.log('Input: Regular email (no commitments)');
console.log('New tasks:', result5.stats.newTasks);
console.log('Expected: 0 new tasks');
console.log('Pass:', result5.stats.newTasks === 0);
console.log('---\n');

// Test 6: Return object structure
console.log('Test 6: Return object structure validation');
clearUserTasks(6);
const result6 = await runCommitmentSystem(
  "I will send the email today.",
  6
);
console.log('Input: Simple commitment');
console.log('Has pending:', Array.isArray(result6.pending));
console.log('Has completed:', Array.isArray(result6.completed));
console.log('Has reminders:', Array.isArray(result6.reminders));
console.log('Has stats:', result6.stats !== undefined);
console.log('Stats has newTasks:', result6.stats.newTasks !== undefined);
console.log('Expected: All fields present');
console.log('Pass:',
  Array.isArray(result6.pending) &&
  Array.isArray(result6.completed) &&
  Array.isArray(result6.reminders) &&
  result6.stats !== undefined
);
console.log('---\n');

// Test 7: Task deadline conversion
console.log('Test 7: Task deadline correctly set');
clearUserTasks(7);
const result7 = await runCommitmentSystem(
  "I will finish tomorrow.",
  7
);
console.log('Input: "I will finish tomorrow"');
console.log('Pending tasks:', result7.pending.length);
if (result7.pending.length > 0) {
  const taskDeadline = new Date(result7.pending[0].deadline);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isTomorrow = taskDeadline.toDateString() === tomorrow.toDateString();
  console.log('Deadline is tomorrow:', isTomorrow);
  console.log('Pass:', isTomorrow);
} else {
  console.log('Pass: false (no tasks created)');
}
console.log('---\n');

// Test 8: User isolation
console.log('Test 8: User isolation (different users)');
clearUserTasks(10); clearUserTasks(11);
const result8a = await runCommitmentSystem(
  "I will send email.",
  10
);
const result8b = await runCommitmentSystem(
  "I will send report.",
  11
);
console.log('User 10 tasks:', result8a.stats.totalTasks);
console.log('User 11 tasks:', result8b.stats.totalTasks);
console.log('Expected: Separate task lists');
console.log('Pass:', result8a.pending[0]?.object !== result8b.pending[0]?.object);
console.log('---\n');

// Test 9: Process multiple emails
console.log('Test 9: Process multiple emails');
clearUserTasks(20); clearUserTasks(21); clearUserTasks(22);
const multiResult = await processMultipleEmails([
  { text: 'I will send email.', userId: 20 },
  { text: 'I promise to call.', userId: 21 },
  { text: 'Let me review code.', userId: 22 },
]);
console.log('Input: 3 emails for 3 users');
console.log('Results count:', multiResult.length);
console.log('Total new tasks:', multiResult.reduce((sum, r) => sum + r.stats.newTasks, 0));
console.log('Expected: 3 results, tasks created');
console.log('Pass:', multiResult.length === 3 && multiResult.reduce((sum, r) => sum + r.stats.newTasks, 0) > 0);
console.log('---\n');

// Test 10: Get user task overview
console.log('Test 10: Get user task overview');
clearUserTasks(30);
await runCommitmentSystem("I will send report today.", 30);
await runCommitmentSystem("Done with report!", 30);
const overview = getUserTaskOverview(30);
console.log('After adding task and completing it');
console.log('Overview pending:', overview.pending.length);
console.log('Overview completed:', overview.completed.length);
console.log('Overview reminders:', overview.reminders.length);
console.log('Expected: Task visible in completed or pending');
console.log('Pass:', overview.pending.length > 0 || overview.completed.length > 0);
console.log('---\n');

// Test 11: Today's deadline generates reminder
console.log('Test 11: Today deadline generates reminder');
clearUserTasks(31);
const result11 = await runCommitmentSystem(
  "I will complete task today.",
  31
);
console.log('Reminders generated:', result11.reminders.length);
console.log('Has "today" reminder:', result11.reminders.some(r => r.includes('today')));
console.log('Expected: Reminder with "today"');
console.log('Pass:', result11.reminders.some(r => r.includes('today')));
console.log('---\n');

// Test 12: Modular functions still work independently
console.log('Test 12: Individual functions still work (not broken)');
// Import the individual utility functions
import dcModule from './commitmentDetector.js';
import etModule from './taskExtractor.js';
const commitments = dcModule("I will send email.");
const extracted = etModule("i will send email");
console.log('detectCommitments works:', commitments.length > 0);
console.log('extractTask works:', extracted !== null);
console.log('Expected: Both functions independent');
console.log('Pass:', commitments.length > 0 && extracted !== null);
console.log('---\n');

// Test 13: Complex email workflow
console.log('Test 13: Complex multi-step workflow');
clearUserTasks(40);
const complex1 = await runCommitmentSystem(
  "I will send quarterly report. I promise to attend meeting tomorrow. Let me also prepare presentation.",
  40
);
console.log('Email 1: Added 3 tasks');
console.log('Tasks:', complex1.stats.totalTasks);

const complex2 = await runCommitmentSystem(
  "Done! Here is the quarterly report. I completed the presentation.",
  40
);
console.log('Email 2: Completed 2 tasks');
console.log('Pending:', complex2.pending.length);
console.log('Completed:', complex2.completed.length);
console.log('Expected: 1 pending, 2+ completed');
console.log('Pass:', complex2.completed.length >= 1);
console.log('---\n');

// Test 14: Email with all keyword types
console.log('Test 14: All completion keywords');
clearUserTasks(41);
await runCommitmentSystem("I will task1. I'll task2. I promise to task3. Let me task4.", 41);
const allKeywords = await runCommitmentSystem(
  "Done with task1. Completed task2. Here is task3 task4.",
  41
);
console.log('After completion keywords');
console.log('Completed tasks:', allKeywords.completed.length);
console.log('Expected: Multiple tasks completed');
console.log('Pass:', allKeywords.completed.length >= 1);
console.log('---\n');

// Test 15: Return structure consistency
console.log('Test 15: Return structure consistency across calls');
clearUserTasks(50); clearUserTasks(51);
const struct1 = await runCommitmentSystem("I will send email.", 50);
const struct2 = await runCommitmentSystem("Regular email.", 51);
const hasConsistentStructure =
  typeof struct1.pending === typeof struct2.pending &&
  typeof struct1.completed === typeof struct2.completed &&
  typeof struct1.reminders === typeof struct2.reminders &&
  typeof struct1.stats === typeof struct2.stats;

console.log('Structure 1 keys:', Object.keys(struct1));
console.log('Structure 2 keys:', Object.keys(struct2));
console.log('Consistent structure:', hasConsistentStructure);
console.log('Pass:', hasConsistentStructure);
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
