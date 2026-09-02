import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import TokenViewer from './TokenViewer';
import BloomFilterVisualizer from './BloomFilterVisualizer';
import HashTableVisualizer from './HashTableVisualizer';
import TrieVisualizer from './TrieVisualizer';
import ScoreVisualizer from './ScoreVisualizer';
import GraphVisualizer from './GraphVisualizer';
import FinalDecisionViewer from './FinalDecisionViewer';
import StepCard from './StepCard';
import FocusView from './FocusView';
import Overlay from './Overlay';
import './EmailAnalysisPanel.css';

/**
 * Main Email Analysis Visualization Panel
 * 
 * Shows step-by-step how an email is processed through:
 * - Tokenization
 * - Bloom Filter
 * - Hash Table
 * - Trie
 * - Scoring
 * 
 * NEW: Interactive focus mode with glassmorphism UI
 */
const EmailAnalysisPanel = ({ email, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);
  const [focusedStep, setFocusedStep] = useState(null);

  // Fetch analysis when email is selected
  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/analyze-email-visualization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: email.sender || 'Unknown',
          subject: email.subject || '',
          body: email.content || email.body || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }
      
      // Transform response data to match expected format
      const analysisData = {
        pipeline: data.pipeline || [],
        finalResult: data.finalResult || null
      };
      
      setAnalysisData(analysisData);
      setActiveStep(1);
      setFocusedStep(null); // Reset focused step for new email
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (isOpen && email) {
      // Always refetch when email changes (not just when analysisData is null)
      fetchAnalysis();
    }
  }, [isOpen, email, fetchAnalysis]);

  // Handle View Full Analysis navigation
  const handleViewFullAnalysis = () => {
    onClose(); // Close the modal first
    navigate('/analysis/detail/1', { 
      state: { analysisData, emailSubject: email?.subject }
    }); // Navigate to full-page analysis with data
  };

  if (!isOpen || !email) return null;

  // Define step configurations for cards
  const getStepConfig = (stepIndex) => {
    const configs = [
      {
        icon: '📧',
        title: 'Email Input',
        description: 'Raw email data',
        stats: [
          { label: 'From', value: analysisData?.pipeline[stepIndex]?.data?.from || 'N/A' },
          { label: 'Subject', value: analysisData?.pipeline[stepIndex]?.data?.subject ? 'Present' : 'None' }
        ]
      },
      {
        icon: '📝',
        title: 'Tokenization',
        description: 'Break into words',
        stats: [
          { label: 'Tokens', value: analysisData?.pipeline[stepIndex]?.data?.tokens?.length || 0 },
          { label: 'Original', value: analysisData?.pipeline[stepIndex]?.data?.originalTokens?.length || 0 }
        ]
      },
      {
        icon: '🔍',
        title: 'Bloom Filter',
        description: 'Probabilistic check',
        stats: [
          { label: 'Size', value: '1024 bits' },
          { label: 'Keywords', value: '113' }
        ]
      },
      {
        icon: '#️⃣',
        title: 'Hash Table',
        description: 'Fast lookup O(1)',
        stats: [
          { label: 'Found', value: analysisData?.pipeline[stepIndex]?.data?.foundWords?.length || 0 },
          { label: 'Clean', value: analysisData?.pipeline[stepIndex]?.data?.notFoundWords?.length || 0 }
        ]
      },
      {
        icon: '🌳',
        title: 'Trie Traversal',
        description: 'Prefix tree search',
        stats: [
          { label: 'Paths', value: analysisData?.pipeline[stepIndex]?.data?.paths?.length || 0 },
          { label: 'Match Rate', value: 'High' }
        ]
      },
      {
        icon: '📊',
        title: 'Scoring',
        description: 'Calculate risk',
        stats: [
          { label: 'Score', value: analysisData?.pipeline[stepIndex]?.data?.score || 0 },
          { label: 'Category', value: analysisData?.pipeline[stepIndex]?.data?.category || 'N/A' }
        ]
      },
      {
        icon: '🔗',
        title: 'Graph Analysis',
        description: 'Relationship detection',
        stats: [
          { label: 'Nodes', value: analysisData?.pipeline[stepIndex]?.data?.graphStats?.nodeCount || 0 },
          { label: 'Score', value: analysisData?.pipeline[stepIndex]?.data?.score || 0 }
        ]
      }
    ];
    return configs[stepIndex] || {};
  };

  // Render focused step content
  const renderFocusedContent = () => {
    switch (focusedStep) {
      case 1:
        return <EmailInputViewer data={analysisData.pipeline[0].data} />;
      case 2:
        return <TokenViewer data={analysisData.pipeline[1].data} />;
      case 3:
        return <BloomFilterVisualizer data={analysisData.pipeline[2].data} />;
      case 4:
        return <HashTableVisualizer data={analysisData.pipeline[3].data} />;
      case 5:
        return <TrieVisualizer data={analysisData.pipeline[4].data} />;
      case 6:
        return <ScoreVisualizer data={analysisData.pipeline[5].data} />;
      case 7:
        return <GraphVisualizer graphData={analysisData.pipeline[6].data?.graph} expanded={true} />;
      case 8:
        return <FinalDecisionViewer data={analysisData.finalResult} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <Overlay isVisible={isOpen} onClick={onClose} />

      {/* Main Panel */}
      <div className="email-analysis-overlay">
        <motion.div
          className="email-analysis-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="analysis-header">
            <div className="header-content">
              <h2>🔍 Email Analysis Dashboard</h2>
              <p className="header-subtitle">Click any step to explore in detail</p>
            </div>
            <div className="header-buttons">
              <button 
                className="view-full-analysis-btn" 
                onClick={handleViewFullAnalysis}
                title="View detailed full-page analysis"
              >
                📊 Full Analysis
              </button>
              <button className="close-btn" onClick={onClose} title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="analysis-loading">
              <div className="spinner"></div>
              <p>Analyzing email...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="analysis-error">
              <InfoIcon />
              <p>{error}</p>
            </div>
          )}

          {/* Main Content - Step Cards Grid */}
          {!loading && !error && analysisData && (
            <div className="analysis-steps-grid">
              <AnimatePresence>
                {analysisData.pipeline.map((step, idx) => {
                  const config = getStepConfig(idx);
                  return (
                    <StepCard
                      key={idx}
                      stepNumber={idx}
                      icon={config.icon}
                      title={config.title}
                      description={config.description}
                      stats={config.stats}
                      isActive={focusedStep === step.step}
                      onExpand={() => setFocusedStep(step.step)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Focus View - Full Screen for Selected Step */}
      <AnimatePresence>
        {focusedStep && analysisData && (
          <>
            <Overlay
              isVisible={true}
              onClick={() => setFocusedStep(null)}
            />
            <FocusView
              isVisible={true}
              onClose={() => setFocusedStep(null)}
              title={analysisData.pipeline[focusedStep - 1]?.name || 'Details'}
              icon={getStepConfig(focusedStep - 1).icon}
            >
              {renderFocusedContent()}
            </FocusView>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Email Input Viewer Component
 */
const EmailInputViewer = ({ data }) => (
  <div className="email-input-viewer">
    <div className="input-card">
      <h3>📧 Email Input</h3>
      <div className="email-preview">
        <div className="preview-field">
          <label>From:</label>
          <p className="sender-name">{data.sender}</p>
        </div>
        <div className="preview-field">
          <label>Subject:</label>
          <p className="subject-text">{data.subject}</p>
        </div>
        <div className="preview-field">

          <label>Body:</label>
          <p className="body-text">{data.bodyPreview}</p>
        </div>
      </div>
    </div>
  </div>
);

export default EmailAnalysisPanel;
