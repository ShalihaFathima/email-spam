/**
 * Extracts task information from a sentence
 * 
 * @param {string} sentence - A single sentence string
 * @returns {object|null} Object with {action, object, timeText} or null if pattern not clear
 * 
 * Example:
 * extractTask("I will send the report today")
 * // Returns: { action: "send", object: "the report", timeText: "today" }
 * 
 * extractTask("I promise to call you today")
 * // Returns: { action: "call", object: "you", timeText: "today" }
 * 
 * extractTask("I'll prepare the slides tomorrow")
 * // Returns: { action: "prepare", object: "slides", timeText: "tomorrow" }
 */
function extractTask(sentence) {
  // Handle invalid input
  if (!sentence || typeof sentence !== 'string') {
    return null;
  }

  // Normalize: convert to lowercase and trim
  const lowerSentence = sentence.toLowerCase().trim();

  // Define commitment markers and their next word positions
  let commitmentIndex = -1;
  let skipWords = 0;

  // Check for different commitment phrases
  if (lowerSentence.includes('will ')) {
    commitmentIndex = lowerSentence.indexOf('will ');
    skipWords = 1; // Skip "will", next word is action
  } else if (lowerSentence.includes("i'll ")) {
    commitmentIndex = lowerSentence.indexOf("i'll ");
    skipWords = 1; // Skip "i'll", next word is action
  } else if (lowerSentence.includes('promise to ')) {
    commitmentIndex = lowerSentence.indexOf('promise to ');
    skipWords = 2; // Skip "promise to", next word is action
  } else if (lowerSentence.includes('let me ')) {
    commitmentIndex = lowerSentence.indexOf('let me ');
    skipWords = 2; // Skip "let me", next word is action
  }

  // If no commitment phrase found
  if (commitmentIndex === -1) {
    return null;
  }

  // Get the part after the commitment phrase
  const afterCommitment = lowerSentence.substring(commitmentIndex);
  const words = afterCommitment.split(/\s+/);

  // Skip the commitment phrase word(s)
  const remainingWords = words.slice(skipWords);

  if (remainingWords.length === 0) {
    return null;
  }

  // Action is the first word after commitment phrase
  const action = remainingWords[0];

  if (!action) {
    return null;
  }

  // Get words after the action
  const objectAndTime = remainingWords.slice(1);

  // Extract timeText and object
  let timeText = null;
  let objectWords = [];

  for (let word of objectAndTime) {
    // Remove punctuation
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    if (cleanWord === 'today' || cleanWord === 'tomorrow') {
      timeText = cleanWord;
    } else if (cleanWord.length > 0) {
      objectWords.push(cleanWord);
    }
  }

  // Join object words
  const object = objectWords.join(' ').trim();

  // If object is empty, pattern is not clear
  if (!object) {
    return null;
  }

  // Return extracted task information
  return {
    action: action,
    object: object,
    timeText: timeText || null, // null if not found
  };
}

module.exports = extractTask;
