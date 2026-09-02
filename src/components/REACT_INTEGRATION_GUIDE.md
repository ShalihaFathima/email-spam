/**
 * React Integration Guide - Commitment Tracker UI
 * 
 * Shows how to integrate the plain JS UI with React components
 */

// ==================== OPTION 1: Direct DOM Manipulation ====================
// Use this if you want to keep the plain JS version in a div

import React, { useEffect } from 'react';
import './commitmentTrackerUI.js';

function CommitmentTrackerComponent({ emailText, userId }) {
  useEffect(() => {
    if (emailText && userId) {
      // Fetch data from your system
      const fetchData = async () => {
        const result = await runCommitmentSystem(emailText, userId);
        // Call the plain JS function
        if (window.updateCommitmentUI) {
          window.updateCommitmentUI(result);
        }
      };
      fetchData();
    }
  }, [emailText, userId]);

  return (
    <div id="commitment-tracker-root">
      {/* Include the HTML structure from CommitmentTracker.html */}
    </div>
  );
}

export default CommitmentTrackerComponent;

// ==================== OPTION 2: React Component Version ====================
// Create a pure React version

import React, { useState, useEffect } from 'react';
import './CommitmentTracker.css'; // Reuse styles

function formatDate(date) {
  if (!date || !(date instanceof Date)) return 'No deadline';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (taskDate.getTime() < today.getTime()) {
    const daysAgo = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  }
  const daysFromNow = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
  if (daysFromNow < 7) return `In ${daysFromNow} day${daysFromNow !== 1 ? 's' : ''}`;
  const options = { month: 'short', day: 'numeric' };
  return taskDate.toLocaleDateString('en-US', options);
}

