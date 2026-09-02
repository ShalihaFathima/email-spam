import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './CommitmentTracker.css';

/**
 * CommitmentTracker Component - 4 Section Task Management
 * 
 * Sections:
 * 1. PENDING - Tasks not yet due (>1 day away)
 * 2. REMINDERS - Tasks due soon (≤1 day away)
 * 3. COMPLETED - Tasks finished on time or late
 * 4. NOT COMPLETED - Overdue tasks not finished
 * 5. COMPLETED LATE - Tasks completed after deadline
 */
const CommitmentTracker = ({ userId = 'john123' }) => {
  const [sections, setSections] = useState({
    pending: [],
    reminders: [],
    completed: [],
    not_completed: [],
    completed_late: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('reminders');
  const [syncStatus, setSyncStatus] = useState(null);

  /**
   * Load tasks by section from API
   */
  const loadTaskSections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/commitments/${userId}/sections`);
      const data = await response.json();

      if (data.success) {
        setSections(data.data);
        console.log('✅ Loaded tasks by section:', data.summary);
      } else {
        setError(data.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark task as complete
   */
  const handleCompleteTask = async (taskId, currentSection) => {
    try {
      const response = await fetch(`/api/commitments/${userId}/complete/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove from current section
        setSections(prev => ({
          ...prev,
          [currentSection]: prev[currentSection].filter(t => t._id !== taskId)
        }));

        // Add to completed or completed_late section
        const targetSection = data.data.isLate ? 'completed_late' : 'completed';
        setSections(prev => ({
          ...prev,
          [targetSection]: [data.data.task, ...prev[targetSection]]
        }));

        console.log(`✅ Task marked as ${data.data.movedToSection}`);
      } else {
        setError(data.message || 'Failed to complete task');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };

  /**
   * Sync task sections (trigger transitions)
   */
  const handleSync = async () => {
    try {
      setSyncStatus('syncing');

      const response = await fetch(`/api/commitments/${userId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus('success');
        // Reload sections
        await loadTaskSections();
        setTimeout(() => setSyncStatus(null), 2000);
      } else {
        setSyncStatus('error');
        setError(data.message || 'Failed to sync');
      }
    } catch (err) {
      console.error('Error syncing:', err);
      setSyncStatus('error');
      setError('Failed to sync tasks');
    }
  };

  /**
   * Format deadline for display
   */
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(deadline);
    taskDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

    if (taskDate < today) {
      const daysAgo = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} overdue`;
    }

    const daysFromNow = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
    if (daysFromNow < 7) return `In ${daysFromNow} day${daysFromNow !== 1 ? 's' : ''}`;

    const options = { month: 'short', day: 'numeric' };
    return taskDate.toLocaleDateString('en-US', options);
  };

  /**
   * Task Item Component
   */
  const TaskItem = ({ task, section }) => (
    <motion.div
      className={`task-item section-${section}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="task-checkbox">
        {section !== 'completed' && section !== 'completed_late' && (
          <button
            className="complete-btn"
            onClick={() => handleCompleteTask(task._id, section)}
            title="Mark as complete"
          >
            <CheckIcon />
          </button>
        )}
        {(section === 'completed' || section === 'completed_late') && (
          <div className="completed-badge">✓</div>
        )}
      </div>

      <div className="task-content">
        <div className="task-action">{task.action}</div>
        <div className="task-object">{task.object}</div>
        <div className="task-deadline">
          <span className="deadline-icon">📅</span>
          {formatDeadline(task.deadline)}
          {section === 'completed_late' && task.completedAt && (
            <span className="late-badge">
              (Completed {Math.ceil((new Date(task.completedAt) - new Date(task.deadline)) / (1000 * 60 * 60 * 24))} days late)
            </span>
          )}
        </div>
      </div>

      {task.blockers && task.blockers.length > 0 && (
        <div className="blocker-warning">
          <WarningIcon />
          <span>Blocked by {task.blockers.length} overdue task(s)</span>
        </div>
      )}
    </motion.div>
  );

  /**
   * Section Component
   */
  const Section = ({ id, title, icon, tasks, color }) => (
    <div className={`section section-${id}`}>
      <div className="section-header" style={{ borderColor: color }}>
        <div className="section-title">
          <span className="section-icon">{icon}</span>
          <h2>{title}</h2>
          <span className="task-count">{tasks.length}</span>
        </div>
        {id === 'reminders' && tasks.length > 0 && (
          <span className="urgent-badge">URGENT!</span>
        )}
      </div>

      <div className="task-list">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="empty-section">
              <div className="empty-icon">📭</div>
              <p>No tasks</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskItem key={task._id} task={task} section={id} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Load on mount
  useEffect(() => {
    loadTaskSections();
    // Auto-sync every 30 minutes
    const syncInterval = setInterval(() => {
      handleSync();
    }, 30 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, [userId]);

  if (loading) {
    return (
      <div className="commitment-tracker loading">
        <div className="loader"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="commitment-tracker">
      <div className="tracker-header">
        <h1>📋 Commitment Tracker</h1>
        <div className="header-controls">
          <button
            className={`sync-btn ${syncStatus}`}
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            title="Synchronize task sections"
          >
            <RefreshIcon />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="sections-container">
        {/* PENDING SECTION */}
        <Section
          id="pending"
          title="Pending"
          icon="📌"
          tasks={sections.pending}
          color="#FFA500"
        />

        {/* REMINDERS SECTION - MOST IMPORTANT */}
        <Section
          id="reminders"
          title="Reminders"
          icon="⏰"
          tasks={sections.reminders}
          color="#FF6B6B"
        />

        {/* NOT COMPLETED SECTION */}
        <Section
          id="not_completed"
          title="Not Completed"
          icon="❌"
          tasks={sections.not_completed}
          color="#FF4444"
        />

        {/* COMPLETED ON TIME SECTION */}
        <Section
          id="completed"
          title="Completed"
          icon="✅"
          tasks={sections.completed}
          color="#4CAF50"
        />

        {/* COMPLETED LATE SECTION */}
        <Section
          id="completed_late"
          title="Completed Late"
          icon="⏳"
          tasks={sections.completed_late}
          color="#FFD700"
        />
      </div>

      <div className="tracker-footer">
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total:</span>
            <span className="stat-value">
              {Object.values(sections).reduce((sum, arr) => sum + arr.length, 0)}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Active:</span>
            <span className="stat-value">
              {sections.pending.length + sections.reminders.length + sections.not_completed.length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Done:</span>
            <span className="stat-value">
              {sections.completed.length + sections.completed_late.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentTracker;
