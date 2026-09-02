/**
 * DEPENDENCY DETECTOR
 * Extracts and analyzes dependencies between tasks from email text
 * 
 * Detects patterns like:
 * - "First do X, then Y" → X blocks Y
 * - "Y depends on X" → X blocks Y
 * - "Before Y, must complete X" → X blocks Y
 * - "Once X is done, start Y" → X blocks Y
 */

/**
 * Extract all tasks with line numbers from email
 */
function extractTasksWithPositions(emailText) {
  const lines = emailText.split('\n');
  const tasks = [];
  const processedTexts = new Set(); // To avoid duplicates

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length < 5) return; // Skip very short lines

    // Pattern 1: Bullet points (-, *, •) or numbered lists (1., 2., etc.)
    const bulletMatch = /^[\-\*•]\s+(.{5,250})$/.exec(trimmed);
    const numberedMatch = /^\d+\.\s+(.{5,250})$/.exec(trimmed);

    if (bulletMatch || numberedMatch) {
      const match = bulletMatch || numberedMatch;
      const taskText = match[1].trim();
      if (!processedTexts.has(taskText)) {
        tasks.push({
          text: taskText,
          position: index,
          type: 'explicit'
        });
        processedTexts.add(taskText);
      }
      return;
    }

    // Pattern 2: Lines with dependency keywords (then, after, once, before, etc.)
    const hasDependencyKeyword =
      /\b(then|after|once|before|depends|requires|needed for|must be|preparation|first|finally)\b/i.test(
        trimmed
      );

    if (hasDependencyKeyword && trimmed.length > 10) {
      if (!processedTexts.has(trimmed)) {
        tasks.push({
          text: trimmed,
          position: index,
          type: 'dependency_keyword'
        });
        processedTexts.add(trimmed);
      }
      return;
    }

    // Pattern 3: Lines with action verbs
    const hasActionVerb = /\b(prepare|complete|review|create|setup|deploy|test|build|check|analyze|update|configure|finalize)\b/i.test(
      trimmed
    );

    if (hasActionVerb && trimmed.length > 10 && !trimmed.match(/^(to|for|and|the|a|an|or|but)\b/i)) {
      if (!processedTexts.has(trimmed)) {
        tasks.push({
          text: trimmed,
          position: index,
          type: 'action_verb'
        });
        processedTexts.add(trimmed);
      }
    }
  });

  return tasks;
}

/**
 * Detect explicit dependency keywords and patterns
 */
function extractDependencyPatterns(emailText) {
  const patterns = {
    sequential: [], // "First X, then Y"
    after: [], // "After X, do Y"
    before: [], // "Before Y, do X"
    depends: [], // "Y depends on X"
    once: [], // "Once X is done, start Y"
    prerequisite: [], // "X is required for Y"
    blocks: [], // "X blocks Y", "X prevents Y"
  };

  const text = emailText.toLowerCase();
  let match;

  // Pattern 1: "First X, then Y" or "X, then Y"
  const thenPattern = /(.{5,150}?),?\s+then\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = thenPattern.exec(emailText)) !== null) {
    const first = match[1].trim();
    const second = match[2].trim();
    if (first.length > 5 && second.length > 5) {
      patterns.sequential.push({
        first: first,
        second: second,
        strength: 'high'
      });
    }
  }

  // Pattern 2: "After X, do Y"
  const afterPattern = /after\s+(?:finishing|completing)?\s*(.{5,150}?),?\s+(?:do|complete|finish|start|begin)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = afterPattern.exec(emailText)) !== null) {
    const prereq = match[1].trim();
    const task = match[2].trim();
    if (prereq.length > 5 && task.length > 5) {
      patterns.after.push({
        prerequisite: prereq,
        task: task,
        strength: 'high'
      });
    }
  }

  // Pattern 3: "Before Y, X" or "Before Y, must X"
  const beforePattern = /before\s+(?:starting|doing|completing)?\s*(.{5,150}?),?\s+(?:must|need to|should|make sure to)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = beforePattern.exec(emailText)) !== null) {
    const task = match[1].trim();
    const prereq = match[2].trim();
    if (prereq.length > 5 && task.length > 5) {
      patterns.before.push({
        task: task,
        prerequisite: prereq,
        strength: 'high'
      });
    }
  }

  // Pattern 4: "Y depends on X"
  const dependsPattern = /(.{5,150}?)\s+(?:depends\s+on|requires)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = dependsPattern.exec(emailText)) !== null) {
    const task = match[1].trim();
    const prereq = match[2].trim();
    if (task.length > 5 && prereq.length > 5) {
      patterns.depends.push({
        task: task,
        prerequisite: prereq,
        strength: 'medium'
      });
    }
  }

  // Pattern 5: "Once X is done, start Y"
  const oncePattern = /once\s+(.{5,150}?)\s+(?:is\s+)?(?:done|complete|finished|approved),?\s+(?:start|begin|do)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = oncePattern.exec(emailText)) !== null) {
    const prereq = match[1].trim();
    const task = match[2].trim();
    if (prereq.length > 5 && task.length > 5) {
      patterns.once.push({
        prerequisite: prereq,
        task: task,
        strength: 'high'
      });
    }
  }

  // Pattern 6: "X is required for Y"
  const prerequisitePattern = /(.{5,150}?)\s+(?:is\s+)?(?:required|necessary|needed)\s+(?:for|before)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = prerequisitePattern.exec(emailText)) !== null) {
    const prereq = match[1].trim();
    const task = match[2].trim();
    if (prereq.length > 5 && task.length > 5) {
      patterns.prerequisite.push({
        prerequisite: prereq,
        task: task,
        strength: 'medium'
      });
    }
  }

  // Pattern 7: "X must be completed before Y"
  const blockPattern = /(.{5,150}?)\s+must\s+be\s+(?:completed|done|finished)\s+(?:before|before starting|before doing)\s+(.{5,150})(?:[.!?\n]|$)/gi;
  while ((match = blockPattern.exec(emailText)) !== null) {
    const prereq = match[1].trim();
    const task = match[2].trim();
    if (prereq.length > 5 && task.length > 5) {
      patterns.blocks.push({
        prerequisite: prereq,
        task: task,
        strength: 'high'
      });
    }
  }

  return patterns;
}

