/**
 * Test cases for detectCommitments function
 */

import detectCommitments from './commitmentDetector.js';

// Test 1: Basic example from requirements
console.log('Test 1: Basic example');
const test1 = detectCommitments("I will send the report tomorrow. Let's meet later.");
console.log('Input: "I will send the report tomorrow. Let\'s meet later."');
console.log('Output:', test1);
console.log('Expected: ["i will send the report tomorrow"]');
console.log('Pass:', JSON.stringify(test1) === JSON.stringify(["i will send the report tomorrow"]));
console.log('---\n');

// Test 2: Multiple commitments
console.log('Test 2: Multiple commitments');
const test2 = detectCommitments("I will finish this today. Then I'll handle the emails. I promise to call you back.");
console.log('Input: "I will finish this today. Then I\'ll handle the emails. I promise to call you back."');
console.log('Output:', test2);
console.log('Expected: ["i will finish this today", "then i\'ll handle the emails", "i promise to call you back"]');
console.log('---\n');

// Test 3: "Let me" commitment
console.log('Test 3: "Let me" commitment');
const test3 = detectCommitments("Let me check this first. We can proceed later.");
console.log('Input: "Let me check this first. We can proceed later."');
console.log('Output:', test3);
console.log('Expected: ["let me check this first"]');
console.log('Pass:', JSON.stringify(test3) === JSON.stringify(["let me check this first"]));
console.log('---\n');

// Test 4: Empty input
console.log('Test 4: Empty input');
const test4 = detectCommitments("");
console.log('Input: ""');
console.log('Output:', test4);
console.log('Expected: []');
console.log('Pass:', JSON.stringify(test4) === JSON.stringify([]));
console.log('---\n');

// Test 5: No commitments
console.log('Test 5: No commitments');
const test5 = detectCommitments("This is a regular email. How are you doing?");
console.log('Input: "This is a regular email. How are you doing?"');
console.log('Output:', test5);
console.log('Expected: []');
console.log('Pass:', JSON.stringify(test5) === JSON.stringify([]));
console.log('---\n');

// Test 6: Null input
console.log('Test 6: Null input');
const test6 = detectCommitments(null);
console.log('Input: null');
console.log('Output:', test6);
console.log('Expected: []');
console.log('Pass:', JSON.stringify(test6) === JSON.stringify([]));
console.log('---\n');

// Test 7: Mixed case with commitments
console.log('Test 7: Mixed case with commitments');
const test7 = detectCommitments("I WILL handle this. Let me know if you need help. I'LL send confirmation.");
console.log('Input: "I WILL handle this. Let me know if you need help. I\'LL send confirmation."');
console.log('Output:', test7);
console.log('---\n');

// Test 8: Sentences with extra spaces
console.log('Test 8: Sentences with extra spaces (trim check)');
const test8 = detectCommitments("  I will send it soon  .  Let me get back to you  .");
console.log('Input: "  I will send it soon  .  Let me get back to you  ."');
console.log('Output:', test8);
console.log('Expected trimmed sentences with no leading/trailing spaces');
console.log('---\n');

// Test 9: Commitment phrases in middle of sentence
console.log('Test 9: Commitment phrases in middle of text');
const test9 = detectCommitments("When I will be free is uncertain. Here let me explain my plan.");
console.log('Input: "When I will be free is uncertain. Here let me explain my plan."');
console.log('Output:', test9);
console.log('---\n');

// Test 10: All four commitment phrases
console.log('Test 10: All four commitment phrases');
const test10 = detectCommitments("I will help. I'll arrive soon. I promise to be on time. Let me assist you.");
console.log('Input: "I will help. I\'ll arrive soon. I promise to be on time. Let me assist you."');
console.log('Output:', test10);
console.log('Expected: All 4 commitment sentences');
