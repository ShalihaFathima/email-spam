/**
 * Commitment Tracker UI Update Function
 * 
 * Updates the DOM with task and reminder data
 */

/**
 * Formats a date to readable format
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return 'No deadline';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if today
  if (taskDate.getTime() === today.getTime()) {
    return 'Today';
  }

  // Check if tomorrow
  if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  // Check if past
  if (taskDate.getTime() < today.getTime()) {
    const daysAgo = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  }

  // Check if within this week
  const daysFromNow = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
  if (daysFromNow < 7) {
    return `In ${daysFromNow} day${daysFromNow !== 1 ? 's' : ''}`;
  }

  // Format as date
  const options = { month: 'short', day: 'numeric' };
  return taskDate.toLocaleDateString('en-US', options);
}

/**
 * Creates HTML for a task item
 * @param {object} task - Task object with {action, object, deadline, status}
 * @returns {string} HTML string
 */
function createTaskHTML(task) {
  if (!task || !task.action || !task.object) {
    return '';
  }

  const deadlineText = formatDate(task.deadline);
  const status = task.status || 'pending';

  return `
    <div class="task-item">
      <div class="task-content">
        <div class="task-details">
          <div class="task-action">${escapeHtml(task.action)}</div>
          <div class="task-object">${escapeHtml(task.object)}</div>
          <div class="task-deadline">
            <span class="deadline-indicator"></span>
            ${escapeHtml(deadlineText)}
          </div>
        </div>
        <div class="task-status status-${status}">
          ${status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates empty state HTML
 * @param {string} icon - Emoji icon
 * @param {string} message - Empty state message
 * @returns {string} HTML string
 */
function createEmptyStateHTML(icon, message) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-message">${escapeHtml(message)}</div>
      <div class="empty-submessage">No tasks to display</div>
    </div>
  `;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Main function: Update Commitment Tracker UI
 * 
 * @param {object} data - Data object with {pending, completed, reminders}
 * @returns {void}
 * 
 * Example:
 * updateCommitmentUI({
 *   pending: [{action: 'send', object: 'report', deadline: new Date(), status: 'pending'}],
 *   completed: [{action: 'call', object: 'client', deadline: new Date(), status: 'completed'}],
 *   reminders: ['Reminder: send report today', 'You missed: call client']
 * })
 */
function updateCommitmentUI(data) {
  try {
    // Validate input
    if (!data || typeof data !== 'object') {
      console.error('Invalid data provided to updateCommitmentUI');
      displayError('Invalid data format');
      return;
    }

    // Extract data with defaults
    const pending = Array.isArray(data.pending) ? data.pending : [];
    const completed = Array.isArray(data.completed) ? data.completed : [];
    const reminders = Array.isArray(data.reminders) ? data.reminders : [];

    console.log(`Updating UI with ${pending.length} pending, ${completed.length} completed, ${reminders.length} reminders`);

    // ==================== UPDATE PENDING TASKS ====================
    const pendingList = document.getElementById('pending-list');
    if (pendingList) {
      if (pending.length === 0) {
        pendingList.innerHTML = createEmptyStateHTML('✨', 'No pending tasks');
      } else {
        pendingList.innerHTML = pending
          .map((task) => createTaskHTML(task))
          .filter((html) => html.length > 0)
          .join('');
      }
    }

    // ==================== UPDATE REMINDERS ====================
    const remindersList = document.getElementById('reminders-list');
    if (remindersList) {
      if (reminders.length === 0) {
        remindersList.innerHTML = createEmptyStateHTML('🎯', 'No active reminders');
      } else {
        remindersList.innerHTML = reminders
          .map(
            (reminder) => `
          <div class="reminder-item">
            <span class="reminder-icon">${reminder.includes('You missed') ? '⏰' : '📌'}</span>
            ${escapeHtml(reminder)}
          </div>
        `
          )
          .join('');
      }
    }

    // ==================== UPDATE COMPLETED TASKS ====================
    const completedList = document.getElementById('completed-list');
    if (completedList) {
      if (completed.length === 0) {
        completedList.innerHTML = createEmptyStateHTML('🎉', 'No completed tasks yet');
      } else {
        completedList.innerHTML = completed
          .map((task) => createTaskHTML(task))
          .filter((html) => html.length > 0)
          .join('');
      }
    }

    // ==================== UPDATE STATISTICS ====================
    updateStats(pending.length, reminders.length, completed.length);

    console.log('✅ UI updated successfully');
  } catch (err) {
    console.error(`Error updating UI: ${err.message}`);
    displayError('Failed to update UI');
  }
}

/**
 * Updates statistics display
 * @param {number} pendingCount - Number of pending tasks
 * @param {number} remindersCount - Number of reminders
 * @param {number} completedCount - Number of completed tasks
 */
function updateStats(pendingCount, remindersCount, completedCount) {
  const statPending = document.getElementById('stat-pending');
  const statReminders = document.getElementById('stat-reminders');
  const statCompleted = document.getElementById('stat-completed');

  if (statPending) statPending.textContent = pendingCount;
  if (statReminders) statReminders.textContent = remindersCount;
  if (statCompleted) statCompleted.textContent = completedCount;
}

/**
 * Displays error message
 * @param {string} message - Error message
 */
function displayError(message) {
  console.error(message);
  // Could be enhanced to show error UI
}

/**
 * Clear all UI
 */
function clearCommitmentUI() {
  updateCommitmentUI({
    pending: [],
    completed: [],
    reminders: [],
  });
}

/**
 * Get current UI state
 * @returns {object} Current state
 */
function getCommitmentUIState() {
  return {
    pending: document.getElementById('pending-list')?.children.length || 0,
    reminders: document.getElementById('reminders-list')?.children.length || 0,
    completed: document.getElementById('completed-list')?.children.length || 0,
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateCommitmentUI,
    clearCommitmentUI,
    getCommitmentUIState,
    formatDate,
    createTaskHTML,
    createEmptyStateHTML,
  };
}
