import React, { useState, useEffect } from 'react';
import './DataStructuresVisualization.css';

/**
 * Data Structures Visualization Component
 * Shows real-time visualization of:
 * 1. Bloom Filter - bit array with hash positions
 * 2. Spam Words Trie - structured word hierarchy
 * 3. Hash Table - sender domain hashing
 */
function DataStructuresVisualization() {
  const [activeTab, setActiveTab] = useState('bloom-filter');
  const [bloomData, setBloomData] = useState(null);
  const [spamWords, setSpamWords] = useState([]);
  const [hashTableData, setHashTableData] = useState(null);
  const [searchWord, setSearchWord] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordHashPositions, setWordHashPositions] = useState([]);
  const [senderEmail, setSenderEmail] = useState('john@gmail.com');
  const [emailHashData, setEmailHashData] = useState(null);

  /**
   * Simulate Bloom Filter data from backend
   */
  useEffect(() => {
    // Mock Bloom Filter data
    setBloomData({
      size: 1024,
      numHashFunctions: 4,
      insertedWords: 113,
      bitArray: generateMockBitArray(128), // 1024 bits = 128 bytes
      setBits: 274,
      fillRate: '26.76%',
      loadFactor: '0.11',
      exampleWord: 'click',
      examplePositions: [45, 112, 278, 521],
    });

    // Spam words
    setSpamWords([
      { category: 'Financial', words: ['win', 'prize', 'free', 'cash', 'claim', 'reward', 'bitcoin', 'loan'] },
      { category: 'Urgency', words: ['urgent', 'act', 'now', 'click', 'confirm', 'verify', 'immediately'] },
      { category: 'Security', words: ['account', 'suspend', 'password', 'update', 'locked', 'verify'] },
      { category: 'Health', words: ['viagra', 'pill', 'weight', 'loss', 'diet', 'cure'] },
      { category: 'Scam', words: ['offer', 'deal', 'discount', 'secret', 'exclusive', 'opportunity'] },
    ]);

    // Hash table data
    setHashTableData({
      totalBuckets: 16,
      filledBuckets: 8,
      domains: {
        'gmail.com': { count: 45, bucket: 2, emailCount: 45 },
        'yahoo.com': { count: 23, bucket: 5, emailCount: 23 },
        'hotmail.com': { count: 12, bucket: 8, emailCount: 12 },
        'domain.com': { count: 8, bucket: 11, emailCount: 8 },
        'company.co.uk': { count: 6, bucket: 3, emailCount: 6 },
        'mailinator.com': { count: 15, bucket: 7, emailCount: 15 },
        'tempmail.org': { count: 9, bucket: 12, emailCount: 9 },
        'proton.me': { count: 5, bucket: 14, emailCount: 5 },
      },
      loadFactor: 0.5,
    });
  }, []);

  /**
   * Generate mock bit array (128 bytes representing 1024 bits)
   */
  function generateMockBitArray(bytes) {
    const bitArray = [];
    for (let i = 0; i < bytes; i++) {
      // Random pattern with some populated bits
      bitArray.push(Math.floor(Math.random() * 256));
    }
    return bitArray;
  }

  /**
   * Simulate hash function calculation
   */
  function simulateHash(word) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash += word.charCodeAt(i);
    }
    return hash % 1024;
  }

  /**
   * Search for word and show hash positions
   */
  const handleWordSearch = (word) => {
    setSearchWord(word);
    if (word.length > 0) {
      const positions = [
        simulateHash(word),
        (simulateHash(word) + 123) % 1024,
        (simulateHash(word) + 456) % 1024,
        (simulateHash(word) + 789) % 1024,
      ];
      setWordHashPositions(positions);
    } else {
      setWordHashPositions([]);
    }
  };

  /**
   * Calculate hash for sender email
   */
  const calculateEmailHash = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const bucket = Math.abs(hash) % 16;
    return bucket;
  };

  const handleEmailHashCalculate = () => {
    if (senderEmail.trim()) {
      const bucket = calculateEmailHash(senderEmail);
      setEmailHashData({
        email: senderEmail,
        hashValue: senderEmail
          .split('')
          .map((c) => c.charCodeAt(0))
          .join(' + '),
        bucket: bucket,
        display: `Hash(${senderEmail}) % 16 = ${bucket}`,
      });
    }
  };

  return (
    <div className="data-structures-container">
      <div className="ds-header">
        <h1>📊 Data Structures Visualization</h1>
        <p>Interactive visualization of internal data structures used in spam detection</p>
      </div>

      {/* Tabs */}
      <div className="ds-tabs">
        <button
          className={`ds-tab ${activeTab === 'bloom-filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('bloom-filter')}
        >
          🔵 Bloom Filter
        </button>
        <button
          className={`ds-tab ${activeTab === 'spam-words' ? 'active' : ''}`}
          onClick={() => setActiveTab('spam-words')}
        >
          📝 Spam Words
        </button>
        <button
          className={`ds-tab ${activeTab === 'hash-table' ? 'active' : ''}`}
          onClick={() => setActiveTab('hash-table')}
        >
          🔗 Hash Table
        </button>
      </div>

      {/* Bloom Filter Visualization */}
      {activeTab === 'bloom-filter' && bloomData && (
        <div className="ds-content bloom-filter-viz">
          <div className="viz-section">
            <h2>🔵 Bloom Filter Structure</h2>
            <div className="bloom-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Filter Size:</span>
                  <span className="value">{bloomData.size} bits</span>
                </div>
                <div className="info-item">
                  <span className="label">Hash Functions:</span>
                  <span className="value">{bloomData.numHashFunctions}</span>
                </div>
                <div className="info-item">
                  <span className="label">Words Inserted:</span>
                  <span className="value">{bloomData.insertedWords}</span>
                </div>
                <div className="info-item">
                  <span className="label">Bits Set:</span>
                  <span className="value">{bloomData.setBits}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fill Rate:</span>
                  <span className="value">{bloomData.fillRate}</span>
                </div>
                <div className="info-item">
                  <span className="label">False Positive Rate:</span>
                  <span className="value">1.62%</span>
                </div>
              </div>
            </div>

            {/* Bit Array Visualization */}
            <div className="bit-array-section">
              <h3>📐 Bit Array (1024 bits)</h3>
              <p className="description">
                Each bit represents a position in the Bloom Filter. Blue bits = set (1), Gray bits = unset (0)
              </p>
              <div className="bit-array">
                {bloomData.bitArray.map((byte, byteIndex) => (
                  <div key={byteIndex} className="byte-group">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((bitIndex) => {
                      const isBitSet = (byte & (1 << bitIndex)) !== 0;
                      const globalBitIndex = byteIndex * 8 + bitIndex;
                      const isExample = bloomData.examplePositions.includes(globalBitIndex);

                      return (
                        <div
                          key={`${byteIndex}-${bitIndex}`}
                          className={`bit ${isBitSet ? 'set' : 'unset'} ${isExample ? 'example' : ''}`}
                          title={`Bit ${globalBitIndex}`}
                        >
                          {isBitSet ? '1' : '0'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hash Function Visualization */}
            <div className="hash-functions-section">
              <h3>🔑 Hash Functions for Word: "{bloomData.exampleWord}"</h3>
              <div className="hash-functions-grid">
                {bloomData.examplePositions.map((pos, index) => (
                  <div key={index} className="hash-function-card">
                    <div className="hash-function-name">Hash Function {index + 1}</div>
                    <div className="hash-result">{pos}</div>
                    <div className="hash-description">
                      {index === 0 && 'Sum of char codes'}
                      {index === 1 && 'Prime multiplier (31)'}
                      {index === 2 && 'DJB2 algorithm'}
                      {index === 3 && 'Golden ratio hashing'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Word Search */}
            <div className="word-search-section">
              <h3>🔍 Search Word in Bloom Filter</h3>
              <p className="description">
                Type a word to see which bit positions would be set:
              </p>
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => handleWordSearch(e.target.value)}
                  placeholder="Type a spam word (e.g., 'free', 'click', 'win')"
                  className="search-input"
                />
              </div>

              {wordHashPositions.length > 0 && (
                <div className="search-results">
                  <h4>Hash Positions for "{searchWord}":</h4>
                  <div className="position-cards">
                    {wordHashPositions.map((pos, index) => (
                      <div key={index} className="position-card">
                        <div className="hash-num">Hash {index + 1}</div>
                        <div className="position-value">{pos}</div>
                        <div className="visual-bar">
                          <div
                            className="bar-fill"
                            style={{ width: `${(pos / bloomData.size) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spam Words Visualization */}
      {activeTab === 'spam-words' && (
        <div className="ds-content spam-words-viz">
          <div className="viz-section">
            <h2>📝 Spam Words by Category</h2>
            <p className="description">
              All spam words are stored in the Bloom Filter for O(1) lookup during email analysis.
              Categories shown below for reference.
            </p>

            <div className="spam-words-grid">
              {spamWords.map((category, catIndex) => (
                <div
                  key={catIndex}
                  className={`spam-category-card category-${catIndex % 5}`}
                >
                  <div className="category-header">
                    <h3>{category.category}</h3>
                    <span className="word-count">{category.words.length} words</span>
                  </div>
                  <div className="words-list">
                    {category.words.map((word, wordIndex) => (
                      <div
                        key={wordIndex}
                        className={`word-chip ${selectedWord === word ? 'selected' : ''}`}
                        onClick={() => setSelectedWord(selectedWord === word ? null : word)}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Word Details */}
            {selectedWord && (
              <div className="word-details">
                <h4>Analysis: "{selectedWord}"</h4>
                <div className="hash-positions">
                  <h5>Hash Positions in Bloom Filter:</h5>
                  <div className="position-visualization">
                    {[
                      simulateHash(selectedWord),
                      (simulateHash(selectedWord) + 123) % 1024,
                      (simulateHash(selectedWord) + 456) % 1024,
                      (simulateHash(selectedWord) + 789) % 1024,
                    ].map((pos, idx) => (
                      <div key={idx} className="position-slot">
                        <div className="slot-num">Hash {idx + 1}</div>
                        <div className="slot-value">{pos}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="word-stats">
                  <p>✅ When this word is detected in an email, all 4 hash positions are set in the Bloom Filter.</p>
                  <p>✅ Quick lookup: O(k) where k = number of hash functions (typically 4)</p>
                  <p>⚠️ False positive possible but no false negatives</p>
                </div>
              </div>
            )}

            {/* Trie Structure Info */}
            <div className="trie-info">
              <h3>🌳 Trie Structure (Word Lookup)</h3>
              <p>
                The spam words can be organized in a Trie structure for efficient prefix matching:
              </p>
              <div className="trie-diagram">
                <div className="trie-node root">
                  <div className="node-label">ROOT</div>
                  <div className="children">
                    <div className="trie-branch">
                      <span className="edge">w</span>
                      <div className="trie-node">win</div>
                    </div>
                    <div className="trie-branch">
                      <span className="edge">f</span>
                      <div className="trie-node">free</div>
                    </div>
                    <div className="trie-branch">
                      <span className="edge">c</span>
                      <div className="trie-node">claim</div>
                    </div>
                    <div className="trie-branch">
                      <span className="edge">...</span>
                      <div className="trie-node">others</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hash Table Visualization */}
      {activeTab === 'hash-table' && hashTableData && (
        <div className="ds-content hash-table-viz">
          <div className="viz-section">
            <h2>🔗 Hash Table: Sender Domain Hashing</h2>
            <p className="description">
              Sender email domains are hashed for quick lookup and reputation checking. Shows bucket distribution.
            </p>

            {/* Hash Table Stats */}
            <div className="hash-table-stats">
              <div className="stat-item">
                <span className="label">Total Buckets:</span>
                <span className="value">{hashTableData.totalBuckets}</span>
              </div>
              <div className="stat-item">
                <span className="label">Filled Buckets:</span>
                <span className="value">{hashTableData.filledBuckets}</span>
              </div>
              <div className="stat-item">
                <span className="label">Load Factor:</span>
                <span className="value">{(hashTableData.loadFactor * 100).toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="label">Unique Domains:</span>
                <span className="value">{Object.keys(hashTableData.domains).length}</span>
              </div>
            </div>

            {/* Bucket Visualization */}
            <div className="hash-bucket-section">
              <h3>📊 Hash Bucket Distribution</h3>
              <div className="bucket-visualization">
                {Array.from({ length: hashTableData.totalBuckets }).map((_, bucket) => {
                  const domainsInBucket = Object.entries(hashTableData.domains)
                    .filter(([, data]) => data.bucket === bucket)
                    .map(([domain]) => domain);

                  return (
                    <div
                      key={bucket}
                      className={`bucket ${domainsInBucket.length > 0 ? 'filled' : 'empty'}`}
                    >
                      <div className="bucket-number">Bucket {bucket}</div>
                      {domainsInBucket.length > 0 && (
                        <div className="bucket-domains">
                          {domainsInBucket.map((domain, idx) => (
                            <div key={idx} className="domain-tag">
                              {domain}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Email Hash Calculator */}
            <div className="email-hash-section">
              <h3>🔐 Calculate Hash for Sender Email</h3>
              <p className="description">
                Enter an email address to see which bucket it would be assigned to:
              </p>
              <div className="email-input-group">
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g., john@gmail.com"
                  className="email-input"
                />
                <button className="calculate-btn" onClick={handleEmailHashCalculate}>
                  Calculate Hash
                </button>
              </div>

              {emailHashData && (
                <div className="hash-result">
                  <h4>Hash Calculation:</h4>
                  <div className="calculation">
                    <div className="step">
                      <div className="step-label">Email:</div>
                      <div className="step-value">{emailHashData.email}</div>
                    </div>
                    <div className="arrow">↓</div>
                    <div className="step">
                      <div className="step-label">Char Codes Sum:</div>
                      <div className="step-value">{emailHashData.hashValue}</div>
                    </div>
                    <div className="arrow">↓</div>
                    <div className="step">
                      <div className="step-label">Bucket Assignment:</div>
                      <div className="step-value large">{emailHashData.bucket}</div>
                    </div>
                  </div>
                  <div className="bucket-assignment">
                    <div className={`bucket-display bucket-${emailHashData.bucket}`}>
                      Bucket {emailHashData.bucket}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hash Collision Info */}
            <div className="collision-info">
              <h3>⚠️ Hash Collision Handling</h3>
              <p>
                When multiple domains hash to the same bucket, they are stored using chaining
                (linked list). This maintains O(1) average lookup time.
              </p>
              <div className="collision-example">
                <div className="example-title">Example: Bucket 2</div>
                <div className="chain">
                  <div className="chain-link">gmail.com</div>
                  <span className="chain-arrow">→</span>
                  <div className="chain-link">domain.com</div>
                  <span className="chain-arrow">→</span>
                  <div className="chain-link">NULL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataStructuresVisualization;
