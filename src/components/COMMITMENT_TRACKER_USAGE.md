# Commitment Tracker UI Documentation

## Overview

The Commitment Tracker UI is a clean, responsive interface for displaying pending tasks, reminders, and completed tasks. It provides real-time updates using the `updateCommitmentUI()` function.

## Files

### 1. **CommitmentTracker.html**
Main HTML template with styling. Use this file for production integration.

### 2. **commitmentTrackerUI.js**
JavaScript functions for updating the UI. Core function: `updateCommitmentUI(data)`

### 3. **CommitmentTrackerExample.html**
Interactive demo with sample scenarios and example code.

---

## Core Function

### `updateCommitmentUI(data)`

Updates all UI sections with the provided data.

**Parameters:**
```javascript
{
  pending: Array<Task>,      // Pending tasks
  completed: Array<Task>,    // Completed tasks
  reminders: Array<string>   // Reminder messages
}
```

**Task Object:**
```javascript
{
  action: string,        // Task action (e.g., "send", "call")
  object: string,        // Task object (e.g., "report", "client")
  deadline: Date,        // JavaScript Date object
  status: string         // "pending" or "completed"
}
```

---

## Usage Examples

### Basic Setup

```html
<!-- Include HTML structure -->
<script src="commitmentTrackerUI.js"></script>

<script>
  // Get data from your system
  const data = {
    pending: [
      {
        action: 'send',
        object: 'report',
        deadline: new Date('2026-04-02'),
        status: 'pending'
      }
    ],
    completed: [],
    reminders: ['Reminder: send report today']
  };

  // Update UI
  updateCommitmentUI(data);
</script>
```

### With Real Data from Commitment System

```javascript
import { runCommitmentSystem } from './utils/commitmentSystem.js';
import { updateCommitmentUI } from './components/commitmentTrackerUI.js';

// Process email and get results
const result = await runCommitmentSystem("I will send the report today.", 1);

// Update UI with results
updateCommitmentUI(result);
```

### Real-time Updates

```javascript
// Update whenever new data arrives
async function handleNewEmail(emailText, userId) {
  const result = await runCommitmentSystem(emailText, userId);
  updateCommitmentUI(result);
  // UI automatically reflects changes
}
```

---

## Helper Functions

### `formatDate(date)`
Formats a Date object to readable text.

```javascript
formatDate(new Date())          // "Today"
formatDate(tomorrow)            // "Tomorrow"
formatDate(pastDate)            // "2 days ago"
formatDate(futureDate)          // "In 5 days"
```

### `clearCommitmentUI()`
Clears all UI sections.

```javascript
clearCommitmentUI();
```

### `getCommitmentUIState()`
Gets current UI element counts.

```javascript
const state = getCommitmentUIState();
// {pending: 2, reminders: 1, completed: 3}
```

### `createTaskHTML(task)`
Creates HTML for a single task.

```javascript
const taskHtml = createTaskHTML(task);
```

---

## UI Sections

### 1. Pending Tasks
- Shows incomplete tasks
- Displays action, object, deadline
- Shows status badge
- Empty state: "No pending tasks"

### 2. Reminders
- Shows actionable reminders
- Different icons for "You missed" vs "Reminder"
- Bold format for easy scanning
- Empty state: "No active reminders"

### 3. Completed Tasks
- Shows finished tasks
- Visual differentiation (green theme)
- Same format as pending
- Empty state: "No completed tasks yet"

### 4. Statistics
- Pending count
- Reminders count
- Completed count
- Updates automatically

---

## Styling

