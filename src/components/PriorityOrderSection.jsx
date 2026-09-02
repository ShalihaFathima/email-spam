import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PriorityOrderSection.css';

/**
 * PRIORITY ORDER SECTION - SHOWS ALL TASKS SORTED BY URGENCY
 * Uses Priority Queue ordering (earliest deadlines first)
 */
const PriorityOrderSection = ({ userId, allTasks = [] }) => {
  const [sortedTasks, setSortedTasks] = useState([]);

  useEffect(() => {
    // Sort tasks by deadline (earliest first) - Priority Queue order
    const sorted = [...allTasks].sort((a, b) => 
      new Date(a.deadline) - new Date(b.deadline)
    );
    setSortedTasks(sorted);
  }, [allTasks]);

  const getUrgencyLevel = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(deadline);
    taskDate.setHours(0, 0, 0, 0);

    const daysUntil = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { level: 'overdue', label: '🔴 OVERDUE', days: daysUntil };
    if (daysUntil === 0) return { level: 'urgent', label: '🔴 TODAY', days: 0 };
    if (daysUntil === 1) return { level: 'urgent', label: '🟠 TOMORROW', days: 1 };
    if (daysUntil <= 3) return { level: 'soon', label: '🟡 SOON', days: daysUntil };
    if (daysUntil <= 7) return { level: 'normal', label: '🟢 THIS WEEK', days: daysUntil };
    return { level: 'later', label: '🔵 LATER', days: daysUntil };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'completed_late': return 'completed-late';
      case 'not_completed': return 'overdue';
      default: return 'pending';
    }
  };

  if (sortedTasks.length === 0) {
    return null;
  }

  return (
    <div className="pos-section">
      <div className="pos-header">
        <span className="pos-icon">⭐</span>
        <h2>Priority Order</h2>
        <span className="pos-count">{sortedTasks.length}</span>
      </div>

      <div className="pos-tasks">
        <AnimatePresence>
          {sortedTasks.map((task, idx) => {
            const urgency = getUrgencyLevel(task.deadline);
            const statusColor = getStatusColor(task.status);

            return (
              <motion.div
                key={task._id}
                className={`pos-task pos-status-${statusColor} pos-urgency-${urgency.level}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="pos-rank">#{idx + 1}</div>

                <div className="pos-info">
                  <div className="pos-task-title">
                    {task.action} <strong>{task.object}</strong>
                  </div>
                  <div className="pos-deadline">
                    📅 {new Date(task.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: new Date(task.deadline).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </div>
                </div>

                <div className="pos-urgency-badge">
                  {urgency.label}
                </div>

                {task.blockers && task.blockers.length > 0 && (
                  <div className="pos-blocked">
                    ⚠️ {task.blockers.length}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pos-footer">
        <div className="pos-legend">
          <div className="pos-legend-item">
            <span className="pos-legend-dot urgent"></span>
            <span>Urgent (0-1 days)</span>
          </div>
          <div className="pos-legend-item">
            <span className="pos-legend-dot soon"></span>
            <span>Soon (2-3 days)</span>
          </div>
          <div className="pos-legend-item">
            <span className="pos-legend-dot normal"></span>
            <span>This Week</span>
          </div>
          <div className="pos-legend-item">
            <span className="pos-legend-dot later"></span>
            <span>Later</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityOrderSection;