function TaskItem({ task }) {
  if (!task || !task.action || !task.object) return null;

  return (
    <div className={`task-item ${task.status}`}>
      <div className="task-content">
        <div className="task-details">
          <div className="task-action">{task.action}</div>
          <div className="task-object">{task.object}</div>
          <div className="task-deadline">
            <span className="deadline-indicator"></span>
            {formatDate(task.deadline)}
          </div>
        </div>
        <div className={`task-status status-${task.status}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-message">{message}</div>
      <div className="empty-submessage">No tasks to display</div>
    </div>
  );
}

function CommitmentTrackerReact({ data }) {
  const [state, setState] = useState({
    pending: [],
    completed: [],
    reminders: [],
  });

  useEffect(() => {
    if (data) {
      setState({
        pending: Array.isArray(data.pending) ? data.pending : [],
        completed: Array.isArray(data.completed) ? data.completed : [],
        reminders: Array.isArray(data.reminders) ? data.reminders : [],
      });
    }
  }, [data]);

  const stats = {
    pending: state.pending.length,
    reminders: state.reminders.length,
    completed: state.completed.length,
  };

  return (
    <div className="container">
      <div className="tracker-header">
        <h1>📋 Commitment Tracker</h1>
        <p>Track your commitments and stay on top of your tasks</p>
      </div>

      <div className="tracker-content">
        {/* Pending Tasks */}
        <div className="section pending">
          <div className="section-title">
            <div className="section-icon">⏳</div>
            Pending Tasks
          </div>
          {state.pending.length === 0 ? (
            <EmptyState icon="✨" message="No pending tasks" />
          ) : (
            state.pending.map((task, idx) => (
              <TaskItem key={idx} task={task} />
            ))
          )}
        </div>

        {/* Reminders */}
        <div className="section reminders">
          <div className="section-title">
            <div className="section-icon">🔔</div>
            Reminders
          </div>
          {state.reminders.length === 0 ? (
            <EmptyState icon="🎯" message="No active reminders" />
          ) : (
            state.reminders.map((reminder, idx) => (
              <div key={idx} className="reminder-item">
                <span className="reminder-icon">
                  {reminder.includes('You missed') ? '⏰' : '📌'}
                </span>
                {reminder}
              </div>
            ))
          )}
        </div>

        {/* Completed Tasks */}
        <div className="section completed">
          <div className="section-title">
            <div className="section-icon">✅</div>
            Completed Tasks
          </div>
          {state.completed.length === 0 ? (
            <EmptyState icon="🎉" message="No completed tasks yet" />
          ) : (
            state.completed.map((task, idx) => (
              <TaskItem key={idx} task={task} />
            ))
          )}
        </div>

        {/* Statistics */}
        <div className="section stats-bar">
          <div className="stat">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat">
            <div className="stat-number">{stats.reminders}</div>
            <div className="stat-label">Reminders</div>
          </div>
          <div className="stat">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommitmentTrackerReact;

// ==================== OPTION 3: Usage in Email App ====================
// Integrate with your existing email application

import CommitmentTrackerReact from './CommitmentTrackerReact';
import { runCommitmentSystem, getUserTaskOverview } from '../utils/commitmentSystem';

function EmailApp() {
  const [userId] = useState(1); // Current user
  const [trackerData, setTrackerData] = useState(null);

  // When user sends email
  async function handleEmailSent(emailText) {
    try {
      // Run the commitment system
      const result = await runCommitmentSystem(emailText, userId);
      
      // Update tracker UI
      setTrackerData(result);
    } catch (error) {
      console.error('Failed to process email:', error);
    }
  }

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const overview = getUserTaskOverview(userId);
      setTrackerData(overview);
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="app">
      {/* Your email components */}
      <ComposeEmail onEmailSent={handleEmailSent} />
      
      {/* Commitment Tracker */}
      {trackerData && <CommitmentTrackerReact data={trackerData} />}
    </div>
  );
}

export default EmailApp;

// ==================== OPTION 4: Custom Hook ====================
// Create a custom React hook for the tracker

function useCommitmentTracker(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTracker = async (emailText) => {
    setLoading(true);
    try {
      const result = await runCommitmentSystem(emailText, userId);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOverview = async () => {
    try {
      const overview = getUserTaskOverview(userId);
      setData(overview);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const clearTracker = () => {
    setData({
      pending: [],
      completed: [],
      reminders: [],
    });
  };

  return {
    data,
    loading,
    error,
    updateTracker,
    getOverview,
    clearTracker,
  };
}

// Usage
function MyComponent() {
  const { data, loading, updateTracker } = useCommitmentTracker(1);

  return (
    <div>
      <button onClick={() => updateTracker('I will send email today')}>
        Process Email
      </button>
      {loading && <p>Processing...</p>}
      {data && <CommitmentTrackerReact data={data} />}
    </div>
  );
}

// ==================== OPTION 5: Context for Global State ====================
// Manage tracker state globally

import { createContext, useContext, useState } from 'react';

const CommitmentContext = createContext();

export function CommitmentProvider({ children }) {
  const [trackerData, setTrackerData] = useState(null);
  const [userId] = useState(1);

  const updateTracker = async (emailText) => {
    const result = await runCommitmentSystem(emailText, userId);
    setTrackerData(result);
  };

  const getOverview = () => {
    const overview = getUserTaskOverview(userId);
    setTrackerData(overview);
  };

  return (
    <CommitmentContext.Provider value={{ trackerData, updateTracker, getOverview }}>
      {children}
    </CommitmentContext.Provider>
  );
}

// Use in any component
function MyComponent() {
  const { trackerData, updateTracker } = useContext(CommitmentContext);

  return (
    <div>
      {trackerData && <CommitmentTrackerReact data={trackerData} />}
    </div>
  );
}

// ==================== CSS / STYLING ====================
// Reuse styles from CommitmentTracker.html

import './CommitmentTracker.css';

// Or import specific styles as needed
import './styles/tracker.css';
import './styles/responsive.css';

// ==================== TESTING ====================
// Example test using React Testing Library

import { render, screen } from '@testing-library/react';
import CommitmentTrackerReact from './CommitmentTrackerReact';

test('renders pending tasks', () => {
  const data = {
    pending: [
      { action: 'send', object: 'email', deadline: new Date(), status: 'pending' }
    ],
    completed: [],
    reminders: []
  };

  render(<CommitmentTrackerReact data={data} />);
  expect(screen.getByText('send')).toBeInTheDocument();
});

test('shows empty state when no tasks', () => {
  const data = {
    pending: [],
    completed: [],
    reminders: []
  };

  render(<CommitmentTrackerReact data={data} />);
  expect(screen.getByText('No pending tasks')).toBeInTheDocument();
});

// ==================== MIGRATION GUIDE ====================
// Moving from plain JS to React

/*
Step 1: Keep both versions working
- Keep CommitmentTracker.html for standalone use
- Add CommitmentTrackerReact.jsx for React integration

Step 2: Gradually migrate
- Use Option 1 first (wrap JS in React)
- Then move to Option 2 (pure React)
- Finally refactor to Option 3 (integrated)

Step 3: Update imports
- Import data from your Redux/Context store
- Update component props
- Connect to API endpoints

Step 4: Add interactivity
- Add buttons to mark tasks complete
- Add edit/delete functionality
- Add date pickers for deadlines
*/

export {
  CommitmentTrackerReact,
  useCommitmentTracker,
  CommitmentProvider,
  CommitmentContext,
};
