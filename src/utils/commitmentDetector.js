/**
 * Detects commitment statements in email text
 * 
 * @param {string} emailText - The email text to analyze
 * @returns {array} Array of sentences containing commitment phrases
 * 
 * Example:
 * detectCommitments("I will send the report tomorrow. Let's meet later.")
 * // Returns: ["i will send the report tomorrow"]
 */
function detectCommitments(emailText) {
  // Handle empty input
  if (!emailText || typeof emailText !== 'string') {
    return [];
  }

  // Convert to lowercase
  const lowerText = emailText.toLowerCase();

  // Split into sentences using '.'
  const sentences = lowerText.split('.');

  // Commitment phrases to detect
  const commitmentPhrases = ['i will', "i'll", 'i promise to', 'let me'];

  // Filter sentences that contain commitment phrases
  const matchedSentences = sentences
    .map(sentence => sentence.trim()) // Trim spaces
    .filter(sentence => {
      // Skip empty sentences
      if (!sentence) return false;

      // Check if sentence contains any commitment phrase
      return commitmentPhrases.some(phrase => sentence.includes(phrase));
    });

  return matchedSentences;
}

module.exports = detectCommitments;
