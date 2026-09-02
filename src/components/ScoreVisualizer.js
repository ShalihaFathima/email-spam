import React, { useState, useEffect } from 'react';
import './ScoreVisualizer.css';

/**
 * Score Visualizer Component
 * Shows scoring breakdown and calculation
 */
const ScoreVisualizer = ({ data }) => {
  // Safe data extraction with defaults
  const totalScore = data?.totalScore || 0;
  const threshold = data?.threshold || 3;
  const breakdown = data?.breakdown || [];

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score accumulation
    let current = 0;
    const interval = setInterval(() => {
      if (current < totalScore) {
        current++;
        setAnimatedScore(current);
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [totalScore]);

  if (!data) {
    return (
      <div className="step-section">
        <h3 className="step-title">📈 Spam Score Calculation</h3>
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <p>No scoring data available</p>
        </div>
      </div>
    );
  }

  const isAboveThreshold = totalScore >= threshold;

  return (
    <div className="score-visualizer">
      <div className="score-container">
        <h3>📈 Spam Score Calculation</h3>
        <p className="section-description">
          Aggregate points from multiple spam indicators
        </p>

        {/* Score Breakdown */}
        <div className="score-breakdown">
          <h4>Score Components:</h4>
          {breakdown && breakdown.length > 0 ? (
            <div className="breakdown-items">
              {breakdown.map((item, idx) => (
                <div key={idx} className="breakdown-item" style={{ borderLeftColor: item?.color || '#d4af37' }}>
                  <div className="item-reason">{item?.label || item?.reason || 'Score component'}</div>
                  <div className="item-points">+{item?.points || 0} pts ({item?.percentage || 0}%)</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items">
              <p>✅ No spam indicators found</p>
            </div>
          )}
        </div>

        {/* Score Meter */}
        <div className="score-meter">
          <div className="meter-header">
            <span>SPAM SCORE</span>
            <span
              className={`meter-threshold ${isAboveThreshold ? 'exceeded' : 'safe'}`}
            >
              Threshold: {data.threshold}
            </span>
          </div>

          <div className="meter-visualization">
            <div className="threshold-line" style={{ left: `${(data.threshold / 10) * 100}%` }}>
              <span className="threshold-label">⚠️ THRESHOLD</span>
            </div>
            <div
              className={`score-bar ${isAboveThreshold ? 'danger' : 'safe'}`}
              style={{ width: `${(animatedScore / 10) * 100}%` }}
            >
              <span className="score-value">{animatedScore}/10</span>
            </div>
          </div>

          <div className="meter-labels">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Score Details */}
        <div className="score-details">
          <div className="detail-box">
            <h4>Score Summary</h4>
            <div className="score-stats">
              <div className="score-stat">
                <span className="label">Total Points:</span>
                <span className={`value ${isAboveThreshold ? 'spam' : 'clean'}`}>
                  {totalScore}
                </span>
              </div>
              <div className="score-stat">
                <span className="label">Threshold:</span>
                <span className="value">{threshold}</span>
              </div>
              <div className="score-stat">
                <span className="label">Above Threshold:</span>
                <span className={`value ${isAboveThreshold ? 'yes' : 'no'}`}>
                  {isAboveThreshold ? 'YES ⚠️' : 'NO ✅'}
                </span>
              </div>
            </div>
          </div>

          <div className="interpretation-box">
            <h4>Interpretation</h4>
            <div className={`interpretation ${isAboveThreshold ? 'spam' : 'ham'}`}>
              {isAboveThreshold ? (
                <>
                  <p>🚫 <strong>HIGH SPAM PROBABILITY</strong></p>
                  <p>This email shows multiple spam indicators and is likely spam.</p>
                </>
              ) : (
                <>
                  <p>✅ <strong>LOW SPAM PROBABILITY</strong></p>
                  <p>This email appears legitimate with few spam indicators.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contribution Chart */}
        {breakdown && breakdown.length > 0 && (
          <div className="contribution-chart">
            <h4>Point Contribution</h4>
            <div className="chart">
              {breakdown.map((item, idx) => {
                const percentage = totalScore > 0 ? ((item?.points || 0) / totalScore) * 100 : 0;
                return (
                  <div key={idx} className="chart-bar">
                    <div className="bar-label">{(item?.label || item?.reason || 'Component').substring(0, 20)}...</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      >
                        <span className="bar-value">{item.points}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scoring Rules */}
        <div className="scoring-rules">
          <h4>📋 Scoring Rules</h4>
          <ul>
            <li><strong>Spam Word:</strong> +2 points per detected spam keyword</li>
            <li><strong>Links:</strong> +1 point per URL/link found</li>
            <li><strong>Threshold:</strong> Score ≥ {data.threshold} → SPAM</li>
            <li><strong>Final Decision:</strong> Score &lt; {data.threshold} → LEGITIMATE</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScoreVisualizer;
