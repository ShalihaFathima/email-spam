import React, { useState } from 'react';
import {
  Edit as EditIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftIcon,
  Error as SpamIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as ChartIcon,
  CheckCircle as TaskIcon,
} from '@mui/icons-material';
import './Sidebar.css';

const Sidebar = ({ onFolderChange, activeFolder, folderCounts = {}, onViewChange, activeView = 'emails', onCompose }) => {
  const [showMore, setShowMore] = useState(false);

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, count: folderCounts.inbox || 0 },
    { id: 'spam', label: 'Spam', icon: <SpamIcon />, count: folderCounts.spam || 0 },
    { id: 'sent', label: 'Sent', icon: <SendIcon />, count: folderCounts.sent || 0 },
    { id: 'drafts', label: 'Drafts', icon: <DraftIcon />, count: folderCounts.drafts || 0 },
  ];

  const moreLabels = [
    { id: 'important', label: 'Important', icon: <LabelIcon /> },
    { id: 'starred', label: 'Starred', icon: <LabelIcon /> },
    { id: 'archive', label: 'Archive', icon: <DeleteIcon /> },
  ];

  const handleFolderClick = (folderId) => {
    onViewChange('emails');
    onFolderChange(folderId);
  };

  const handleVisualizationClick = () => {
    onViewChange('data-structures');
  };

  const handleCommitmentsClick = () => {
    onViewChange('commitments');
  };

  return (
    <div className="sidebar">
      <button className="compose-btn" onClick={onCompose} title="Compose new email">
        <EditIcon />
        <span>Compose</span>
      </button>

      <div className="folders-list">
        {folders.map((folder) => (
          <button
            key={folder.id}
            className={`folder-item ${activeFolder === folder.id && activeView === 'emails' ? 'active' : ''}`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <span className="folder-icon">{folder.icon}</span>
            <span className="folder-label">{folder.label}</span>
            <span className="folder-count">{folder.count}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-divider"></div>

      <div className="more-labels">
        {showMore && (
          <>
            {moreLabels.map((label) => (
              <button
                key={label.id}
                className="label-item"
                onClick={() => handleFolderClick(label.id)}
              >
                <span className="label-icon">{label.icon}</span>
                <span className="label-name">{label.label}</span>
              </button>
            ))}
          </>
        )}

        <button
          className="show-more-btn"
          onClick={() => setShowMore(!showMore)}
        >
          <ExpandMoreIcon style={{ transform: showMore ? 'rotate(180deg)' : 'none' }} />
          <span>{showMore ? 'Less' : 'More'}</span>
        </button>
      </div>

      <div className="sidebar-divider"></div>

      <div className="tools-section">
        <button
          className={`tool-item ${activeView === 'commitments' ? 'active' : ''}`}
          onClick={handleCommitmentsClick}
        >
          <span className="tool-icon"><TaskIcon /></span>
          <span className="tool-label">Commitments</span>
        </button>

        <button
          className={`tool-item ${activeView === 'data-structures' ? 'active' : ''}`}
          onClick={handleVisualizationClick}
        >
          <span className="tool-icon"><ChartIcon /></span>
          <span className="tool-label">Data Structures</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
