import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';
import ComposeEmail from './components/ComposeEmail';
import DataStructures from './components/DataStructures';
import TaskTracker from './components/TaskTracker';
import AnalysisPage from './pages/AnalysisPage';
import AnalysisDetailPage from './components/analysis/AnalysisDetailPage';
import * as emailService from './services/emailService';
import { runCommitmentSystem, getUserTaskOverview } from './utils/commitmentSystem';
import './styles/App.css';

function AppContent() {
  const navigate = useNavigate();
  // State management
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeView, setActiveView] = useState('emails'); // 'emails', 'data-structures', or 'commitments'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    spam: 0,
    sent: 0,
    drafts: 0,
  });
  const [showCompose, setShowCompose] = useState(false);
  const [composeMessage, setComposeMessage] = useState(null);
  const [trackerData, setTrackerData] = useState({
    pending: [],
    completed: [],
    reminders: [],
    stats: {}
  });
  const [userId] = useState(1); // TODO: Get from auth context

  /**
   * Fetch emails from backend and merge with stored emails
   */
  const loadEmails = async (folder = activeFolder, search = searchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const result = await emailService.fetchEmails(folder, search);
      const backendEmails = result.emails;
      
      // Load stored emails from localStorage
      const storedEmails = emailService.loadEmailsFromLocalStorage();
      
      // Merge backend emails with stored emails (avoiding duplicates)
      const mergedEmails = emailService.mergeEmailsWithStorage(backendEmails, storedEmails);
      
      // Filter merged emails by current folder and search query if needed
      let filteredEmails = mergedEmails;
      if (folder !== 'inbox' && folder !== 'spam') {
        // For folders like sent, drafts, starred, etc., only show relevant emails
        filteredEmails = mergedEmails.filter(email => email.folder === folder);
      } else {
        // For inbox/spam, use backend folder classification (label: 'ham' or 'spam')
        // Include emails without a label (treat as 'ham'/inbox by default)
        const targetLabel = folder === 'spam' ? 'spam' : 'ham';
        filteredEmails = mergedEmails.filter(email => {
          return email.label === targetLabel || (!email.label && folder === 'inbox');
        });
      }
      
      console.log(`Loading ${folder}: found ${filteredEmails.length} emails from ${mergedEmails.length} merged`);
      setEmails(filteredEmails);
      
      // Update folder counts from merged data
      const inboxCount = mergedEmails.filter(e => e.label === 'ham').length;
      const spamCount = mergedEmails.filter(e => e.label === 'spam').length;
      
      setFolderCounts({
        inbox: inboxCount,
        spam: spamCount,
        sent: 0,
        drafts: 0,
      });

      // Set first email as selected if none selected
      if (!selectedEmailId && filteredEmails.length > 0) {
        setSelectedEmailId(filteredEmails[0].id);
      }
    } catch (err) {
      console.error('Error loading emails:', err);
      setError(err.message || 'Failed to load emails');
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save emails to localStorage whenever they change
   */
  useEffect(() => {
    if (emails.length > 0) {
      emailService.saveEmailsToLocalStorage(emails);
    }
  }, [emails]);

  /**
   * Load emails when component mounts or dependencies change
   */
  useEffect(() => {
    loadEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder, searchQuery]);

  /**
   * Load stored commitments on app initialization
   */
  useEffect(() => {
    const loadStoredCommitments = async () => {
      try {
        const overview = await getUserTaskOverview(userId);
        setTrackerData(overview);
        console.log('✅ Loaded stored commitments on page load:', {
          pending: overview.pending?.length || 0,
          completed: overview.completed?.length || 0,
        });
      } catch (err) {
        console.error('Error loading stored commitments:', err);
      }
    };

    loadStoredCommitments();
  }, [userId]); // Run when userId changes (but usually only once)


  /**
   * Get currently selected email
   */
  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [selectedEmailId, emails]);

  /**
   * Handle search
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedEmailId(null); // Reset selection on search
  };

  /**
   * Handle folder change
   */
  const handleFolderChange = (folderId) => {
    setActiveFolder(folderId);
    setSelectedEmailId(null); // Reset selection on folder change
    setSearchQuery(''); // Clear search on folder change
  };

  /**
   * Handle star toggle with API call
   */
  const handleStarToggle = async (emailId) => {
    try {
      // Optimistic update
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
        )
      );

      // API call
      const updatedEmail = await emailService.toggleEmailStar(emailId);

      // Update the email in state with response
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === emailId ? updatedEmail : email
        )
      );
    } catch (err) {
      console.error('Error updating star status:', err);
      // Revert on error
      loadEmails();
    }
  };

  /**
   * Retry loading emails
   */
  const handleRetry = () => {
    loadEmails();
  };

  /**
   * Handle new email sent from compose form
   */
  const handleEmailSent = async (result) => {
    // Display success message
    setComposeMessage({
      type: 'success',
      text: result.message,
      label: result.label,
      folder: result.folder,
    });

    // Close compose modal
    setShowCompose(false);

    // Process email for commitments
    try {
      const emailText = `${result.subject || ''} ${result.body || ''}`;
      console.log('📋 Processing commitments for email:', { 
        subject: result.subject, 
        bodyLength: result.body?.length || 0,
        userId 
      });
      
      const commitmentResult = await runCommitmentSystem(emailText, userId);
      console.log('✅ Commitment result:', commitmentResult);
      
      setTrackerData(commitmentResult);
    } catch (err) {
      console.error('❌ Error processing commitments:', err);
    }

    // Reload emails from backend to get the new email
    // This ensures frontend stays in sync with database
    setTimeout(() => {
      loadEmails(result.folder === 'spam' ? 'spam' : 'inbox');
    }, 500);

    // Update folder counts
    setFolderCounts((prev) => ({
      ...prev,
      [result.folder]: prev[result.folder] + 1,
    }));

    // Clear message after 5 seconds
    setTimeout(() => {
      setComposeMessage(null);
    }, 5000);
  };

  /**
   * Handle close compose
   */
  const handleCloseCompose = () => {
    setShowCompose(false);
  };

  return (
    <>
      <Routes>
        {/* Analysis Detail Page Route - 8 step visualization */}
        <Route
          path="/analysis/detail/:step"
          element={<AnalysisDetailPage analysisData={null} />}
        />

        {/* Analysis Page Route */}
        <Route
          path="/analysis/:emailId"
          element={<AnalysisPage emails={emails} />}
        />

        {/* Main Email View */}
        <Route
          path="/*"
          element={
            <div className="app-container">
              <Navbar onSearch={handleSearch} onCompose={() => setShowCompose(true)} />

              {/* Compose Email Modal */}
              {showCompose && (
                <div className="compose-overlay">
                  <ComposeEmail
                    onEmailSent={handleEmailSent}
                    onClose={handleCloseCompose}
                  />
                </div>
              )}

              {/* Success Message */}
              {composeMessage && (
                <div className={`compose-success-banner ${composeMessage.classification}`}>
                  <span>
                    {composeMessage.classification === 'spam'
                      ? '⚠️ '
                      : '✅ '}
                    {composeMessage.text}
                  </span>
                </div>
              )}

              {/* Data Structures Visualization View */}
              {activeView === 'data-structures' && (
                <div className="app-body full-width">
                  <Sidebar
                    onFolderChange={handleFolderChange}
                    activeFolder={activeFolder}
                    folderCounts={folderCounts}
                    onViewChange={setActiveView}
                    activeView={activeView}
                    onCompose={() => setShowCompose(true)}
                  />
                  <div className="visualization-main">
                    <DataStructures />
                  </div>
                </div>
              )}

              {/* Task Tracker View */}
              {activeView === 'commitments' && (
                <TaskTracker userId="john123" onBack={() => setActiveView('emails')} />
              )}

              {/* Email View */}
              {activeView === 'emails' && (
                <div className="app-body">
                  <Sidebar
                    onFolderChange={handleFolderChange}
                    activeFolder={activeFolder}
                    folderCounts={folderCounts}
                    onViewChange={setActiveView}
                    activeView={activeView}
                    onCompose={() => setShowCompose(true)}
                  />
                  <div className="app-main">
                    <div className="email-list-container">
                      {error && (
                        <div className="error-banner">
                          <span>{error}</span>
                          <button onClick={handleRetry}>Retry</button>
                        </div>
                      )}
                      <EmailList
                        emails={emails}
                        onSelectEmail={setSelectedEmailId}
                        selectedEmailId={selectedEmailId}
                        onStarToggle={handleStarToggle}
                        loading={loading}
                      />
                    </div>
                    <div className="email-viewer-container">
                      <EmailViewer
                        email={selectedEmail}
                        onStarToggle={handleStarToggle}
                        onAnalyze={() => selectedEmail && navigate(`/analysis/${selectedEmail.id}`)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
