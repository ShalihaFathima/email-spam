import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import './AnalysisDetailPage.css';

// Import all detail components
import TokenizationDetail from '../components/analysis/TokenizationDetail';
import BloomFilterDetail from '../components/analysis/BloomFilterDetail';
import HashTableDetail from '../components/analysis/HashTableDetail';
import TrieDetail from '../components/analysis/TrieDetail';
import ScoringDetail from '../components/analysis/ScoringDetail';
import GraphAnalysisDetail from '../components/analysis/GraphAnalysisDetail';
import FinalDecisionDetail from '../components/analysis/FinalDecisionDetail';

/**
 * Analysis Detail Page
 * Shows full-page detailed view of each analysis step
 * 
 * Routes: /analysis/:step
 */
const AnalysisDetailPage = ({ analysisData, emailSubject }) => {
  const { step } = useParams();
  const navigate = useNavigate();
  const [stepData, setStepData] = useState(null);

  useEffect(() => {
    if (analysisData?.pipeline && step) {
      const stepNum = parseInt(step) - 1;
      if (analysisData.pipeline[stepNum]) {
        setStepData(analysisData.pipeline[stepNum]);
      }
    }
  }, [analysisData, step]);

  const getStepComponent = () => {
    switch (parseInt(step)) {
      case 1:
        return <TokenizationDetail data={stepData?.data} />;
      case 2:
        return <BloomFilterDetail data={stepData?.data} />;
      case 3:
        return <HashTableDetail data={stepData?.data} />;
      case 4:
        return <TrieDetail data={stepData?.data} />;
      case 5:
        return <ScoringDetail data={stepData?.data} analysisData={analysisData} />;
      case 6:
        return <GraphAnalysisDetail data={stepData?.data} />;
      case 7:
        return <FinalDecisionDetail data={analysisData?.finalResult} />;
      default:
        return <div>Step not found</div>;
    }
  };

  const stepNames = [
    '📧 Email Input',
    '📝 Tokenization',
    '🔍 Bloom Filter',
    '#️⃣ Hash Table',
    '🌳 Trie Traversal',
    '📊 Scoring',
    '🔗 Graph Analysis',
    '✅ Final Decision'
  ];

  return (
    <motion.div
      className="analysis-detail-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowBackIcon /> Back
        </button>
        <h1>{stepNames[parseInt(step) - 1]}</h1>
        <p className="email-title">{emailSubject}</p>
      </div>

      {/* Step Navigation */}
      <div className="step-navigation">
        {stepNames.map((name, idx) => (
          <motion.button
            key={idx}
            className={`step-nav-button ${parseInt(step) === idx + 1 ? 'active' : ''}`}
            onClick={() => navigate(`/analysis/${idx + 1}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="step-number">{idx + 1}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div className="detail-content">
        {stepData ? (
          getStepComponent()
        ) : (
          <div className="loading">Loading step data...</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(parseInt(step) / 7) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  );
};

export default AnalysisDetailPage;
