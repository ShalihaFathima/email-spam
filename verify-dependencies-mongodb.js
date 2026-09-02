/**
 * VERIFY: Check MongoDB for saved dependencies
 */

const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/email-spam-db';

// Define Task schema
const taskSchema = new mongoose.Schema({
  taskId: String,
  userId: String,
  action: String,
  object: String,
  deadline: Date,
  status: String,
  section: String,
  blockedBy: [String],
  sourceEmail: {
    sender: String,
    subject: String
  }
});

const Task = mongoose.model('Task', taskSchema);

async function verifyDependencies() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  VERIFYING DEPENDENCIES IN MONGODB');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all tasks
    const tasks = await Task.find({}).sort({ _id: -1 }).limit(15);

    console.log(`📊 Found ${tasks.length} recent tasks:\n`);

    // Group by sourceEmail
    const byEmail = {};
    tasks.forEach(task => {
      const emailKey = task.sourceEmail?.subject || 'Unknown';
      if (!byEmail[emailKey]) {
        byEmail[emailKey] = [];
      }
      byEmail[emailKey].push(task);
    });

    // Display tasks organized by email
    Object.entries(byEmail).forEach(([emailSubject, emailTasks]) => {
      console.log(`\n📧 EMAIL: "${emailSubject}"\n`);
      console.log(`   Total tasks: ${emailTasks.length}\n`);

      emailTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.object}`);
        console.log(`      Task ID: ${task.taskId}`);
        console.log(`      Status: ${task.status}`);
        console.log(`      Deadline: ${task.deadline ? task.deadline.toLocaleDateString() : 'Not set'}`);

        if (task.blockedBy && task.blockedBy.length > 0) {
          console.log(`      ⬅️  Blocked by: ${task.blockedBy.length} task(s)`);
          task.blockedBy.forEach(blockerId => {
            const blockerTask = emailTasks.find(t => t.taskId === blockerId);
            if (blockerTask) {
              console.log(`         • ${blockerTask.object}`);
            } else {
              console.log(`         • Task ID: ${blockerId}`);
            }
          });
        } else {
          console.log(`      ✓ No blockers (can start immediately)`);
        }
        console.log('');
      });

      // Count dependencies
      const tasksWithDeps = emailTasks.filter(t => t.blockedBy && t.blockedBy.length > 0);
      const totalDeps = emailTasks.reduce((sum, t) => sum + (t.blockedBy ? t.blockedBy.length : 0), 0);

      console.log(`\n   📊 DEPENDENCY SUMMARY:`);
      console.log(`      Tasks with dependencies: ${tasksWithDeps.length}`);
      console.log(`      Total dependency links: ${totalDeps}\n`);
    });

    // Show ready tasks (no blockers)
    console.log('\n═'.repeat(70));
    console.log('\n🚀 READY TO START (No Blockers):\n');

    const readyTasks = tasks.filter(t => !t.blockedBy || t.blockedBy.length === 0);
    readyTasks.forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.object}`);
    });

    console.log(`\n   Total: ${readyTasks.length} task(s) ready to start\n`);

    // Show blocked tasks
    console.log('═'.repeat(70));
    console.log('\n⏸️  BLOCKED (Waiting for Dependencies):\n');

    const blockedTasks = tasks.filter(t => t.blockedBy && t.blockedBy.length > 0);
    blockedTasks.forEach((task, i) => {
      console.log(`   ${i + 1}. ${task.object}`);
      console.log(`      ⬅️  Waiting on ${task.blockedBy.length} task(s)\n`);
    });

    console.log(`   Total: ${blockedTasks.length} task(s) blocked\n`);

    console.log('═'.repeat(70) + '\n');

    console.log('✅ VERIFICATION COMPLETE!\n');
    console.log(`Summary:`);
    console.log(`  • Total tasks in database: ${tasks.length}`);
    console.log(`  • Tasks with dependencies: ${blockedTasks.length}`);
    console.log(`  • Ready to start: ${readyTasks.length}`);
    console.log(`  • Total dependency links: ${blockedTasks.reduce((sum, t) => sum + t.blockedBy.length, 0)}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');
  }
}

verifyDependencies();
