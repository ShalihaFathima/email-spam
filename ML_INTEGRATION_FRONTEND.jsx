/**
 * ===============================================================================
 * SPAM DETECTION SYSTEM - ML INTEGRATION (FRONTEND UI)
 * ===============================================================================
 * React Component for displaying multi-layer detection with ML Analysis step
 * ===============================================================================
 */

import React, { useState, useEffect } from 'react';

/**
 * Main Detection Analysis Component
 * Displays: Bloom Filter → Hash Table → Trie → Graph → Score → ML Analysis
 */
const SpamDetectionAnalysis = ({ email }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analysis from backend
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/check-spam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            score: calculateScore(email)  // Get score from your detection layers
          })
        });

        if (!response.ok) throw new Error('Analysis failed');
        const data = await response.json();
        setAnalysis(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchAnalysis();
  }, [email]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!analysis) return null;

  return (
    <div className="spam-detection-container">
      {/* Header */}
      <DetectionHeader 
        finalDecision={analysis.finalDecision}
        confidence={analysis.confidence}
      />

      {/* Analysis Steps Pipeline */}
      <DetectionPipeline steps={analysis.uiSteps} />

      {/* Detection Score Breakdown */}
      <ScoreBreakdown 
        score={analysis.detectionScore}
        layers={analysis.detectionLayers}
      />

      {/* ML Analysis Section (NEW) */}
      {analysis.mlAnalysis && (
        <MLAnalysisSection mlAnalysis={analysis.mlAnalysis} />
      )}

      {/* Final Decision */}
      <FinalDecision 
        decision={analysis.finalDecision}
        confidence={analysis.confidence}
        reasoning={analysis.reasoning}
      />
    </div>
  );
};

// ============================================================================
// COMPONENT 1: Loading State
// ============================================================================

const LoadingState = () => (
  <div className="analysis-loading">
    <div className="spinner"></div>
    <p>Analyzing email through all detection layers...</p>
  </div>
);

// ============================================================================
// COMPONENT 2: Error State
// ============================================================================

const ErrorState = ({ error }) => (
  <div className="analysis-error">
    <span className="error-icon">⚠️</span>
    <p>Analysis Error: {error}</p>
  </div>
);

// ============================================================================
// COMPONENT 3: Detection Header
// ============================================================================

