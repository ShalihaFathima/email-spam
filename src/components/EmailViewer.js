import React, { useState } from 'react';
import {
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FileDownload as FileDownloadIcon,
  Visibility as AnalyzeIcon,
  TaskAlt as TaskIcon,
} from '@mui/icons-material';
import './EmailViewer.css';

const EmailViewer = ({ email, onStarToggle, onAnalyze, onCreateTask, userId = 'john123' }) => {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  if (!email) {
    return (
      <div className="email-viewer">
        <div className="empty-viewer">
          <div className="empty-icon">✉️</div>
          <div className="empty-text">Select an email to view</div>
        </div>
      </div>
    );
  }

  const formatFullDate = (date) => {
    const emailDate = new Date(date);
    return emailDate.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Handle "Create Task from Email" action
   */
  const handleCreateTaskFromEmail = async () => {
    if (!email.content) return;

    setIsCreatingTask(true);

    try {
      // Call commitment system to extract tasks from email
      const response = await fetch('/api/extract-tasks-from-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailText: `${email.subject || ''} ${email.content || ''}`,
          userId: userId,
          sourceEmail: {
            sender: email.sender,
            subject: email.subject,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Tasks created from email: ${data.data.tasksCreated} task(s)`);
        
        // Show success notification
        alert(`✅ ${data.data.tasksCreated} task(s) created from this email!\n\nGo to TaskTracker to see them.`);

        // Notify parent
        if (onCreateTask) {
          onCreateTask(data.data);
        }
      } else {
        alert(`⚠️  ${data.message || 'No tasks found in this email'}`);
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="email-viewer">
      <div className="viewer-header">
        <div className="viewer-title">
          <h2>{email.subject}</h2>
        </div>
        <div className="viewer-actions">
          <button className="viewer-action-btn" onClick={onAnalyze} title="Analyze Email">
            <AnalyzeIcon />
          </button>
          <button 
            className="viewer-action-btn" 
            onClick={handleCreateTaskFromEmail}
            disabled={isCreatingTask}
            title="Create Task from Email"
          >
            <TaskIcon />
          </button>
          <button className="viewer-action-btn" title="Archive">
            <ArchiveIcon />
          </button>
          <button className="viewer-action-btn" title="Delete">
            <DeleteIcon />
          </button>
          <button className="viewer-action-btn" title="More">
            <MoreVertIcon />
          </button>
        </div>
      </div>

      <div className="email-meta">
        <div className="meta-row">
          <div className="sender-info">
            <div className="sender-avatar">{email.sender.charAt(0).toUpperCase()}</div>
            <div>
              <div className="sender-name">{email.sender}</div>
              <div className="sender-email">{email.senderEmail}</div>
            </div>
          </div>
          <div className="meta-time">{formatFullDate(email.timestamp)}</div>
        </div>

        <div className="recipient-row">
          <span className="label">to</span>
          <span>{email.recipient || 'recipient@example.com'}</span>
        </div>
      </div>

      <div className="email-content">
        <div className="content-text">
          {email.content}
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <div className="attachments">
            <div className="attachments-title">Attachments</div>
            {email.attachments.map((attachment, idx) => (
              <div key={idx} className="attachment-item">
                <FileDownloadIcon />
                <span className="attachment-name">{attachment}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="email-footer">
        <button className="footer-btn">
          <ReplyIcon />
          <span>Reply</span>
        </button>
        <button className="footer-btn">
          <ForwardIcon />
          <span>Forward</span>
        </button>
        <button
          className="footer-btn"
          onClick={() => onStarToggle(email.id)}
        >
          {email.isStarred ? <StarIcon /> : <StarBorderIcon />}
          <span>{email.isStarred ? 'Starred' : 'Add star'}</span>
        </button>
      </div>
    </div>
  );
};

export default EmailViewer;
