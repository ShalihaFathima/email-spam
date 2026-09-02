import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NextActionBanner.css';

/**
 * NEXT ACTION BANNER - PRIORITY QUEUE VISUALIZATION
 * Shows the most urgent task (O(1) peek from heap)
 */
const NextActionBanner = ({ userId }) => {
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextAction();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNextAction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNextAction = async () => {
    try {
      const response = await fetch(
        `/api/commitments/${userId}/priority/next`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setNextAction(data.data);
      } else {
        setNextAction(null);
      }
    } catch (err) {
      console.error('Error fetching next action:', err);
      setNextAction(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !nextAction) {
    return null;
  }

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue <= 0) return 'critical';
    if (daysUntilDue <= 1) return 'urgent';
    if (daysUntilDue <= 3) return 'soon';
    return 'normal';
  };

  const urgency = getUrgencyColor(nextAction.daysUntilDue);

  return (
    <motion.div
      className={`nab-container urgency-${urgency}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
    >
      <div className="nab-content">
        <div className="nab-icon">🎯</div>
        <div className="nab-text">
          <div className="nab-label">NEXT ACTION:</div>
          <div className="nab-task">
            {nextAction.action} <strong>{nextAction.object}</strong>
          </div>
        </div>
        <div className="nab-deadline">
          <div className="nab-due">
            {nextAction.daysUntilDue === 0
              ? '⚡ TODAY'
              : nextAction.daysUntilDue === 1
              ? '⚠️ TOMORROW'
              : `📅 In ${nextAction.daysUntilDue} days`}
          </div>
          <div className="nab-date">
            {new Date(nextAction.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Animated pulse for urgent tasks */}
      {urgency === 'urgent' || urgency === 'critical' ? (
        <motion.div
          className="nab-pulse"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ) : null}
    </motion.div>
  );
};

export default NextActionBanner;
