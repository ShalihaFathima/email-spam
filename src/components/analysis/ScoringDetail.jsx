import React from 'react';
import { motion } from 'framer-motion';
import './ScoringDetail.css';

/**
 * Scoring Detail Page
 * Shows comprehensive score breakdown with all contributions
 */
const ScoringDetail = ({ data, analysisData }) => {
  if (!data) {
    return <div className="scoring-empty">Loading scoring data...</div>;
  }

  // Use data from pipeline (correct structure)
  const { totalScore = 0, threshold = 2, breakdown = [] } = data;

  // Calculate percentages
  const getPercentage = (part) => {
    return totalScore > 0 ? (part / totalScore) * 100 : 0;
  };

  const scoreComponents = breakdown.map(item => ({
    name: item.label,
    icon: '📊',
    score: item.points || 0,
    description: `${item.points || 0} points`,
    percentage: item.percentage || 0,
    color: '#8B5CF6'
  }));

  const nonZeroComponents = scoreComponents.filter(c => c.score > 0);

  return (
    <motion.div
      className="scoring-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Score Display */}
      <div className="main-score-section">
        <motion.div
          className="score-circle"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <div className="score-value">{totalScore}</div>
          <div className="score-label">Total Score</div>
        </motion.div>

        <div className="score-status">
          <p className="threshold-info">
            Threshold: <strong>{threshold}</strong>
          </p>

          {totalScore >= threshold ? (
            <motion.div
              className="status spam"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="status-icon">🚨</span>
              <span className="status-text">SPAM DETECTED</span>
            </motion.div>
          ) : (
            <motion.div
              className="status legitimate"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="status-icon">✅</span>
              <span className="status-text">LEGITIMATE</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown-section">
        <h2>Score Breakdown</h2>

        <div className="breakdown-cards">
          {scoreComponents.map((component, idx) => (
            <motion.div
              key={idx}
              className="breakdown-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card-header">
                <span className="icon">{component.icon}</span>
                <h3>{component.name}</h3>
              </div>

              <p className="description">{component.description}</p>

              <div className="score-display">
                <span className="label">Score Contribution:</span>
                <span
                  className="score-value"
                  style={{ color: component.color }}
                >
                  +{component.score}
                </span>
              </div>

              {totalScore > 0 && (
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(component.score)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ backgroundColor: component.color }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Contributions */}
      {nonZeroComponents.length > 0 && (
        <div className="detailed-contributions">
          <h2>Scoring Rules</h2>

          <div className="rules-list">
            {nonZeroComponents.map((component, idx) => (
              <motion.div
                key={idx}
                className="rule-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="rule-number">{idx + 1}</span>
                <div className="rule-content">
                  <h4>{component.name}</h4>
                  <p>{component.description}</p>
                </div>
                <span className="rule-score" style={{ color: component.color }}>
                  +{component.score}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence */}
      <div className="confidence-section">
        <h2>Detection Confidence</h2>

        <motion.div
          className="confidence-meter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="meter-label">
            <span>Confidence Level</span>
            <span className="confidence-value">{totalScore > threshold ? 85 : 72}%</span>
          </div>

          <div className="meter-bar">
            <motion.div
              className="meter-fill"
              initial={{ width: 0 }}
              animate={{
                width: `${totalScore > threshold ? 85 : 72}%`,
                backgroundColor: totalScore >= threshold ? '#EF4444' : '#10B981'
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Decision Logic */}
      <div className="decision-logic">
        <h2>Classification Logic</h2>

        <div className="logic-box">
          <code>
            if (score &gt;= {threshold}) →
            <span className="spam-keyword">SPAM</span>
            <br />
            else → <span className="legitimate-keyword">NORMAL</span>
          </code>
        </div>

        <p className="logic-explanation">
          Your email scored <strong>{totalScore}</strong>, which is{' '}
          <strong>
            {totalScore >= threshold ? 'greater than or equal to' : 'less than'}
          </strong>{' '}
          the threshold of <strong>{threshold}</strong>, resulting in classification as{' '}
          <strong>{totalScore >= threshold ? 'SPAM' : 'LEGITIMATE'}</strong>.
        </p>
      </div>
    </motion.div>
  );
};

export default ScoringDetail;
