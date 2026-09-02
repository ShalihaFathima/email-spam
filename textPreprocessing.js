/**
 * Text Preprocessing Module for Email Spam Detection
 * 
 * Pipeline steps:
 * 1. Convert text to lowercase
 * 2. Tokenize words
 * 3. Remove stopwords
 * 4. Apply stemming
 * 5. Check against Bloom Filter for spam words (new)
 * 
 * Processed tokens are clean and ready for ML models
 */

const natural = require('natural');
const { removeStopwords, eng } = require('stopword');
const BloomFilter = require('./bloomFilter');

// Initialize stemmer (Porter stemmer)
const PorterStemmer = natural.PorterStemmer;

// English stopwords list
const STOPWORDS = eng;

// Initialize Bloom Filter for spam word detection (1024 bits, 4 hash functions)
const SPAM_FILTER = new BloomFilter(1024, 4);

// Spam keywords database - extensive list of common spam indicators
const SPAM_KEYWORDS = [
  // Financial/money-related
  'win', 'won', 'prize', 'free', 'cash', 'bonus', 'claim', 'reward',
  'money', 'dollar', 'pay', 'payment', 'invest', 'investor', 'stock',
  'crypto', 'bitcoin', 'ethereum', 'loan', 'credit', 'bank', 'paypal',
  'amazon', 'ebay', 'refund', 'transaction',
  
  // Urgency/Action
  'urgent', 'act', 'now', 'today', 'immediately', 'hurry', 'limited',
  'expire', 'deadline', 'confirm', 'verify', 'authenticate', 'click',
  'link',
  
  // Security/Account
  'account', 'suspend', 'block', 'lock', 'disable', 'compromise',
  'password', 'update', 'reset', 'secure', 'protect',
  
  // Health/Pharma
  'viagra', 'pill', 'drug', 'weight', 'loss', 'diet', 'medical',
  'pharma', 'prescription', 'health', 'cure', 'treatment',
  
  // Scam tactics
  'offer', 'deal', 'discount', 'sale', 'cheap', 'bargain',
  'hidden', 'secret', 'exclusive', 'opportunity', 'rich', 'wealth',
  'millionaire', 'success', 'guarantee', 'promise', 'work', 'home',
  'call', 'contact', 'reach',
  
  // Personalization tricks
  'congratulate', 'selected', 'chosen', 'special', 'honor', 'luck',
  'fortunate',
  
  // Technical scam
  'email', 'reactivate', 'upgrade', 'download', 'plugin',
  'software', 'antivirus', 'toolbar',
  
  // Nigerian/advance-fee scams
  'inherit', 'fund', 'beneficiary', 'testament', 'estate',
  'lawyer', 'transfer', 'fee', 'process'
];

// Stem all keywords and insert into Bloom Filter
const stemmedKeywords = SPAM_KEYWORDS.map(keyword => PorterStemmer.stem(keyword.toLowerCase()));
SPAM_FILTER.insertBatch(stemmedKeywords);

console.log('✅ Bloom Filter initialized for spam detection');
console.log(`   Keywords stemmed and inserted: ${stemmedKeywords.length}`);
console.log(`   Filter Stats: ${JSON.stringify(SPAM_FILTER.getStats())}`);
console.log(`   Estimated False Positive Rate: ${(SPAM_FILTER.estimateFalsePositiveRate() * 100).toFixed(4)}%`);

// DEBUG: Show some sample keywords that were inserted
console.log(`   Sample stemmed keywords inserted:`);
console.log(`      "transfer" → "${PorterStemmer.stem('transfer')}"`);
console.log(`      "urgent" → "${PorterStemmer.stem('urgent')}"`);
console.log(`      "account" → "${PorterStemmer.stem('account')}"`);
console.log(`      "bank" → "${PorterStemmer.stem('bank')}"`);
console.log(`      "immediately" → "${PorterStemmer.stem('immediately')}"`);

// Test if these stemmed keywords are actually in the filter
console.log(`   Testing if these stemmed keywords ARE in the Bloom Filter now:`);
['transfer', 'urgent', 'account', 'bank', 'immediately'].forEach(word => {
  const stemmed = PorterStemmer.stem(word);
  const found = SPAM_FILTER.possiblyContains(stemmed);
  console.log(`      "${stemmed}" → ${found ? '✅ IN FILTER' : '❌ NOT IN FILTER'}`);
});
console.log('');

