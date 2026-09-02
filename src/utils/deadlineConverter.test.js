/**
 * Test cases for convertToDeadline function
 */

import convertToDeadline from './deadlineConverter.js';

console.log('=== CONVERT TO DEADLINE FUNCTION TESTS ===\n');

// Helper function to get today's date at midnight
function getTodayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper function to check if two dates are the same (ignoring time)
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

// Test 1: "today"
console.log('Test 1: Input "today"');
const test1 = convertToDeadline('today');
const today = getTodayAtMidnight();
console.log('Input: "today"');
console.log('Output:', test1.toString());
console.log('Expected: Current date at midnight');
console.log('Pass:', isSameDay(test1, today));
console.log('---\n');

// Test 2: "tomorrow"
console.log('Test 2: Input "tomorrow"');
const test2 = convertToDeadline('tomorrow');
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
console.log('Input: "tomorrow"');
console.log('Output:', test2.toString());
console.log('Expected: Tomorrow\'s date at midnight');
console.log('Pass:', isSameDay(test2, tomorrow));
console.log('---\n');

// Test 3: undefined (default)
console.log('Test 3: Input undefined (default)');
const test3 = convertToDeadline(undefined);
const twoDaysLater = new Date(today);
twoDaysLater.setDate(twoDaysLater.getDate() + 2);
console.log('Input: undefined');
console.log('Output:', test3.toString());
console.log('Expected: Date 2 days from now at midnight');
console.log('Pass:', isSameDay(test3, twoDaysLater));
console.log('---\n');

// Test 4: No argument (also default)
console.log('Test 4: No argument (default)');
const test4 = convertToDeadline();
console.log('Input: (no argument)');
console.log('Output:', test4.toString());
console.log('Expected: Date 2 days from now at midnight');
console.log('Pass:', isSameDay(test4, twoDaysLater));
console.log('---\n');

// Test 5: Null input (default)
console.log('Test 5: Null input (default)');
const test5 = convertToDeadline(null);
console.log('Input: null');
console.log('Output:', test5.toString());
console.log('Expected: Date 2 days from now at midnight');
console.log('Pass:', isSameDay(test5, twoDaysLater));
console.log('---\n');

// Test 6: Invalid string (default)
console.log('Test 6: Invalid string (default)');
const test6 = convertToDeadline('next week');
console.log('Input: "next week"');
console.log('Output:', test6.toString());
console.log('Expected: Date 2 days from now at midnight (default)');
console.log('Pass:', isSameDay(test6, twoDaysLater));
console.log('---\n');

// Test 7: Case sensitivity - uppercase "TODAY"
console.log('Test 7: Case sensitivity - "TODAY" (uppercase)');
const test7 = convertToDeadline('TODAY');
console.log('Input: "TODAY"');
console.log('Output:', test7.toString());
console.log('Expected: Date 2 days from now (case sensitive, so default)');
console.log('Pass:', isSameDay(test7, twoDaysLater));
console.log('---\n');

// Test 8: Case sensitivity - lowercase "today"
console.log('Test 8: Case sensitivity - "today" (lowercase)');
const test8 = convertToDeadline('today');
console.log('Input: "today"');
console.log('Output:', test8.toString());
console.log('Expected: Current date at midnight');
console.log('Pass:', isSameDay(test8, today));
console.log('---\n');

// Test 9: Time is always set to midnight (00:00:00)
console.log('Test 9: Time is always set to midnight');
const test9 = convertToDeadline('today');
console.log('Input: "today"');
console.log('Hours:', test9.getHours(), 'Minutes:', test9.getMinutes(), 'Seconds:', test9.getSeconds());
console.log('Expected: 0 0 0');
console.log('Pass:', test9.getHours() === 0 && test9.getMinutes() === 0 && test9.getSeconds() === 0);
console.log('---\n');

// Test 10: Verify return type is Date object
console.log('Test 10: Return type is Date object');
const test10 = convertToDeadline('tomorrow');
console.log('Input: "tomorrow"');
console.log('Is Date:', test10 instanceof Date);
console.log('Has getDate method:', typeof test10.getDate === 'function');
console.log('Pass:', test10 instanceof Date);
console.log('---\n');

// Test 11: Day boundary - "today" should be same day even if called later
console.log('Test 11: Verify date consistency');
const test11a = convertToDeadline('today');
const test11b = convertToDeadline('today');
console.log('Two calls to convertToDeadline("today")');
console.log('Same day:', isSameDay(test11a, test11b));
console.log('Pass:', isSameDay(test11a, test11b));
console.log('---\n');

// Test 12: "tomorrow" is exactly 1 day ahead
console.log('Test 12: "tomorrow" is exactly 1 day ahead');
const test12today = convertToDeadline('today');
const test12tomorrow = convertToDeadline('tomorrow');
const dayDifference = (test12tomorrow - test12today) / (1000 * 60 * 60 * 24);
console.log('Input: "today" vs "tomorrow"');
console.log('Day difference:', dayDifference, 'days');
console.log('Expected: 1 day');
console.log('Pass:', Math.abs(dayDifference - 1) < 0.001);
console.log('---\n');

// Test 13: Default is exactly 2 days ahead
console.log('Test 13: Default is exactly 2 days ahead');
const test13today = convertToDeadline('today');
const test13default = convertToDeadline();
const dayDifference13 = (test13default - test13today) / (1000 * 60 * 60 * 24);
console.log('Input: "today" vs undefined');
console.log('Day difference:', dayDifference13, 'days');
console.log('Expected: 2 days');
console.log('Pass:', Math.abs(dayDifference13 - 2) < 0.001);
console.log('---\n');

// Test 14: Empty string (default)
console.log('Test 14: Empty string (default)');
const test14 = convertToDeadline('');
console.log('Input: ""');
console.log('Output:', test14.toString());
console.log('Expected: Date 2 days from now at midnight');
console.log('Pass:', isSameDay(test14, twoDaysLater));
console.log('---\n');

// Test 15: Whitespace around input (should not match)
console.log('Test 15: Whitespace - " today " (should not match)');
const test15 = convertToDeadline(' today ');
console.log('Input: " today "');
console.log('Output:', test15.toString());
console.log('Expected: Date 2 days from now (case and whitespace sensitive)');
console.log('Pass:', isSameDay(test15, twoDaysLater));
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
