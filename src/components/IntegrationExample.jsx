import React, { useState } from 'react';
import CommitmentTracker from './components/CommitmentTracker';
import DependentTasksPanel from './components/DependentTasksPanel';
import DependencyGraphVisualizer from './components/DependencyGraphVisualizer';
import './IntegrationExample.css';

/**
 * Integration Example: Task Dependency Graph DS
 * 
 * This component demonstrates how to integrate the dependent tasks feature
 * to show the graph data structure is working properly.
 * 
 * Components:
 * 1. CommitmentTracker - Main task list display
 * 2. DependentTasksPanel - Shows blockers and dependent tasks for selected task
 * 3. DependencyGraphVisualizer - Shows entire dependency graph as DAG
 * 
 * Features demonstrated:
 * - Task dependency relationships
 * - Blocking tasks (must be done first)
 * - Dependent tasks (waiting on this task)
 * - Critical path analysis
 * - Readiness status
 * - Graph DS visualization
 */
const IntegrationExample = ({ userId = 'user123' }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleTaskSelect = (taskId) => {
    setSelectedTaskId(taskId);
    // Smooth scroll to DependentTasksPanel
    setTimeout(() => {
      document.querySelector('.dependent-tasks-panel')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  return (
    <div className="integration-example">
      <div className="example-header">
        <h1>📊 Task Dependency Graph System</h1>
        <p className="subtitle">
          Complete demonstration of graph data structure for task dependencies
        </p>
      </div>

      <div className="integration-layout">
        {/* Main task list */}
        <section className="main-section">
          <h2>📋 Your Tasks</h2>
          <CommitmentTracker 
            userId={userId} 
            onTaskSelect={handleTaskSelect}
          />
        </section>

        {/* Selected task dependencies */}
        {selectedTaskId && (
          <section className="dependent-section">
            <h2>🔗 Task Dependencies</h2>
            <p className="section-description">
              Click a task above to see its blockers and dependent tasks
            </p>
            <DependentTasksPanel 
              userId={userId}
              taskId={selectedTaskId}
              onTaskSelect={handleTaskSelect}
            />
          </section>
        )}

        {/* Full graph visualization */}
        <section className="graph-section">
          <h2>🌐 Dependency Graph</h2>
          <p className="section-description">
            Complete view of all task relationships in the system
          </p>
          <DependencyGraphVisualizer userId={userId} />
        </section>
      </div>

      {/* Feature Guide */}
      <section className="feature-guide">
        <h2>📚 How It Works</h2>
        
        <div className="guide-grid">
          {/* Feature 1 */}
          <div className="guide-card">
            <div className="guide-icon">🔗</div>
            <h3>Dependency Tracking</h3>
            <p>
              Tasks can have dependencies - tasks that must be completed 
              before they can start. The system tracks these relationships 
              using a Directed Acyclic Graph (DAG).
            </p>
          </div>

          {/* Feature 2 */}
          <div className="guide-card">
            <div className="guide-icon">🚀</div>
            <h3>Readiness Status</h3>
            <p>
              Each task shows whether it's "Ready to Start" or "Blocked". 
              A task is ready only when all its blocking tasks are completed.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="guide-card">
            <div className="guide-icon">📌</div>
            <h3>Impact Analysis</h3>
            <p>
              See which tasks depend on the current one. Completing a task 
              may unblock multiple dependent tasks at once.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="guide-card">
            <div className="guide-icon">🎯</div>
            <h3>Critical Path</h3>
            <p>
              The longest chain of dependencies determines the minimum time 
              to complete the entire project. Priority work on critical path tasks.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="guide-card">
            <div className="guide-icon">⚠️</div>
            <h3>Blockage Warnings</h3>
            <p>
              Tasks blocked by overdue tasks are highlighted with warnings. 
              Fix blockage chains quickly to keep the project moving.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="guide-card">
            <div className="guide-icon">🔄</div>
            <h3>Cycle Prevention</h3>
            <p>
              The system automatically prevents circular dependencies 
              (A→B→A). The DAG remains acyclic and valid at all times.
            </p>
          </div>
        </div>
      </section>

      {/* Data Structure Explanation */}
      <section className="data-structure-section">
        <h2>🏗️ Directed Acyclic Graph (DAG) - Data Structure</h2>
        
        <div className="ds-grid">
          <div className="ds-card">
            <h3>Components</h3>
            <ul className="component-list">
              <li>
                <strong>Nodes:</strong> Each task is a node with properties:
                <ul>
                  <li>Task ID, action, object, deadline</li>
                  <li>Status (pending, reminder, completed, etc.)</li>
                  <li>Array of blocker task IDs</li>
                </ul>
              </li>
              <li>
                <strong>Edges:</strong> Directed arrows representing dependencies
                <ul>
                  <li>A → B means "A must complete before B"</li>
                  <li>Multiple edges possible from one node</li>
                </ul>
              </li>
              <li>
                <strong>Properties:</strong>
                <ul>
                  <li>Directed: edges have direction</li>
                  <li>Acyclic: no circular paths</li>
                  <li>Weighted: could include duration estimates</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="ds-card">
            <h3>Operations & Complexity</h3>
            <table className="complexity-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Complexity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Get task blockers</td>
                  <td>O(k) *</td>
                </tr>
                <tr>
                  <td>Get dependent tasks</td>
                  <td>O(k)</td>
                </tr>
                <tr>
                  <td>Check if ready</td>
                  <td>O(k)</td>
                </tr>
                <tr>
                  <td>Add dependency</td>
                  <td>O(n) **</td>
                </tr>
                <tr>
                  <td>Find critical path</td>
                  <td>O(n + m) ***</td>
                </tr>
                <tr>
                  <td>Get ready tasks</td>
                  <td>O(n)</td>
                </tr>
              </tbody>
            </table>
            <p className="complexity-note">
              * k = number of dependencies for a task<br/>
              ** includes cycle detection<br/>
              *** DFS with memoization (n=nodes, m=edges)
            </p>
          </div>

          <div className="ds-card">
            <h3>Why DAG for Tasks?</h3>
            <ul className="reason-list">
              <li>
                <strong>Natural representation:</strong> Tasks inherently have 
                temporal ordering constraints
              </li>
              <li>
                <strong>Efficiency:</strong> Operations like finding ready tasks 
                and critical path are optimized
              </li>
              <li>
                <strong>Validity guarantee:</strong> Acyclic property ensures 
                there's always a valid execution order
              </li>
              <li>
                <strong>Visual clarity:</strong> DAG structure is easy to visualize 
                and understand at a glance
              </li>
              <li>
                <strong>Scalability:</strong> Works well even with thousands of tasks 
                and dependencies
              </li>
            </ul>
          </div>

          <div className="ds-card">
            <h3>Real-World Example</h3>
            <div className="example">
              <div className="example-step">
                <span className="step-num">1</span>
                <div>Write proposal</div>
              </div>
              <span className="arrow">↓</span>
              <div className="example-step">
                <span className="step-num">2</span>
                <div>Get approval (depends on 1)</div>
              </div>
              <span className="arrow">↓</span>
              <div className="example-step">
                <span className="step-num">3</span>
                <div>Start project (depends on 2)</div>
              </div>
              <span className="arrow">↓</span>
              <div className="example-step">
                <span className="step-num">4</span>
                <div>Submit final report (depends on 3)</div>
              </div>
            </div>
            <p className="example-note">
              This chain cannot be parallelized. The critical path is 4 task durations.
              Any delay in steps 1-3 delays the entire project.
            </p>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="api-reference">
        <h2>🔌 API Endpoints</h2>
        
        <div className="endpoint-card">
          <div className="endpoint-method">GET</div>
          <div className="endpoint-path">/api/commitments/:userId/task/:taskId/dependencies</div>
          <div className="endpoint-description">
            Get detailed dependency information for a specific task
          </div>
          <div className="endpoint-response">
            <div className="response-item">
              <span className="key">task:</span>
              <span className="value">Current task details</span>
            </div>
            <div className="response-item">
              <span className="key">blockers:</span>
              <span className="value">Tasks that must complete first</span>
            </div>
            <div className="response-item">
              <span className="key">dependents:</span>
              <span className="value">Tasks waiting on this one</span>
            </div>
            <div className="response-item">
              <span className="key">readiness:</span>
              <span className="value">Whether task can start now</span>
            </div>
          </div>
        </div>

        <div className="endpoint-card">
          <div className="endpoint-method">GET</div>
          <div className="endpoint-path">/api/commitments/:userId/graph/dependencies</div>
          <div className="endpoint-description">
            Get the entire task dependency graph
          </div>
          <div className="endpoint-response">
            <div className="response-item">
              <span className="key">nodes:</span>
              <span className="value">All tasks with their properties</span>
            </div>
            <div className="response-item">
              <span className="key">edges:</span>
              <span className="value">All dependency relationships</span>
            </div>
            <div className="response-item">
              <span className="key">statistics:</span>
              <span className="value">Graph metrics (ready, blocked, critical path)</span>
            </div>
            <div className="response-item">
              <span className="key">criticalPath:</span>
              <span className="value">Longest dependency chain</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntegrationExample;
