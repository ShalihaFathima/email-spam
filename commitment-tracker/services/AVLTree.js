/**
 * AVL TREE (Self-Balancing Binary Search Tree)
 * 
 * Efficiently stores tasks sorted by deadline
 * Time Complexity: O(log n) insert/delete/search, O(log n + k) range query
 * 
 * Use case: "Show me all tasks due THIS WEEK" - Fast range queries by date
 */

class AVLNode {
  constructor(task) {
    this.task = task;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  /**
   * Insert task into AVL tree
   * Maintains balance with rotations
   */
  insert(task) {
    if (!task || !task.deadline) return false;
    this.root = this._insert(this.root, task);
    return true;
  }

  /**
   * Delete task from AVL tree
   */
  delete(taskId) {
    this.root = this._delete(this.root, taskId);
    return true;
  }

  /**
   * Search for task by ID
   */
  search(taskId) {
    return this._search(this.root, taskId);
  }

  /**
   * Get all tasks in date range (inclusive)
   * Perfect for "show tasks from Monday to Friday"
   */
  getRange(startDate, endDate) {
    const result = [];
    this._rangeSearch(this.root, startDate, endDate, result);
    return result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  /**
   * Get all tasks in-order (sorted by deadline)
   */
  getInOrder() {
    const result = [];
    this._inOrder(this.root, result);
    return result;
  }

  /**
   * Get next task after a given date
   */
  getNext(afterDate) {
    const allTasks = this.getInOrder();
    return allTasks.find(task => new Date(task.deadline) > new Date(afterDate)) || null;
  }

  /**
   * Get last task (latest deadline)
   */
  getLast() {
    if (!this.root) return null;
    let current = this.root;
    while (current.right) current = current.right;
    return current.task;
  }

  /**
   * Check if tree is balanced (for testing)
   */
  isBalanced() {
    return this._isBalanced(this.root).balanced;
  }

  /**
   * Get tree height
   */
  getHeight() {
    return this._getHeight(this.root);
  }

  /**
   * Clear tree
   */
  clear() {
    this.root = null;
  }

  // ============= INTERNAL METHODS =============

  _insert(node, task) {
    if (!node) return new AVLNode(task);

    const cmp = new Date(task.deadline) - new Date(node.task.deadline);
    if (cmp < 0) {
      node.left = this._insert(node.left, task);
    } else if (cmp > 0) {
      node.right = this._insert(node.right, task);
    } else {
      // Same deadline, use task ID to distinguish
      if ((task._id || task.id || '') < (node.task._id || node.task.id || '')) {
        node.left = this._insert(node.left, task);
      } else {
        node.right = this._insert(node.right, task);
      }
    }

    node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    return this._balance(node);
  }

  _delete(node, taskId) {
    if (!node) return null;

    if (node.task._id === taskId || node.task.id === taskId) {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      let minRight = node.right;
      while (minRight.left) minRight = minRight.left;
      node.task = minRight.task;
      node.right = this._delete(node.right, minRight.task._id || minRight.task.id);
    } else {
      const cmp = new Date(node.task.deadline) - new Date(taskId);
      if (cmp > 0) {
        node.left = this._delete(node.left, taskId);
      } else {
        node.right = this._delete(node.right, taskId);
      }
    }

    if (!node) return null;
    node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    return this._balance(node);
  }

  _search(node, taskId) {
    if (!node) return null;
    if (node.task._id === taskId || node.task.id === taskId) return node.task;
    
    const searchLeft = this._search(node.left, taskId);
    if (searchLeft) return searchLeft;
    return this._search(node.right, taskId);
  }

  _rangeSearch(node, startDate, endDate, result) {
    if (!node) return;

    const taskDate = new Date(node.task.deadline);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (taskDate >= start && taskDate <= end) {
      result.push(node.task);
    }

    if (taskDate > start) {
      this._rangeSearch(node.left, startDate, endDate, result);
    }
    if (taskDate < end) {
      this._rangeSearch(node.right, startDate, endDate, result);
    }
  }

  _inOrder(node, result) {
    if (!node) return;
    this._inOrder(node.left, result);
    result.push(node.task);
    this._inOrder(node.right, result);
  }

  _getHeight(node) {
    return node ? node.height : 0;
  }

  _getBalance(node) {
    return node ? this._getHeight(node.left) - this._getHeight(node.right) : 0;
  }

  _balance(node) {
    if (!node) return null;

    const balance = this._getBalance(node);

    // Left Heavy
    if (balance > 1) {
      if (this._getBalance(node.left) < 0) {
        node.left = this._rotateLeft(node.left);
      }
      return this._rotateRight(node);
    }

    // Right Heavy
    if (balance < -1) {
      if (this._getBalance(node.right) > 0) {
        node.right = this._rotateRight(node.right);
      }
      return this._rotateLeft(node);
    }

    return node;
  }

  _rotateRight(node) {
    const newRoot = node.left;
    node.left = newRoot.right;
    newRoot.right = node;
    node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    newRoot.height = 1 + Math.max(this._getHeight(newRoot.left), this._getHeight(newRoot.right));
    return newRoot;
  }

  _rotateLeft(node) {
    const newRoot = node.right;
    node.right = newRoot.left;
    newRoot.left = node;
    node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
    newRoot.height = 1 + Math.max(this._getHeight(newRoot.left), this._getHeight(newRoot.right));
    return newRoot;
  }

  _isBalanced(node) {
    if (!node) return { balanced: true };
    
    const leftBalance = this._isBalanced(node.left);
    if (!leftBalance.balanced) return { balanced: false };
    
    const rightBalance = this._isBalanced(node.right);
    if (!rightBalance.balanced) return { balanced: false };
    
    const balance = this._getBalance(node);
    if (Math.abs(balance) > 1) return { balanced: false };
    
    return { balanced: true };
  }
}

module.exports = AVLTree;
