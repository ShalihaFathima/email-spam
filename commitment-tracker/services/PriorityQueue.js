/**
 * PRIORITY QUEUE (Min Heap)
 * 
 * Efficiently tracks tasks by urgency (deadline)
 * Time Complexity: O(log n) insert/extract, O(1) peek
 * 
 * Use case: "What should I do FIRST?" - Always get most urgent task
 */

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  /**
   * Insert task with priority (deadline)
   * Earlier deadline = higher priority (gets extracted first)
   */
  insert(task) {
    if (!task || !task.deadline) return false;
    
    this.heap.push(task);
    this._bubbleUp(this.heap.length - 1);
    return true;
  }

  /**
   * Extract and return most urgent task
   */
  extractHighestPriority() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return root;
  }

  /**
   * Peek at most urgent task WITHOUT removing it
   * O(1) operation
   */
  getHighestPriority() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Get all tasks sorted by urgency (without modifying heap)
   */
  getAllSorted() {
    return [...this.heap].sort((a, b) => 
      new Date(a.deadline) - new Date(b.deadline)
    );
  }

  /**
   * Clear all tasks
   */
  clear() {
    this.heap = [];
  }

  /**
   * Get heap size
   */
  size() {
    return this.heap.length;
  }

  /**
   * Internal: Bubble up after insertion
   */
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      const current = this.heap[index];

      if (new Date(current.deadline) < new Date(parent.deadline)) {
        [this.heap[parentIndex], this.heap[index]] = [current, parent];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Internal: Bubble down after extraction
   */
  _bubbleDown(index) {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && 
          new Date(this.heap[left].deadline) < new Date(this.heap[smallest].deadline)) {
        smallest = left;
      }

      if (right < this.heap.length && 
          new Date(this.heap[right].deadline) < new Date(this.heap[smallest].deadline)) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

module.exports = PriorityQueue;
