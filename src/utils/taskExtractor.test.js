/**
 * Test cases for extractTask function
 */

import extractTask from './taskExtractor.js';

console.log('=== EXTRACT TASK FUNCTION TESTS ===\n');

// Test 1: Basic example with "today"
console.log('Test 1: Basic example with "today"');
const test1 = extractTask("I will send the report today");
console.log('Input: "I will send the report today"');
console.log('Output:', test1);
console.log('Expected: { action: "send", object: "the report", timeText: "today" }');
console.log('Pass:', test1?.action === 'send' && test1?.object === 'the report' && test1?.timeText === 'today');
console.log('---\n');

// Test 2: Basic example with "tomorrow"
console.log('Test 2: Basic example with "tomorrow"');
const test2 = extractTask("I will help you tomorrow");
console.log('Input: "I will help you tomorrow"');
console.log('Output:', test2);
console.log('Expected: { action: "help", object: "you", timeText: "tomorrow" }');
console.log('Pass:', test2?.action === 'help' && test2?.object === 'you' && test2?.timeText === 'tomorrow');
console.log('---\n');

// Test 3: No time text
console.log('Test 3: No time text');
const test3 = extractTask("I will complete the task");
console.log('Input: "I will complete the task"');
console.log('Output:', test3);
console.log('Expected: { action: "complete", object: "the task", timeText: null }');
console.log('Pass:', test3?.action === 'complete' && test3?.object === 'the task' && test3?.timeText === null);
console.log('---\n');

// Test 4: Multiple words in object
console.log('Test 4: Multiple words in object');
const test4 = extractTask("I will submit the final report today");
console.log('Input: "I will submit the final report today"');
console.log('Output:', test4);
console.log('Expected: { action: "submit", object: "the final report", timeText: "today" }');
console.log('Pass:', test4?.action === 'submit' && test4?.object === 'the final report' && test4?.timeText === 'today');
console.log('---\n');

// Test 5: No "will" - should return null
console.log('Test 5: No "will" - should return null');
const test5 = extractTask("I am sending the report");
console.log('Input: "I am sending the report"');
console.log('Output:', test5);
console.log('Expected: null');
console.log('Pass:', test5 === null);
console.log('---\n');

// Test 6: Empty input - should return null
console.log('Test 6: Empty input - should return null');
const test6 = extractTask("");
console.log('Input: ""');
console.log('Output:', test6);
console.log('Expected: null');
console.log('Pass:', test6 === null);
console.log('---\n');

// Test 7: Null input - should return null
console.log('Test 7: Null input - should return null');
const test7 = extractTask(null);
console.log('Input: null');
console.log('Output:', test7);
console.log('Expected: null');
console.log('Pass:', test7 === null);
console.log('---\n');

// Test 8: "will" at end of sentence - should return null
console.log('Test 8: "will" at end of sentence - should return null');
const test8 = extractTask("I will");
console.log('Input: "I will"');
console.log('Output:', test8);
console.log('Expected: null');
console.log('Pass:', test8 === null);
console.log('---\n');

// Test 9: Mixed case
console.log('Test 9: Mixed case');
const test9 = extractTask("I WILL SEND THE REPORT TODAY");
console.log('Input: "I WILL SEND THE REPORT TODAY"');
console.log('Output:', test9);
console.log('Expected: { action: "send", object: "the report", timeText: "today" }');
console.log('Pass:', test9?.action === 'send' && test9?.object === 'the report' && test9?.timeText === 'today');
console.log('---\n');

// Test 10: With extra spaces
console.log('Test 10: With extra spaces');
const test10 = extractTask("  I  will  send  the  report  tomorrow  ");
console.log('Input: "  I  will  send  the  report  tomorrow  "');
console.log('Output:', test10);
console.log('Expected: { action: "send", object: "the report", timeText: "tomorrow" }');
console.log('Pass:', test10?.action === 'send' && test10?.object === 'the report' && test10?.timeText === 'tomorrow');
console.log('---\n');

// Test 11: Action without object - should return null
console.log('Test 11: Action without object - should return null');
const test11 = extractTask("I will tomorrow");
console.log('Input: "I will tomorrow"');
console.log('Output:', test11);
console.log('Expected: null (no object after action)');
console.log('Pass:', test11 === null);
console.log('---\n');

// Test 12: Complex sentence with "will" in middle
console.log('Test 12: Complex sentence with "will" in middle');
const test12 = extractTask("Eventually I will process the applications today");
console.log('Input: "Eventually I will process the applications today"');
console.log('Output:', test12);
console.log('Expected: { action: "process", object: "the applications", timeText: "today" }');
console.log('Pass:', test12?.action === 'process' && test12?.object === 'the applications' && test12?.timeText === 'today');
console.log('---\n');

// Test 13: Neither "today" nor "tomorrow"
console.log('Test 13: Neither "today" nor "tomorrow"');
const test13 = extractTask("I will send the email next week");
console.log('Input: "I will send the email next week"');
console.log('Output:', test13);
console.log('Expected: { action: "send", object: "the email next week", timeText: null }');
console.log('Pass:', test13?.action === 'send' && test13?.object === 'the email next week' && test13?.timeText === null);
console.log('---\n');

// Test 14: Both "today" and "tomorrow" (should extract both in object or first timeText found)
console.log('Test 14: "today" appearing in object and timeText');
const test14 = extractTask("I will complete today\'s tasks today");
console.log('Input: "I will complete today\'s tasks today"');
console.log('Output:', test14);
console.log('Expected: timeText should be "today"');
console.log('timeText:', test14?.timeText);
console.log('---\n');

// Test 15: Type checking - number input
console.log('Test 15: Type checking - number input');
const test15 = extractTask(12345);
console.log('Input: 12345');
console.log('Output:', test15);
console.log('Expected: null');
console.log('Pass:', test15 === null);
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
