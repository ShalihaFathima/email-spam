/**
 * DELETE EMAIL - React Component Integration
 * 
 * Shows how to integrate email deletion into your React components
 * File: src/components/EmailItem.js (UPDATED)
 */

import React, { useState } from 'react';
import { 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
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
      `Delete email from ${email.sender}?\n"${email.subject}"\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Send DELETE request to backend
      const response = await fetch(`http://localhost:5000/api/emails/${email.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete email');
      }

      console.log(`✅ Email deleted: ${result.data?.subject}`);

      // Notify parent component to remove email from UI
      if (onDelete) {
        onDelete(email.id);
      }

    } catch (error) {
      console.error('❌ Error deleting email:', error);
      alert(`Failed to delete email: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`email-item ${isSelected ? 'selected' : ''} ${isDeleting ? 'deleting' : ''}`}
      onClick={() => onSelect(email.id)}
    >
      {/* Star button */}
      <button
        className="star-btn"
        onClick={(e) => {
          e.stopPropagation();
          onStarToggle(email.id);
        }}
        disabled={isDeleting}
      >
        {email.isStarred ? <StarIcon /> : <StarBorderIcon />}
      </button>

      {/* Email content */}
      <div className="email-item-content">
        <div className="email-header">
          <span className="sender-name">{email.sender}</span>
          <span className="email-time">{formatTime(email.timestamp)}</span>
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-preview">{truncateText(email.preview || email.content || '', 80)}</div>
      </div>

      {/* Attachment indicator */}
      {email.hasAttachment && <div className="attachment-indicator">📎</div>}

      {/* Delete button */}
      <button
        className={`delete-btn ${isDeleting ? 'deleting' : ''}`}
        onClick={handleDeleteClick}
        disabled={isDeleting}
        title="Delete email"
      >
        {isDeleting ? (
          <span className="deleting-spinner">⏳</span>
        ) : (
          <DeleteIcon />
        )}
      </button>
    </div>
  );
};

export default EmailItem;

// =========================================================
// REFERENCE DOCUMENTATION
// =========================================================
// 
// To use this component in EmailList:
// 1. Import the EmailItem component
// 2. Pass onDelete handler to delete emails
// 3. The handleDeleteClick function handles DELETE request to API
//
// Example usage in parent component:
// const handleEmailDeleted = (deletedEmailId) => {
//   setEmails(prev => prev.filter(e => e.id !== deletedEmailId));
// };
//
// CSS required in EmailItem.css:
// .delete-btn { opacity: 0; }
// .email-item:hover .delete-btn { opacity: 1; }
// .email-item.deleting { opacity: 0.6; pointer-events: none; }
//
