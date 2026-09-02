/**
 * TASK DEPENDENCY GRAPH (Directed Acyclic Graph)
 * 
 * Tracks task dependencies and blockers
 * Time Complexity: O(n+m) most operations (n=tasks, m=dependencies)
 * 
 * Use case: "What's blocking this task?" / "What's the critical path?"
 * Example: gather_data → analyze → report (must follow this order)
 */

class TaskGraph {
  constructor() {
    this.nodes = new Map();        // taskId → task object
    this.edges = new Map();        // taskId → Set of dependent taskIds
    this.reverseEdges = new Map(); // taskId → Set of blocker taskIds
  }

  /**
   * Add a task as a node
   */
  addTask(task) {
    if (!task || !task._id && !task.id) return false;
    const taskId = task._id || task.id;
    
    this.nodes.set(taskId, task);
    if (!this.edges.has(taskId)) {
      this.edges.set(taskId, new Set());
    }
    if (!this.reverseEdges.has(taskId)) {
      this.reverseEdges.set(taskId, new Set());
    }
    return true;
  }

  /**
   * Add dependency: taskA must be done before taskB
   * Returns false if would create circular dependency
   */
  addDependency(taskAId, taskBId) {
    if (!this.nodes.has(taskAId) || !this.nodes.has(taskBId)) {
      return false;
    }
    if (this.wouldCreateCycle(taskAId, taskBId)) {
      return false;
    }

    this.edges.get(taskAId).add(taskBId);
    this.reverseEdges.get(taskBId).add(taskAId);
    return true;
  }

  /**
   * Remove dependency
   */
  removeDependency(taskAId, taskBId) {
    if (!this.edges.has(taskAId)) return false;
    this.edges.get(taskAId).delete(taskBId);
    this.reverseEdges.get(taskBId).delete(taskAId);
    return true;
  }

  /**
   * Get all tasks blocking this task (must be done first)
   */
  getTaskBlockers(taskId) {
    if (!this.reverseEdges.has(taskId)) return [];
    const blockerIds = this.reverseEdges.get(taskId);
    return Array.from(blockerIds).map(id => this.nodes.get(id)).filter(t => t);
  }

  /**
   * Get all tasks that depend on this one
   */
  getBlockedTasks(taskId) {
    if (!this.edges.has(taskId)) return [];
    const dependentIds = this.edges.get(taskId);
    return Array.from(dependentIds).map(id => this.nodes.get(id)).filter(t => t);
  }

  /**
   * Is task ready to start? (no blockers)
   */
  isTaskReady(taskId) {
    const blockers = this.getTaskBlockers(taskId);
    return blockers.every(b => b.status === 'completed');
  }

  /**
   * Get tasks with no blockers (ready to start)
   */
  getReadyTasks() {
    return Array.from(this.nodes.values()).filter(task => 
      this.isTaskReady(task._id || task.id) && task.status !== 'completed'
    );
  }

  /**
   * Find critical path (longest chain of dependencies)
   * Returns array of tasks in the critical path
   */
  findCriticalPath() {
    const memo = new Map();
    let longestPath = [];

    for (const [taskId, task] of this.nodes) {
      if (this.reverseEdges.get(taskId).size === 0) {
        // Start from tasks with no dependencies
        const path = this._findLongestPath(taskId, memo);
        if (path.length > longestPath.length) {
          longestPath = path;
        }
      }
    }

    return longestPath;
  }

  /**
   * Topological sort (execution order respecting dependencies)
   */
  topologicalSort() {
    const visited = new Set();
    const stack = [];

    for (const taskId of this.nodes.keys()) {
      if (!visited.has(taskId)) {
        this._topologicalSortDFS(taskId, visited, stack);
      }
    }

    return stack.reverse().map(id => this.nodes.get(id));
  }

  /**
   * Check if graph has circular dependency
   */
  hasCircularDependency() {
    const visited = new Set();
    const recursionStack = new Set();

    for (const taskId of this.nodes.keys()) {
      if (this._hasCycleDFS(taskId, visited, recursionStack)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if adding edge would create cycle
   */
  wouldCreateCycle(fromId, toId) {
    // Temporarily add edge and check
    this.edges.get(fromId).add(toId);
    this.reverseEdges.get(toId).add(fromId);

    const hasCycle = this.hasCircularDependency();

    // Remove edge if it would create cycle
    if (hasCycle) {
      this.edges.get(fromId).delete(toId);
      this.reverseEdges.get(toId).delete(fromId);
    }

    return hasCycle;
  }

  /**
   * Mark task as completed and get next ready tasks
   */
  completeTask(taskId) {
    if (this.nodes.has(taskId)) {
      this.nodes.get(taskId).status = 'completed';
      return this.getReadyTasks();
    }
    return [];
  }

  /**
   * Get all tasks in graph
   */
  getAllTasks() {
    return Array.from(this.nodes.values());
  }

  /**
   * Clear graph
   */
  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.reverseEdges.clear();
  }

  /**
   * Get total number of nodes (tasks)
   */
  getNodeCount() {
    return this.nodes.size;
  }

  /**
   * Get total number of edges (dependencies)
   */
  getEdgeCount() {
    let count = 0;
    for (const dependents of this.edges.values()) {
      count += dependents.size;
    }
    return count;
  }

  /**
   * Get critical path (alias for findCriticalPath)
   */
  getCriticalPath() {
    return this.findCriticalPath();
  }

  // ============= INTERNAL METHODS =============

  _findLongestPath(taskId, memo) {
    if (memo.has(taskId)) {
      return memo.get(taskId);
    }

    const dependents = Array.from(this.edges.get(taskId) || []);
    let longestPath = [this.nodes.get(taskId)];

    for (const dependentId of dependents) {
      const subPath = this._findLongestPath(dependentId, memo);
      if (subPath.length + 1 > longestPath.length) {
        longestPath = [this.nodes.get(taskId), ...subPath];
      }
    }

    memo.set(taskId, longestPath);
    return longestPath;
  }

  _topologicalSortDFS(taskId, visited, stack) {
    visited.add(taskId);
    
    for (const dependentId of this.edges.get(taskId) || []) {
      if (!visited.has(dependentId)) {
        this._topologicalSortDFS(dependentId, visited, stack);
      }
    }
    
    stack.push(taskId);
  }

  _hasCycleDFS(taskId, visited, recursionStack) {
    visited.add(taskId);
    recursionStack.add(taskId);

    for (const dependentId of this.edges.get(taskId) || []) {
      if (!visited.has(dependentId)) {
        if (this._hasCycleDFS(dependentId, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dependentId)) {
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  }
}

module.exports = TaskGraph;
