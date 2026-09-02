import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RelatedTasks.css';

/**
 * RELATED TASKS COMPONENT - DEPENDENCY GRAPH VISUALIZATION
 * Shows tasks that block or are blocked by the current task (O(k))
 */
const RelatedTasks = ({ userId, taskId, taskAction, taskObject }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [relatedData, setRelatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isExpanded && !relatedData) {
      fetchRelatedTasks();
    }
  }, [isExpanded]);

  const fetchRelatedTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/commitments/${userId}/task/${taskId}/related`
      );
      const data = await response.json();

      if (data.success) {
        setRelatedData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching related tasks:', err);
      setError('Failed to fetch related tasks');
    } finally {
      setLoading(false);
    }
  };

  if (!relatedData && !isExpanded) {
    return (
      <button
        className="rt-trigger"
        onClick={() => setIsExpanded(true)}
        title="Show related tasks"
      >
        🔗 Related
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="rt-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rt-header">
            <span className="rt-title">🔗 Related Tasks</span>
            <button
              className="rt-close"
              onClick={() => setIsExpanded(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {loading && (
            <div className="rt-loading">⏳ Loading...</div>
          )}

          {error && (
            <div className="rt-error">⚠️ {error}</div>
          )}

          {relatedData && !loading && (
            <div className="rt-content">
              {/* Blocked By */}
              {relatedData.blockedBy && relatedData.blockedBy.length > 0 && (
                <div className="rt-section">
                  <div className="rt-section-title">⬅️ Blocked By:</div>
                  <div className="rt-tasks">
                    {relatedData.blockedBy.map((task, idx) => (
                      <motion.div
                        key={idx}
                        className="rt-task"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="rt-badge blocking">MUST COMPLETE</div>
                        <div className="rt-task-text">
                          <strong>{task.action}</strong> {task.object}
                        </div>
                        {task.deadline && (
                          <div className="rt-task-date">
                            📅 {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocks */}
              {relatedData.blocks && relatedData.blocks.length > 0 && (
                <div className="rt-section">
                  <div className="rt-section-title">➡️ Blocks:</div>
                  <div className="rt-tasks">
                    {relatedData.blocks.map((task, idx) => (
                      <motion.div
                        key={idx}
                        className="rt-task"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="rt-badge blocked">WAITING</div>
                        <div className="rt-task-text">
                          <strong>{task.action}</strong> {task.object}
                        </div>
                        {task.deadline && (
                          <div className="rt-task-date">
                            📅 {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Related Tasks */}
              {(!relatedData.blockedBy || relatedData.blockedBy.length === 0) &&
                (!relatedData.blocks || relatedData.blocks.length === 0) && (
                  <div className="rt-empty">✓ No related tasks (independent)</div>
                )}

              <div className="rt-info">
                Total related: {relatedData.totalRelated}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RelatedTasks;
