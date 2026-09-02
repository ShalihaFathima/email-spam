import React, { useEffect, useState } from 'react';
import './FinalDecisionViewer.css';

/**
 * Final Decision Viewer Component
 * Shows the final classification result with animations
 */
const FinalDecisionViewer = ({ data }) => {
  // Safe data extraction with defaults
  const isSpam = data?.isSpam ?? false;
  const classification = data?.classification || 'UNKNOWN';
  const message = data?.message || 'Analysis result unavailable';
  const score = data?.score || 0;
  const confidence = data?.confidence || 0;

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Trigger animation on load
    setTimeout(() => setRevealed(true), 300);
  }, []);

  if (!data) {
    return (
      <div className="step-section">
        <h3 className="step-title">✅/🚫 Final Result</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No final decision data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="final-decision-viewer">
      <div className={`decision-container ${revealed ? 'revealed' : ''}`}>
        <div className={`decision-badge ${isSpam ? 'spam' : 'legitimate'}`}>
          <div className="badge-animation">
            <span className="badge-icon">
              {isSpam ? '🚫' : '✅'}
            </span>
          </div>
          <h2 className="badge-text">
            {classification}
          </h2>
        </div>

        {/* Message */}
        <div className="decision-message">
          <p>{message}</p>
        </div>

        {/* Score Display */}
        <div className="score-display">
          <div className="score-box">
            <div className="score-number">{score}</div>
            <div className="score-label">Final Score</div>
          </div>
          <div className="threshold-box">
            <div className="threshold-number">{3}</div>
            <div className="threshold-label">Threshold</div>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="confidence-section">
          <h3>Confidence Level</h3>
          <div className="confidence-bar-container">
            <div
              className={`confidence-bar ${isSpam ? 'high' : 'medium'}`}
              style={{ width: `${confidence}%` }}
            >
              <span className="confidence-percent">{Math.round(confidence)}%</span>
            </div>
          </div>
          <p className="confidence-text">
            {confidence > 80
              ? '🎯 Very High Confidence'
              : confidence > 50
              ? '📊 Medium Confidence'
              : '⚠️ Low Confidence'}
          </p>
        </div>

        {/* Detailed Analysis */}
        <div className={`analysis-summary ${isSpam ? 'spam' : 'legitimate'}`}>
          <h3>Analysis Summary</h3>
          
          <div className="summary-content">
            {isSpam ? (
              <>
                <p className="summary-heading">
                  This email is likely <strong>SPAM</strong> based on:
                </p>
                <ul className="summary-points">
                  <li>Multiple spam keywords detected</li>
                  <li>Suspicious patterns identified</li>
                  <li>High spam score ({score}/{10})</li>
                </ul>
                <div className="action-box spam-action">
                  <p><strong>Recommendation:</strong> Move to spam folder</p>
                </div>
              </>
            ) : (
              <>
                <p className="summary-heading">
                  This email appears <strong>LEGITIMATE</strong>:
                </p>
                <ul className="summary-points">
                  <li>Few or no spam indicators</li>
                  <li>Normal communication patterns</li>
                  <li>Low spam score ({score}/{10})</li>
                </ul>
                <div className="action-box legitimate-action">
                  <p><strong>Recommendation:</strong> Safe to view and open</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="key-insights">
          <h3>🔍 Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <span className="insight-icon">📊</span>
              <span className="insight-text">Score: {score}/10</span>
            </div>
            <div className="insight-card">
              <span className="insight-icon">⚖️</span>
              <span className="insight-text">
                {isSpam ? 'Above' : 'Below'} Threshold
              </span>
            </div>
            <div className="insight-card">
              <span className="insight-icon">🎯</span>
              <span className="insight-text">
                {Math.round(confidence)}% Confident
              </span>
            </div>
            <div className="insight-card">
              <span className="insight-icon">✨</span>
              <span className="insight-text">
                {isSpam ? 'Risky' : 'Safe'} Email
              </span>
            </div>
          </div>
        </div>

        {/* Data Structures Used */}
        <div className="structures-info">
          <h3>📚 Data Structures Used</h3>
          <div className="structures-list">
            <div className="structure">
              <span className="structure-icon">🎯</span>
              <span className="structure-name">Bloom Filter</span>
              <span className="structure-desc">Fast probabilistic lookup</span>
            </div>
            <div className="structure">
              <span className="structure-icon">📊</span>
              <span className="structure-name">Hash Table</span>
              <span className="structure-desc">O(1) keyword lookup</span>
            </div>
            <div className="structure">
              <span className="structure-icon">🌳</span>
              <span className="structure-name">Trie</span>
              <span className="structure-desc">Prefix matching</span>
            </div>
          </div>
        </div>

        {/* Classification Box */}
        <div className={`classification-box ${isSpam ? 'spam' : 'ham'}`}>
          <h3>📬 Email Classification</h3>
          <div className="classification-result">
            <span className="classification-tag">
              {isSpam ? '🚫 SPAM' : '✅ LEGITIMATE'}
            </span>
            <span className="classification-desc">
              {isSpam
                ? 'This email is filtered as spam'
                : 'This email is safe to inbox'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalDecisionViewer;
