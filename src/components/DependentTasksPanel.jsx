import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DependentTasksPanel.css';

/**
 * DependentTasksPanel Component
 * 
 * Displays task dependencies to show graph DS is working:
 * - Tasks that block the current task (must be done first)
 * - Tasks that depend on the current task
 * - Visual indicators for readiness and urgency
 * - Shows the task dependency graph in action
 */
const DependentTasksPanel = ({ userId, taskId, onTaskSelect }) => {
  const [dependencies, setDependencies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!userId || !taskId) return;
    
    fetchDependencies();
  }, [userId, taskId]);

  const fetchDependencies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/commitments/${userId}/task/${taskId}/dependencies`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dependencies');
      }

      const result = await response.json();
      setDependencies(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dependencies:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!dependencies || loading) {
    return (
      <div className="dependent-tasks-panel loading">
        <div className="loading-spinner"></div>
        <p>Loading dependencies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dependent-tasks-panel error">
        <p>Error: {error}</p>
      </div>
    );
  }

  const { task, blockers, dependents, readiness } = dependencies;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'reminder':
        return '⏰';
      case 'not_completed':
        return '✕';
      default:
        return '⊙';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'reminder':
        return 'warning';
      case 'not_completed':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getReadinessIcon = () => {
    if (readiness.isReady) {
      return '🚀';
    }
    return '🔒';
  };

  const daysClass = task.isOverdue ? 'overdue' : 
                   task.daysUntilDue <= 1 ? 'urgent' :
                   task.daysUntilDue <= 3 ? 'soon' : 'pending';

  return (
    <motion.div 
      className={`dependent-tasks-panel ${expanded ? 'expanded' : 'collapsed'}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="panel-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-content">
          <h3>Task Dependencies</h3>
          <div className="header-stats">
            <span className="stat blockers" title="Blocking tasks">
              🔗 {blockers.count}
            </span>
            <span className="stat dependents" title="Dependent tasks">
              📌 {dependents.count}
            </span>
            <span className={`readiness-badge ${readiness.isReady ? 'ready' : 'blocked'}`}>
              {getReadinessIcon()} {readiness.isReady ? 'Ready' : 'Blocked'}
            </span>
          </div>
        </div>
        <span className={`expand-icon ${expanded ? 'open' : 'closed'}`}>
          ⌄
        </span>
      </div>

      {/* Task Info Card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="panel-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Current Task Summary */}
            <div className="task-summary">
              <div className="task-header">
                <div className="task-title">
                  <span className="task-action">{task.action}</span>
                  <span className="task-object">{task.object}</span>
                </div>
                <div className={`deadline-badge ${daysClass}`}>
                  {task.isOverdue ? '⚠️ OVERDUE' : `📅 ${task.daysUntilDue}d`}
                </div>
              </div>
              <div className="task-status">
                <span className={`status-badge ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)} {task.status}
                </span>
              </div>
            </div>

            {/* Blockers Section */}
            {blockers.count > 0 && (
              <div className="dependencies-section blockers-section">
                <div className="section-title">
                  <span className="title-icon">🔗</span>
                  <span className="title-text">
                    Blocking Tasks ({blockers.count})
                  </span>
                  {blockers.allCompleted && (
                    <span className="section-badge success">All Done!</span>
                  )}
                </div>

                <div className="tasks-list">
                  {blockers.tasks.map((blocker) => (
                    <motion.div
                      key={blocker.taskId}
                      className={`task-item blocker ${blocker.isCompleted ? 'completed' : 'pending'}`}
                      whileHover={{ x: 4 }}
                      onClick={() => onTaskSelect?.(blocker.taskId)}
                    >
                      <div className="task-item-content">
                        <div className="task-item-main">
                          <span className={`status-icon ${getStatusColor(blocker.status)}`}>
                            {getStatusIcon(blocker.status)}
                          </span>
                          <div className="task-item-text">
                            <span className="item-action">{blocker.action}</span>
                            <span className="item-object">{blocker.object}</span>
                          </div>
                        </div>
                        <div className="task-item-deadline">
                          {new Date(blocker.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      {blocker.isCompleted && (
                        <div className="completed-checkmark">✓</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Blockers Message */}
            {blockers.count === 0 && (
              <div className="no-dependencies blockers">
                <span className="icon">✓</span>
                <span className="text">No blocking tasks! This task is ready to start.</span>
              </div>
            )}

            {/* Dependents Section */}
            {dependents.count > 0 && (
              <div className="dependencies-section dependents-section">
                <div className="section-title">
                  <span className="title-icon">📌</span>
                  <span className="title-text">
                    Dependent Tasks ({dependents.count})
                  </span>
                  {dependents.blockedCount > 0 && (
                    <span className="section-badge warning">
                      {dependents.blockedCount} blocked
                    </span>
                  )}
                </div>

                <div className="tasks-list">
                  {dependents.tasks.map((dependent) => (
                    <motion.div
                      key={dependent.taskId}
                      className={`task-item dependent ${dependent.isBlocked ? 'blocked' : 'ready'}`}
                      whileHover={{ x: 4 }}
                      onClick={() => onTaskSelect?.(dependent.taskId)}
                    >
                      <div className="task-item-content">
                        <div className="task-item-main">
                          <span className={`status-icon ${dependent.isBlocked ? 'warning' : 'info'}`}>
                            {dependent.isBlocked ? '⊘' : '→'}
                          </span>
                          <div className="task-item-text">
                            <span className="item-action">{dependent.action}</span>
                            <span className="item-object">{dependent.object}</span>
                          </div>
                        </div>
                        <div className="task-item-deadline">
                          {new Date(dependent.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      {dependent.isBlocked && (
                        <div className="blocked-indicator">🔒</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Dependents Message */}
            {dependents.count === 0 && (
              <div className="no-dependencies dependents">
                <span className="icon">-</span>
                <span className="text">No tasks depend on this one.</span>
              </div>
            )}

            {/* Readiness Information */}
            <div className={`readiness-info ${readiness.isReady ? 'ready' : 'blocked'}`}>
              <div className="readiness-icon">
                {readiness.isReady ? '✓' : '⚠'}
              </div>
              <div className="readiness-text">
                <div className="readiness-title">
                  {readiness.isReady ? 'Ready to Start' : 'Currently Blocked'}
                </div>
                <div className="readiness-reason">
                  {readiness.reason}
                </div>
                {readiness.canStart && (
                  <div className="readiness-action">
                    You can start working on this task now!
                  </div>
                )}
              </div>
            </div>

            {/* Graph DS Explanation */}
            <div className="graph-ds-info">
              <div className="info-title">📊 Dependency Graph Data Structure</div>
              <div className="info-content">
                <p>
                  This panel demonstrates a <strong>Directed Acyclic Graph (DAG)</strong> data structure:
                </p>
                <ul>
                  <li><strong>Nodes:</strong> Each task is a node ({blockers.count + dependents.count + 1} in this chain)</li>
                  <li><strong>Edges:</strong> Dependencies shown as directed arrows (A → B means A must finish before B)</li>
                  <li><strong>Cycles:</strong> The system prevents circular dependencies automatically</li>
                  <li><strong>Critical Path:</strong> The longest chain of dependencies determines minimum project duration</li>
                </ul>
                <p className="complexity-info">
                  ⚡ <strong>Time Complexity:</strong> Finding blockers O(k) where k = number of dependencies
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DependentTasksPanel;
