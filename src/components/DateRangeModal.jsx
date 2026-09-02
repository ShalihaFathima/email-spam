import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DateRangeModal.css';

/**
 * DATE RANGE MODAL - AVL TREE VISUALIZATION
 * Query tasks between two dates (O(log n + k))
 */
const DateRangeModal = ({ userId, isOpen, onClose, onApply }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleApply = async () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/commitments/${userId}/daterange?start=${startDate}&end=${endDate}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data.tasks || []);
        onApply(data.data.tasks || [], { start: startDate, end: endDate });
        console.log(`✅ Found ${data.data.count} tasks in date range`);
      } else {
        setError(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching date range:', err);
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const setQuickDate = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(today);

    if (preset === 'thisweek') {
      const dayOfWeek = today.getDay();
      start.setDate(today.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
    } else if (preset === 'nextweek') {
      const dayOfWeek = today.getDay();
      start.setDate(today.getDate() - dayOfWeek + 7);
      end.setDate(start.getDate() + 6);
    } else if (preset === 'thismonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setResults([]);
    setError(null);
    onApply([], null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="drm-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="drm-modal"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drm-header">
            <h2>📅 Query Tasks by Date Range</h2>
            <p className="drm-subtitle">AVL Tree Range Query (O(log n + k))</p>
            <button className="drm-close" onClick={onClose}>✕</button>
          </div>

          <div className="drm-content">
            <div className="drm-presets">
              <button
                className="drm-preset"
                onClick={() => setQuickDate('thisweek')}
              >
                This Week
              </button>
              <button
                className="drm-preset"
                onClick={() => setQuickDate('nextweek')}
              >
                Next Week
              </button>
              <button
                className="drm-preset"
                onClick={() => setQuickDate('thismonth')}
              >
                This Month
              </button>
            </div>

            <div className="drm-inputs">
              <div className="drm-input-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="drm-input"
                />
              </div>
              <div className="drm-input-group">
                <label>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="drm-input"
                />
              </div>
            </div>

            {error && <div className="drm-error">⚠️ {error}</div>}

            <div className="drm-actions">
              <button
                className="drm-apply"
                onClick={handleApply}
                disabled={loading}
              >
                {loading ? '⏳ Loading...' : '✅ Apply'}
              </button>
              <button className="drm-clear" onClick={handleClear}>
                🔄 Clear
              </button>
            </div>

            {results.length > 0 && (
              <motion.div
                className="drm-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3>📊 Found {results.length} task(s)</h3>
                <div className="drm-tasks">
                  {results.map((task, idx) => (
                    <motion.div
                      key={idx}
                      className="drm-task"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="drm-task-action">{task.action}</div>
                      <div className="drm-task-object">{task.object}</div>
                      <div className="drm-task-date">
                        📅 {new Date(task.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {results.length === 0 && startDate && endDate && !loading && (
              <div className="drm-empty">📭 No tasks in this date range</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DateRangeModal;
