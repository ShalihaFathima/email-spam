import React from 'react';
import { motion } from 'framer-motion';
import './TokenizationDetail.css';

/**
 * Tokenization Detail Page
 * Shows email breaking into words animation
 */
const TokenizationDetail = ({ data }) => {
  if (!data) return <div className="tokenization-empty">Loading tokenization data...</div>;

  const { originalTokens = [], afterStemming = [], removedCount = 0 } = data;

  return (
    <motion.div
      className="tokenization-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="tokenization-container">
        {/* Original Tokens */}
        <div className="tokens-section">
          <h2>📝 Original Tokens</h2>
          <p className="section-description">Email split into individual words</p>

          <div className="tokens-grid">
            {originalTokens.slice(0, 20).map((token, idx) => (
              <motion.div
                key={idx}
                className="token-chip"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.1 }}
              >
                {token}
              </motion.div>
            ))}
          </div>
          <p className="token-count">
            Total: <strong>{data.totalOriginal || originalTokens.length}</strong> words
          </p>
        </div>

        {/* Processing Arrow */}
        <motion.div
          className="processing-arrow"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span>↓ Preprocessing ↓</span>
          <p className="processing-steps">
            • Lowercasing • Stemming • Stopword Removal
          </p>
        </motion.div>

        {/* Processed Tokens */}
        <div className="tokens-section processed">
          <h2>🔤 Processed Tokens</h2>
          <p className="section-description">After stemming and stopword removal</p>

          <div className="tokens-grid">
            {afterStemming.slice(0, 20).map((token, idx) => (
              <motion.div
                key={idx}
                className="token-chip processed"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ scale: 1.1 }}
              >
                {token}
              </motion.div>
            ))}
          </div>
          <p className="token-count">
            Total: <strong>{data.totalProcessed || afterStemming.length}</strong> tokens
          </p>
        </div>

        {/* Statistics */}
        <div className="statistics-section">
          <h2>📊 Statistics</h2>

          <div className="stats-grid">
            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Removed Words</h3>
              <p className="stat-number">{removedCount}</p>
              <p className="stat-description">Stopwords filtered out</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Reduction Rate</h3>
              <p className="stat-number">
                {data.totalOriginal > 0
                  ? ((removedCount / data.totalOriginal) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="stat-description">Words removed</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenizationDetail;
