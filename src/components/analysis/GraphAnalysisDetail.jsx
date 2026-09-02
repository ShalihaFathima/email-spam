import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './GraphAnalysisDetail.css';

/**
 * Graph Analysis Detail Page
 * Flagship visualization showing relationship-based spam detection
 * 
 * Features:
 * - Interactive node network
 * - Animated clusters
 * - Edge highlighting
 * - Frequency indicators
 */
const GraphAnalysisDetail = ({ data }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  if (!data || !data.graph || data.graph.nodes.length === 0) {
    return (
      <div className="graph-detail-empty">
        <p>No graph data available for this email.</p>
        <p className="hint">Analyze more emails from the same sender to see patterns.</p>
      </div>
    );
  }

  const { graph, score, suspiciousWordCount, frequentWordCount, senderEmailCount } = data;

  // Organize nodes by type
  const senderNodes = graph.nodes.filter(n => n.type === 'sender');
  const emailNodes = graph.nodes.filter(n => n.type === 'email');
  const wordNodes = graph.nodes.filter(n => n.type === 'word');

  // Get connected nodes for selected word
  const getConnectedToWord = (wordId) => {
    const connected = graph.edges.filter(
      e => e.source === wordId || e.target === wordId
    );
    return connected.map(e => e.source === wordId ? e.target : e.source);
  };

  return (
    <motion.div
      className="graph-analysis-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Statistics */}
      <div className="graph-stats-cards">
        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Graph Score</h3>
          <p className="stat-value">{score}</p>
          <p className="stat-label">Points added to total</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Suspicious Words</h3>
          <p className="stat-value">{suspiciousWordCount}</p>
          <p className="stat-label">Words appearing 3+ times</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Frequent Words</h3>
          <p className="stat-value">{frequentWordCount}</p>
          <p className="stat-label">High-frequency spam words</p>
        </motion.div>

        <motion.div
          className="stat-card"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Sender Emails</h3>
          <p className="stat-value">{senderEmailCount}</p>
          <p className="stat-label">Emails from this sender</p>
        </motion.div>
      </div>

      {/* Network Visualization */}
      <div className="graph-network-section">
        <h2>Relationship Network</h2>

        <div className="network-container">
          {/* Senders */}
          <div className="node-group senders">
            <h3>🔵 Senders</h3>
            <div className="nodes-list">
              {senderNodes.map((node, idx) => (
                <motion.div
                  key={idx}
                  className="node sender-node"
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="node-circle sender-color" />
                  <span className="node-label">{node.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Emails */}
          <div className="node-group emails">
            <h3>🟢 Emails</h3>
            <div className="nodes-list">
              {emailNodes.slice(0, 5).map((node, idx) => (
                <motion.div
                  key={idx}
                  className="node email-node"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="node-circle email-color" />
                  <span className="node-label">Email {idx + 1}</span>
                </motion.div>
              ))}
              {emailNodes.length > 5 && (
                <div className="node more-nodes">+{emailNodes.length - 5} more</div>
              )}
            </div>
          </div>

          {/* Words */}
          <div className="node-group words">
            <h3>🟣 Spam Words</h3>
            <div className="nodes-list">
              {wordNodes.map((node, idx) => {
                const isConnected = selectedWord && getConnectedToWord(node.id).length > 0;
                const isSuspicious = node.isSuspicious;

                return (
                  <motion.div
                    key={idx}
                    className={`node word-node ${isSuspicious ? 'suspicious' : ''} ${
                      isConnected ? 'connected' : ''
                    }`}
                    onClick={() => setSelectedWord(selectedWord === node.id ? null : node.id)}
                    onHoverStart={() => setHoveredNode(node.id)}
                    onHoverEnd={() => setHoveredNode(null)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                  >
                    <div className={`node-circle ${isSuspicious ? 'word-suspicious' : 'word-color'}`} />
                    <span className="node-label">{node.label}</span>
                    {node.frequency > 1 && (
                      <span className="frequency-badge">{node.frequency}x</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edge Connections */}
      <div className="graph-edges-section">
        <h2>Relationship Connections</h2>

        <div className="edges-info">
          <p>
            <strong>Total Relationships:</strong> {graph.edges.length} connections between
            senders, emails, and words
          </p>
          <p className="hint">Click on any suspect word above to see its connections</p>
        </div>

        {selectedWord && (
          <motion.div
            className="selected-word-connections"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3>Connections for "{wordNodes.find(n => n.id === selectedWord)?.label}"</h3>
            <div className="connections-list">
              {getConnectedToWord(selectedWord).map((connId, idx) => {
                const connNode = graph.nodes.find(n => n.id === connId);
                return (
                  <motion.div
                    key={idx}
                    className="connection-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="type-badge">{connNode.type}</span>
                    <span className="connection-label">→ {connNode.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <h2>Legend</h2>
        <div className="legend-items">
          <div className="legend-item">
            <div className="color-box sender-color" />
            <span>Sender Email Addresses</span>
          </div>
          <div className="legend-item">
            <div className="color-box email-color" />
            <span>Email IDs</span>
          </div>
          <div className="legend-item">
            <div className="color-box word-color" />
            <span>Regular Words</span>
          </div>
          <div className="legend-item">
            <div className="color-box word-suspicious" />
            <span>Suspicious Words (3+ emails)</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h2>How Graph Analysis Works</h2>
        <div className="explanation">
          <motion.div
            className="explanation-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4>1. Relationship Tracking</h4>
            <p>
              The system builds a graph of relationships: Sender → Email → Words. Each connection
              is tracked to understand patterns.
            </p>
          </motion.div>

          <motion.div
            className="explanation-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4>2. Word Frequency Analysis</h4>
            <p>
              Words appearing in 3+ emails are marked as suspicious. High frequency indicates a
              spam pattern.
            </p>
          </motion.div>

          <motion.div
            className="explanation-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4>3. Sender Reputation</h4>
            <p>
              Senders who send multiple emails with suspicious words gain negative reputation
              points.
            </p>
          </motion.div>

          <motion.div
            className="explanation-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4>4. Score Calculation</h4>
            <p>
              Each suspicious word contributes +2, prolific senders contribute +1. This score
              adds to the total spam detection score.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GraphAnalysisDetail;
