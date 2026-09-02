const { detectDependencies } = require('./utils/dependencyDetector');

const email = `
First, prepare the presentation slides, then review them with the team
`;

console.log('INPUT EMAIL:\n', email);
console.log('\n' + '='.repeat(60) + '\n');

const result = detectDependencies(email);

console.log('TASKS FOUND:', result.tasks.length);
result.tasks.forEach((t, i) => {
  console.log(`  ${i + 1}. "${t.text}"`);
});

console.log('\nPATTERNS FOUND:');
Object.entries(result.patterns).forEach(([type, patterns]) => {
  if (patterns.length > 0) {
    console.log(`  ${type}: ${patterns.length}`);
    patterns.forEach(p => console.log(`    - ${JSON.stringify(p)}`));
  }
});

console.log('\nDEPENDENCIES FOUND:', result.dependencies.length);
result.dependencies.forEach((d, i) => {
  console.log(`  ${i + 1}. "${d.blocker}" -> "${d.blocked}"`);
});
