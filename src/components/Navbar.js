import React from 'react';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import './Navbar.css';

const Navbar = ({ onSearch, onCompose }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="gmail-logo">
          <span className="gmail-text">MailNova</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search mail"
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" title="Help">
          <HelpIcon />
        </button>
        <button className="navbar-icon-btn" title="Settings">
          <SettingsIcon />
        </button>
        {onCompose && (
          <button className="navbar-compose-btn" onClick={onCompose} title="Compose Email">
            <EditIcon /> Compose
          </button>
        )}
        <div className="profile-icon">
          <span>A</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
