// Test if imports are working correctly

console.log('Testing imports...\n');

try {
  const detectCommitments = require('./src/utils/commitmentDetector');
  console.log('✅ detectCommitments imported:', typeof detectCommitments);
  
  const result = detectCommitments('I will submit the report tomorrow');
  console.log('✅ detectCommitments result:', result);
  console.log('   Length:', result ? result.length : 'undefined');
} catch (err) {
  console.error('❌ Error with detectCommitments:', err.message);
}

try {
  const extractTask = require('./src/utils/taskExtractor');
  console.log('\n✅ extractTask imported:', typeof extractTask);
  
  const result = extractTask('i will submit the report tomorrow');
  console.log('✅ extractTask result:', result);
} catch (err) {
  console.error('❌ Error with extractTask:', err.message);
}

try {
  const convertToDeadline = require('./src/utils/deadlineConverter');
  console.log('\n✅ convertToDeadline imported:', typeof convertToDeadline);
  
  const result = convertToDeadline('tomorrow');
  console.log('✅ convertToDeadline result:', result);
} catch (err) {
  console.error('❌ Error with convertToDeadline:', err.message);
}

try {
  const { addTaskAPI } = require('./src/utils/taskStorageAPI');
  console.log('\n✅ taskStorageAPI imported, addTaskAPI:', typeof addTaskAPI);
} catch (err) {
  console.error('❌ Error with taskStorageAPI:', err.message);
}
