import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete as DeleteIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import './CommitmentTracker.css';

/**
 * CommitmentTracker Component
 * Displays pending, reminders, and completed tasks
 * Integrates with commitmentSystem utilities
 */
const CommitmentTracker = ({ trackerData, onRefresh }) => {
  const [data, setData] = useState({
    pending: [],
    completed: [],
    reminders: [],
    stats: {}
  });

  useEffect(() => {
    if (trackerData) {
      setData(trackerData);
    }
  }, [trackerData]);

  /**
   * Format date for display
   */
  const formatDate = (date) => {
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
  };

  /**
   * Mark task as complete
   */
  const markTaskComplete = async (task) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Call refresh to reload data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  /**
   * Render single task item
   */
  const TaskItem = ({ task, status }) => {
    if (!task || !task.action || !task.object) return null;

    const statusColors = {
      pending: '#FFA500',
      reminder: '#FF6B6B',
      completed: '#4CAF50'
    };

    return (
      <motion.div
        className={`task-item ${status}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        style={{ borderLeft: `4px solid ${statusColors[status]}` }}
      >
        <div className="task-content">
          <div className="task-main">
            <div className="task-action">{task.action}</div>
            <div className="task-object">{task.object}</div>
          </div>
          <div className="task-deadline">
            <span className="deadline-label">📅</span>
            {formatDate(task.deadline)}
          </div>
        </div>
        <div className="task-actions">
          {status === 'pending' && (
            <button
              className="complete-button"
              onClick={() => markTaskComplete(task)}
              title="Mark as completed"
            >
              <CheckIcon />
              <span>Complete</span>
            </button>
          )}
          <div className={`task-status status-${status}`}>
            {status === 'completed' ? '✓' : status === 'reminder' ? '!' : '○'}
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * Render empty state
   */
  const EmptyState = ({ icon, message }) => (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-message">{message}</div>
    </div>
  );

  const pendingTasks = Array.isArray(data.pending) ? data.pending : [];
  const completedTasks = Array.isArray(data.completed) ? data.completed : [];
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];

  return (
    <div className="commitment-tracker-container">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-title">
          <span className="header-icon">📋</span>
          <h2>Commitment Tracker</h2>
        </div>
        <p className="header-subtitle">Track your commitments and stay organized</p>
      </div>

      {/* Statistics Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">{pendingTasks.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{reminders.length}</div>
          <div className="stat-label">Reminders</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{completedTasks.length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="tracker-sections">
        {/* Pending Tasks Section */}
        <motion.div 
          className="tracker-section pending-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="section-header">
            <span className="section-icon">⏳</span>
            <h3>Pending Tasks</h3>
          </div>
          <div className="section-content">
            <AnimatePresence mode="wait">
              {pendingTasks.length === 0 ? (
                <EmptyState key="empty-pending" icon="✨" message="No pending tasks" />
              ) : (
                <div className="tasks-list">
                  {pendingTasks.map((task, idx) => (
                    <TaskItem key={`pending-${idx}`} task={task} status="pending" />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Reminders Section */}
        <motion.div 
          className="tracker-section reminders-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="section-header">
            <span className="section-icon">🔔</span>
            <h3>Active Reminders</h3>
          </div>
          <div className="section-content">
            <AnimatePresence mode="wait">
              {reminders.length === 0 ? (
                <EmptyState key="empty-reminders" icon="🎯" message="No active reminders" />
              ) : (
                <div className="reminders-list">
                  {reminders.map((reminder, idx) => (
                    <motion.div
                      key={`reminder-${idx}`}
                      className="reminder-item"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="reminder-icon">
                        {reminder.includes('missed') ? '⏰' : '📌'}
                      </span>
                      <span className="reminder-text">{reminder}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Completed Tasks Section */}
        <motion.div 
          className="tracker-section completed-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="section-header">
            <span className="section-icon">✅</span>
            <h3>Completed Tasks</h3>
          </div>
          <div className="section-content">
            <AnimatePresence mode="wait">
              {completedTasks.length === 0 ? (
                <EmptyState key="empty-completed" icon="🎉" message="No completed tasks yet" />
              ) : (
                <div className="tasks-list">
                  {completedTasks.map((task, idx) => (
                    <TaskItem key={`completed-${idx}`} task={task} status="completed" />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Empty State if no data */}
      {pendingTasks.length === 0 && 
       completedTasks.length === 0 && 
       reminders.length === 0 && (
        <div className="no-data-state">
          <div className="no-data-icon">📭</div>
          <h3>No commitments yet</h3>
          <p>Send emails with commitments to get started!</p>
          <p className="example-text">Example: "I will send the report by tomorrow"</p>
        </div>
      )}
    </div>
  );
};

export default CommitmentTracker;
