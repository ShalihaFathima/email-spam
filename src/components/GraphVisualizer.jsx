import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './GraphVisualizer.css';

/**
 * GraphVisualizer Component
 * 
 * Displays relationship-based spam detection graph:
 * - Nodes: senders, emails, and suspicious words
 * - Edges: connections showing relationships
 * - Highlights: active email and connected components
 * 
 * Uses force-directed layout algorithm for natural visualization
 */
const GraphVisualizer = ({ graphData, activeEmailId = null, expanded = false }) => {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [hoveredNode, setHoveredNode] = useState(null);
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  // Simulate force-directed layout
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return;
    }

    const width = expanded ? 800 : 400;
    const height = expanded ? 600 : 300;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize positions or update based on nodes
    let newPositions = { ...positions };
    let changed = false;

    graphData.nodes.forEach((node, index) => {
      if (!newPositions[node.id]) {
        // Position based on node type
        const angle = (index / graphData.nodes.length) * Math.PI * 2;
        const distance = node.type === 'email' ? 80 : 120;

        newPositions[node.id] = {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          type: node.type,
          label: node.label,
          frequency: node.frequency || 1,
          isSuspicious: node.isSuspicious || false
        };
        changed = true;
      }
    });

    if (changed) {
      setPositions(newPositions);
    }
  }, [graphData, expanded]);

  // Highlight edges connected to hovered node
  const handleNodeHover = (nodeId) => {
    setHoveredNode(nodeId);
    if (graphData && graphData.edges) {
      const connected = graphData.edges.filter(
        edge => edge.source === nodeId || edge.target === nodeId
      );
      setHighlightedEdges(connected.map((e, i) => i));
    }
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="graph-visualizer empty">
        <p>No graph data available</p>
      </div>
    );
  }

  const width = expanded ? 800 : 400;
  const height = expanded ? 600 : 300;

  return (
    <motion.div
      className={`graph-visualizer ${expanded ? 'expanded' : 'compact'}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="graph-header">
        <h3>Relationship Graph</h3>
        <div className="graph-stats">
          <span className="stat">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{graphData.nodes?.length || 0}</span>
          </span>
          <span className="stat">
            <span className="stat-label">Edges:</span>
            <span className="stat-value">{graphData.edges?.length || 0}</span>
          </span>
        </div>
      </div>

      <div className="graph-container">
        <svg ref={svgRef} width={width} height={height} className="graph-canvas">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#888" />
            </marker>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>

          {/* Render Edges */}
          {graphData.edges &&
            graphData.edges.map((edge, idx) => {
              const sourcePos = positions[edge.source];
              const targetPos = positions[edge.target];

              if (!sourcePos || !targetPos) return null;

              const isHighlighted = highlightedEdges.includes(idx);

              return (
                <motion.line
                  key={`edge-${idx}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  className={`edge ${isHighlighted ? 'highlighted' : ''} ${
                    edge.type === 'suspicious' ? 'suspicious' : ''
                  }`}
                  strokeDasharray={edge.type === 'suspicious' ? '5,5' : 'none'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.01 }}
                />
              );
            })}

          {/* Render Nodes */}
          {Object.entries(positions).map(([nodeId, pos], idx) => {
            const node = graphData.nodes.find(n => n.id === nodeId);
            if (!node) return null;

            const isActive =
              activeEmailId && (node.id === activeEmailId || node.type === 'email');
            const isHovered = hoveredNode === node.id;
            const radius = isHovered ? 10 : node.isSuspicious ? 8 : 6;

            // Color by type
            let nodeColor = '#6366F1'; // default (email)
            if (node.type === 'sender') nodeColor = '#3B82F6'; // blue
            if (node.type === 'word') nodeColor = node.isSuspicious ? '#EF4444' : '#8B5CF6'; // red or purple
            if (node.type === 'email') nodeColor = '#10B981'; // green

            return (
              <motion.g
                key={`node-${node.id}`}
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => {
                  setHoveredNode(null);
                  setHighlightedEdges([]);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
              >
                {/* Node circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={nodeColor}
                  className={`node ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{
                    cursor: 'pointer',
                    filter: isHovered
                      ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                  }}
                  animate={{
                    r: isHovered ? 10 : isActive ? 8 : 6,
                    fill: isHovered ? '#FFD700' : nodeColor
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* Node label - show on hover or for emails */}
                {(isHovered || isActive) && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <rect
                      x={pos.x + 12}
                      y={pos.y - 12}
                      width={Math.min(node.label.length * 4 + 8, 100)}
                      height={20}
                      rx={3}
                      fill="rgba(0, 0, 0, 0.8)"
                      stroke={nodeColor}
                      strokeWidth="1"
                    />
                    <text
                      x={pos.x + 16}
                      y={pos.y - 1}
                      fontSize="11"
                      fill="#FFF"
                      fontWeight="500"
                      textAnchor="start"
                    >
                      {node.label.substring(0, 12)}
                      {node.label.length > 12 ? '...' : ''}
                    </text>
                  </motion.g>
                )}

                {/* Frequency indicator */}
                {node.frequency && node.frequency > 1 && (
                  <motion.text
                    x={pos.x}
                    y={pos.y + radius + 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#999"
                    fontWeight="bold"
                  >
                    {node.frequency}x
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
          <span>Sender</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
          <span>Email</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#8B5CF6' }}></div>
          <span>Word</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#EF4444' }}></div>
          <span>Suspicious Word</span>
        </div>
      </div>

      {/* Details panel */}
      {hoveredNode && positions[hoveredNode] && (
        <motion.div
          className="graph-details"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="detail-header">
            <h4>
              {positions[hoveredNode].label}
              {positions[hoveredNode].isSuspicious && (
                <span className="suspicious-badge">⚠</span>
              )}
            </h4>
            <p className="detail-type">Type: {positions[hoveredNode].type}</p>
          </div>
          {positions[hoveredNode].frequency > 1 && (
            <p className="detail-frequency">
              Appears in {positions[hoveredNode].frequency} emails
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GraphVisualizer;
