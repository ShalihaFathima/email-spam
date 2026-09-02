import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './BloomFilterDetail.css';

/**
 * Bloom Filter Detail Page
 * Shows bit array with hash positions highlighted
 */
const BloomFilterDetail = ({ data }) => {
  const [expandedWord, setExpandedWord] = useState(null);

  // DEBUG: Log all data
  console.log('🔵 BloomFilterDetail RECEIVED DATA:', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : 'N/A',
    tokensLength: data?.tokens?.length || 0,
    firstToken: data?.tokens?.[0] || 'no tokens',
    fullData: data
  });

  if (!data) return <div className="bloom-empty">Loading Bloom Filter data...</div>;

  const { 
    tokens = [],
    filterSize = 1024, 
    hashFunctions = 4
  } = data;

  console.log('📊 BloomFilterDetail AFTER DESTRUCTURE:', {
    tokensCount: tokens.length,
    filterSize,
    hashFunctions,
    tokensSample: tokens.slice(0, 3)
  });

  // Hash function to compute values consistently
  const computeHash = (word, hashNum) => {
    let hash = 0;
    switch(hashNum) {
      case 1:
        hash = Math.abs(word.split('').reduce((h, c) => h + c.charCodeAt(0), 0)) % 1024;
        break;
      case 2:
        hash = Math.abs(word.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1024, 0)) % 1024;
        break;
      case 3:
        hash = Math.abs(word.split('').reduce((h, c) => (((h << 5) + h) ^ c.charCodeAt(0)), 5381)) % 1024;
        break;
      case 4:
        hash = Math.abs(word.split('').reduce((h, c) => (h + c.charCodeAt(0)) * 0x9e3779b9, 0) >>> 0) % 1024;
        break;
      default:
        hash = 0;
    }
    return hash;
  };

  // Example words: Use ACTUAL detected spam words from the email
  // Each word gets its own hash values
  const exampleWords = (tokens && tokens.length > 0) 
    ? tokens.map(tokenObj => {
        const word = tokenObj.token || tokenObj;
        return {
          word: word,
          hashes: [computeHash(word, 1), computeHash(word, 2), computeHash(word, 3), computeHash(word, 4)],
          found: true  // These are actual detected words from the email
        };
      })
    : [];  // No detected words = empty array

  // Create interactive bit array with highlighted positions
  const bitArray = Array(128).fill(0); // 128 bytes = 1024 bits

  // Mark bits that are set by our detected words
  tokens.forEach(token => {
    if (token.hash1 !== undefined) bitArray[Math.floor(token.hash1 / 8)] = 1;
    if (token.hash2 !== undefined) bitArray[Math.floor(token.hash2 / 8)] = 1;
    if (token.hash3 !== undefined) bitArray[Math.floor(token.hash3 / 8)] = 1;
    if (token.hash4 !== undefined) bitArray[Math.floor(token.hash4 / 8)] = 1;
  });

  // For demo, show first 128 bits
  const displayBits = bitArray.slice(0, 128);

  return (
    <motion.div
      className="bloom-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bloom-container">
        {/* Header */}
        <h1>🔍 Bloom Filter Analysis</h1>
        <p className="subtitle">Fast probabilistic data structure for spam keyword detection</p>

        {/* Bit Array Visualization */}
        <div className="bit-array-section">
          <h2>📦 Bit Array (1024 bits - showing first 128)</h2>
          <p className="description">Each bit represents a memory location. Blue = 1 (set), Gray = 0 (unset)</p>
          <p className="description">🔴 Bits are SET when spam words are detected</p>

          <div className="bit-array">
            {displayBits.map((bit, idx) => (
              <motion.div
                key={idx}
                className={`bit ${bit === 1 ? 'set' : 'unset'}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.01 }}
                title={`Bit ${idx}: ${bit}`}
              >
                {idx % 16 === 0 ? <span className="bit-label">{idx}</span> : ''}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Hash Functions Visualization */}
        <div className="hash-positions-section">
          <h2>🎯 Interactive Hash Functions Visualization</h2>
          <p className="description">Click on any hash value to highlight bit positions in the bit array above</p>

          {tokens.length > 0 ? (
            <div className="words-table-container">
              <table className="words-hash-table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>🔑 Hash 1</th>
                    <th>🔑 Hash 2</th>
                    <th>🔑 Hash 3</th>
                    <th>🔑 Hash 4</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((wordObj, idx) => (
                    <React.Fragment key={idx}>
                      <motion.tr
                        className="word-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => setExpandedWord(expandedWord === idx ? null : idx)}
                      >
                        <td className="word-cell">
                          <span className="spam-badge">⚠️</span>
                          <span className="word-name">{wordObj.token}</span>
                        </td>
                        <td 
                          className="hash-cell interactive-hash"
                        >
                          <div className="hash-box">
                            <span className="hash-label">Bit</span>
                            {wordObj.hash1}
                          </div>
                        </td>
                        <td 
                          className="hash-cell interactive-hash"
                        >
                          <div className="hash-box">
                            <span className="hash-label">Bit</span>
                            {wordObj.hash2}
                          </div>
                        </td>
                        <td 
                          className="hash-cell interactive-hash"
                        >
                          <div className="hash-box">
                            <span className="hash-label">Bit</span>
                            {wordObj.hash3}
                          </div>
                        </td>
                        <td 
                          className="hash-cell interactive-hash"
                        >
                          <div className="hash-box">
                            <span className="hash-label">Bit</span>
                            {wordObj.hash4}
                          </div>
                        </td>
                        <td className="details-cell">
                          <button 
                            className="details-btn"
                            onClick={() => setExpandedWord(expandedWord === idx ? null : idx)}
                          >
                            {expandedWord === idx ? '▼' : '▶'}
                          </button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded row with explanation */}
                      {expandedWord === idx && (
                        <motion.tr 
                          className="expanded-row"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan="6" className="expanded-content">
                            <div className="explanation-box">
                              <h4>Word Detection Logic for: <strong>"{wordObj.token}"</strong></h4>
                              
                              <div className="hash-visualization">
                                <h5>📍 Hash Function Mapping:</h5>
                                <div className="hash-flow">
                                  <div className="hash-input">
                                    <span className="input-label">Input Word: <strong>"{wordObj.token}"</strong></span>
                                  </div>
                                  <div className="arrow">↓</div>
                                  <div className="hash-functions">
                                    <div className="hash-function-box">
                                      <span className="hash-fn-name">Hash Fn #1</span>
                                      <span className="hash-fn-result">→ Bit {wordObj.hash1}</span>
                                    </div>
                                    <div className="hash-function-box">
                                      <span className="hash-fn-name">Hash Fn #2</span>
                                      <span className="hash-fn-result">→ Bit {wordObj.hash2}</span>
                                    </div>
                                    <div className="hash-function-box">
                                      <span className="hash-fn-name">Hash Fn #3</span>
                                      <span className="hash-fn-result">→ Bit {wordObj.hash3}</span>
                                    </div>
                                    <div className="hash-function-box">
                                      <span className="hash-fn-name">Hash Fn #4</span>
                                      <span className="hash-fn-result">→ Bit {wordObj.hash4}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="logic-section">
                                <h5>✅ Checking if Word Exists:</h5>
                                <div className="logic-flow">
                                  <div className="check-steps">
                                    <div className="check-step">
                                      <span className="check-icon">✓</span>
                                      <div className="check-content">
                                        <strong>Step 1:</strong> Check if these 4 bits are SET (1)
                                        <div className="bits-check">
                                          <span className="bit-check-item">Bit {wordObj.hash1}: SET ✓</span>
                                          <span className="bit-check-item">Bit {wordObj.hash2}: SET ✓</span>
                                          <span className="bit-check-item">Bit {wordObj.hash3}: SET ✓</span>
                                          <span className="bit-check-item">Bit {wordObj.hash4}: SET ✓</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="check-step">
                                      <span className="check-icon">→</span>
                                      <div className="check-content">
                                        <strong>Result:</strong> <span className="result-match">ALL BITS SET = WORD FOUND ✅</span>
                                      </div>
                                    </div>
                                    <div className="check-step">
                                      <span className="check-icon">⚡</span>
                                      <div className="check-content">
                                        <strong>Score Impact:</strong> <span className="score-add">+2 points to spam score</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="note-box">
                                <strong>💡 How Bloom Filter Works:</strong> This data structure uses multiple hash functions to map each word to different bit positions. If ANY bit is 0, word is NOT in dictionary. If ALL bits are 1, word is PROBABLY in dictionary.
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-words-section">
              <div className="no-words">
                <span className="no-words-icon">🔍</span>
                <p>No spam words detected in this email</p>
                <p className="no-words-sub">This email appears to be legitimate or uses words not in the spam database</p>
              </div>
              
              {/* Show example visualization */}
              <div className="example-visualization">
                <h5>📚 Example: How Hash Functions Work</h5>
                <p>Here's how the system detects spam words using different hash values for each word:</p>
                <p className="example-desc">⚠️ Each word produces 4 DIFFERENT bit positions. If ALL 4 bits are SET in filter, word is FOUND!</p>
                <div className="example-table-container">
                  <table className="example-table">
                    <thead>
                      <tr>
                        <th>Spam Word</th>
                        <th>Hash 1</th>
                        <th>Hash 2</th>
                        <th>Hash 3</th>
                        <th>Hash 4</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exampleWords.map((item, idx) => (
                        <tr key={idx} className={`example-row ${item.found ? 'found' : 'not-found'}`}>
                          <td className="example-word">{item.word}</td>
                          <td className="example-hash">{item.hashes[0]}</td>
                          <td className="example-hash">{item.hashes[1]}</td>
                          <td className="example-hash">{item.hashes[2]}</td>
                          <td className="example-hash">{item.hashes[3]}</td>
                          <td className="example-result">
                            {item.found ? '✅ FOUND' : '❌ NOT FOUND'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="example-explanation">
                  {exampleWords.length > 0 ? (
                    <>
                      {exampleWords.slice(0, 3).map((item, idx) => (
                        <p key={idx}>✓ "{item.word}" checks bits {item.hashes.join(', ')} - all SET means word is FOUND!</p>
                      ))}
                      {exampleWords.length > 3 && (
                        <p>... and {exampleWords.length - 3} more spam word{exampleWords.length - 3 !== 1 ? 's' : ''}</p>
                      )}
                    </>
                  ) : (
                    <p>No spam keywords detected in this email - all words are safe!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="stats-section">
          <h2>📊 Filter Performance - Spam Detection Summary</h2>

          <div className="detection-status">
            {tokens.length > 0 ? (
              <div className="status-detected">
                <span className="status-icon">⚠️ SPAM DETECTED!</span>
                <p>Found {tokens.length} spam word{tokens.length !== 1 ? 's' : ''} in this email</p>
              </div>
            ) : (
              <div className="status-clean">
                <span className="status-icon">✅ CLEAN</span>
                <p>No spam words detected in this email</p>
              </div>
            )}
          </div>

          <div className="stats-grid">
            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3>Spam Words Detected</h3>
              <p className="stat-number">{tokens.length}</p>
              <p className="stat-description">from 113 total keywords</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3>Spam Score Contribution</h3>
              <p className="stat-number">{tokens.length * 2}</p>
              <p className="stat-description">{tokens.length > 0 ? '+2 per matched word' : '0 words = 0 points'}</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3>Bloom Filter Size</h3>
              <p className="stat-number">{filterSize}</p>
              <p className="stat-description">bits for fast lookup</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3>Hash Functions</h3>
              <p className="stat-number">{hashFunctions}</p>
              <p className="stat-description">independ. functions/word</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3>Detection Rate</h3>
              <p className="stat-number">{tokens.length > 0 ? '⚠️ HIGH' : '✅ CLEAR'}</p>
              <p className="stat-description">{tokens.length > 0 ? 'Risk present' : 'Safe email'}</p>
            </motion.div>

            <motion.div
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h3>Threshold Status</h3>
              <p className="stat-number">{tokens.length * 2 >= 2 ? '✗ FAIL' : '✓ PASS'}</p>
              <p className="stat-description">{tokens.length * 2 >= 2 ? 'Score ≥ 2: SPAM' : 'Score < 2: OK'}</p>
            </motion.div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h2>⚙️ How Bloom Filter Works</h2>
          <div className="steps">
            <motion.div
              className="step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Hash Functions</h4>
                <p>Email tokenized and passed through 4 independent hash functions</p>
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
                <h4>Bit Checking</h4>
                <p>Each hash produces position in 1024-bit array. Check if bit is 1</p>
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
                <h4>Match Detection</h4>
                <p>If all 4 hash positions are 1, word likely in spam dictionary</p>
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
                <h4>Fast Detection</h4>
                <p>Operations: O(k) where k=4 hash functions. Extremely efficient!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BloomFilterDetail;
