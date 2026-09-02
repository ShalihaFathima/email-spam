/**
 * DEMO: Task Completion Feature
 * Shows how to use the "Mark Complete" button to move tasks to completed section
 */

const http = require('http');

// Test task data
const testData = {
  // First, create tasks from an email
  email: {
    sender: 'manager@company.com',
    from: 'Manager',
    subject: 'Three Important Tasks',
    body: `
Hi Team,

Please complete these tasks:

1. First, prepare quarterly report
2. Then, review with stakeholders
3. Finally, submit to board

Thanks
    `
  },

  // Then mark one as complete
  completeRequest: {
    taskId: 'TO_BE_REPLACED', // This will be filled after email is sent
    status: 'completed'
  }
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('  DEMO: TASK COMPLETION FEATURE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Step 1: Send email to create tasks
console.log('📧 STEP 1: SENDING EMAIL TO CREATE TASKS...\n');

const postData = JSON.stringify(testData.email);

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

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.success && response.data.taskExtraction && response.data.taskExtraction.tasks) {
        const tasks = response.data.taskExtraction.tasks;
        console.log(`✅ EMAIL PROCESSED!\n`);
        console.log(`   Tasks Created: ${tasks.length}\n`);

        tasks.forEach((task, i) => {
          console.log(`   ${i + 1}. ${task.object}`);
          console.log(`      Task ID: ${task.taskId}`);
          console.log(`      Status: ${task.status}\n`);
        });

        // Step 2: Mark first task as complete
        if (tasks.length > 0) {
          const firstTaskId = tasks[0].taskId;

          console.log('═'.repeat(70));
          console.log('\n⏳ STEP 2: MARKING FIRST TASK AS COMPLETED...\n');
          console.log(`   Task: "${tasks[0].object}"`);
          console.log(`   Task ID: ${firstTaskId}\n`);

          const completeData = JSON.stringify({
            status: 'completed'
          });

          const completeOptions = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/tasks/${firstTaskId}`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(completeData)
            }
          };

          const completeReq = http.request(completeOptions, (completeRes) => {
            let completeResponseData = '';

            completeRes.on('data', (chunk) => {
              completeResponseData += chunk;
            });

            completeRes.on('end', () => {
              try {
                const completeResponse = JSON.parse(completeResponseData);

                if (completeResponse.success) {
                  console.log(`✅ TASK COMPLETED!\n`);
                  console.log(`   Task: "${completeResponse.task.object}"`);
                  console.log(`   New Status: ${completeResponse.task.status}`);
                  console.log(`   Updated At: ${completeResponse.task.updatedAt}\n`);

                  console.log('═'.repeat(70));
                  console.log('\n📊 FEATURE SUMMARY:\n');
                  console.log('✓ Button appears on PENDING tasks only');
                  console.log('✓ Click button to mark task as COMPLETED');
                  console.log('✓ Task automatically moves to COMPLETED section');
                  console.log('✓ Task status changes from "pending" to "completed"');
                  console.log('✓ Timestamp updated when task is completed');
                  console.log('✓ Remaining tasks stay in PENDING section\n');

                  console.log('═'.repeat(70));
                  console.log('\n🎯 HOW TO USE IN FRONTEND:\n');
                  console.log('1. See "Pending Tasks" section with tasks');
                  console.log('2. Each pending task has a green "Complete" button');
                  console.log('3. Click button to mark task as done');
                  console.log('4. Task moves to "Completed Tasks" section instantly');
                  console.log('5. Status updates in database\n');

                  console.log('═'.repeat(70) + '\n');
                } else {
                  console.log(`❌ Error: ${completeResponse.message}`);
                }
              } catch (e) {
                console.log('Error parsing response:', e.message);
              }
            });
          });

          completeReq.on('error', (e) => {
            console.log(`❌ REQUEST ERROR: ${e.message}`);
          });

          completeReq.write(completeData);
          completeReq.end();
        }
      } else {
        console.log('Error: No tasks created');
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.log(`\n❌ REQUEST ERROR: ${e.message}`);
  console.log('\n⚠️  Make sure the server is running on port 3001!\n');
  console.log('Start server with: node server.js\n');
});

req.write(postData);
req.end();