/**
 * Match extracted tasks with dependency patterns
 * Returns: Array of {blocker: taskId, blocked: taskId, strength}
 */
function linkDependencies(tasks, patterns) {
  const dependencies = [];

  /**
   * Calculate string similarity using multiple methods
   */
  function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1.includes(s2) || s2.includes(s1)) {
      return 0.95;
    }

    // Word-based similarity
    const words1 = s1
      .split(/\s+/)
      .filter(w => w.length > 3)
      .map(w => w.replace(/[^\w]/g, ''));
    const words2 = s2
      .split(/\s+/)
      .filter(w => w.length > 3)
      .map(w => w.replace(/[^\w]/g, ''));

    if (words1.length === 0 || words2.length === 0) return 0;

    const commonWords = words1.filter(w =>
      words2.some(w2 => w2.includes(w) || w.includes(w2))
    );

    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity;
  }

  /**
   * Find the best match for a pattern description
   */
  function findMatchingTask(description, allTasks, excludeIndices = []) {
    if (!description || description.length < 5) return null;

    let bestMatch = null;
    let bestScore = 0;

    allTasks.forEach((task, index) => {
      if (excludeIndices.includes(index)) return;

      const score = calculateSimilarity(description, task.text);

      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = { task, index, score };
      }
    });

    return bestMatch;
  }

  // Process all dependency patterns with better matching
  const processedDeps = new Set();

  Object.entries(patterns).forEach(([patternType, patternList]) => {
    if (!Array.isArray(patternList) || patternList.length === 0) return;

    patternList.forEach(pattern => {
      let blockerMatch, blockedMatch;
      let blockerText, blockedText;

      switch (patternType) {
        case 'sequential':
          blockerMatch = findMatchingTask(pattern.first, tasks);
          if (blockerMatch) {
            blockedMatch = findMatchingTask(pattern.second, tasks, [blockerMatch.index]);
          }
          blockerText = pattern.first;
          blockedText = pattern.second;
          break;

        case 'after':
        case 'once':
          blockerMatch = findMatchingTask(pattern.prerequisite, tasks);
          if (blockerMatch) {
            blockedMatch = findMatchingTask(pattern.task, tasks, [blockerMatch.index]);
          }
          blockerText = pattern.prerequisite;
          blockedText = pattern.task;
          break;

        case 'before':
          blockerMatch = findMatchingTask(pattern.prerequisite, tasks);
          if (blockerMatch) {
            blockedMatch = findMatchingTask(pattern.task, tasks, [blockerMatch.index]);
          }
          blockerText = pattern.prerequisite;
          blockedText = pattern.task;
          break;

        case 'depends':
          blockerMatch = findMatchingTask(pattern.prerequisite, tasks);
          if (blockerMatch) {
            blockedMatch = findMatchingTask(pattern.task, tasks, [blockerMatch.index]);
          }
          blockerText = pattern.prerequisite;
          blockedText = pattern.task;
          break;

        case 'prerequisite':
        case 'blocks':
          blockerMatch = findMatchingTask(pattern.prerequisite, tasks);
          if (blockerMatch) {
            blockedMatch = findMatchingTask(pattern.task, tasks, [blockerMatch.index]);
          }
          blockerText = pattern.prerequisite;
          blockedText = pattern.task;
          break;
      }

      // Create dependency if we found matches
      if (blockerMatch && blockedMatch) {
        const depKey = `${blockerMatch.index}→${blockedMatch.index}`;

        if (!processedDeps.has(depKey)) {
          dependencies.push({
            blocker: blockerMatch.task.text,
            blockerIndex: blockerMatch.index,
            blocked: blockedMatch.task.text,
            blockedIndex: blockedMatch.index,
            strength: pattern.strength || 'medium',
            patternType: patternType,
            matchQuality: Math.min(blockerMatch.score, blockedMatch.score)
          });
          processedDeps.add(depKey);
        }
      }
    });
  });

  return dependencies;
}

