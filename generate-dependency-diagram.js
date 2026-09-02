/**
 * VISUAL DIAGRAM: Task Dependencies
 * Generates Mermaid diagram for task dependency visualization
 */

const { detectDependencies } = require('./utils/dependencyDetector');

// Demo email with dependencies
const demoEmail = `
SUBJECT: Q1 Project Launch - Action Items

PHASE 1 - REQUIREMENTS
1. Gather project requirements from stakeholders
2. Create detailed design mockups based on requirements

PHASE 2 - DEVELOPMENT
3. Start coding the backend services
4. Begin frontend development
5. Development depends on the API specifications being finalized

PHASE 3 - TESTING & DEPLOYMENT
6. Do testing and quality assurance
7. Prepare release notes
8. Deploy to production

BEFORE LAUNCHING:
- Documentation must be complete
- Server configuration must be done before testing starts
- Security audit is required for deployment
`;

console.log('═══════════════════════════════════════════════════════════════');
console.log('  GENERATING TASK DEPENDENCY DIAGRAM');
console.log('═══════════════════════════════════════════════════════════════\n');

const result = detectDependencies(demoEmail);

// Generate Mermaid diagram
let mermaidDiagram = 'graph TD\n';

// Create task nodes
result.tasks.forEach((task, index) => {
  const taskId = `T${index + 1}`;
  const taskText = task.text
    .substring(0, 50)
    .replace(/"/g, "'")
    .replace(/\n/g, ' ');
  mermaidDiagram += `    ${taskId}["${index + 1}. ${taskText}..."]\n`;
});

// Add dependency edges
result.dependencies.forEach((dep) => {
  const blockerIndex = result.tasks.findIndex(t => t.text === dep.blocker);
  const blockedIndex = result.tasks.findIndex(t => t.text === dep.blocked);

  if (blockerIndex !== -1 && blockedIndex !== -1) {
    const blockerId = `T${blockerIndex + 1}`;
    const blockedId = `T${blockedIndex + 1}`;
    const strength = dep.strength === 'high' ? '🔴' : '🟡';

    mermaidDiagram += `    ${blockerId} -->|${dep.patternType}| ${blockedId}\n`;
  }
});

// Add styling
mermaidDiagram += '\n    style T1 fill:#e1f5ff\n'; // First task - light blue
mermaidDiagram += '    style T8 fill:#fff3e0\n'; // Last task - light orange

// Print Mermaid code
console.log('📊 MERMAID DIAGRAM CODE:\n');
console.log('```mermaid');
console.log(mermaidDiagram);
console.log('```\n');

console.log('═'.repeat(70));
console.log('\n💡 To visualize this diagram:\n');
console.log('Option 1: Copy the Mermaid code above and paste at https://mermaid.live\n');
console.log('Option 2: Use in VS Code with extension:\n');
console.log('  - Install: Markdown Preview Mermaid Support\n');
console.log('  - Create file: diagram.md\n');
console.log('  - Paste code in markdown code block\n');
console.log('  - Preview the diagram\n');

// Also generate a text-based graph
console.log('═'.repeat(70));
console.log('\n📈 TEXT-BASED DEPENDENCY GRAPH:\n');

result.dependencies.forEach((dep, index) => {
  const arrow = '  ─→  ';
  console.log(`\n${index + 1}. [${dep.strength.toUpperCase()}] ${dep.patternType}`);
  console.log(`\n   📌 ${dep.blocker}`);
  console.log(arrow);
  console.log(`   📌 ${dep.blocked}\n`);
});

// Task relationship matrix
console.log('\n═'.repeat(70));
console.log('\n🔗 DEPENDENCY MATRIX:\n');
console.log('   Legend: → = BLOCKS | ← = BLOCKED BY\n');

console.log('   Task | Status | Blocked By | Blocks\n');
console.log('   ─────┼────────┼────────────┼────────────\n');

result.tasks.forEach((task, i) => {
  const taskNum = i + 1;
  const graph = result.graph[task.text];
  
  const blockedBy = graph.blockedBy.length > 0 
    ? graph.blockedBy.map(b => `T${result.tasks.findIndex(t => t.text === b.task) + 1}`).join(',')
    : '—';
  
  const blocks = graph.blocks.length > 0 
    ? graph.blocks.map(b => `T${result.tasks.findIndex(t => t.text === b.task) + 1}`).join(',')
    : '—';
  
  const status = graph.blockedBy.length > 0 ? '⏸️ WAIT' : '▶️ GO';
  
  console.log(`   T${taskNum}    | ${status}    | ${blockedBy.padEnd(10)} | ${blocks}`);
});

console.log('\n═'.repeat(70));
console.log('\n✅ SUMMARY:\n');
console.log(`   Total Tasks: ${result.stats.totalTasks}`);
console.log(`   Total Dependencies: ${result.stats.totalDependencies}`);
console.log(`   Critical Path Length: ${result.dependencies.length > 0 ? 'Multiple chains' : 'Linear'}`);
console.log('\n═'.repeat(70) + '\n');