const DetectionHeader = ({ finalDecision, confidence }) => {
  const isSpam = finalDecision === 'Spam';
  const icon = isSpam ? '🚫' : '✅';
  const className = isSpam ? 'header-spam' : 'header-legitimate';

  return (
    <div className={`detection-header ${className}`}>
      <span className="decision-icon">{icon}</span>
      <div className="header-content">
        <h2>{finalDecision}</h2>
        <p>Confidence: {(confidence * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT 4: Detection Pipeline (Analysis Steps)
// ============================================================================

/**
 * NEW: Visual pipeline showing all detection steps including ML Analysis
 */
const DetectionPipeline = ({ steps }) => (
  <div className="detection-pipeline">
    <h3>Detection Pipeline</h3>
    <div className="pipeline-steps">
      {steps.map((step, index) => (
        <div key={index} className="pipeline-step">
          <StepVisualizer step={step} index={index} totalSteps={steps.length} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Individual step in the pipeline
 */
const StepVisualizer = ({ step, index, totalSteps }) => {
  const isMLStep = step.name === 'ML Analysis';
  const statusClass = step.status === 'skipped' ? 'step-skipped' : 'step-completed';

  return (
    <div className={`step ${statusClass} ${isMLStep ? 'step-ml' : ''}`}>
      <div className="step-header">
        <span className="step-number">{index + 1}</span>
        <span className="step-name">{step.name}</span>
      </div>

      {/* Step Status Badge */}
      <StatusBadge status={step.status} />

      {/* Step Details */}
      <div className="step-details">
        {isMLStep && step.status === 'completed' && (
          <MLStepDetails result={step.result} />
        )}
        {!isMLStep && (
          <LayerStepDetails result={step.result} />
        )}
      </div>

      {/* Arrow to next step */}
      {index < totalSteps - 1 && <div className="pipeline-arrow">→</div>}
    </div>
  );
};

/**
 * Status badge for each step
 */
const StatusBadge = ({ status }) => {
  const badges = {
    completed: <span className="badge badge-completed">✓ Completed</span>,
    skipped: <span className="badge badge-skipped">⊘ Skipped</span>,
    pending: <span className="badge badge-pending">○ Pending</span>
  };
  return badges[status] || null;
};

/**
 * ML-specific step details
 */
const MLStepDetails = ({ result }) => (
  <div className="ml-details">
    <div className="ml-prediction">
      <strong>Prediction:</strong> {result.label}
    </div>
    <div className="ml-confidence">
      <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
    </div>
    {result.probabilities && (
      <div className="ml-probabilities">
        <div className="prob-item">
          <span className="prob-label">Legitimate:</span>
          <ConfidenceBar value={result.probabilities.ham} />
        </div>
        <div className="prob-item">
          <span className="prob-label">Spam:</span>
          <ConfidenceBar value={result.probabilities.spam} />
        </div>
      </div>
    )}
  </div>
);

/**
 * Regular detection layer step details
 */
const LayerStepDetails = ({ result }) => {
  if (!result) return null;
  
  return (
    <div className="layer-details">
      {Object.entries(result).map(([key, value]) => (
        <div key={key} className="detail-item">
          <span className="detail-key">{key}:</span>
          <span className="detail-value">
            {typeof value === 'number' ? value.toFixed(2) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Confidence bar visualization
 */
const ConfidenceBar = ({ value }) => (
  <div className="confidence-bar">
    <div className="bar-fill" style={{ width: `${value * 100}%` }}></div>
    <span className="bar-label">{(value * 100).toFixed(1)}%</span>
  </div>
);

// ============================================================================
// COMPONENT 5: Score Breakdown
// ============================================================================

const ScoreBreakdown = ({ score, layers }) => (
  <div className="score-breakdown">
    <h3>Detection Score: {score.toFixed(1)}/10</h3>
    
    {/* Score indicator */}
    <ScoreGauge score={score} />

    {/* Layer breakdown */}
    <div className="layers-grid">
      {Object.entries(layers).map(([layerName, layerData]) => (
        <div key={layerName} className="layer-card">
          <h4>{toTitleCase(layerName)}</h4>
          <div className="layer-metrics">
            {Object.entries(layerData).map(([metricName, metricValue]) => (
              <div key={metricName} className="metric">
                <span>{metricName}:</span>
                <strong>{metricValue}</strong>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Visual gauge showing score (0-10)
 */
const ScoreGauge = ({ score }) => {
  const getScoreColor = (s) => {
    if (s <= 3) return '#4CAF50';   // Green - Not Spam
    if (s <= 6) return '#FFC107';   // Yellow - Uncertain
    return '#F44336';               // Red - Spam
  };

  const color = getScoreColor(score);

  return (
    <div className="score-gauge">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 40 100 A 60 60 0 0 1 160 100"
          stroke="#e0e0e0"
          strokeWidth="10"
          fill="none"
        />
        {/* Filled arc */}
        <path
          d={`M 40 100 A 60 60 0 0 1 ${40 + 120 * (score / 10)} ${100 - 60 * Math.sin((score / 10) * Math.PI)}`}
          stroke={color}
          strokeWidth="10"
          fill="none"
        />
        {/* Needle */}
        <circle cx="100" cy="100" r="4" fill="black" />
      </svg>
      <div className="score-text">{score.toFixed(1)}</div>
    </div>
  );
};

// ============================================================================
// COMPONENT 6: ML Analysis Section (NEW)
// ============================================================================

/**
 * NEW: Dedicated section for ML Analysis results
 * Shows whether ML was used and why
 */
const MLAnalysisSection = ({ mlAnalysis }) => {
  const { used, reason, prediction, label, confidence, probabilities } = mlAnalysis;

  if (used === false) {
    // ML was not needed
    return (
      <div className="ml-analysis-section ml-skipped">
        <h3>ML Analysis</h3>
        <div className="ml-skipped-content">
          <span className="skip-icon">⊘</span>
          <p className="skip-reason">{reason}</p>
          <p className="skip-note">High confidence from detection layers; ML not required</p>
        </div>
      </div>
    );
  }

  // ML was used
  return (
    <div className="ml-analysis-section ml-used">
      <h3>Machine Learning Analysis</h3>
      
      <div className="ml-content">
        {/* Why ML was triggered */}
        <div className="ml-trigger">
          <p className="trigger-text">
            <strong>Why ML?</strong> Detection layers were uncertain. ML model provides additional analysis.
          </p>
        </div>

        {/* Main prediction */}
        <div className="ml-prediction-box">
          <div className="prediction-icon">
            {prediction === 1 ? '🤖 Detected as' : '🤖 Detected as'}
          </div>
          <div className="prediction-label">
            <span className="label-text">{label}</span>
            <span className="confidence-badge">{(confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Probability breakdown */}
        {probabilities && (
          <div className="ml-probabilities-detailed">
            <div className="prob-row">
              <span className="prob-category">Legitimate Probability:</span>
              <ConfidenceBar value={probabilities.ham} />
            </div>
            <div className="prob-row">
              <span className="prob-category">Spam Probability:</span>
              <ConfidenceBar value={probabilities.spam} />
            </div>
          </div>
        )}

        {/* ML Model Info */}
        <div className="ml-info">
          <p className="ml-model-note">
            Based on: Trained Naive Bayes model (96.95% accuracy)
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT 7: Final Decision
// ============================================================================

const FinalDecision = ({ decision, confidence, reasoning }) => (
  <div className={`final-decision final-${decision.toLowerCase()}`}>
    <h3>Final Decision</h3>
    
    <div className="decision-content">
      <div className="decision-main">
        <span className="decision-badge">
          {decision === 'Spam' ? '🚫 SPAM' : '✅ LEGITIMATE'}
        </span>
        <div className="confidence-section">
          <span className="confidence-label">Confidence:</span>
          <div className="confidence-display">
            <ConfidenceBar value={confidence} />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && reasoning.length > 0 && (
        <div className="reasoning">
          <h4>Analysis Summary:</h4>
          <ul>
            {reasoning.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate score from detection layers
 * Replace with your actual implementation
 */
function calculateScore(email) {
  // TODO: Replace with actual score calculation from your layers
  return Math.floor(Math.random() * 11);
}

/**
 * Convert snake_case to Title Case
 */
function toTitleCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// CSS STYLING
// ============================================================================

const styles = `
/* Pipeline and Steps */
.detection-pipeline {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.pipeline-steps {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 15px 0;
  flex-wrap: wrap;
}

.step {
  flex: 1;
  min-width: 150px;
  padding: 15px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  position: relative;
}

.step-completed {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.step-skipped {
  border-color: #bdbdbd;
  background: #f9f9f9;
  opacity: 0.7;
}

.step-ml {
  border: 2px solid #2196F3;
  background: #e3f2fd;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.2);
}

/* ML Analysis Section */
.ml-analysis-section {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.ml-analysis-section h3 {
  color: #1976D2;
  margin-top: 0;
}

.ml-used {
  background: #e3f2fd;
}

.ml-skipped {
  background: #f5f5f5;
}

.ml-skipped-content {
  text-align: center;
  padding: 15px;
}

.skip-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 10px;
}

.skip-reason {
  font-weight: 500;
  color: #666;
  margin: 5px 0;
}

.skip-note {
  font-size: 0.9em;
  color: #999;
}

.ml-prediction-box {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
  border: 1px solid #90CAF9;
}

.prediction-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1em;
  font-weight: 500;
}

.confidence-badge {
  background: #2196F3;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
}

/* Confidence Bars */
.confidence-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-fill {
  height: 8px;
  background: linear-gradient(90deg, #2196F3, #4CAF50);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-label {
  font-size: 0.85em;
  min-width: 40px;
  text-align: right;
  font-weight: 500;
}

/* Final Decision */
.final-decision {
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.final-spam {
  background: #ffebee;
  border-left: 4px solid #F44336;
}

.final-legitimate {
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
}

.decision-badge {
  font-size: 1.2em;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 15px;
}

/* Loading and Error States */
.analysis-loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.analysis-error {
  background: #ffebee;
  padding: 15px;
  border-radius: 6px;
  color: #C62828;
  border-left: 4px solid #F44336;
}

.error-icon {
  font-size: 20px;
  margin-right: 10px;
}
`;

export default SpamDetectionAnalysis;
export { styles };
