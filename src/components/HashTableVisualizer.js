import React from 'react';
import './HashTableVisualizer.css';

/**
 * Hash Table (Set) Visualizer Component
 * Shows found and not-found spam words
 */
const HashTableVisualizer = ({ data }) => {
  // Safe data extraction with defaults
  const foundWords = data?.foundWords || [];
  const notFoundWords = data?.notFoundWords || [];
  const spamKeywords = data?.spamKeywords || [];

  if (!data) {
    return (
      <div className="step-section">
        <h3 className="step-title">📊 Hash Table (Set) Lookup</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No hash table data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hash-table-visualizer">
      <div className="hash-container">
        <h3>📊 Hash Table (Set) Lookup</h3>
        <p className="section-description">
          Check tokens against spam keyword set with O(1) lookup time
        </p>

        {/* Found Words */}
        <div className="hash-section found-section">
          <h4>🚫 Spam Words Found ({foundWords?.length || 0})</h4>
          {foundWords && foundWords.length > 0 ? (
            <div className="word-list">
              {foundWords.map((item, idx) => (
                <div key={idx} className="word-item found">
                  <div className="word-badge">
                    <span className="word-text">{item?.token || item?.word || 'Word'}</span>
                    <span className="matched">← {item?.matchedKeyword || 'Matched'}</span>
                  </div>
                  <div className="word-weight">+{item?.weight || 0} pts</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>✅ No spam words detected</p>
            </div>
          )}
        </div>

        {/* Not Found Words */}
        <div className="hash-section not-found-section">
          <h4>✅ Clean Words ({notFoundWords?.length || 0})</h4>
          {notFoundWords && notFoundWords.length > 0 ? (
            <div className="word-grid">
              {notFoundWords.slice(0, 12).map((word, idx) => (
                <div key={idx} className="word-chip">
                  {word}
                </div>
              ))}
              {notFoundWords.length > 12 && (
                <div className="word-chip more">+{notFoundWords.length - 12}</div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>All tokens are spam indicators</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="hash-statistics">
          <div className="stat-card found-count">
            <div className="stat-icon">🚫</div>
            <div className="stat-data">
              <div className="stat-number">{foundWords?.length || 0}</div>
              <div className="stat-label">Spam Words</div>
            </div>
          </div>

          <div className="stat-card clean-count">
            <div className="stat-icon">✅</div>
            <div className="stat-data">
              <div className="stat-number">{notFoundWords?.length || 0}</div>
              <div className="stat-label">Clean Words</div>
            </div>
          </div>

          <div className="stat-card total-count">
            <div className="stat-icon">📊</div>
            <div className="stat-data">
              <div className="stat-number">{(foundWords?.length || 0) + (notFoundWords?.length || 0)}</div>
              <div className="stat-label">Total Words</div>
            </div>
          </div>

          <div className="stat-card spam-ratio">
            <div className="stat-icon">📈</div>
            <div className="stat-data">
              <div className="stat-number">
                {(foundWords?.length || 0) + (notFoundWords?.length || 0) > 0
                  ? Math.round(
                      ((foundWords?.length || 0) / ((foundWords?.length || 0) + (notFoundWords?.length || 0))) * 100
                    )
                  : 0}
              </div>
              <div className="stat-label">Spam Ratio %</div>
            </div>
          </div>
        </div>

        {/* Spam Keywords Reference */}
        <div className="keywords-reference">
          <h4>Spam Keywords Database ({spamKeywords?.length || 0} total)</h4>
          <p className="reference-hint">Sample of keywords used for detection:</p>
          <div className="keyword-chips">
            {spamKeywords && spamKeywords.length > 0 ? (
              <>
                {spamKeywords.slice(0, 15).map((keyword, idx) => (
                  <span key={idx} className="keyword-chip">
                    {keyword}
                  </span>
                ))}
                {spamKeywords.length > 15 && (
                  <span className="keyword-chip more">
                    +{spamKeywords.length - 15} more
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: '#999', padding: '10px' }}>No keywords data available</span>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="hash-explanation">
          <h4>ℹ️ How Hash Table Lookup Works</h4>
          <ol>
            <li>Each token is hashed to a position in the set</li>
            <li>Look up the hash position in constant O(1) time</li>
            <li>If token exists in set → spam word detected</li>
            <li>If token doesn't exist → clean word</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HashTableVisualizer;
