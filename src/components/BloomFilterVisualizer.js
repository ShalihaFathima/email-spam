import React, { useState } from 'react';
import './BloomFilterVisualizer.css';

/**
 * Bloom Filter Visualizer Component
 * Shows bit array and hash positions
 */
const BloomFilterVisualizer = ({ data }) => {
  // Safe data extraction with defaults
  const tokens = data?.tokens || [];
  const filterSize = data?.filterSize || 1024;
  const hashFunctions = data?.hashFunctions || 4;
  const stats = data?.stats || { fillRate: '0%' };

  const [selectedToken, setSelectedToken] = useState(tokens?.[0]?.token);

  if (!data || tokens.length === 0) {
    return (
      <div className="step-section">
        <h3 className="step-title">🎯 Bloom Filter Check</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No spam words detected in this email</p>
        </div>
      </div>
    );
  }

  const selected = tokens.find(t => t?.token === selectedToken) || tokens[0];

  return (
    <>
      <div className="bloom-visualizer">
        <div className="bloom-container">
          <h3>🎯 Bloom Filter Check</h3>
          <p className="section-description">
            Each token is hashed to multiple bit positions and checked
          </p>

          {/* Filter Info */}
          <div className="bloom-info">
            <div className="info-item">
              <span className="label">Filter Size:</span>
              <span className="value">{filterSize} bits</span>
            </div>
            <div className="info-item">
              <span className="label">Hash Functions:</span>
              <span className="value">{hashFunctions}</span>
            </div>
            <div className="info-item">
              <span className="label">Fill Rate:</span>
              <span className="value">{stats?.fillRate || '—'}</span>
            </div>
          </div>

          {/* Token Selector */}
          {tokens.length > 0 && (
            <div className="token-selector">
              <h4>Select Token to Inspect:</h4>
              <div className="token-buttons">
                {tokens.map((token, idx) => (
                  <button
                    key={`${token?.token || idx}`}
                    className={`token-btn ${selectedToken === token?.token ? 'active' : ''} ${
                      token?.found ? 'found' : 'not-found'
                    }`}
                    onClick={() => setSelectedToken(token?.token)}
                    title={token?.found ? 'Found in filter' : 'Not found'}
                  >
                    {token?.token || 'Token'}
                    <span className="status">{token?.found ? '✅' : '❌'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bit Array Visualization */}
          {selected && (
            <div className="bit-visualization">
              <h4>Hash Positions for "{selected?.token}"</h4>
              <div className="bit-array">
                {Array.from({ length: Math.min(64, filterSize) }).map((_, idx) => {
                  const positions = selected?.hash1 !== undefined 
                    ? [selected.hash1, selected.hash2, selected.hash3, selected.hash4].filter(p => p !== undefined)
                    : [];
                  const isHighlighted = positions.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`bit ${isHighlighted ? 'highlighted' : ''} ${
                        selected?.found ? 'found' : ''
                      }`}
                      title={`Bit ${idx}${isHighlighted ? ' (Hash Position)' : ''}`}
                    >
                      {isHighlighted ? '1' : '0'}
                    </div>
                  );
                })}
              </div>
              <p className="bit-hint">
                Showing first 64 bits (out of {filterSize})
              </p>
            </div>
          )}

          {/* Token Details */}
          {selected && (
            <div className={`token-detail ${selected?.found ? 'found' : 'not-found'}`}>
              <h4>Token Analysis</h4>
              <div className="detail-row">
                <span className="label">Token:</span>
                <span className="value">{selected?.token || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`value ${selected?.found ? 'spam' : 'clean'}`}>
                  {selected?.found ? '🚫 Possibly in filter (spam indicator)' : '✅ Not in filter (clean)'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Hash Positions:</span>
                <span className="value">
                  {[selected?.hash1, selected?.hash2, selected?.hash3, selected?.hash4]
                    .filter(p => p !== undefined)
                    .join(', ') || '—'}
                </span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bloom-summary">
            <div className="summary-stat">
              <span className="label">Total Tokens Checked:</span>
              <span className="value">{tokens?.length || 0}</span>
            </div>
            <div className="summary-stat">
              <span className="label">Spam Indicators Found:</span>
              <span className="value spam">{tokens?.filter(t => t?.found)?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BloomFilterVisualizer;
