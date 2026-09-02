import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/FlowVisualization.css';

/**
 * Email Input Step - Shows raw email content
 */
const EmailInputStep = ({ data, isActive }) => {
  return (
    <motion.div
      className="flow-step email-input-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">1</span>
        <h3>📧 Email Input</h3>
      </div>
      <div className="email-content">
        <div className="email-field">
          <span className="label">From:</span>
          <span className="value">{data?.sender || 'Unknown'}</span>
        </div>
        <div className="email-field">
          <span className="label">Subject:</span>
          <span className="value">{data?.subject || 'No subject'}</span>
        </div>
        <div className="email-body-preview">
          <span className="label">Body:</span>
          <p>{data?.preview || 'No content'}</p>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Tokenization Step - Words breaking into boxes with animation
 */
const TokenizationStep = ({ data, isActive }) => {
  const tokens = data?.afterStemming?.slice(0, 15) || [];
  
  return (
    <motion.div
      className="flow-step tokenization-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">2</span>
        <h3>📝 Tokenization</h3>
        <span className="step-info">{tokens.length} tokens</span>
      </div>
      
      <div className="tokens-container">
        {tokens.map((token, idx) => (
          <motion.div
            key={idx}
            className="token-box"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' }}
          >
            {token}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="stat-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{ delay: 0.3 }}
      >
        <span>Original: {data?.totalOriginal || 0}</span>
        <span>After Stemming: {data?.totalProcessed || 0}</span>
        <span>Removed: {data?.removedCount || 0}</span>
      </motion.div>
    </motion.div>
  );
};

/**
 * Bloom Filter Visualization - Animated bit array with glow effects
 */
const BloomFilterStep = ({ data, isActive }) => {
  const tokens = data?.tokens?.slice(0, 8) || [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedToken = tokens[selectedIdx];
  
  return (
    <motion.div
      className="flow-step bloom-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">3</span>
        <h3>🎯 Bloom Filter</h3>
        <span className="step-info">1024 bits, 4 hash functions</span>
      </div>

      {/* Token Selector */}
      <div className="token-selector">
        <div className="selector-label">Select Word:</div>
        <div className="token-buttons">
          {tokens.map((t, idx) => (
            <motion.button
              key={idx}
              className={`token-btn ${selectedIdx === idx ? 'active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.token}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bit Array Visualization */}
      {selectedToken && (
        <motion.div
          className="bit-array-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hash-positions">
            {[selectedToken.hash1, selectedToken.hash2, selectedToken.hash3, selectedToken.hash4].map((pos, idx) => (
              <motion.div
                key={idx}
                className="hash-info"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <span className="hash-label">h{idx + 1}</span>
                <span className="hash-value">{pos}</span>
              </motion.div>
            ))}
          </div>

          {/* Bit Array Display */}
          <div className="bit-array">
            {Array.from({ length: 64 }).map((_, idx) => {
              const positions = [selectedToken.hash1, selectedToken.hash2, selectedToken.hash3, selectedToken.hash4];
              const isHighlighted = positions.includes(idx);
              
              return (
                <motion.div
                  key={idx}
                  className={`bit ${isHighlighted ? 'active' : ''}`}
                  animate={{
                    boxShadow: isHighlighted
                      ? '0 0 15px rgba(212, 175, 55, 1), inset 0 0 10px rgba(212, 175, 55, 0.5)'
                      : '0 0 5px rgba(100, 100, 100, 0.3)'
                  }}
                  transition={{ delay: isHighlighted ? 0.2 : 0 }}
                >
                  {isHighlighted ? '1' : '0'}
                </motion.div>
              );
            })}
          </div>

          <div className="bit-info">
            <span className="info-badge found">🚫 Found in filter</span>
            <span className="info-text">Hash positions highlighted</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Hash Table Visualization - Matching words
 */
const HashTableStep = ({ data, isActive }) => {
  const foundWords = data?.foundWords?.slice(0, 8) || [];
  const notFoundWords = data?.notFoundWords?.slice(0, 5) || [];

  return (
    <motion.div
      className="flow-step hashtable-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">4</span>
        <h3>📊 Hash Table Lookup</h3>
        <span className="step-info">O(1) lookup</span>
      </div>

      <div className="words-grid">
        <div className="words-section found">
          <h4>🚫 Found Spam Words</h4>
          <div className="words-list">
            {foundWords.map((word, idx) => (
              <motion.div
                key={idx}
                className="word-item found"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 50, 50, 0.8)' }}
              >
                <span className="word-text">{word?.token || word?.word}</span>
                <span className="badge">✓</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="words-section clean">
          <h4>✅ Clean Words</h4>
          <div className="words-list">
            {notFoundWords.slice(0, 5).map((word, idx) => (
              <motion.div
                key={idx}
                className="word-item clean"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(50, 200, 100, 0.8)' }}
              >
                <span className="word-text">{word}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Trie Visualization - Tree traversal
 */
const TrieStep = ({ data, isActive }) => {
  const paths = data?.paths?.slice(0, 3) || [];
  const [selectedPath, setSelectedPath] = useState(0);
  const currentPath = paths[selectedPath];

  return (
    <motion.div
      className="flow-step trie-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">5</span>
        <h3>🌳 Trie Traversal</h3>
        <span className="step-info">Prefix matching</span>
      </div>

      <div className="path-selector">
        {paths.map((path, idx) => (
          <motion.button
            key={idx}
            className={`path-btn ${selectedPath === idx ? 'active' : ''} ${path.isSpamWord ? 'spam' : 'clean'}`}
            onClick={() => setSelectedPath(idx)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {path.token}
            <span className="status">{path.isSpamWord ? '🚫' : '✅'}</span>
          </motion.button>
        ))}
      </div>

      {currentPath && (
        <motion.div
          className="trie-tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="node root-node">
            <span>ROOT</span>
          </div>

          {currentPath.characters && currentPath.characters.map((char, idx) => (
            <motion.div
              key={idx}
              className="node-path"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="line"></div>
              <motion.div
                className={`node ${idx === currentPath.characters.length - 1 && currentPath.isSpamWord ? 'end' : ''}`}
                animate={{
                  boxShadow: `0 0 ${10 + idx * 5}px ${currentPath.isSpamWord ? 'rgba(255, 50, 50, 0.8)' : 'rgba(50, 200, 100, 0.8)'}`,
                }}
              >
                <span>{char}</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Score Animation - Dynamic score increase
 */
const ScoreStep = ({ data, isActive }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const totalScore = data?.totalScore || 0;

  useEffect(() => {
    if (!isActive) {
      setDisplayScore(0);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      if (current < totalScore) {
        current += totalScore / 20;
        setDisplayScore(Math.min(Math.round(current), totalScore));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, totalScore]);

  const breakdown = data?.breakdown || [];

  return (
    <motion.div
      className="flow-step score-step"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">6</span>
        <h3>📈 Spam Score Calculation</h3>
      </div>

      <motion.div
        className="score-display"
        animate={{
          boxShadow: `0 0 ${20 + displayScore * 5}px rgba(212, 175, 55, ${displayScore / totalScore})`,
        }}
      >
        <div className="score-number">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={displayScore}
          >
            {displayScore}
          </motion.span>
          <span className="score-max">/ 10</span>
        </div>
        <motion.div
          className="score-bar"
          initial={{ width: '0%' }}
          animate={{ width: `${(displayScore / 10) * 100}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </motion.div>

      <div className="breakdown-list">
        {breakdown.map((item, idx) => (
          <motion.div
            key={idx}
            className="breakdown-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <span className="breakdown-label">{item?.label || 'Component'}</span>
            <span className="breakdown-value">+{item?.points || 0} pts</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Final Result - Big animated result with glow
 */
const FinalResultStep = ({ data, isActive }) => {
  const isSpam = data?.isSpam ?? false;

  return (
    <motion.div
      className={`flow-step final-step ${isSpam ? 'spam' : 'legitimate'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isActive ? 1 : 0.3, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="step-header">
        <span className="step-number">7</span>
        <h3>✨ Final Decision</h3>
      </div>

      <motion.div
        className={`result-box ${isSpam ? 'spam' : 'legitimate'}`}
        animate={{
          boxShadow: isSpam
            ? '0 0 40px rgba(255, 50, 50, 0.8), inset 0 0 20px rgba(255, 50, 50, 0.3)'
            : '0 0 40px rgba(50, 200, 100, 0.8), inset 0 0 20px rgba(50, 200, 100, 0.3)',
        }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="result-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          {isSpam ? '🚨' : '✅'}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isSpam ? 'SPAM DETECTED' : 'NOT SPAM'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="result-message"
        >
          {data?.message || 'Analysis complete'}
        </motion.p>

        <motion.div
          className="result-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="stat">
            <span className="label">Score:</span>
            <span className="value">{data?.score || 0} / 10</span>
          </div>
          <div className="stat">
            <span className="label">Confidence:</span>
            <span className="value">{data?.confidence || 0}%</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Main Flow Visualization Component
 */
const FlowVisualization = ({ analysisData }) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!analysisData) {
    return (
      <div className="flow-loading">
        <div className="spinner"></div>
        <p>Loading analysis...</p>
      </div>
    );
  }

  const pipeline = analysisData.pipeline || [];

  return (
    <div className="flow-visualization">
      {/* Flow Steps */}
      <div className="flow-container">
        <AnimatePresence mode="wait">
          {/* Email Input */}
          {pipeline[0] && (
            <EmailInputStep
              key="email"
              data={pipeline[0].data}
              isActive={activeStep === 1}
            />
          )}

          {/* Tokenization */}
          {pipeline[1] && (
            <TokenizationStep
              key="tokenization"
              data={pipeline[1].data}
              isActive={activeStep === 2}
            />
          )}

          {/* Bloom Filter */}
          {pipeline[2] && (
            <BloomFilterStep
              key="bloom"
              data={pipeline[2].data}
              isActive={activeStep === 3}
            />
          )}

          {/* Hash Table */}
          {pipeline[3] && (
            <HashTableStep
              key="hashtable"
              data={pipeline[3].data}
              isActive={activeStep === 4}
            />
          )}

          {/* Trie */}
          {pipeline[4] && (
            <TrieStep
              key="trie"
              data={pipeline[4].data}
              isActive={activeStep === 5}
            />
          )}

          {/* Score */}
          {pipeline[5] && (
            <ScoreStep
              key="score"
              data={pipeline[5].data}
              isActive={activeStep === 6}
            />
          )}

          {/* Final Result */}
          {analysisData.finalResult && (
            <FinalResultStep
              key="final"
              data={analysisData.finalResult}
              isActive={activeStep === 7}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Step Navigation */}
      <div className="step-navigation">
        <div className="nav-label">Steps:</div>
        <div className="nav-buttons">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <motion.button
              key={step}
              className={`nav-btn ${activeStep === step ? 'active' : ''}`}
              onClick={() => setActiveStep(step)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {step}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Auto-play Controls */}
      <div className="flow-controls">
        <motion.button
          className="btn-prev"
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={activeStep === 1}
        >
          ← Previous
        </motion.button>
        <span className="step-counter">{activeStep} / 7</span>
        <motion.button
          className="btn-next"
          onClick={() => setActiveStep(Math.min(7, activeStep + 1))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={activeStep === 7}
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
};

export default FlowVisualization;
