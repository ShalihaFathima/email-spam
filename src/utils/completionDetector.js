/**
 * Detects task completion from email text and updates task status
 * 
 * @param {string} emailText - Email text content
 * @param {array} tasks - Array of task objects with {action, object, deadline, status}
 * @returns {array} Updated tasks array with completed status
 * 
 * Completion triggers:
 * - Contains "done"
 * - Contains "completed"
 * - Contains "here is"
 * 
 * Example:
 * detectCompletion(
 *   "Done! Here is the report you requested.",
 *   [{action: 'send', object: 'report', deadline: ..., status: 'pending'}]
 * )
 * // Returns: [{action: 'send', object: 'report', deadline: ..., status: 'completed'}]
 */
function detectCompletion(emailText, tasks) {
  try {
    // Validate inputs
    if (!emailText || typeof emailText !== 'string') {
      return tasks && Array.isArray(tasks) ? tasks : [];
    }

    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }

    // If no tasks, return empty array
    if (tasks.length === 0) {
      return [];
    }

    // Convert email text to lowercase
    const lowerEmailText = emailText.toLowerCase();

    // Check if email contains completion indicators
    const hasCompletionIndicator =
      lowerEmailText.includes('done') ||
      lowerEmailText.includes('completed') ||
      lowerEmailText.includes('here is');

    // If no completion indicator, return tasks unchanged
    if (!hasCompletionIndicator) {
      return tasks;
    }

    // Create a copy of tasks to avoid mutating original
    const updatedTasks = tasks.map((task) => {
      // Validate task has required fields
      if (!task || !task.object) {
        return task;
      }

      // Check if task.object appears in email text
      const objectKeyword = task.object.toLowerCase();
      if (lowerEmailText.includes(objectKeyword)) {
        // Match found - set status to completed
        return {
          ...task,
          status: 'completed',
        };
      }

      return task;
    });

    return updatedTasks;
  } catch (err) {
    console.error(`Error detecting completion: ${err.message}`);
    // Return original tasks on error to avoid data loss
    return tasks && Array.isArray(tasks) ? tasks : [];
  }
}

module.exports = detectCompletion;