/**
 * Process email text through NLP pipeline
 * 
 * @param {string} text - Raw email text (subject + body)
 * @returns {Object} Preprocessing result with tokens and metadata
 * 
 * Example:
 * Input: "You have WON a FREE lottery"
 * Output: {
 *   tokens: ["won", "free", "lottri"],
 *   originalTokens: ["you", "have", "won", "a", "free", "lottery"],
 *   removedStopwords: ["you", "have", "a"],
 *   tokenCount: 3,
 *   originalCount: 6
 * }
 */
function processEmail(text) {
  try {
    if (!text || typeof text !== 'string') {
      return {
        tokens: [],
        originalTokens: [],
        removedStopwords: [],
        tokenCount: 0,
        originalCount: 0,
        error: 'Invalid input text'
      };
    }

    // Step 1: Convert to lowercase
    const lowercase = text.toLowerCase();

    // Step 2: Tokenize words (remove punctuation, keep alphanumeric)
    // Remove URLs, emails, numbers, special characters
    const cleaned = lowercase
      .replace(/https?:\/\/[^\s]+/gi, '') // Remove URLs
      .replace(/[\w.-]+@[\w.-]+\.\w+/gi, '') // Remove email addresses
      .replace(/[^a-z\s]/gi, ' ') // Keep only letters and spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const tokens = cleaned.split(/\s+/).filter(token => token.length > 0);
    const originalTokens = [...tokens];

    // Step 3: Remove stopwords
    const remainingTokens = tokens.filter(token => {
      return !STOPWORDS.includes(token) && token.length > 2; // Also remove very short tokens
    });

    const removedStopwords = tokens.filter(token => 
      STOPWORDS.includes(token) || token.length <= 2
    );

    // Step 4: Apply stemming
    const stemmedTokens = remainingTokens.map(token => {
      return PorterStemmer.stem(token);
    });

    // Remove duplicates and sort for consistency
    const finalTokens = [...new Set(stemmedTokens)].sort();

    return {
      tokens: finalTokens,
      originalTokens: originalTokens,
      removedStopwords: removedStopwords,
      tokenCount: finalTokens.length,
      originalCount: originalTokens.length,
      textLength: text.length,
      success: true
    };
  } catch (error) {
    console.error('Error processing email:', error.message);
    return {
      tokens: [],
      originalTokens: [],
      removedStopwords: [],
      tokenCount: 0,
      originalCount: 0,
      error: error.message,
      success: false
    };
  }
}

/**
 * Process email subject and body together
 * 
 * @param {string} subject - Email subject line
 * @param {string} body - Email body content
 * @returns {Object} Combined preprocessing result
 */
function processEmailParts(subject = '', body = '') {
  // Combine subject and body with higher weight for subject
  const combined = `${subject} ${subject} ${body}`; // Subject weighted 2x
  return processEmail(combined);
}

/**
 * Calculate spam score based on processed tokens using Bloom Filter
 * Enhanced with weighted scoring for detected spam words
 * 
 * @param {Array} tokens - Processed tokens
 * @returns {Object} Detailed spam score analysis
 */
function calculateSpamScore(tokens) {
  if (!tokens || tokens.length === 0) {
    return {
      score: 0,
      detectedSpamWords: [],
      detectionCount: 0,
      tokenCount: 0,
      spamTokenRatio: 0
    };
  }

  const detectedSpamWords = [];
  
  // DEBUG: Check each token step-by-step
  console.log(`\n   📋 Checking ${tokens.length} tokens against Bloom Filter:`);
  
  // Check each token against the Bloom Filter
  tokens.forEach((token, idx) => {
    const found = SPAM_FILTER.possiblyContains(token);
    if (found) {
      detectedSpamWords.push(token);
      console.log(`      [${idx+1}] "${token}" → ✅ FOUND (added to spam words)`);
    }
    // Log suspicious words even if not found
    if (idx < 10) {
      console.log(`      [${idx+1}] "${token}" → ${found ? '✅' : '❌'}`);
    }
  });

  const detectionCount = detectedSpamWords.length;
  const spamTokenRatio = detectionCount / tokens.length;
  
  // Calculate score with weighted formula:
  // - Base: detection ratio (0-100)
  // - Bonus: higher weight if many spam words detected
  const baseScore = spamTokenRatio * 100;
  const weightFactor = Math.min(detectionCount / 3, 1); // Weight increases with more detections
  const score = baseScore * (0.7 + weightFactor * 0.3); // Final score: 70-100% of base

  return {
    score: Math.min(Math.round(score), 100),
    detectedSpamWords: detectedSpamWords,
    detectionCount: detectionCount,
    tokenCount: tokens.length,
    spamTokenRatio: (spamTokenRatio * 100).toFixed(2)
  };
}

