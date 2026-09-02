/**
 * Email API Service
 * Handles all communication with the backend email server
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Check if the API server is running
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Fetch emails from the backend
 * @param {string} folder - 'inbox', 'spam', 'sent', 'drafts'
 * @param {string} search - Search query
 * @param {number} limit - Number of emails to return
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} Array of email objects
 */
export const fetchEmails = async (folder = 'inbox', search = '', limit = 50, offset = 0) => {
  try {
    const params = new URLSearchParams({
      folder,
      ...(search && { search }),
      limit,
      offset,
    });

    const response = await fetch(`${API_BASE_URL}/emails?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch emails');
    }

    return {
      emails: result.data,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      folder: result.folder,
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

/**
 * Fetch a single email by ID
 * @param {number} emailId - Email ID
 * @returns {Promise<Object>} Email object
 */
export const fetchEmailById = async (emailId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch email: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch email');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching email:', error);
    throw error;
  }
};

/**
 * Toggle star status for an email
 * @param {number} emailId - Email ID
 * @returns {Promise<Object>} Updated email object
 */
export const toggleEmailStar = async (emailId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}/star`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to update email: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to update email');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Fetch email statistics
 * @returns {Promise<Object>} Statistics object
 */
export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch statistics');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Check email for spam in real-time
 * @param {string} sender - Sender name
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @returns {Promise<Object>} Spam detection result
 */
export const checkEmail = async (sender, subject, body) => {
  try {
    const response = await fetch(`${API_BASE_URL}/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check email: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to check email');
    }

    return result.data;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

/**
 * LocalStorage helper: Save emails to localStorage
 * @param {Array} emails - Array of email objects to save
 */
export const saveEmailsToLocalStorage = (emails) => {
  try {
    localStorage.setItem('storedEmails', JSON.stringify(emails));
  } catch (error) {
    console.error('Error saving emails to localStorage:', error);
  }
};

/**
 * LocalStorage helper: Load emails from localStorage
 * @returns {Array} Array of emails from localStorage or empty array
 */
export const loadEmailsFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem('storedEmails');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading emails from localStorage:', error);
    return [];
  }
};

/**
 * LocalStorage helper: Clear stored emails
 */
export const clearEmailsFromLocalStorage = () => {
  try {
    localStorage.removeItem('storedEmails');
  } catch (error) {
    console.error('Error clearing emails from localStorage:', error);
  }
};

/**
 * Merge backend emails with stored emails, avoiding duplicates
 * Uses email ID as unique identifier
 * @param {Array} backendEmails - Emails from backend
 * @param {Array} storedEmails - Emails from localStorage
 * @returns {Array} Merged email array
 */
export const mergeEmailsWithStorage = (backendEmails, storedEmails) => {
  // Create a map of backend emails by ID
  const backendMap = new Map(backendEmails.map(e => [e.id, e]));
  
  // Add stored emails that aren't in backend (new composed emails)
  storedEmails.forEach(stored => {
    if (!backendMap.has(stored.id)) {
      backendMap.set(stored.id, stored);
    }
  });
  
  return Array.from(backendMap.values());
};

const emailService = {
  checkHealth,
  fetchEmails,
  fetchEmailById,
  toggleEmailStar,
  fetchStats,
  checkEmail,
  saveEmailsToLocalStorage,
  loadEmailsFromLocalStorage,
  clearEmailsFromLocalStorage,
  mergeEmailsWithStorage,
};

export default emailService;
