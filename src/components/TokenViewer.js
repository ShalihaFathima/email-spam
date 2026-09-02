import React, { useEffect, useState } from 'react';
import './TokenViewer.css';

/**
 * Token Viewer Component
 * Shows tokenization process and preprocessing steps
 */
const TokenViewer = ({ data }) => {
  // Safe data extraction with defaults
  const afterStemming = data?.afterStemming || [];
  const originalTokens = data?.originalTokens || [];
  const removed = data?.removed || [];
  const totalOriginal = data?.totalOriginal || 0;
  const totalProcessed = data?.totalProcessed || 0;
  const removedCount = data?.removedCount || 0;

  const [animatingIndex, setAnimatingIndex] = useState(-1);

  useEffect(() => {
    // Animate tokens sequentially
    if (afterStemming && afterStemming.length > 0) {
      afterStemming.forEach((_, idx) => {
        setTimeout(() => setAnimatingIndex(idx), idx * 100);
      });
    }
  }, [afterStemming]);

  if (!data) {
    return (
      <div className="step-section">
        <h3 className="step-title">📝 Tokenization & Preprocessing</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No tokenization data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-viewer">
      <div className="token-section">
        <h3>📝 Tokenization & Preprocessing</h3>
        <p className="section-description">
          Email text is split into words, cleaned, and processed
        </p>

        {/* Original Tokens */}
        <div className="token-subsection">
          <h4>1. Original Tokens ({totalOriginal})</h4>
          <div className="token-group">
            {(originalTokens && originalTokens.length > 0) ? (
              originalTokens.map((token, idx) => (
                <span key={idx} className="token-pill original">
                  {token || 'token'}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>No original tokens</span>
            )}
          </div>
        </div>

        {/* Removed Stopwords */}
        <div className="token-subsection">
          <h4>2. Removed Stopwords ({removedCount})</h4>
          <div className="token-group">
            {(removed && removed.length > 0) ? (
              removed.slice(0, 10).map((token, idx) => (
                <span key={idx} className="token-pill removed" title={token}>
                  {token}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>No stopwords removed</span>
            )}
          </div>
        </div>

        {/* Processed Tokens */}
        <div className="token-subsection">
          <h4>3. After Preprocessing ({totalProcessed})</h4>
          <div className="token-group">
            {(afterStemming && afterStemming.length > 0) ? (
              afterStemming.map((token, idx) => (
                <span
                  key={idx}
                  className={`token-pill processed ${animatingIndex >= idx ? 'animated' : ''}`}
                >
                  {token}
                </span>
              ))
            ) : (
              <span style={{ color: '#999' }}>No processed tokens</span>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="token-summary">
          <div className="summary-stat">
            <span className="stat-label">Original:</span>
            <span className="stat-value">{totalOriginal} tokens</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">After Preprocessing:</span>
            <span className="stat-value">{totalProcessed} tokens</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Removed:</span>
            <span className="stat-value">{removedCount} stopwords</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenViewer;