/**
 * Detect if email is likely spam using Bloom Filter + token analysis
 * 
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {number} threshold - Spam score threshold (default: 30)
 * @returns {Object} Detection result with detailed analysis
 */
function detectSpam(subject = '', body = '', threshold = 30) {
  const processed = processEmailParts(subject, body);
  const spamAnalysis = calculateSpamScore(processed.tokens);
  const spamScore = spamAnalysis.score;
  
  // DEBUG: Log what tokens were extracted and checked
  console.log('\n🔍 BLOOM FILTER DEBUG:');
  console.log(`   All tokens: [${processed.tokens.slice(0, 20).join(', ')}${processed.tokens.length > 20 ? '...' : ''}]`);
  console.log(`   Total tokens: ${processed.tokens.length}`);
  console.log(`   Detected spam words: [${spamAnalysis.detectedSpamWords.join(', ')}]`);
  console.log(`   Detection count: ${spamAnalysis.detectionCount}`);
  
  // Check specific keywords against filter
  const testWords = ['urgent', 'transfer', 'account', 'bank', 'immediately', 'million'];
  console.log(`   Testing specific keywords against Bloom Filter:`);
  testWords.forEach(word => {
    const stemmed = PorterStemmer.stem(word.toLowerCase());
    const found = SPAM_FILTER.possiblyContains(stemmed);
    console.log(`      "${word}" (stemmed: "${stemmed}") → ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
  });
  console.log('');
  
  return {
    isSpam: spamScore >= threshold,
    spamScore: spamScore,
    threshold: threshold,
    tokens: processed.tokens,
    tokenCount: processed.tokenCount,
    detectedSpamWords: spamAnalysis.detectedSpamWords,
    detectedSpamCount: spamAnalysis.detectionCount,
    spamTokenRatio: spamAnalysis.spamTokenRatio,
    confidence: Math.abs(spamScore - threshold) / 100,
    bloomFilterUsed: true
  };
}

/**
 * Get preprocessing statistics for a batch of emails
 * 
 * @param {Array} emails - Array of email objects with subject and body
 * @returns {Object} Batch statistics including Bloom Filter metrics
 */
function getBatchStats(emails = []) {
  if (!Array.isArray(emails)) return null;

  let totalTokens = 0;
  let totalStopwords = 0;
  let totalSpamWordsDetected = 0;
  let totalEmails = emails.length;

  const processed = emails.map(email => {
    const result = processEmailParts(email.subject, email.body);
    totalTokens += result.tokenCount;
    totalStopwords += result.removedStopwords.length;
    
    // Calculate spam words detected
    const spamAnalysis = calculateSpamScore(result.tokens);
    totalSpamWordsDetected += spamAnalysis.detectionCount;
    
    return result;
  });

  const bloomFilterStats = SPAM_FILTER.getStats();

  return {
    totalEmails: totalEmails,
    averageTokensPerEmail: totalEmails > 0 ? (totalTokens / totalEmails).toFixed(2) : 0,
    averageStopwordsPerEmail: totalEmails > 0 ? (totalStopwords / totalEmails).toFixed(2) : 0,
    totalTokensExtracted: totalTokens,
    totalStopwordsRemoved: totalStopwords,
    totalSpamWordsDetected: totalSpamWordsDetected,
    bloomFilter: bloomFilterStats
  };
}

// Export functions and Bloom Filter
module.exports = {
  processEmail,
  processEmailParts,
  calculateSpamScore,
  detectSpam,
  getBatchStats,
  SPAM_FILTER,  // Export the Bloom Filter instance
  BloomFilter   // Export the Bloom Filter class for potential reuse
};
