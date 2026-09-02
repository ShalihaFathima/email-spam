import React from 'react';
import { motion } from 'framer-motion';
import './InputDetail.css';

/**
 * Input Detail Page
 * Shows the email being analyzed
 */
const InputDetail = ({ data }) => {
  // DEBUG: Log what data InputDetail received
  console.log('\n🔍 INPUT DETAIL DEBUG:');
  console.log('   Received data:', data);
  if (data) {
    console.log('   data.body:', data.body ? `"${data.body.substring(0, 100)}..."` : 'EMPTY/UNDEFINED');
    console.log('   data.bodyPreview:', data.bodyPreview ? `"${data.bodyPreview.substring(0, 100)}..."` : 'EMPTY/UNDEFINED');
  }
  console.log('');

  if (!data) return <div className="input-empty">Loading email input...</div>;

  const {
    subject = 'No Subject',
    from = 'Unknown Sender',
    to = 'Unknown Recipient',
    date = 'Unknown Date',
    body = '',
    bodyPreview = ''
  } = data;

  return (
    <motion.div
      className="input-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="input-container">
        {/* Header */}
        <h1>📧 Email Input</h1>
        <p className="subtitle">Email being analyzed for spam detection</p>

        {/* Email Headers */}
        <motion.div
          className="email-headers"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="header-row">
            <span className="header-label">From:</span>
            <span className="header-value">{from}</span>
          </div>

          <div className="header-row">
            <span className="header-label">To:</span>
            <span className="header-value">{to}</span>
          </div>

          <div className="header-row">
            <span className="header-label">Date:</span>
            <span className="header-value">{date}</span>
          </div>

          <div className="header-row subject-row">
            <span className="header-label">Subject:</span>
            <span className="header-value subject">{subject}</span>
          </div>
        </motion.div>

        {/* Email Body */}
        <motion.div
          className="email-body-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>📄 Email Body</h2>
          <div className="email-body">
            {bodyPreview ? (
              <p className="body-text">{bodyPreview}</p>
            ) : (
              <p className="body-text">{body.substring(0, 500)}</p>
            )}
            {body.length > 500 && <p className="body-truncated">... [truncated]</p>}
          </div>
        </motion.div>

        {/* Email Metadata */}
        <motion.div
          className="metadata-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>📊 Email Metadata</h2>

          <div className="metadata-grid">
            <div className="metadata-item">
              <h4>Content Length</h4>
              <p className="metadata-value">{body ? body.length : 0} characters</p>
              <p className="metadata-description">Email size</p>
            </div>

            <div className="metadata-item">
              <h4>Word Count</h4>
              <p className="metadata-value">
                {body ? body.split(/\s+/).length : 0} words
              </p>
              <p className="metadata-description">Approximate word count</p>
            </div>

            <div className="metadata-item">
              <h4>Links</h4>
              <p className="metadata-value">
                {body ? (body.match(/https?:\/\//g) || []).length : 0}
              </p>
              <p className="metadata-description">HTTP/HTTPS links detected</p>
            </div>

            <div className="metadata-item">
              <h4>Special Chars</h4>
              <p className="metadata-value">
                {body ? (body.match(/[!@#$%^&*]/g) || []).length : 0}
              </p>
              <p className="metadata-description">Suspicious special characters</p>
            </div>
          </div>
        </motion.div>

        {/* Analysis Info */}
        <motion.div
          className="analysis-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>🚀 Next Steps</h2>
          <p className="info-text">
            This email will now be processed through our 7-step spam detection pipeline:
          </p>

          <div className="next-steps">
            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <span className="step-icon">2️⃣</span>
              <span className="step-text">Tokenization - Break email into words</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <span className="step-icon">3️⃣</span>
              <span className="step-text">Bloom Filter - Check for spam keywords</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <span className="step-icon">4️⃣</span>
              <span className="step-text">Hash Table - Look up domains and patterns</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <span className="step-icon">5️⃣</span>
              <span className="step-text">Trie - Find prefix patterns</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <span className="step-icon">6️⃣</span>
              <span className="step-text">Scoring - Calculate overall score</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
            >
              <span className="step-icon">7️⃣</span>
              <span className="step-text">Graph - Analyze sender relationships</span>
            </motion.div>

            <motion.div
              className="next-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <span className="step-icon">8️⃣</span>
              <span className="step-text">Decision - Final verdict</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InputDetail;
