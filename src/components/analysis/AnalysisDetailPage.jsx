import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './AnalysisDetailPage.css';

// Import all detail components
import InputDetail from './InputDetail';
import TokenizationDetail from './TokenizationDetail';
import BloomFilterDetail from './BloomFilterDetail';
import HashTableDetail from './HashTableDetail';
import TrieDetail from './TrieDetail';
import ScoringDetail from './ScoringDetail';
import GraphAnalysisDetail from './GraphAnalysisDetail';
import MLAnalysisDetail from './MLAnalysisDetail';
import FinalDecisionDetail from './FinalDecisionDetail';

/**
 * AnalysisDetailPage
 * Main routing page for 8-step spam detection visualization
 */
const AnalysisDetailPage = ({ analysisData: propAnalysisData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();
  const [currentStep, setCurrentStep] = useState(parseInt(step) || 1);
  
  // Get analysisData from props or location state (for Option C redirect flow)
  const analysisData = propAnalysisData || location.state?.analysisData;

  useEffect(() => {
    if (step) {
      setCurrentStep(parseInt(step));
    }
  }, [step]);

  const steps = [
    { number: 1, name: 'Input', icon: '📧' },
    { number: 2, name: 'Tokenization', icon: '📝' },
    { number: 3, name: 'Bloom Filter', icon: '🔍' },
    { number: 4, name: 'Hash Table', icon: '#️⃣' },
    { number: 5, name: 'Trie', icon: '🌳' },
    { number: 6, name: 'Scoring', icon: '📊' },
    { number: 7, name: 'Graph', icon: '🔗' },
    { number: 8, name: 'ML Analysis', icon: '🤖' },
    { number: 9, name: 'Decision', icon: '✅' },
  ];

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      navigate(`/analysis/detail/${newStep}`, { state: { analysisData } });
    }
  };

  const handleNextStep = () => {
    if (currentStep < 9) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      navigate(`/analysis/detail/${newStep}`, { state: { analysisData } });
    }
  };

  const handleStepClick = (stepNum) => {
    setCurrentStep(stepNum);
    navigate(`/analysis/detail/${stepNum}`, { state: { analysisData } });
  };

  const getDetailComponent = () => {
    // Get step data from pipeline array (API structure)
    const stepData = analysisData?.pipeline?.[currentStep - 1]?.data;
    
    // DEBUG: Log data for each step
    console.log(`🟡 AnalysisDetailPage STEP ${currentStep}:`, {
      hasPipeline: !!analysisData?.pipeline,
      pipelineLength: analysisData?.pipeline?.length || 0,
      stepData: stepData,
      stepName: analysisData?.pipeline?.[currentStep - 1]?.name,
      tokenCount: stepData?.tokens?.length || 0
    });
    
    switch (currentStep) {
      case 1:
        return <InputDetail data={stepData} />;
      case 2:
        return <TokenizationDetail data={stepData} />;
      case 3:
        return <BloomFilterDetail data={stepData} />;
      case 4:
        return <HashTableDetail data={stepData} />;
      case 5:
        return <TrieDetail data={stepData} />;
      case 6:
        return <ScoringDetail data={stepData} analysisData={analysisData} />;
      case 7:
        return <GraphAnalysisDetail data={stepData} />;
      case 8:
        return <MLAnalysisDetail analysisData={analysisData} />;
      case 9:
        return <FinalDecisionDetail data={analysisData?.finalResult} />;
      default:
        return <InputDetail data={stepData} />;
    }
  };

  const progressPercentage = (currentStep / 9) * 100;

  return (
    <div className="analysis-detail-page">
      {/* Back to Inbox Button */}
      <motion.button
        className="back-to-inbox-btn"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, x: -3 }}
        title="Back to Inbox"
      >
        ← Back to Inbox
      </motion.button>

      {/* Header */}
      <motion.div
        className="analysis-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>🔬 Email Spam Analysis Pipeline</h1>
       <p >
  Step-by-step visualization of the spam detection process
</p>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        className="progress-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="progress-info">
          <span>Progress: {currentStep} of 9 Steps</span>
          <span style={{ fontSize: '0.9rem', color: '#808080' }}>
            {steps[currentStep - 1]?.name}
          </span>
        </div>
        <div className="progress-bar-container">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="detail-content">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {getDetailComponent()}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <motion.div
        className="nav-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="nav-button"
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          title="Go to previous step"
        >
          ← Previous
        </button>

        <span className="step-indicator">
          {steps[currentStep - 1]?.icon} Step {currentStep} of 9
        </span>

        <button
          className="nav-button"
          onClick={handleNextStep}
          disabled={currentStep === 9}
          title="Go to next step"
        >
          Next →
        </button>
      </motion.div>

      {/* Step Cards Overview */}
      <motion.div
        className="step-cards"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {steps.map((s, idx) => (
          <motion.div
            key={s.number}
            className={`step-card ${s.number === currentStep ? 'active' : ''}`}
            onClick={() => handleStepClick(s.number)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            style={{
              cursor: 'pointer',
              opacity: s.number === currentStep ? 1 : 0.7,
            }}
          >
            <div className="step-number">{s.icon}</div>
            <div className="step-name">{s.name}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AnalysisDetailPage;
