import React from 'react';
import { motion } from 'framer-motion';
import './StepCard.css';

/**
 * StepCard Component - Interactive data structure step card
 * Shows summary info and responds to click/hover
 */
const StepCard = ({ 
  stepNumber, 
  icon, 
  title, 
  description,
  stats,
  onExpand,
  isActive 
}) => {
  return (
    <motion.div
      className={`step-card ${isActive ? 'active' : ''}`}
      onClick={onExpand}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: stepNumber * 0.1 }}
    >
      {/* Glow effect */}
      <div className="card-glow" />
      
      {/* Card Content */}
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-title-section">
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="card-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-mini">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Click to Expand Hint */}
      <div className="card-footer">
        <span className="expand-hint">Click to explore →</span>
      </div>

      {/* Active indicator */}
      {isActive && <div className="active-indicator" />}
    </motion.div>
  );
};

export default StepCard;
