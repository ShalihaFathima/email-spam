/**
 * DEMO: Email with Clear Dependencies
 * Tests the complete dependency detection workflow
 */

const { detectDependencies, getTaskOrder } = require('./utils/dependencyDetector');

// ═══════════════════════════════════════════════════════════════
// DEMO EMAIL WITH CLEAR DEPENDENCIES
// ═══════════════════════════════════════════════════════════════

const demoEmail = `
SUBJECT: Q1 Project Launch - Action Items

Hi Team,

Here's our project delivery timeline:

PHASE 1 - REQUIREMENTS
1. First, gather all project requirements from stakeholders
2. Then, create detailed design mockups based on requirements

PHASE 2 - DEVELOPMENT
3. Once design is approved, start coding the backend services
4. After backend is complete, begin frontend development
5. Development depends on the API specifications being finalized

PHASE 3 - TESTING & DEPLOYMENT
6. Testing is required for any code deployment
7. Once all testing is complete, prepare release notes
8. Finally, deploy to production after approval

BEFORE LAUNCHING:
- Make sure documentation is complete before deployment
- Server configuration must be done before testing starts
- Security audit required for production release

Please follow this sequence strictly. Dependencies are critical!

Thanks
`;

console.log('═══════════════════════════════════════════════════════════════');
console.log('  DEMO: DEPENDENCY DETECTION SYSTEM');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📧 EMAIL CONTENT:\n');
console.log(demoEmail);

console.log('\n' + '─'.repeat(70) + '\n');
console.log('🔍 ANALYZING DEPENDENCIES...\n');

const result = detectDependencies(demoEmail);

// ═══════════════════════════════════════════════════════════════
// DISPLAY EXTRACTED TASKS
// ═══════════════════════════════════════════════════════════════
console.log('📋 EXTRACTED TASKS:\n');
result.tasks.forEach((task, i) => {
  const icon = task.type === 'explicit' ? '✓' : '◆';
  console.log(`  ${i + 1}. [${icon}] ${task.text}`);
});

// ═══════════════════════════════════════════════════════════════
// DISPLAY DETECTED PATTERNS
// ═══════════════════════════════════════════════════════════════
console.log(`\n📊 DEPENDENCY PATTERNS DETECTED:\n`);

let patternCount = 0;
Object.entries(result.patterns).forEach(([patternType, patterns]) => {
  if (Array.isArray(patterns) && patterns.length > 0) {
    console.log(`  ${patternType.toUpperCase()} (${patterns.length}):`);
    patterns.forEach((p, i) => {
      const first = p.first || p.prerequisite;
      const second = p.second || p.task;
      console.log(
        `    ${i + 1}. "${first.substring(0, 40)}..." → "${second.substring(0, 40)}..."`
      );
    });
    patternCount += patterns.length;
  }
});

if (patternCount === 0) {
  console.log(`  (No explicit patterns found - using sequential linking)`);
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY DEPENDENCY LINKS
// ═══════════════════════════════════════════════════════════════
console.log(`\n🔗 CREATED DEPENDENCY LINKS:\n`);

if (result.dependencies.length === 0) {
  console.log(`  (No dependencies created)`);
} else {
  result.dependencies.forEach((dep, i) => {
    const arrow = '─→';
    const strength = dep.strength === 'high' ? '🔴' : '🟡';
    console.log(`  ${i + 1}. ${strength} "${dep.blocker}"`);
    console.log(`     ${arrow} BLOCKS ${arrow}`);
    console.log(`     "${dep.blocked}"`);
    console.log(
      `     Pattern: ${dep.patternType} | Strength: ${dep.strength}\n`
    );
  });
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY TASK EXECUTION ORDER
// ═══════════════════════════════════════════════════════════════
const taskOrder = getTaskOrder(result.tasks, result.dependencies);

console.log(`\n📊 OPTIMAL TASK EXECUTION ORDER:\n`);
console.log(`(Respecting all dependencies)\n`);

taskOrder.forEach((taskText, i) => {
  const task = result.tasks.find(t => t.text === taskText);
  const symbol = i === 0 ? '▶' : '│';
  console.log(`  ${symbol} ${i + 1}. ${taskText}`);
  if (i < taskOrder.length - 1) {
    console.log(`  │`);
    console.log(`  ▼`);
  }
});

// ═══════════════════════════════════════════════════════════════
// DISPLAY TASK GRAPH
// ═══════════════════════════════════════════════════════════════
console.log(`\n\n📊 TASK DEPENDENCY GRAPH:\n`);

Object.entries(result.graph).forEach(([taskText, info]) => {
  console.log(`\n  📌 "${taskText}"`);

  if (info.blockedBy.length > 0) {
    console.log(`     ⬅️  Blocked by (prerequisites):`);
    info.blockedBy.forEach(blocker => {
      console.log(`        • "${blocker.task}" [${blocker.strength}]`);
    });
  }

  if (info.blocks.length > 0) {
    console.log(`     ➡️  Blocks (dependents):`);
    info.blocks.forEach(blocked => {
      console.log(`        • "${blocked.task}" [${blocked.strength}]`);
    });
  }

  if (info.blockedBy.length === 0 && info.blocks.length === 0) {
    console.log(`     No dependencies`);
  }
});

// ═══════════════════════════════════════════════════════════════
// DISPLAY STATISTICS
// ═══════════════════════════════════════════════════════════════
console.log(`\n\n📈 STATISTICS:\n`);
console.log(`  Total Tasks Found: ${result.stats.totalTasks}`);
console.log(`  Total Dependencies: ${result.stats.totalDependencies}`);
console.log(`  High-Strength Dependencies: ${result.stats.highStrengthDeps}`);
console.log(`  Medium-Strength Dependencies: ${result.stats.mediumStrengthDeps}`);
console.log(
  `  Average Tasks per Dependency: ${
    result.stats.totalTasks > 0
      ? (result.stats.totalDependencies / result.stats.totalTasks).toFixed(2)
      : 0
  }`
);

// ═══════════════════════════════════════════════════════════════
// RESULTS SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log(`\n\n` + '═'.repeat(70));
console.log('✅ DEMO SUMMARY');
console.log('═'.repeat(70));

console.log(`\n✨ System successfully:`);
console.log(`   ✓ Extracted ${result.stats.totalTasks} tasks from email`);
console.log(`   ✓ Detected ${result.stats.totalDependencies} dependency relationships`);
console.log(`   ✓ Calculated optimal execution order (${taskOrder.length} items)`);
console.log(`   ✓ Built task dependency graph with ${Object.keys(result.graph).length} nodes`);

if (result.stats.totalDependencies > 0) {
  console.log(`\n🎯 Ready to save to MongoDB:`);
  console.log(`   • Create ${result.stats.totalTasks} Task documents`);
  console.log(`   • Link ${result.stats.totalDependencies} dependencies in blockedBy arrays`);
  console.log(`   • Store task graph for visualization`);
  console.log(`   • Track critical path for project planning`);
}

console.log('\n' + '═'.repeat(70) + '\n');
