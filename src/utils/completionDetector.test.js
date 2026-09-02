/**
 * Test cases for detectCompletion function
 */

import detectCompletion from './completionDetector.js';

console.log('=== DETECT COMPLETION FUNCTION TESTS ===\n');

// Helper function to create test tasks
function createTask(action, object, status = 'pending') {
  return {
    action,
    object,
    deadline: new Date(),
    status,
  };
}

// Test 1: Single task completed with "done"
console.log('Test 1: Single task completed with "done"');
const tasks1 = [createTask('send', 'report', 'pending')];
const email1 = 'Done! Here is the report.';
const result1 = detectCompletion(email1, tasks1);
console.log('Email:', email1);
console.log('Input task:', tasks1[0]);
console.log('Result status:', result1[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result1[0].status === 'completed');
console.log('---\n');

// Test 2: Single task completed with "completed"
console.log('Test 2: Single task completed with "completed"');
const tasks2 = [createTask('call', 'client', 'pending')];
const email2 = 'I have completed the client call.';
const result2 = detectCompletion(email2, tasks2);
console.log('Email:', email2);
console.log('Result status:', result2[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result2[0].status === 'completed');
console.log('---\n');

// Test 3: Single task completed with "here is"
console.log('Test 3: Single task completed with "here is"');
const tasks3 = [createTask('send', 'presentation', 'pending')];
const email3 = 'Here is the presentation file you asked for.';
const result3 = detectCompletion(email3, tasks3);
console.log('Email:', email3);
console.log('Result status:', result3[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result3[0].status === 'completed');
console.log('---\n');

// Test 4: No completion indicator - status unchanged
console.log('Test 4: No completion indicator');
const tasks4 = [createTask('send', 'report', 'pending')];
const email4 = 'I will try to send the report soon.';
const result4 = detectCompletion(email4, tasks4);
console.log('Email:', email4);
console.log('Result status:', result4[0].status);
console.log('Expected: "pending" (unchanged)');
console.log('Pass:', result4[0].status === 'pending');
console.log('---\n');

// Test 5: Object not in email - not matched
console.log('Test 5: Completion indicator but object not in email');
const tasks5 = [createTask('send', 'email', 'pending')];
const email5 = 'Done with the report!';
const result5 = detectCompletion(email5, tasks5);
console.log('Email:', email5);
console.log('Task object: "email"');
console.log('Result status:', result5[0].status);
console.log('Expected: "pending" (object not mentioned)');
console.log('Pass:', result5[0].status === 'pending');
console.log('---\n');

// Test 6: Empty email
console.log('Test 6: Empty email');
const tasks6 = [createTask('send', 'report', 'pending')];
const email6 = '';
const result6 = detectCompletion(email6, tasks6);
console.log('Email: ""');
console.log('Result status:', result6[0].status);
console.log('Expected: "pending"');
console.log('Pass:', result6[0].status === 'pending');
console.log('---\n');

// Test 7: Null email
console.log('Test 7: Null email');
const tasks7 = [createTask('send', 'report', 'pending')];
const result7 = detectCompletion(null, tasks7);
console.log('Email: null');
console.log('Result:', result7);
console.log('Expected: Original tasks unchanged');
console.log('Pass:', result7[0].status === 'pending');
console.log('---\n');

// Test 8: Undefined email
console.log('Test 8: Undefined email');
const tasks8 = [createTask('send', 'report', 'pending')];
const result8 = detectCompletion(undefined, tasks8);
console.log('Email: undefined');
console.log('Result:', result8);
console.log('Expected: Original tasks unchanged');
console.log('Pass:', result8[0].status === 'pending');
console.log('---\n');

// Test 9: Null tasks array
console.log('Test 9: Null tasks array');
const email9 = 'Done! Here is the report.';
const result9 = detectCompletion(email9, null);
console.log('Tasks: null');
console.log('Result:', result9);
console.log('Expected: []');
console.log('Pass:', Array.isArray(result9) && result9.length === 0);
console.log('---\n');

// Test 10: Empty tasks array
console.log('Test 10: Empty tasks array');
const email10 = 'Done! Here is the report.';
const result10 = detectCompletion(email10, []);
console.log('Tasks: []');
console.log('Result:', result10);
console.log('Expected: []');
console.log('Pass:', Array.isArray(result10) && result10.length === 0);
console.log('---\n');

// Test 11: Multiple tasks, multiple matches
console.log('Test 11: Multiple tasks with multiple matches');
const tasks11 = [
  createTask('send', 'report', 'pending'),
  createTask('call', 'client', 'pending'),
  createTask('attend', 'meeting', 'pending'),
];
const email11 = 'Done! Here is the report and I completed the client call.';
const result11 = detectCompletion(email11, tasks11);
console.log('Email:', email11);
console.log('Task 1 (report):', result11[0].status);
console.log('Task 2 (client):', result11[1].status);
console.log('Task 3 (meeting):', result11[2].status);
console.log('Expected: report-completed, client-completed, meeting-pending');
console.log('Pass:', result11[0].status === 'completed' && result11[1].status === 'completed' && result11[2].status === 'pending');
console.log('---\n');

// Test 12: Case insensitivity
console.log('Test 12: Case insensitivity');
const tasks12 = [createTask('send', 'REPORT', 'pending')];
const email12 = 'Done! Here is the report.';
const result12 = detectCompletion(email12, tasks12);
console.log('Email:', email12);
console.log('Task object: "REPORT"');
console.log('Result status:', result12[0].status);
console.log('Expected: "completed" (case insensitive)');
console.log('Pass:', result12[0].status === 'completed');
console.log('---\n');

// Test 13: Multi-word object matching
console.log('Test 13: Multi-word object matching');
const tasks13 = [createTask('send', 'final report', 'pending')];
const email13 = 'Done! Here is the final report you requested.';
const result13 = detectCompletion(email13, tasks13);
console.log('Email:', email13);
console.log('Task object: "final report"');
console.log('Result status:', result13[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result13[0].status === 'completed');
console.log('---\n');

// Test 14: No mutation of original tasks
console.log('Test 14: Original tasks not mutated');
const tasks14 = [createTask('send', 'report', 'pending')];
const email14 = 'Done! Here is the report.';
const originalStatus = tasks14[0].status;
const result14 = detectCompletion(email14, tasks14);
console.log('Original task status after detectCompletion:', tasks14[0].status);
console.log('Result task status:', result14[0].status);
console.log('Original unchanged:', tasks14[0].status === originalStatus);
console.log('Pass:', tasks14[0].status === 'pending' && result14[0].status === 'completed');
console.log('---\n');

// Test 15: Already completed task stays completed
console.log('Test 15: Already completed task stays completed');
const tasks15 = [createTask('send', 'report', 'completed')];
const email15 = 'Done! Here is the report.';
const result15 = detectCompletion(email15, tasks15);
console.log('Email:', email15);
console.log('Input status: "completed"');
console.log('Result status:', result15[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result15[0].status === 'completed');
console.log('---\n');

// Test 16: Partial object match (word boundary)
console.log('Test 16: Partial object matching');
const tasks16 = [createTask('send', 'report', 'pending')];
const email16 = 'Done! Here is the reporter information.';
const result16 = detectCompletion(email16, tasks16);
console.log('Email:', email16);
console.log('Task object: "report"');
console.log('Email contains "reporter" (partial match)');
console.log('Result status:', result16[0].status);
console.log('Expected: "completed" (contains substring)');
console.log('Pass:', result16[0].status === 'completed');
console.log('---\n');

// Test 17: All three completion keywords
console.log('Test 17: All three completion keywords');
const tasks17 = [
  createTask('send', 'email', 'pending'),
  createTask('call', 'manager', 'pending'),
  createTask('review', 'proposal', 'pending'),
];
const email17 = 'Done with the email. Completed the manager call. Here is the proposal review.';
const result17 = detectCompletion(email17, tasks17);
console.log('Email has all three keywords');
console.log('Results:',
  result17[0].status,
  result17[1].status,
  result17[2].status
);
console.log('Expected: completed, completed, completed');
console.log('Pass:', result17.every(task => task.status === 'completed'));
console.log('---\n');

// Test 18: Mixed case keywords
console.log('Test 18: Mixed case keywords');
const tasks18 = [
  createTask('send', 'report', 'pending'),
  createTask('call', 'client', 'pending'),
];
const email18 = 'DONE with report. Completed the client call.';
const result18 = detectCompletion(email18, tasks18);
console.log('Email: "DONE with report. Completed the client call."');
console.log('Result 1:', result18[0].status);
console.log('Result 2:', result18[1].status);
console.log('Expected: completed, completed');
console.log('Pass:', result18[0].status === 'completed' && result18[1].status === 'completed');
console.log('---\n');

// Test 19: Task without object property
console.log('Test 19: Task without object property');
const tasks19 = [{ action: 'send', status: 'pending' }]; // missing object
const email19 = 'Done!';
const result19 = detectCompletion(email19, tasks19);
console.log('Task missing object property');
console.log('Result:', result19);
console.log('Expected: Tasks returned unchanged');
console.log('Pass:', result19[0].status === 'pending');
console.log('---\n');

// Test 20: Large email and tasks
console.log('Test 20: Large email with many tasks');
const tasks20 = [];
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    tasks20.push(createTask('action' + i, 'object' + i, 'pending'));
  } else {
    tasks20.push(createTask('action' + i, 'object' + i, 'pending'));
  }
}
const email20 = 'Done with object0, object2, object4! Here is object6 and object8. Completed object1 and object3.';
const result20 = detectCompletion(email20, tasks20);
const completedCount = result20.filter(t => t.status === 'completed').length;
console.log('Tasks: 10');
console.log('Completed count:', completedCount);
console.log('Expected: > 0');
console.log('Pass:', completedCount > 0);
console.log('---\n');

// Test 21: Numeric string in object
console.log('Test 21: Numeric values in object');
const tasks21 = [createTask('send', 'doc123', 'pending')];
const email21 = 'Done! Here is the doc123 file.';
const result21 = detectCompletion(email21, tasks21);
console.log('Task object: "doc123"');
console.log('Email:', email21);
console.log('Result status:', result21[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result21[0].status === 'completed');
console.log('---\n');

// Test 22: Special characters in object
console.log('Test 22: Special characters in object');
const tasks22 = [createTask('send', 'file-v2.0', 'pending')];
const email22 = 'Done! Here is the file-v2.0 document.';
const result22 = detectCompletion(email22, tasks22);
console.log('Task object: "file-v2.0"');
console.log('Email:', email22);
console.log('Result status:', result22[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result22[0].status === 'completed');
console.log('---\n');

// Test 23: Completion keyword at end of email
console.log('Test 23: Completion keyword at end');
const tasks23 = [createTask('send', 'report', 'pending')];
const email23 = 'Here is the report. All done!';
const result23 = detectCompletion(email23, tasks23);
console.log('Email:', email23);
console.log('Result status:', result23[0].status);
console.log('Expected: "completed"');
console.log('Pass:', result23[0].status === 'completed');
console.log('---\n');

// Test 24: Null task in array
console.log('Test 24: Null task in array');
const tasks24 = [
  createTask('send', 'report', 'pending'),
  null,
  createTask('call', 'client', 'pending'),
];
const email24 = 'Done! Here is the report and client call.';
const result24 = detectCompletion(email24, tasks24);
console.log('Tasks array has null');
console.log('Result count:', result24.length);
console.log('Result 1 status:', result24[0].status);
console.log('Result 3 status:', result24[2].status);
console.log('Pass:', result24[0].status === 'completed' && result24[2].status === 'completed');
console.log('---\n');

console.log('=== TEST SUITE COMPLETE ===');
