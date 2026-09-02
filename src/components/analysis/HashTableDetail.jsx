import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './HashTableDetail.css';

/**
 * Hash Table Detail Page
 * Shows set membership search (FOUND/NOT FOUND)
 */
const HashTableDetail = ({ data }) => {
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  if (!data) return <div className="hashtable-empty">Loading Hash Table data...</div>;

  const {
    totalEntries = 0,
    foundWords = [],
    notFoundWords = [],
    lookupTime = 0,
    dominainMatches = [],
  } = data;

  return (
    <motion.div
      className="hashtable-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="hashtable-container">
        {/* Header */}
        <h1>🔑 Hash Table Analysis</h1>
        <p className="subtitle">O(1) constant-time lookup for exact email domain matching</p>

        {/* Found Words Section */}
        <div className="found-section">
          <h2>✅ Words Found in Hash Table</h2>
          <p className="description">Exact matches against known spam domains and patterns</p>

          <div className="words-grid">
            {foundWords && foundWords.length > 0 ? (
              foundWords.slice(0, 12).map((wordObj, idx) => (
                <motion.div
                  key={idx}
                  className="word-entry found"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseLeave={() => setHighlightedIndex(null)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="status-indicator">✓</div>
                  <div className="word-content">
                    <span className="word-label">{wordObj.token || wordObj}</span>
                    <span className="status">FOUND</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#A0A0A0' }}>
                <p>No spam words detected in this email</p>
              </div>
            )}
          </div>

          <p className="count">
            <strong>{foundWords?.length || 0}</strong> spam word{foundWords?.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Not Found Section */}
        <div className="not-found-section">
          <h2>❌ Words Not in Hash Table</h2>
          <p className="description">Tokens not matching known patterns</p>

          {notFoundWords && notFoundWords.length > 0 ? (
            <div className="not-found-words">
              <div className="words-grid">
                {notFoundWords.slice(0, 12).map((word, idx) => (
                  <motion.div
                    key={idx}
                    className="word-entry not-found"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="status-indicator">✗</div>
                    <div className="word-content">
                      <span className="word-label">{word}</span>
                      <span className="status">NOT FOUND</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="count">
                <strong>{notFoundWords.length}</strong> word{notFoundWords.length !== 1 ? 's' : ''} not in spam database
              </p>
            </div>
          ) : (
            <motion.div
              className="not-found-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="not-found-count">All words found in spam database!</p>
              <p className="explanation">This email contains only known spam keywords</p>
            </motion.div>
          )}
        </div>

        {/* Domain Matches */}
        {dominainMatches && dominainMatches.length > 0 && (
          <div className="domain-matches-section">
            <h2>🌐 Domain Matches</h2>
            <p className="description">Email domains detected as suspicious</p>

            <div className="domain-grid">
              {dominainMatches.slice(0, 8).map((domain, idx) => (
                <motion.div
                  key={idx}
                  className="domain-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <span className="domain-icon">📧</span>
                  <span className="domain-text">{domain}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Stats */}
        <div className="stats-section">
          <h2>⚡ Performance Characteristics</h2>

          <div className="stats-grid">
            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Total Entries</h3>
              <p className="stat-number">{totalEntries}</p>
              <p className="stat-description">in hash table</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3>Lookup Time</h3>
              <p className="stat-number">O(1)</p>
              <p className="stat-description">constant time</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3>Hit Rate</h3>
              <p className="stat-number">
                {totalEntries > 0 ? ((foundWords.length / totalEntries) * 100).toFixed(1) : 0}%
              </p>
              <p className="stat-description">pattern match rate</p>
            </motion.div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h2>⚙️ How Hash Table Lookup Works</h2>
          <div className="steps">
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Input Token</h4>
                <p>Take each word/domain from email</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Compute Hash</h4>
                <p>Hash function converts token to index</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Lookup in Set</h4>
                <p>Check if token exists at hash index</p>
              </div>
            </motion.div>

            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Instant Result</h4>
                <p>Return FOUND or NOT FOUND immediately</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HashTableDetail;
