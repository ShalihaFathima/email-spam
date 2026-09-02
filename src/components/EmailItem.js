import React, { useState } from 'react';
import { Star as StarIcon, StarBorder as StarBorderIcon, Delete as DeleteIcon } from '@mui/icons-material';
import './EmailItem.css';

const EmailItem = ({ email, isSelected, onSelect, onStarToggle, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const formatTime = (date) => {
    const now = new Date();
    const emailDate = new Date(date);
    const diffMs = now - emailDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return emailDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Handle delete button click
  const handleDeleteClick = async (e) => {
    e.stopPropagation();

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Delete email from ${email.sender}?\n\n"${email.subject}"\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    setIsDeleting(true);

    try {
      // Get email ID - try multiple properties in case of different formats
      const emailId = email.id || email._id;
      
      if (!emailId) {
        throw new Error('Email ID is missing. Cannot delete email.');
      }

      console.log(`🗑️  Deleting email with ID: ${emailId}`);

      // Send DELETE request to backend
      const response = await fetch(`http://localhost:3001/api/emails/${emailId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to delete email (${response.status})`);
      }

      console.log(`✅ Email deleted successfully: ${result.data.subject}`);

      // Tell parent component to remove from UI
      if (onDelete) {
        onDelete(emailId);
      }

    } catch (error) {
      console.error('❌ Error deleting email:', error);
      alert(`Failed to delete email:\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`email-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(email.id)}
    >
      <button
        className="star-btn"
        onClick={(e) => {
          e.stopPropagation();
          onStarToggle(email.id);
        }}
      >
        {email.isStarred ? <StarIcon /> : <StarBorderIcon />}
      </button>

      <div className="email-item-content">
        <div className="email-header">
          <span className="sender-name">{email.sender}</span>
          <span className="email-time">{formatTime(email.timestamp)}</span>
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-preview">{truncateText(email.preview || email.content || '', 80)}</div>
      </div>

      {email.hasAttachment && <div className="attachment-indicator">📎</div>}

      {/* Delete button */}
      <button
        className={`delete-btn ${isDeleting ? 'deleting' : ''}`}
        onClick={handleDeleteClick}
        disabled={isDeleting}
        title={isDeleting ? 'Deleting...' : 'Delete email'}
      >
        {isDeleting ? (
          <span style={{ opacity: 0.5 }}>⏳</span>
        ) : (
          <DeleteIcon />
        )}
      </button>
    </div>
  );
};

export default EmailItem;
