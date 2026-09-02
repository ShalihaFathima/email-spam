import React, { useState, useMemo } from 'react';
import { Checkbox } from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkAsUnread as MarkIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import EmailItem from './EmailItem';
import './EmailList.css';

const EmailList = ({ emails, onSelectEmail, selectedEmailId, onStarToggle, loading = false }) => {
  const [emailList, setEmailList] = useState(emails || []);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpam, setFilterSpam] = useState('all');

  // Handle when an email is deleted
  const handleEmailDeleted = (deletedEmailId) => {
    console.log(`🗑️  Removing email ${deletedEmailId} from UI`);
    setEmailList(prev => prev.filter(email => email.id !== deletedEmailId));
    if (selectedEmailId === deletedEmailId) {
      onSelectEmail(null);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emailList.map((e) => e.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (id) => {
    onSelectEmail(id);
  };

  // Filter emails based on search query and spam filter
  const filteredEmails = useMemo(() => {
    let result = emailList || [];

    // Apply spam filter
    if (filterSpam === 'spam') {
      result = result.filter(email => email.label === 'Spam' || email.engineClassification === 'spam');
    } else if (filterSpam === 'normal') {
      result = result.filter(email => email.label !== 'Spam' && email.engineClassification !== 'spam');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(email =>
        email.sender?.toLowerCase().includes(query) ||
        email.subject?.toLowerCase().includes(query) ||
        email.preview?.toLowerCase().includes(query) ||
        email.content?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [emailList, searchQuery, filterSpam]);

  return (
    <div className="email-list">
      <div className="email-list-header">
        <button className="select-all-btn" onClick={handleSelectAll}>
          <Checkbox
            checked={selectAll}
            indeterminate={selectedEmails.size > 0 && !selectAll}
            size="small"
          />
        </button>

        <div className="list-actions">
          <button className="action-btn" title="Archive">
            <ArchiveIcon fontSize="small" />
          </button>
          <button className="action-btn" title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
          <button className="action-btn" title="Mark as read">
            <MarkIcon fontSize="small" />
          </button>
          <button className="action-btn" title="More">
            <MoreVertIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="email-search-filter">
        <div className="search-box">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <ClearIcon fontSize="small" />
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterSpam === 'all' ? 'active' : ''}`}
            onClick={() => setFilterSpam('all')}
          >
            📧 All
          </button>
          <button
            className={`filter-btn ${filterSpam === 'normal' ? 'active' : ''}`}
            onClick={() => setFilterSpam('normal')}
          >
            ✓ Legitimate
          </button>
          <button
            className={`filter-btn ${filterSpam === 'spam' ? 'active' : ''}`}
            onClick={() => setFilterSpam('spam')}
          >
            ⚠️ Spam
          </button>
        </div>
      </div>

      <div className="email-count">
        {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
        {(searchQuery || filterSpam !== 'all') && ` (filtered from ${emailList?.length || 0})`}
      </div>

      <div className="emails-container">
        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <div className="empty-text">Loading emails...</div>
          </div>
        ) : filteredEmails && filteredEmails.length > 0 ? (
          filteredEmails.map((email) => (
            <EmailItem
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onSelect={handleSelectEmail}
              onStarToggle={onStarToggle}
              onDelete={handleEmailDeleted}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">
              {searchQuery || filterSpam !== 'all'
                ? 'No emails match your search or filter'
                : 'No emails in this folder'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
