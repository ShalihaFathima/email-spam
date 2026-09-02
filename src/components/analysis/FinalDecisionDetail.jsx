import React from 'react';
import { motion } from 'framer-motion';
import './FinalDecisionDetail.css';

/**
 * Final Decision Detail Page
 * Shows the final verdict with complete reasoning
 */
const FinalDecisionDetail = ({ data }) => {
  if (!data) return <div className="decision-empty">Loading final decision...</div>;

  const { isSpam = false, confidence = 0, score = 0, totalScore = 0, verdict = '', reasoning = [] } = data;
  
  // Use score if totalScore is not provided (for finalResult data)
  const displayScore = totalScore || score;

  return (
    <motion.div
      className="final-decision-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="decision-container">
        {/* Main Verdict */}
        <motion.div
          className="verdict-box"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <div className={`verdict-badge ${isSpam ? 'spam' : 'legitimate'}`}>
            <span className="verdict-icon">{isSpam ? '🚨' : '✅'}</span>
            <span className="verdict-text">{isSpam ? 'SPAM DETECTED' : 'LEGITIMATE EMAIL'}</span>
          </div>

          <div className="confidence-display">
            <p className="confidence-label">Confidence Level</p>
            <motion.div
              className="confidence-bar"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              <span className="confidence-value">{confidence}%</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Score Summary */}
        <motion.div
          className="score-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>📊 Final Score</h2>
          <div className="score-display">
            <p className="score-number">{displayScore}</p>
            <p className="score-threshold">
              {isSpam ? 'Above' : 'Below'} spam threshold (7.0)
            </p>
          </div>
        </motion.div>

        {/* Reasoning Breakdown */}
        <div className="reasoning-section">
          <h2>🔍 Why This Decision?</h2>
          <p className="reasoning-intro">
            {isSpam
              ? 'This email exhibits multiple spam indicators:'
              : 'This email appears legitimate based on:'}
          </p>

          <div className="reasons-list">
            {reasoning.slice(0, 6).map((reason, idx) => (
              <motion.div
                key={idx}
                className={`reason-item ${reason.impact ? reason.impact : 'neutral'}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <span className={`reason-icon ${reason.impact}`}>
                  {reason.impact === 'positive' ? '✓' : reason.impact === 'negative' ? '✗' : '—'}
                </span>
                <div className="reason-content">
                  <p className="reason-text">{reason.text}</p>
                  <p className="reason-detail">{reason.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Classification Logic */}
        <motion.div
          className="classification-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>⚖️ Classification Rules Applied</h2>
          <p className="logic-description">
            Decision based on comprehensive multi-layer analysis:
          </p>

          <div className="rule-boxes">
            <div className="rule-box">
              <h4>Layer 1: Keyword Detection</h4>
              <p>Bloom Filter scanned for known spam keywords</p>
            </div>

            <div className="rule-box">
              <h4>Layer 2: Pattern Analysis</h4>
              <p>Complex regex patterns checked for phishing/scam indicators</p>
            </div>

            <div className="rule-box">
              <h4>Layer 3: Domain Reputation</h4>
              <p>Email domain checked against suspicious domain database</p>
            </div>

            <div className="rule-box">
              <h4>Layer 4: Structural Analysis</h4>
              <p>Link density, special characters, formatting analyzed</p>
            </div>

            <div className="rule-box">
              <h4>Layer 5: Graph Relationships</h4>
              <p>Sender reputation and email network connections evaluated</p>
            </div>

            <div className="rule-box">
              <h4>Layer 6: Final Classification</h4>
              <p>Aggregate score threshold (7.0) determines final verdict</p>
            </div>
          </div>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          className="recommendation-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className={`recommendation-box ${isSpam ? 'spam-recommendation' : 'legit-recommendation'}`}>
            <h3>📋 Recommended Action</h3>
            {isSpam ? (
              <div className="action-content">
                <p className="action-title">⛔ Move to Spam Folder</p>
                <ul className="action-list">
                  <li>Block sender domain permanently</li>
                  <li>Delete similar emails from sender</li>
                  <li>Report to email provider</li>
                  <li>Add to spam filters for future detection</li>
                </ul>
              </div>
            ) : (
              <div className="action-content">
                <p className="action-title">✅ Keep in Inbox</p>
                <ul className="action-list">
                  <li>Email appears safe to open</li>
                  <li>Sender reputation is good</li>
                  <li>No malicious indicators detected</li>
                  <li>Safe to click links and interact</li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* How We Got Here */}
        <div className="process-section">
          <h2>🔄 Our Analysis Pipeline</h2>
          <p className="process-description">8-step comprehensive spam detection process:</p>

          <div className="process-steps">
            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="process-number">1</span>
              <span className="process-label">Input</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="process-number">2</span>
              <span className="process-label">Tokenization</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="process-number">3</span>
              <span className="process-label">Bloom Filter</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="process-number">4</span>
              <span className="process-label">Hash Table</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="process-number">5</span>
              <span className="process-label">Trie</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="process-number">6</span>
              <span className="process-label">Scoring</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <span className="process-number">7</span>
              <span className="process-label">Graph</span>
            </motion.div>

            <div className="step-arrow">→</div>

            <motion.div
              className="process-step highlighted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
            >
              <span className="process-number">8</span>
              <span className="process-label">Decision</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinalDecisionDetail;
