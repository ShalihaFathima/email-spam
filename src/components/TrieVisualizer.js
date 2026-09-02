import React, { useState } from 'react';
import './TrieVisualizer.css';

/**
 * Trie Visualizer Component
 * Shows character-by-character traversal through Trie
 */
const TrieVisualizer = ({ data }) => {
  // Safe data extraction with defaults
  const paths = data?.paths || [];
  const [selectedPath, setSelectedPath] = useState(0);

  if (!data || !paths || paths.length === 0) {
    return (
      <div className="step-section">
        <h3 className="step-title">🌳 Trie Traversal</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No trie paths available</p>
        </div>
      </div>
    );
  }

  const currentPath = paths[selectedPath] || paths[0];

  return (
    <div className="trie-visualizer">
      <div className="trie-container">
        <h3>🌳 Trie Traversal</h3>
        <p className="section-description">
          Character-by-character traversal through Trie data structure
        </p>

        {/* Path Selector */}
        {paths.length > 0 && (
          <div className="path-selector">
            <h4>Select Token to Trace:</h4>
            <div className="path-buttons">
              {paths.map((path, idx) => (
                <button
                  key={idx}
                  className={`path-btn ${selectedPath === idx ? 'active' : ''} ${
                    path?.isSpamWord ? 'spam' : 'clean'
                  }`}
                  onClick={() => setSelectedPath(idx)}
                  title={path?.isSpamWord ? 'Spam word' : 'Clean word'}
                >
                  <span className="path-token">{path?.token || 'Token'}</span>
                  <span className="path-status">
                    {path?.isSpamWord ? '🚫' : '✅'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trie Visualization */}
        {currentPath && (
          <div className="trie-path-visualization">
            <h4>Traversal Path for "{currentPath?.token || 'Token'}"</h4>

            {/* Root Node */}
            <div className="trie-tree">
              <div className="node-row root">
                <div className="trie-node root-node">
                  <span className="node-label">ROOT</span>
                </div>
                <div className="node-arrow">↓</div>
              </div>

              {/* Character Nodes */}
              {(currentPath?.characters || currentPath?.path || []).map((step, idx) => {
                const character = typeof step === 'string' ? step : step?.character || '';
                const partial = (currentPath?.characters || currentPath?.path || []).slice(0, idx + 1).join('');
                return (
                  <div key={idx} className={`node-row depth-${idx + 1}`}>
                    <div className="depth-indicator">
                      {'─'.repeat(idx * 2)}
                    </div>
                    <div className={`trie-node character-node ${idx === (currentPath?.characters || currentPath?.path || []).length - 1 && currentPath?.isSpamWord ? 'end-of-word' : ''}`}>
                      <span className="character">{character}</span>
                      <span className="partial" title={`Prefix: ${partial}`}>
                        {partial}
                      </span>
                    </div>
                    {idx < (currentPath?.characters || currentPath?.path || []).length - 1 && (
                      <div className="node-arrow">↓</div>
                    )}
                  </div>
                );
              })}

              {/* End Marker */}
              {currentPath.isSpamWord && (
                <div className="node-row end-marker">
                  <div className="trie-node end-node">
                    <span className="end-label">🚫 END OF SPAM WORD</span>
                  </div>
                </div>
              )}
            </div>

            {/* Path Statistics */}
            <div className="path-stats">
              <div className="stat">
                <span className="label">Token:</span>
                <span className="value">{currentPath.token}</span>
              </div>
              <div className="stat">
                <span className="label">Depth:</span>
                <span className="value">{currentPath.depth}</span>
              </div>
              <div className="stat">
                <span className="label">Characters:</span>
                <span className="value">{(currentPath?.characters || currentPath?.path || []).length}</span>
              </div>
              <div className="stat">
                <span className="label">Status:</span>
                <span className={`value ${currentPath.isSpamWord ? 'spam' : 'clean'}`}>
                  {currentPath.isSpamWord ? '🚫 Spam Match' : '✅ No Match'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary  */}
        <div className="trie-summary">
          <div className="summary-box">
            <h4>📊 Summary</h4>
            <div className="summary-items">
              <div className="summary-item">
                <span className="label">Total Paths:</span>
                <span className="value">{data?.totalPaths || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Spam Matches:</span>
                <span className="value spam">{data?.successfulMatches || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Clean Paths:</span>
                <span className="value clean">{(data?.totalPaths || 0) - (data?.successfulMatches || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* How Trie Works */}
        <div className="trie-explanation">
          <h4>ℹ️ How Trie Works</h4>
          <ol>
            <li>Start at ROOT node</li>
            <li>For each character in the token:
              <ul>
                <li>Follow the edge labeled with that character</li>
                <li>Move to the child node</li>
              </ul>
            </li>
            <li>If we reach an "end of word" marker → token is a known word</li>
            <li>Prefix matching and autocomplete are fast O(prefix length)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TrieVisualizer;
