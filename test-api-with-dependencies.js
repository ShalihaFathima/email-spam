/**
 * TEST: End-to-End Dependency Detection with API
 * Tests saving tasks with dependencies to MongoDB
 */

const http = require('http');

// Simple test email with clear dependencies
const testEmail = {
  sender: 'manager@company.com',
  from: 'Manager',
  subject: 'Sprint 1: Development Tasks',
  body: `
Hi Team,

Please complete these tasks in order:

1. First, setup the development environment with Docker
2. Then, write the API endpoints specification
3. Once specification is approved, begin backend implementation
4. After backend is done, implement frontend components
5. Testing must be completed before deployment

Before going live:
- Make sure all tests pass
- Security audit is required for production

This is sequential work!

Thanks
  `
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  TEST: DEPENDENCY DETECTION WITH API ENDPOINT');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📧 TEST EMAIL:\n');
console.log(`  From: ${testEmail.from} (${testEmail.sender})`);
console.log(`  Subject: ${testEmail.subject}\n`);
console.log('Body:');
console.log(testEmail.body);

console.log('\n' + '─'.repeat(70) + '\n');
console.log('📡 Sending to: POST http://localhost:3001/api/check-email\n');

// Build request
const postData = JSON.stringify(testEmail);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/check-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make request
const req = http.request(options, (res) => {
  let data = '';

  console.log(`\n✅ Response Status: ${res.statusCode}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      console.log('📊 RESPONSE DATA:\n');

      if (response.success) {
        const d = response.data;

        console.log(`✅ Email Classification: ${d.classification.toUpperCase()}`);
        console.log(`   JS Score: ${d.jsScore}/10`);
        console.log(`   Confidence: ${d.confidence}%\n`);

        console.log(`📋 EXTRACTED TASKS:\n`);
        if (d.taskExtraction && d.taskExtraction.tasks && d.taskExtraction.tasks.length > 0) {
          d.taskExtraction.tasks.forEach((task, i) => {
            console.log(`   ${i + 1}. ${task.object}`);
            if (task.blockedBy.length > 0) {
              console.log(`      ⬅️  Blocked by: ${task.blockedBy.join(', ')}`);
            }
          });
        } else {
          console.log('   (No tasks extracted)');
        }

        console.log(`\n🔗 DEPENDENCY STATISTICS:\n`);
        console.log(`   Tasks Created: ${d.taskExtraction?.tasksCreated || 0}`);
        console.log(`   Dependencies Created: ${d.taskExtraction?.dependenciesCreated || 0}`);

        if (d.mlAnalysis) {
          console.log(`\n🤖 ML ANALYSIS:\n`);
          console.log(`   Used ML: ${d.mlAnalysis.used}`);
          console.log(`   Score Range: ${d.mlAnalysis.scoreRange}`);
          if (d.mlAnalysis.mlResult) {
            console.log(`   ML Prediction: ${d.mlAnalysis.mlResult.label}`);
            console.log(`   ML Confidence: ${d.mlAnalysis.mlResult.confidence}`);
          }
        }

        console.log(`\n📝 Message:`);
        console.log(`   ${d.message}`);

        console.log(`\n⏰ Timestamp: ${d.timestamp}`);
      } else {
        console.log(`❌ Error: ${response.error}`);
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }

    console.log('\n' + '═'.repeat(70) + '\n');
  });
});

req.on('error', (e) => {
  console.log(`\n❌ REQUEST ERROR: ${e.message}`);
  console.log(
    '\n⚠️  Make sure the server is running on port 3001!\n'
  );
  console.log('Start server with: node server.js\n');
});

req.write(postData);
req.end();
