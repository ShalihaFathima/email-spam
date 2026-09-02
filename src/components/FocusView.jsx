import React from 'react';
import { motion } from 'framer-motion';
import './FocusView.css';

/**
 * FocusView Component - Full-screen focused view of a single data structure
 */
const FocusView = ({ 
  isVisible,
  onClose,
  title,
  icon,
  children
}) => {
  // Close on ESC key
  React.useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="focus-view"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div className="focus-header">
        <div className="focus-title-section">
          <span className="focus-icon">{icon}</span>
          <h2 className="focus-title">{title}</h2>
        </div>
        <button
          className="focus-close-btn"
          onClick={onClose}
          aria-label="Close focus view"
        >
          ✕
        </button>
      </div>

      {/* Content Area */}
      <div className="focus-content">
        <motion.div
          className="focus-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Close hint */}
      <div className="focus-hint">
        Press ESC or click outside to close
      </div>
    </motion.div>
  );
};

export default FocusView;
