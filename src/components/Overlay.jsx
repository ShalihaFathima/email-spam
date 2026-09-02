import React from 'react';
import { motion } from 'framer-motion';
import './Overlay.css';

/**
 * Overlay Component - Dark blur background for focus mode
 */
const Overlay = ({ isVisible, onClick }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    />
  );
};

export default Overlay;
