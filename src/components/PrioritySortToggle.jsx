import React from 'react';
import './PrioritySortToggle.css';

/**
 * PRIORITY SORT TOGGLE - TOGGLE BUTTON FOR SORTING
 * Switches between normal section order and priority queue order
 */
const PrioritySortToggle = ({ isActive, onChange }) => {
  return (
    <button
      className={`pst-toggle ${isActive ? 'active' : ''}`}
      onClick={() => onChange(!isActive)}
      title={isActive ? 'Sorted by Priority' : 'Click to sort by Priority'}
    >
      <span className="pst-icon">
        {isActive ? '⬆️' : '📊'}
      </span>
      <span className="pst-label">
        {isActive ? 'Sorted by Priority' : 'Sort by Priority'}
      </span>
    </button>
  );
};

export default PrioritySortToggle;
