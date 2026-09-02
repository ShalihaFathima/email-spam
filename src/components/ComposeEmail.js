import React, { useState } from 'react';
import * as emailService from '../services/emailService';
import './ComposeEmail.css';

function ComposeEmail({ onEmailSent, onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    sender: '',
    subject: '',
    body: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when user starts typing
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (!formData.sender.trim()) {
      setError('Sender name is required');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.body.trim()) {
      setError('Email body is required');
      return false;
    }
    return true;
  };

  /**
   * Handle email submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await emailService.checkEmail(
        formData.sender,
        formData.subject,
        formData.body
      );

      // Display result
      setResult(result);
      setShowResult(true);

      // Notify parent component - include body for commitment processing
      if (onEmailSent) {
        onEmailSent({
          ...result,
          body: formData.body,
          subject: formData.subject,
        });
      }

      // Clear form after success
      setFormData({
        sender: '',
        subject: '',
        body: '',
      });

      // Scroll to result
      setTimeout(() => {
        document.querySelector('.compose-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Failed to check email. Please try again.');
      console.error('Error checking email:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    setFormData({
      sender: '',
      subject: '',
      body: '',
    });
    setError(null);
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="compose-email-container">
      <div className="compose-email-header">
        <h2>✉️ Compose Email</h2>
        <p>Check if an email is spam before sending</p>
        {onClose && (
          <button className="compose-close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        )}
      </div>

      <form className="compose-form" onSubmit={handleSubmit}>
        {/* Sender Field */}
        <div className="form-group">
          <label htmlFor="sender">From (Sender Name)</label>
          <input
            type="text"
            id="sender"
            name="sender"
            placeholder="e.g., John Doe, Marketing Team"
            value={formData.sender}
            onChange={handleInputChange}
            disabled={loading}
            className="form-input"
          />
        </div>

        {/* Subject Field */}
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="e.g., Check this opportunity!"
            value={formData.subject}
            onChange={handleInputChange}
            disabled={loading}
            className="form-input"
          />
        </div>

        {/* Body Field */}
        <div className="form-group">
          <label htmlFor="body">Email Body</label>
          <textarea
            id="body"
            name="body"
            placeholder="Enter the email content here..."
            value={formData.body}
            onChange={handleInputChange}
            disabled={loading}
            className="form-textarea"
            rows="6"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Checking...' : '🔍 Check Email'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            ↺ Reset
          </button>
        </div>
      </form>

      {/* Result Display */}
      {showResult && result && (
        <div className="compose-result">
          <div className={`result-card ${result.classification}`}>
            <div className="result-header">
              <h3>
                {result.classification === 'spam' ? '⚠️ SPAM DETECTED' : '✅ LEGITIMATE EMAIL'}
              </h3>
              <span className={`classification-badge ${result.classification}`}>
                {result.classification.toUpperCase()}
              </span>
            </div>

            <div className="result-details">
              {/* Folder Information */}
              <div className="result-item">
                <span className="result-label">📁 Destination:</span>
                <span className="result-value">
                  {result.folder === 'spam' ? (
                    <span className="folder-spam">🚫 Spam Folder</span>
                  ) : (
                    <span className="folder-inbox">📬 Inbox</span>
                  )}
                </span>
              </div>

              {/* Spam Score */}
              <div className="result-item">
                <span className="result-label">📊 Spam Score:</span>
                <span className="result-value">
                  <span className={`score ${result.classification}`}>
                    {result.spam_score}/10
                  </span>
                  <span className="threshold">(Threshold: ≥ 3)</span>
                </span>
              </div>

              {/* Confidence */}
              <div className="result-item">
                <span className="result-label">🎯 Confidence:</span>
                <span className="result-value">
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${result.confidence}%`,
                        backgroundColor: result.confidence >= 80 ? '#d4af37' : '#888',
                      }}
                    />
                  </div>
                  <span className="percentage">{result.confidence}%</span>
                </span>
              </div>

              {/* Detected Words */}
              {result.detected_words && result.detected_words.length > 0 && (
                <div className="result-item">
                  <span className="result-label">🔴 Detected Words:</span>
                  <div className="detected-words">
                    {result.detected_words.map((word, index) => (
                      <span key={index} className="word-badge">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Score Breakdown */}
              {result.scoreBreakdown && (
                <div className="score-breakdown">
                  <h4>📈 Score Breakdown:</h4>
                  <ul className="breakdown-list">
                    {result.scoreBreakdown.spamWords && (
                      <li>
                        <strong>Spam Words:</strong> {result.scoreBreakdown.spamWords.count} words
                        {' '}
                        <span className="points">
                          (+{result.scoreBreakdown.spamWords.score} pts)
                        </span>
                      </li>
                    )}
                    {result.scoreBreakdown.senderDomain && (
                      <li>
                        <strong>Sender Domain:</strong> {result.scoreBreakdown.senderDomain.domain}
                        {' '}
                        <span className="points">
                          (+{result.scoreBreakdown.senderDomain.score} pts)
                        </span>
                      </li>
                    )}
                    {result.scoreBreakdown.links && (
                      <li>
                        <strong>Links:</strong> {result.scoreBreakdown.links.linkCount} found
                        {' '}
                        <span className="points">
                          (+{result.scoreBreakdown.links.score} pts)
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="result-message">
              {result.message}
            </div>

            {/* Email ID */}
            <div className="result-footer">
              Email ID: #{result.id} • Created: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComposeEmail;
