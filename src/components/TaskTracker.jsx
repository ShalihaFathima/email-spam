import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './TaskTracker.css';
import DateRangeModal from './DateRangeModal';
import RelatedTasks from './RelatedTasks';
import NextActionBanner from './NextActionBanner';
import PriorityOrderSection from './PriorityOrderSection';
import PrioritySortToggle from './PrioritySortToggle';
import DependentTasksPanel from './DependentTasksPanel';
import DependencyGraphVisualizer from './DependencyGraphVisualizer';

/**
 * TASK TRACKER - 5 SECTION UI
 * 
 * Sections:
 * 1. PENDING - Not yet due (>1 day away)
 * 2. REMINDERS - Due soon (≤1 day away)
 * 3. NOT COMPLETED - Overdue & not finished
 * 4. COMPLETED - Done on time
 * 5. COMPLETED LATE - Done after deadline
 */
const TaskTracker = ({ userId = 'john123', onBack }) => {
  const [sections, setSections] = useState({
    pending: [],
    reminders: [],
    completed: [],
    not_completed: [],
    completed_late: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // NEW: Data Structure Visualization Features
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [dateRangeResults, setDateRangeResults] = useState([]);
  const [dateRangeInfo, setDateRangeInfo] = useState(null);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  
  // NEW: Dependency Graph Features
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  /**
   * Load all tasks by section
   */
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/commitments/${userId}/sections`);
      const data = await response.json();

      if (data.success) {
        setSections(data.data);
        // NEW: Aggregate all tasks for PriorityOrderSection and other features
        const all = Object.values(data.data).flat();
        setAllTasks(all);
        console.log('✅ Tasks loaded:', data.summary);
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark task complete
   */
  const completeTask = async (taskId, currentSection) => {
    try {
      const response = await fetch(
        `/api/commitments/${userId}/complete/${taskId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from current section
        setSections(prev => ({
          ...prev,
          [currentSection]: prev[currentSection].filter(t => t._id !== taskId)
        }));

        // Add to target section
        const target = data.data.isLate ? 'completed_late' : 'completed';
        setSections(prev => ({
          ...prev,
          [target]: [data.data.task, ...prev[target]]
        }));

        console.log(`✅ Marked as ${target}`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to complete task');
    }
  };

  /**
   * Sync sections (trigger auto-transitions)
   */
  const syncSections = async () => {
    try {
      setSyncStatus('syncing');

      const response = await fetch(
        `/api/commitments/${userId}/sync`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );

      const data = await response.json();

      if (data.success) {
        setSyncStatus('success');
        await loadTasks();
        setTimeout(() => setSyncStatus(null), 2000);
      } else {
        setSyncStatus('error');
        setError(data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setSyncStatus('error');
    }
  };

  /**
   * Format deadline display
   */
  const formatDate = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(deadline);
    date.setHours(0, 0, 0, 0);

    const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return `${-diff} days ago`;
    if (diff < 7) return `In ${diff} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Task Item
   */
  const TaskItem = ({ task, section }) => (
    <motion.div
      className={`task-item task-${section} ${selectedTaskId === task._id ? 'selected' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={() => setSelectedTaskId(task._id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-action-badge">
        {section !== 'completed' && section !== 'completed_late' ? (
          <button
            className="task-complete-btn"
            onClick={(e) => {
              e.stopPropagation();
              completeTask(task._id, section);
            }}
            title="Mark complete"
          >
            <CheckIcon />
          </button>
        ) : (
          <div className="task-done">✓</div>
        )}
      </div>

      <div className="task-info" onClick={() => setSelectedTaskId(task._id)}>
        <div className="task-action">{task.action}</div>
        <div className="task-object">{task.object}</div>
        <div className="task-date">
          📅 {formatDate(task.deadline)}
          {section === 'completed_late' && task.completedAt && (
            <span className="late-info">
              ({Math.ceil((new Date(task.completedAt) - new Date(task.deadline)) / (1000 * 60 * 60 * 24))} days late)
            </span>
          )}
        </div>
        <div className="click-hint">👆 Click to see dependencies</div>
      </div>

      {task.blockers && task.blockers.length > 0 && (
        <div className="task-warning">
          <WarningIcon />
          <span>Blocked</span>
        </div>
      )}

      {/* NEW: Related Tasks - Dependency Graph visualization */}
      <RelatedTasks taskId={task._id} userId={userId} />
    </motion.div>
  );

  /**
   * Section
   */
  const Section = ({ id, title, icon, tasks, color }) => (
    <div className={`task-section section-${id}`}>
      <div className="section-header" style={{ borderColor: color }}>
        <span className="section-icon">{icon}</span>
        <h2>{title}</h2>
        <span className="count">{tasks.length}</span>
        {id === 'reminders' && tasks.length > 0 && <span className="urgent">URGENT</span>}
      </div>

      <div className="tasks-list">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="empty">📭 No tasks</div>
          ) : (
            tasks.map(task => <TaskItem key={task._id} task={task} section={id} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Load on mount
  useEffect(() => {
    loadTasks();
    const interval = setInterval(() => syncSections(), 30 * 60 * 1000); // Every 30 min
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return <div className="tracker loading"><div className="spinner"></div>Loading...</div>;
  }

  const total = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="tracker-container">
      {/* NEW: Next Action Banner - Priority Queue */}
      <NextActionBanner userId={userId} />

      <div className="tracker-header">
        {onBack && (
          <button className="tracker-back-btn" onClick={onBack} title="Go Back">
            ← Back
          </button>
        )}
        <h1>📋 Task Tracker</h1>
        <div className="tracker-toolbar">
          {/* NEW: Sort Toggle */}
          <PrioritySortToggle
            isActive={sortByPriority}
            onChange={(value) => {
              setSortByPriority(value);
            }}
          />
          {/* NEW: Date Range Query */}
          <button
            className="toolbar-btn"
            onClick={() => setDateRangeModalOpen(true)}
            title="Query tasks by date range (AVL Tree)"
          >
            📅 Date Range
          </button>
          <button
            className={`sync-btn ${syncStatus}`}
            onClick={syncSections}
            disabled={syncStatus === 'syncing'}
          >
            <RefreshIcon /> {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* NEW: Date Range Modal */}
      <DateRangeModal
        userId={userId}
        isOpen={dateRangeModalOpen}
        onClose={() => {
          setDateRangeModalOpen(false);
          setDateRangeResults([]);
          setDateRangeInfo(null);
        }}
        onApply={(tasks, info) => {
          setDateRangeResults(tasks);
          setDateRangeInfo(info);
        }}
      />

      {error && (
        <div className="error-msg">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* NEW: Priority Order Section - Shows all active tasks sorted by urgency */}
      {sortByPriority && allTasks.length > 0 && (
        <PriorityOrderSection allTasks={allTasks} />
      )}

      <div className="sections-grid">
        <Section
          id="pending"
          title="Pending"
          icon="📌"
          tasks={sections.pending}
          color="#FFA500"
        />
        <Section
          id="reminders"
          title="Reminders"
          icon="⏰"
          tasks={sections.reminders}
          color="#FF6B6B"
        />
        <Section
          id="not_completed"
          title="Not Completed"
          icon="❌"
          tasks={sections.not_completed}
          color="#FF4444"
        />
        <Section
          id="completed"
          title="Completed"
          icon="✅"
          tasks={sections.completed}
          color="#4CAF50"
        />
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
            <span className="label">Total:</span>
            <span className="value">{total}</span>
          </div>
          <div className="stat">
            <span className="label">Active:</span>
            <span className="value">{sections.pending.length + sections.reminders.length + sections.not_completed.length}</span>
          </div>
          <div className="stat">
            <span className="label">Done:</span>
            <span className="value">{sections.completed.length + sections.completed_late.length}</span>
          </div>
        </div>
      </div>

      {/* NEW: Dependency Features */}
      {selectedTaskId && (
        <div className="dependency-section">
          <h2>🔗 Task Dependencies & Blockers</h2>
          <DependentTasksPanel 
            userId={userId}
            taskId={selectedTaskId}
            onTaskSelect={setSelectedTaskId}
          />
        </div>
      )}

      <div className="graph-section">
        <h2>📊 Full Dependency Graph</h2>
        <DependencyGraphVisualizer userId={userId} />
      </div>
    </div>
  );
};

export default TaskTracker;
