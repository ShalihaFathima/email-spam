import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as BackIcon, Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import AnalysisDetailPage from '../components/analysis/AnalysisDetailPage';
import '../styles/AnalysisPage.css';
import '../styles/FlowVisualization.css';


const AnalysisPage = ({ emails }) => {
  const navigate = useNavigate();
  const { emailId } = useParams();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);

  // Find email from emails list
  useEffect(() => {
    if (emails && emailId) {
      const found = emails.find(e => e.id === emailId);
      setEmail(found);
    }
  }, [emails, emailId]);

  // Fetch analysis data
  useEffect(() => {
    if (!email) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        // DEBUG: Log email data
        console.log('\n🔍 ANALYSIS PAGE DEBUG:');
        console.log('   Email object:', email);
        console.log('   email.sender:', email.sender);
        console.log('   email.subject:', email.subject);
        console.log('   email.content:', email.content ? `"${email.content.substring(0, 100)}..."` : 'UNDEFINED');
        console.log('   email.body:', email.body ? `"${email.body.substring(0, 100)}..."` : 'UNDEFINED');
        console.log('');

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
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Analysis failed');
        }

        // DEBUG: Log response structure
        console.log('🟢 AnalysisPage SERVER RESPONSE:', {
          success: data.success,
          hasPipeline: !!data.pipeline,
          pipelineLength: data.pipeline?.length || 0,
          pipelineSteps: data.pipeline?.map(p => ({ step: p.step, name: p.name, hasData: !!p.data })) || [],
          bloomFilterData: {
            step3Name: data.pipeline?.[2]?.name,
            step3TokensCount: data.pipeline?.[2]?.data?.tokens?.length || 0,
            step3Sample: data.pipeline?.[2]?.data?.tokens?.slice(0, 2)
          }
        });

        setAnalysisData({
          pipeline: data.pipeline || [],
          finalResult: data.finalResult || null,
        });
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err.message || 'Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [email]);

  // Redirect to new analysis detail page once data is fetched (Option C: make new pages primary)
  useEffect(() => {
    if (!loading && !error && analysisData) {
      setTimeout(() => {
        navigate('/analysis/detail/1', { 
          state: { analysisData, emailSubject: email?.subject }
        });
      }, 100);
    }
  }, [loading, error, analysisData, navigate, email]);

  if (!email) {
    return (
      <div className="analysis-page">
        <div className="analysis-error">
          <ErrorIcon />
          <p>Email not found</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')} title="Back to inbox">
            <BackIcon />
          </button>
          <div className="header-title">
            <h1>🔍 Email Analysis Dashboard</h1>
            <p className="header-subtitle">
              Re: {email.subject}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="analysis-container">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing email...</p>
          </div>
        )}

        {/* Redirecting State */}
        {!loading && !error && analysisData && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Opening detailed analysis...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">
              <ErrorIcon />
            </div>
            <h3>Analysis Failed</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => window.location.reload()}>
              <RefreshIcon /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