### Colors
- **Pending**: Yellow/Amber (#fbbf24)
- **Reminders**: Red (#ef4444)
- **Completed**: Green (#10b981)
- **Primary**: Purple gradient

### Responsive Design
- Works on desktop, tablet, mobile
- Stacked layout on small screens
- Flexible grid on large screens

### Date Display
- "Today" for current date
- "Tomorrow" for next day
- "X days ago" for past
- "In X days" for near future
- "Month Day" for others

---

## Integration with Commitment System

The UI works perfectly with `runCommitmentSystem()`:

```javascript
// Listen for email submissions
async function onEmailSubmit(emailText, userId) {
  try {
    // Process email through system
    const result = await runCommitmentSystem(emailText, userId);
    
    // Update UI with results
    updateCommitmentUI(result);
    
    // Optional: Log stats
    console.log(`Added ${result.stats.newTasks} new tasks`);
    console.log(`Pending: ${result.pending.length}`);
    console.log(`Reminders: ${result.reminders.length}`);
  } catch (error) {
    console.error('Failed to process email:', error);
  }
}
```

---

## Error Handling

The UI gracefully handles:
- ✅ Null/undefined data
- ✅ Empty arrays
- ✅ Invalid task objects
- ✅ Missing deadline dates
- ✅ XSS attacks (HTML escaping)
- ✅ DOM element not found

---

## Empty States

Each section shows user-friendly empty states:

| Section | Icon | Message |
|---------|------|---------|
| Pending Tasks | ✨ | No pending tasks |
| Reminders | 🎯 | No active reminders |
| Completed | 🎉 | No completed tasks yet |

---

## Performance

- Efficient DOM updates
- No unnecessary re-renders
- HTML escaping prevents XSS
- Optimized date formatting
- Minimal memory footprint

---

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

## Customization

### Change Colors
Edit CSS in `CommitmentTracker.html`:
```css
.pending .task-item {
  background: #fffbeb;        /* Change bg */
  border-color: #f59e0b;      /* Change border */
}
```

### Add Custom Fields
Extend `createTaskHTML()`:
```javascript
function createTaskHTML(task) {
  // Add custom fields
  const priority = task.priority || 'normal';
  // ... add to template
}
```

### Change Date Format
Modify `formatDate()`:
```javascript
function formatDate(date) {
  // Use different format
  return date.toLocaleDateString('en-US', options);
}
```

---

## Testing

### Test with Example File
Open `CommitmentTrackerExample.html` in browser and click scenario buttons.

### Test Scenarios
1. **Fresh Tasks**: New pending tasks with reminders
2. **With Updates**: Mix of pending and completed
3. **Mixed Tasks**: Various dates and statuses

---

## Common Issues

### UI not updating
- Check that element IDs match (`pending-list`, `reminders-list`, `completed-list`)
- Verify data format is correct
- Check browser console for errors

### Date formatting issues
- Ensure deadline is a Date object (not string)
- Check timezone settings

### Empty sections showing wrong message
- Clear arrays are properly formatted as `[]`
- Null values handled automatically

---

## API Reference

```javascript
// Main function
updateCommitmentUI(data)                    // Update all sections

// Helper functions
formatDate(date)                             // Format date to string
clearCommitmentUI()                         // Clear all sections
getCommitmentUIState()                     // Get current counts
createTaskHTML(task)                        // Create HTML for task
createEmptyStateHTML(icon, message)        // Create empty state HTML
```

---

## Examples

### Example 1: Update after processing email
```javascript
const emailResult = await runCommitmentSystem(emailText, userId);
updateCommitmentUI(emailResult);
```

### Example 2: Manual data update
```javascript
updateCommitmentUI({
  pending: [
    {action: 'send', object: 'email', deadline: new Date(), status: 'pending'}
  ],
  completed: [],
  reminders: ['Reminder: send email today']
});
```

### Example 3: Periodic refresh
```javascript
setInterval(async () => {
  const overview = getUserTaskOverview(userId);
  updateCommitmentUI(overview);
}, 60000); // Update every minute
```

---

## File Structure

```
src/
├── components/
│   ├── CommitmentTracker.html         # Main template
│   ├── commitmentTrackerUI.js        # JavaScript functions
│   └── CommitmentTrackerExample.html  # Interactive demo
└── utils/
    └── commitmentSystem.js           # System orchestrator
```

---

## Next Steps

1. **Integrate with backend**: Connect to real API endpoints
2. **Add animations**: Enhance with transitions
3. **Add filters**: Allow filtering by date, status, etc.
4. **Add actions**: Mark complete, edit, delete tasks
5. **Persist data**: Save to localStorage or database

---

## Support

For issues or questions:
1. Check example file for usage patterns
2. Review error messages in browser console
3. Verify data format matches specification
4. Check responsive design on target devices

---

**Last Updated**: April 2, 2026
**Version**: 1.0.0
