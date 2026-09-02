import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './DependencyGraphVisualizer.css';

/**
 * DependencyGraphVisualizer Component
 * 
 * Displays the entire task dependency graph as nodes and edges
 * Shows the DAG data structure in action with:
 * - All tasks as nodes colored by status
 * - Dependencies as directed arrows
 * - Critical path highlighting
 * - Graph statistics and analysis
 */
const DependencyGraphVisualizer = ({ userId }) => {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetchDependencyGraph();
  }, [userId]);

  const fetchDependencyGraph = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/commitments/${userId}/graph/dependencies`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dependency graph');
      }

      const result = await response.json();
      setGraph(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching graph:', err);
    } finally {
      setLoading(false);
    }
  };

  // Draw graph using canvas
  useEffect(() => {
    if (!graph || !expanded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Simple force-directed layout simulation
    const positions = {};
    const nodeCount = graph.nodes.length;

    graph.nodes.forEach((node, index) => {
      const angle = (index / nodeCount) * Math.PI * 2;
      const distance = Math.min(width, height) / 3;
      const centerX = width / 2;
      const centerY = height / 2;

      positions[node.id] = {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
      };
    });

    // Draw edges (dependencies)
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;

    graph.edges.forEach(edge => {
      const from = positions[edge.source];
      const to = positions[edge.target];

      if (from && to) {
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowSize = 12;

        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - arrowSize * Math.cos(angle - Math.PI / 6), to.y - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - arrowSize * Math.cos(angle + Math.PI / 6), to.y - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = '#ccc';
        ctx.fill();
      }
    });

    // Draw nodes (tasks)
    graph.nodes.forEach(node => {
      const pos = positions[node.id];
      if (!pos) return;

      // Draw circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [graph, expanded, canvasRef]);

  if (!graph || loading) {
    return (
      <div className="dependency-graph-visualizer loading">
        <div className="loading-spinner"></div>
        <p>Loading dependency graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dependency-graph-visualizer error">
        <p>Error: {error}</p>
      </div>
    );
  }

  const { nodes, edges, statistics, criticalPath } = graph;

  return (
    <motion.div 
      className={`dependency-graph-visualizer ${expanded ? 'expanded' : 'collapsed'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="graph-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-content">
          <h3>📊 Task Dependency Graph</h3>
          <span className="subtitle">DAG Data Structure Visualization</span>
        </div>

        <div className="header-stats-mini">
          <span className="stat-mini nodes-count">{statistics.totalTasks} tasks</span>
          <span className="stat-mini edges-count">{statistics.totalDependencies} deps</span>
        </div>

        <span className={`expand-icon ${expanded ? 'open' : 'closed'}`}>
          ⌄
        </span>
      </div>

      {expanded && (
        <motion.div
          className="graph-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Canvas for graph visualization */}
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="dependency-canvas"
            />
            {nodes.length === 0 && (
              <div className="empty-graph">
                <p>No tasks to display</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="graph-statistics">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{statistics.totalTasks}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Dependencies</div>
                <div className="stat-value">{statistics.totalDependencies}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Ready Tasks</div>
                <div className="stat-value ready">{statistics.readyTasks}</div>
                <div className="stat-percent">
                  {((statistics.readyTasks / statistics.totalTasks) * 100).toFixed(0)}% ready
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Blocked Tasks</div>
                <div className="stat-value blocked">{statistics.blockedTasks}</div>
                <div className="stat-percent">
                  {((statistics.blockedTasks / statistics.totalTasks) * 100).toFixed(0)}% blocked
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value completed">{statistics.completedTasks}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Overdue</div>
                <div className="stat-value overdue">{statistics.overdueTasks}</div>
              </div>
            </div>
          </div>

          {/* Critical Path */}
          {criticalPath && criticalPath.length > 0 && (
            <div className="critical-path-section">
              <div className="section-title">
                🎯 Critical Path ({criticalPath.length} tasks)
              </div>
              <div className="critical-path-chain">
                {criticalPath.map((task, idx) => (
                  <div key={idx} className="path-step">
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-task">
                      <div className="step-action">{task.action}</div>
                      <div className="step-object">{task.object}</div>
                    </div>
                    {idx < criticalPath.length - 1 && (
                      <div className="step-arrow">→</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="critical-path-info">
                The critical path represents the longest chain of dependencies. 
                The project cannot complete faster than this path, even if other tasks are done in parallel.
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="graph-legend">
            <div className="legend-title">Status Legend</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#4CAF50' }}></span>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#FF9800' }}></span>
                <span>Reminder / Soon</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#F44336' }}></span>
                <span>Not Completed</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#2196F3' }}></span>
                <span>Pending</span>
              </div>
            </div>
          </div>

          {/* Data Structure Explanation */}
          <div className="ds-explanation">
            <div className="explanation-title">📚 Directed Acyclic Graph (DAG)</div>
            <div className="explanation-content">
              <p>
                The dependency system uses a <strong>Directed Acyclic Graph (DAG)</strong> to track task relationships:
              </p>
              <ul>
                <li>
                  <strong>Nodes:</strong> Each task is a node in the graph
                </li>
                <li>
                  <strong>Edges:</strong> Arrows from A to B mean "A must complete before B can start"
                </li>
                <li>
                  <strong>Acyclic:</strong> The system prevents circular dependencies (A→B→A) automatically
                </li>
                <li>
                  <strong>Critical Path:</strong> The longest chain determines minimum project duration
                </li>
                <li>
                  <strong>Topological Sort:</strong> Execution order respects all dependencies
                </li>
              </ul>
              <div className="complexity-table">
                <div className="table-header">Time Complexity of Key Operations</div>
                <div className="table-row">
                  <span className="operation">Find task blockers</span>
                  <span className="complexity">O(k) where k = dependencies</span>
                </div>
                <div className="table-row">
                  <span className="operation">Add dependency</span>
                  <span className="complexity">O(n) cycle check worst case</span>
                </div>
                <div className="table-row">
                  <span className="operation">Get ready tasks</span>
                  <span className="complexity">O(n) linear scan</span>
                </div>
                <div className="table-row">
                  <span className="operation">Find critical path</span>
                  <span className="complexity">O(n + m) DFS with memoization</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button className="refresh-button" onClick={fetchDependencyGraph}>
            🔄 Refresh Graph
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DependencyGraphVisualizer;
