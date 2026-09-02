import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './TrieDetail.css';

/**
 * Trie Detail Page
 * Shows tree structure traversal animation
 */
const TrieDetail = ({ data }) => {
  const [expandedNode, setExpandedNode] = useState(null);

  if (!data) return <div className="trie-empty">Loading Trie data...</div>;

  const {
    traversalSteps = [],
    patternsFound = [],
    depth = 0,
    totalNodes = 0,
    matchedPatterns = [],
  } = data;

  return (
    <motion.div
      className="trie-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="trie-container">
        {/* Header */}
        <h1>🌳 Trie (Prefix Tree) Analysis</h1>
        <p className="subtitle">Efficient pattern matching for email content detection</p>

        {/* Traversal Steps */}
        <div className="traversal-section">
          <h2>🔍 Traversal Steps</h2>
          <p className="description">How the Trie matches spam patterns in this email</p>

          {traversalSteps && traversalSteps.length > 0 ? (
            <div className="traversal-timeline">
              {traversalSteps.slice(0, 15).map((step, idx) => (
                <motion.div
                  key={idx}
                  className="traversal-step"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => setExpandedNode(expandedNode === idx ? null : idx)}
                >
                  <div className="step-marker">
                    <span className="marker-number">{idx + 1}</span>
                  </div>
                  <div className="step-details">
                    <p className="step-character">
                      Character: <strong className="char-highlight">"{step.character}"</strong>
                    </p>
                    <p className="step-action">→ {step.action}</p>
                    {expandedNode === idx && (
                      <motion.div
                        className="step-expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <p className="detail">📍 {step.detail}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No spam patterns detected in this email</p>
              <p className="sub-text">This Trie traversal would find no matches</p>
            </div>
          )}
        </div>

        {/* Patterns Found */}
        <div className="patterns-section">
          <h2>✅ Patterns Matched</h2>
          <p className="description">Spam keywords detected via Trie matching</p>

          {matchedPatterns && matchedPatterns.length > 0 ? (
            <>
              <div className="patterns-grid">
                {matchedPatterns.slice(0, 12).map((pattern, idx) => (
                  <motion.div
                    key={idx}
                    className="pattern-card found"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)' }}
                  >
                    <span className="pattern-icon">⚠️</span>
                    <span className="pattern-text">{pattern}</span>
                    <span className="pattern-badge">{pattern.length} chars</span>
                  </motion.div>
                ))}
              </div>
              <p className="pattern-count">
                Total spam patterns found: <strong>{matchedPatterns.length}</strong>
              </p>
            </>
          ) : (
            <div className="empty-state">
              <p>No spam patterns found</p>
              <p className="sub-text">This email doesn't match known spam keywords</p>
            </div>
          )}
        </div>

        {/* Trie Structure Overview */}
        <div className="structure-section">
          <h2>📊 Trie Structure Statistics</h2>
          <p className="description">Prefix tree organization for efficient pattern matching</p>

          <div className="structure-stats-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="stat-icon">🌳</div>
              <h3>Tree Depth</h3>
              <p className="stat-value">{depth > 0 ? depth : 'N/A'}</p>
              <p className="stat-description">
                {depth > 0 
                  ? `Longest word has ${depth} characters`
                  : 'No words detected'}
              </p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="stat-icon">🔗</div>
              <h3>Total Nodes</h3>
              <p className="stat-value">{totalNodes > 0 ? totalNodes : '0'}</p>
              <p className="stat-description">
                {totalNodes > 0
                  ? `${totalNodes} character nodes in Trie`
                  : 'No nodes created'}
              </p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="stat-icon">⚠️</div>
              <h3>Patterns Found</h3>
              <p className="stat-value">{matchedPatterns?.length || '0'}</p>
              <p className="stat-description">
                {matchedPatterns?.length > 0
                  ? `${matchedPatterns.length} spam word${matchedPatterns.length !== 1 ? 's' : ''}`
                  : 'No spam patterns'}
              </p>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="stat-icon">⚡</div>
              <h3>Lookup Time</h3>
              <p className="stat-value">O(m)</p>
              <p className="stat-description">m = length of pattern</p>
            </motion.div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h2>⚙️ How Trie Matching Works</h2>
          <div className="steps">
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Start at Root</h4>
                <p>Begin traversal from root node</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Follow Path</h4>
                <p>For each character, follow edge to next node</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Match Pattern</h4>
                <p>If end-of-word marker found, pattern matched!</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Continue</h4>
                <p>Backtrack to find all prefix patterns</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrieDetail;
