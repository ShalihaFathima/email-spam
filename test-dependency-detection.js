/**
 * TEST: Dependency Detection System
 * 
 * Tests all dependency patterns and task extraction
 * Run: node test-dependency-detection.js
 */

const { detectDependencies, getTaskOrder } = require('./utils/dependencyDetector');

// Test cases with expected outputs
const testCases = [
  {
    name: 'Sequential Dependency (then)',
    email: `
    Please complete the following tasks:
    1. First, prepare the presentation slides, then review them with the team
    2. Once approved, send to stakeholders
    `,
    expectedDependencies: 2
  },

  {
    name: 'Before/After Pattern',
    email: `
    Before starting the project, make sure to:
    - Review the requirements document
    - Get approval from management
    - Setup the development environment
    
    After approval is received, begin coding.
    `,
    expectedDependencies: 3
  },

  {
    name: 'Depends On Pattern',
    email: `
    The following needs to be done:
    - Write documentation (depends on code being complete)
    - Deploy to production (depends on testing being done)
    - Notify team (depends on deployment)
    `,
    expectedDependencies: 3
  },

  {
    name: 'Once Pattern',
    email: `
    Here's the workflow:
    1. Complete the design mockups
    2. Once design is approved, start development
    3. Once development is done, begin testing
    4. After testing is complete, deploy
    `,
    expectedDependencies: 3
  },

  {
    name: 'Required For Pattern',
    email: `
    Steps for the launch:
    - Update the database schema (required for code deployment)
    - Deploy new code (required for testing in production)
    - Configure servers (required for deployment to work)
    `,
    expectedDependencies: 3
  },

  {
    name: 'Mixed Patterns',
    email: `
    Project timeline:
    1. First, gather requirements
    2. Then create the design mockups
    3. Once design is approved, start coding
    4. Development depends on the design being finalized
    5. Testing is required for deployment
    6. After all testing is complete, release to production
    `,
    expectedDependencies: 5
  },

  {
    name: 'Bullet Points Only',
    email: `
    To-do list:
    - Prepare presentation
    - Create slides
    - Practice delivery
    - Get feedback
    `,
    expectedDependencies: 0 // No explicit dependencies stated
  }
];

// Run all tests
console.log('═══════════════════════════════════════════════════════════════');
console.log('  DEPENDENCY DETECTION SYSTEM - TEST SUITE');
console.log('═══════════════════════════════════════════════════════════════\n');

testCases.forEach((testCase, index) => {
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log('─'.repeat(60));

  const result = detectDependencies(testCase.email);

  console.log(`\n📋 Tasks Found: ${result.stats.totalTasks}`);
  result.tasks.forEach((task, i) => {
    console.log(`   ${i + 1}. ${task.text}`);
  });

  console.log(`\n🔗 Dependencies Found: ${result.stats.totalDependencies}`);
  if (result.dependencies.length > 0) {
    result.dependencies.forEach((dep, i) => {
      console.log(`   ${i + 1}. "${dep.blocker}" → blocks → "${dep.blocked}" [${dep.patternType}]`);
    });
  } else {
    console.log('   (None)');
  }

  // Get task order
  const taskOrder = getTaskOrder(result.tasks, result.dependencies);
  if (taskOrder.length > 1) {
    console.log(`\n📊 Recommended Execution Order:`);
    taskOrder.forEach((task, i) => {
      console.log(`   ${i + 1}. ${task}`);
    });
  }

  // Validation
  const passed = result.stats.totalDependencies === testCase.expectedDependencies;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status} - Expected ${testCase.expectedDependencies}, Got ${result.stats.totalDependencies}`);

  console.log('\n' + '═'.repeat(60) + '\n');
});

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE TEST
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📧 REAL-WORLD EMAIL EXAMPLE:');
console.log('═══════════════════════════════════════════════════════════════\n');

const realWorldEmail = `
Subject: Q3 Project Requirements

Hi Team,

Please follow these steps for the Q3 delivery:

1. First, we need to complete the requirements analysis
2. Then, create technical design document (this depends on requirements being clear)
3. Once design is approved by stakeholders, begin development
4. Development is required for the code review phase
5. After code review is complete, do quality assurance testing
6. Testing must be finished before we can deploy to production
7. Once all testing is done, prepare the release notes
8. Finally, notify all customers about the new release

Before launching, make sure to:
- Update all documentation
- Prepare training materials
- Notify support team

Once everything is ready, we can go live.

Thanks!
`;

console.log('Email Content:\n', realWorldEmail);
console.log('\n' + '─'.repeat(60) + '\n');

const analysis = detectDependencies(realWorldEmail);

console.log('📊 ANALYSIS RESULTS:\n');

console.log(`Total Tasks: ${analysis.stats.totalTasks}`);
console.log(`Total Dependencies: ${analysis.stats.totalDependencies}\n`);

console.log('📋 Extracted Tasks:');
analysis.tasks.forEach((task, i) => {
  console.log(`   ${i + 1}. ${task.text} [${task.type}]`);
});

console.log('\n🔗 Dependency Network:');
analysis.dependencies.forEach((dep, i) => {
  console.log(
    `   ${i + 1}. "${dep.blocker}" ─[${dep.patternType}]─> "${dep.blocked}" (${dep.strength})`
  );
});

console.log('\n📊 Task Dependency Graph:');
Object.entries(analysis.graph).forEach(([task, info]) => {
  console.log(`\n   Task: "${task}"`);
  if (info.blockedBy.length > 0) {
    console.log(`   Blocked by:`);
    info.blockedBy.forEach(blocker => {
      console.log(`      ← ${blocker.task} (${blocker.strength})`);
    });
  }
  if (info.blocks.length > 0) {
    console.log(`   Blocks:`);
    info.blocks.forEach(blocked => {
      console.log(`      → ${blocked.task} (${blocked.strength})`);
    });
  }
  if (info.blockedBy.length === 0 && info.blocks.length === 0) {
    console.log(`   No dependencies`);
  }
});

const taskOrder = getTaskOrder(analysis.tasks, analysis.dependencies);
console.log('\n📊 Optimal Execution Order (Respecting Dependencies):');
taskOrder.forEach((task, i) => {
  const taskInfo = analysis.tasks.find(t => t.text === task);
  console.log(`   ${i + 1}. ${task} [${taskInfo.type}]`);
});

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Test Complete!\n');
