/**
 * Converts time text to a JavaScript Date object
 * 
 * @param {string|undefined} timeText - "today", "tomorrow", or undefined
 * @returns {Date} JavaScript Date object
 * 
 * Rules:
 * - "today" → current date
 * - "tomorrow" → current date + 1 day
 * - undefined/default → current date + 2 days
 * 
 * Example:
 * convertToDeadline("today") // Returns today's date
 * convertToDeadline("tomorrow") // Returns tomorrow's date
 * convertToDeadline() // Returns date 2 days from now
 */
function convertToDeadline(timeText) {
  // Get current date
  const currentDate = new Date();

  // Determine days to add based on input
  let daysToAdd = 2; // Default: 2 days

  if (timeText === 'today') {
    daysToAdd = 0;
  } else if (timeText === 'tomorrow') {
    daysToAdd = 1;
  }
  // else: default is 2 days (if undefined, null, or any other value)

  // Create new date with added days
  const deadline = new Date(currentDate);
  deadline.setDate(deadline.getDate() + daysToAdd);

  // Reset time to start of day (midnight)
  deadline.setHours(0, 0, 0, 0);

  return deadline;
}

module.exports = convertToDeadline;
