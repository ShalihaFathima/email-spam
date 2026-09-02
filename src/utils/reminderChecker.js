/**
 * Checks tasks and generates reminder messages based on deadlines
 * 
 * @param {array} tasks - Array of task objects with {action, object, deadline, status}
 * @returns {array} Array of reminder strings
 * 
 * Reminder types:
 * - "You missed: [action] [object]" - If deadline has passed
 * - "Reminder: [action] [object] today" - If due today
 * 
 * Example:
 * checkReminders([
 *   {action: 'send', object: 'report', deadline: new Date('2026-04-01')},
 *   {action: 'call', object: 'client', deadline: new Date('2026-04-02')}
 * ])
 * // Returns: ["You missed: send report", "Reminder: call client today"]
 */
function checkReminders(tasks) {
  try {
    // Handle invalid or empty input
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }

    const reminders = [];
    const today = new Date();
    
    // Normalize today to midnight for comparison
    const todayAtMidnight = new Date(today);
    todayAtMidnight.setHours(0, 0, 0, 0);

    // Check each task
    for (const task of tasks) {
      // Validate task has required fields
      if (!task || !task.deadline || !task.action || !task.object) {
        continue;
      }

      // Normalize task deadline to midnight for comparison
      const taskDeadline = new Date(task.deadline);
      taskDeadline.setHours(0, 0, 0, 0);

      // Get time difference in milliseconds
      const timeDifference = taskDeadline - todayAtMidnight;
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      // Generate reminder message based on deadline
      let reminderMessage = null;

      if (daysDifference < 0) {
        // Deadline has passed (in the past)
        reminderMessage = `You missed: ${task.action} ${task.object}`;
      } else if (daysDifference === 0) {
        // Due today
        reminderMessage = `Reminder: ${task.action} ${task.object} today`;
      }

      // Add to reminders if there's a message
      if (reminderMessage) {
        reminders.push(reminderMessage);
      }
    }

    return reminders;
  } catch (err) {
    console.error(`Error checking reminders: ${err.message}`);
    return [];
  }
}

module.exports = checkReminders;