/**
 * Simple pattern detection: Look for dependency keywords
 */
function detectSimpleDependencies(emailText) {
  const dependencies = [];
  const lines = emailText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i].toLowerCase();
    const nextLine = lines[i + 1].toLowerCase();

    // Check for: "then", "after", "once", "before starting", etc.
    const hasSequentialKeyword =
      currentLine.includes(' then ') ||
      nextLine.includes('then ') ||
      nextLine.includes('after ') ||
      nextLine.includes('once ') ||
      nextLine.includes('after all') ||
      nextLine.includes('once all') ||
      nextLine.includes('before ') ||
      nextLine.includes('depends on') ||
      nextLine.includes('requires ') ||
      nextLine.includes('is required for') ||
      nextLine.includes('must be completed') ||
      nextLine.includes('is necessary for');

    if (hasSequentialKeyword) {
      dependencies.push({
        blocker: lines[i],
        blocked: lines[i + 1],
        strength: 'high',
        patternType: 'sequential'
      });
    }
  }

  return dependencies;
}

/**
 * Main function: Analyze email and return structured dependencies
 */
function detectDependencies(emailText) {
  // Step 1: Extract all tasks with positions
  const tasks = extractTasksWithPositions(emailText);

  if (tasks.length < 2) {
    return {
      tasks,
      dependencies: [],
      patterns: {},
      graph: {},
      message: 'Not enough tasks to create dependencies (need 2+)',
      stats: {
        totalTasks: tasks.length,
        totalDependencies: 0,
        highStrengthDeps: 0,
        mediumStrengthDeps: 0
      }
    };
  }

  // Step 2: Extract dependency patterns from email
  const patterns = extractDependencyPatterns(emailText);

  // Step 3: Link tasks with dependencies from patterns
  const dependencies = linkDependencies(tasks, patterns);

  // Step 4: If not enough dependencies found, use sequential approach
  if (dependencies.length === 0 && tasks.length >= 2) {
    // Create sequential dependencies between consecutive tasks
    for (let i = 0; i < tasks.length - 1; i++) {
      dependencies.push({
        blocker: tasks[i].text,
        blockerIndex: i,
        blocked: tasks[i + 1].text,
        blockedIndex: i + 1,
        strength: 'medium',
        patternType: 'sequential'
      });
    }
  }

  // Step 5: Build adjacency list for task graph
  const graph = {};
  tasks.forEach(task => {
    graph[task.text] = {
      blockedBy: [],
      blocks: []
    };
  });

  dependencies.forEach(dep => {
    if (graph[dep.blocked]) {
      graph[dep.blocked].blockedBy.push({
        task: dep.blocker,
        strength: dep.strength
      });
    }
    if (graph[dep.blocker]) {
      graph[dep.blocker].blocks.push({
        task: dep.blocked,
        strength: dep.strength
      });
    }
  });

  return {
    tasks,
    dependencies,
    patterns,
    graph,
    stats: {
      totalTasks: tasks.length,
      totalDependencies: dependencies.length,
      highStrengthDeps: dependencies.filter(d => d.strength === 'high').length,
      mediumStrengthDeps: dependencies.filter(d => d.strength === 'medium').length
    }
  };
}

/**
 * Get topological order of tasks (which to do first)
 */
function getTaskOrder(tasks, dependencies) {
  const visited = new Set();
  const result = [];

  function dfs(taskText) {
    if (visited.has(taskText)) return;
    visited.add(taskText);

    // First visit all dependencies
    const deps = dependencies.filter(d => d.blocked === taskText);
    deps.forEach(dep => {
      dfs(dep.blocker);
    });

    result.push(taskText);
  }

  tasks.forEach(task => {
    dfs(task.text);
  });

  return result;
}

module.exports = {
  extractTasksWithPositions,
  extractDependencyPatterns,
  linkDependencies,
  detectDependencies,
  getTaskOrder
};
