/**
 * Advanced Spam Detection Engine
 * 
 * Pipeline:
 * 1. Receive email text
 * 2. Run preprocessing (tokenization, stemming)
 * 3. Check tokens using Bloom Filter
 * 4. Check sender domain & links
 * 5. Detect suspicious patterns
 * 6. GRAPH ANALYSIS - Relationship-based detection (NEW)
 * 7. Calculate final classification
 * 
 * Scoring Rules:
 * - Each spam word found: +2
 * - Suspicious sender domain: +2
 * - Email contains link: +1
 * - Pattern detection: varies
 * - Graph analysis (relationship-based): varies
 * - Score >= 3 → SPAM
 * - Score < 3 → NORMAL
 */

const { detectSpam, processEmailParts, SPAM_FILTER } = require('./textPreprocessing');
const SpamGraph = require('./spamGraph');

// Initialize global SpamGraph instance for relationship-based spam detection
const spamGraph = new SpamGraph(3); // frequency threshold = 3

/**
 * Lists of suspicious domain indicators
 */
const SUSPICIOUS_DOMAINS = [
  // Removed gmail.com, yahoo.com, hotmail.com - too many legitimate users
  'mailinator.com', // Temporary email
  'guerrillamail.com', // Temporary email
  '10minutemail.com', // Temporary email
  'tempmail.com',  // Temporary email
  'throwaway.email', // Disposable email
];

const TRUSTED_DOMAINS = [
  'company.com',
  'microsoft.com',
  'google.com',
  'apple.com',
  'amazon.com',
  'facebook.com',
  'linkedin.com',
];

/**
 * SAFE BUSINESS WORDS - Indicate legitimate professional communication
 * These words REDUCE spam score by -2 each
 */
const SAFE_BUSINESS_WORDS = new Set([
  // Professional roles & communication
  'team', 'manager', 'director', 'executive', 'colleague', 'department',
  
  // Project/work activities
  'project', 'proposal', 'presentation', 'meeting', 'review', 'analysis',
  'report', 'document', 'schedule', 'planning', 'strategy', 'initiative',
  
  // Business entities & products
  'client', 'customer', 'vendor', 'partner', 'stakeholder', 'employee',
  
  // Business processes
  'budget', 'invoice', 'contract', 'agreement', 'approval', 'request',
  'update', 'status', 'progress', 'feedback', 'discussion', 'collaboration',
  
  // Timeline/deadlines (normal business context)
  'deadline', 'timeline', 'schedule', 'quarter', 'fiscal', 'annual',
  
  // Professional greetings
  'regards', 'sincerely'
]);

/**
 * POSITIVE GREETING WORDS - Indicate legitimate communication
 */
const POSITIVE_GREETINGS = new Set([
  'hi', 'hello', 'good morning', 'good afternoon', 'dear', 'greetings'
]);

/**
 * Regex pattern to detect URLs and links
 */
const LINK_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|org|net|io|co|uk|edu|gov)/gi;

/**
 * Detect if sender domain is suspicious
 * 
 * @param {string} senderEmail - Sender email address
 * @returns {Object} Domain analysis result
 */
function analyzeSenderDomain(senderEmail) {
  if (!senderEmail || typeof senderEmail !== 'string') {
    return {
      isSuspicious: false,
      domain: 'unknown',
      reason: null,
      score: 0
    };
  }

  // Extract domain from email
  const emailParts = senderEmail.toLowerCase().split('@');
  if (emailParts.length !== 2) {
    return {
      isSuspicious: false,
      domain: 'invalid',
      reason: 'invalid_email_format',
      score: 0
    };
  }

  const domain = emailParts[1];

  // Check if domain is in trusted list
  const isTrusted = TRUSTED_DOMAINS.some(td => domain.includes(td));
  if (isTrusted) {
    return {
      isSuspicious: false,
      domain: domain,
      reason: 'trusted_domain',
      score: 0
    };
  }

  // Check if domain is suspicious
  const isSuspicious = SUSPICIOUS_DOMAINS.some(sd => domain === sd || domain.endsWith('.' + sd));
  if (isSuspicious) {
    return {
      isSuspicious: true,
      domain: domain,
      reason: 'known_suspicious_domain',
      score: 2
    };
  }

  // Check for other suspicious patterns
  if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(domain)) {
    return {
      isSuspicious: true,
      domain: domain,
      reason: 'ip_address_as_domain',
      score: 2
    };
  }

  if (domain.length > 50) {
    return {
      isSuspicious: true,
      domain: domain,
      reason: 'unusually_long_domain',
      score: 1
    };
  }

  // Domain appears legitimate but uncommon
  return {
    isSuspicious: false,
    domain: domain,
    reason: 'unknown_domain',
    score: 0
  };
}

/**
 * Detect links in email text
 * 
 * @param {string} text - Email text to analyze
 * @returns {Object} Link detection result
 */
function detectLinks(text) {
  if (!text || typeof text !== 'string') {
    return {
      hasLinks: false,
      linksFound: [],
      linkCount: 0,
      score: 0
    };
  }

  const links = text.match(LINK_PATTERN) || [];
  const uniqueLinks = [...new Set(links.map(link => link.toLowerCase()))];

  return {
    hasLinks: uniqueLinks.length > 0,
    linksFound: uniqueLinks,
    linkCount: uniqueLinks.length,
    score: uniqueLinks.length > 0 ? 1 : 0
  };
}

/**
 * Detect safe business words in email content
 * These words indicate legitimate professional communication
 * 
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Object} Safe words analysis
 */
function detectSafeBusinessWords(subject = '', body = '') {
  const combined = (subject + ' ' + body).toLowerCase();
  const words = combined.match(/\b\w+\b/g) || [];
  
  const foundSafeWords = [];
  words.forEach(word => {
    if (SAFE_BUSINESS_WORDS.has(word)) {
      foundSafeWords.push(word);
    }
  });

  // Remove duplicates and count unique safe words
  const uniqueSafeWords = [...new Set(foundSafeWords)];
  
  return {
    foundCount: foundSafeWords.length,
    uniqueCount: uniqueSafeWords.length,
    words: uniqueSafeWords,
    score: foundSafeWords.length * -2 // -2 per safe word (reduces spam score)
  };
}

/**
 * Detect positive greeting in email
 * 
 * @param {string} text - Email text to analyze
 * @returns {Object} Greeting analysis
 */
function detectPositiveGreeting(text = '') {
  const combined = text.toLowerCase().substring(0, 200); // Check first 200 chars
  
  for (let greeting of POSITIVE_GREETINGS) {
    if (combined.includes(greeting)) {
      return {
        hasGreeting: true,
        greeting: greeting,
        score: -1 // Reduce score slightly for professional greeting
      };
    }
  }
  
  return {
    hasGreeting: false,
    greeting: null,
    score: 0
  };
}

/**
 * Early classification: If email has greeting + business words, likely NOT spam
 * 
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {Object} greetingAnalysis - Result from detectPositiveGreeting
 * @param {Object} safeWordsAnalysis - Result from detectSafeBusinessWords
 * @returns {Object|null} Early classification or null if inconclusive
 */
function earlyClassification(subject, body, greetingAnalysis, safeWordsAnalysis) {
  // If we have professional greeting + multiple business words = NOT SPAM
  if (greetingAnalysis.hasGreeting && safeWordsAnalysis.uniqueCount >= 2) {
    return {
      earlyClassification: true,
      classification: 'normal',
      reason: 'professional_greeting_with_business_context',
      confidence: 95
    };
  }
  
  return null;
}

/**
 * Detect suspicious patterns in email content
 * 
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Object} Pattern detection result
 */
function detectSuspiciousPatterns(subject = '', body = '') {
  const combined = (subject + ' ' + body).toLowerCase();
  
  const patterns = {
    urgency: /urgent|act now|immediately|limited time|expires? (today|tonight|tomorrow)|hurry/gi,
    personalInfo: /password|credit card|social security|ssn|bank account|pin|cvv/gi,
    moneyRelated: /click here|confirm|verify|update|reactivate|validate|authenticate/gi,
    excitement: /wow|amazing|incredible|unbelievable|congratulations|won|prize|claim/gi,
    threats: /account (disabled|locked|suspended|compromised)|action required|verify identity/gi,
  };

  const detectedPatterns = {};
  let patternScore = 0;

  Object.entries(patterns).forEach(([name, pattern]) => {
    const matches = combined.match(pattern) || [];
    if (matches.length > 0) {
      detectedPatterns[name] = matches.length;
      patternScore += Math.min(matches.length, 4); // Cap at 4 per pattern
    }
  });

  return {
    detectedPatterns: detectedPatterns,
    hasPatterns: Object.keys(detectedPatterns).length > 0,
    patternCount: Object.keys(detectedPatterns).length,
    score: Math.min(patternScore / 2, 1) // Normalize to 0-1
  };
}

/**
 * Main Spam Detection Engine (IMPROVED)
 * 
 * Implements complete pipeline with scoring rules and business context awareness
 * 
 * @param {Object} emailData - Email object with subject, body, sender, etc.
 * @param {boolean} debug - Enable debug logging
 * @returns {Object} Spam detection result with classification and score
 */
function detectSpamAdvanced(emailData, debug = false) {
  if (!emailData || typeof emailData !== 'object') {
    return {
      classification: 'error',
      spam_score: 0,
      detected_words: [],
      message: 'Invalid email data'
    };
  }

  const {
    subject = '',
    body = '',
    senderEmail = 'unknown@example.com',
    from = 'Unknown Sender'
  } = emailData;

  let spam_score = 0;
  const scoreBreakdown = {};

  if (debug) console.log('\n' + '='.repeat(70));
  if (debug) console.log(`📧 ANALYZING EMAIL: "${subject.substring(0, 40)}..."`);
  if (debug) console.log('='.repeat(70));

  // ============================================================================
  // STEP 1: Detect Safe Business Words (HIGH PRIORITY)
  // ============================================================================
  const safeWordsAnalysis = detectSafeBusinessWords(subject, body);
  spam_score += safeWordsAnalysis.score; // Reduce score by 2 per safe word
  scoreBreakdown.safeBusinessWords = safeWordsAnalysis;
  
  if (debug) {
    console.log(`\n✓ SAFE BUSINESS WORDS FOUND: ${safeWordsAnalysis.foundCount}`);
    if (safeWordsAnalysis.uniqueCount > 0) {
      console.log(`  Words: [${safeWordsAnalysis.words.join(', ')}]`);
      console.log(`  Score impact: ${safeWordsAnalysis.score} (${safeWordsAnalysis.foundCount} × -2)`);
    }
  }

  // ============================================================================
  // STEP 2: Detect Positive Greeting (HIGH PRIORITY)
  // ============================================================================
  const greetingAnalysis = detectPositiveGreeting(subject + ' ' + body);
  spam_score += greetingAnalysis.score;
  scoreBreakdown.greeting = greetingAnalysis;
  
  if (debug && greetingAnalysis.hasGreeting) {
    console.log(`\n✓ PROFESSIONAL GREETING: "${greetingAnalysis.greeting}"`);
    console.log(`  Score impact: ${greetingAnalysis.score}`);
  }

  // ============================================================================
  // STEP 3: EARLY CLASSIFICATION
  // ============================================================================
  const earlyClass = earlyClassification(subject, body, greetingAnalysis, safeWordsAnalysis);
  if (earlyClass) {
    const result = {
      classification: earlyClass.classification,
      spam_score: spam_score,
      detected_words: [],
      confidence: earlyClass.confidence,
      threshold: 8,
      scoreBreakdown: scoreBreakdown,
      sender: from,
      senderEmail: senderEmail,
      subject: subject.substring(0, 50),
      earlyClassification: true,
      earlyClassificationReason: earlyClass.reason,
      tokenCount: 0,
      preprocessedTokens: [],
      bloomFilterUsed: false,
      falsePositiveRate: '0.0000'
    };
    
    if (debug) {
      console.log(`\n✅ EARLY CLASSIFICATION: ${earlyClass.classification.toUpperCase()}`);
      console.log(`  Reason: ${earlyClass.reason}`);
      console.log(`  Current Score: ${spam_score}`);
      console.log('='.repeat(70) + '\n');
    }
    
    return result;
  }

  // ============================================================================
  // STEP 4: Run Preprocessing (for other analysis)
  // ============================================================================
  const preprocessed = processEmailParts(subject, body);

  // ============================================================================
  // STEP 5: Check tokens using Bloom Filter
  // ============================================================================
  const spamAnalysis = detectSpam(subject, body);
  const detected_words = spamAnalysis.detectedSpamWords || [];

  // Scoring Rule: Each spam word found = +1
  const spamWordScore = detected_words.length;
  spam_score += spamWordScore;
  scoreBreakdown.spamWords = {
    count: detected_words.length,
    score: spamWordScore,
    words: detected_words
  };
  
  if (debug && detected_words.length > 0) {
    console.log(`\n⚠ SPAM WORDS FOUND: ${detected_words.length}`);
    console.log(`  Words: [${detected_words.join(', ')}]`);
    console.log(`  Score impact: +${spamWordScore}`);
  }

  // ============================================================================
  // STEP 6: Check sender domain
  // ============================================================================
  const domainAnalysis = analyzeSenderDomain(senderEmail);
  const domainScore = (domainAnalysis.isSuspicious && domainAnalysis.reason !== 'unknown_domain') ? 2 : 0;
  spam_score += domainScore;
  scoreBreakdown.senderDomain = domainAnalysis;
  
  if (debug && domainScore > 0) {
    console.log(`\n⚠ SUSPICIOUS DOMAIN: ${domainAnalysis.domain}`);
    console.log(`  Reason: ${domainAnalysis.reason}`);
    console.log(`  Score impact: +${domainScore}`);
  }

  // ============================================================================
  // STEP 7: Check for links
  // ============================================================================
  const linkAnalysis = detectLinks(body);
  spam_score += linkAnalysis.score;
  scoreBreakdown.links = linkAnalysis;
  
  if (debug && linkAnalysis.hasLinks) {
    console.log(`\n🔗 LINKS FOUND: ${linkAnalysis.linkCount}`);
    console.log(`  Score impact: +${linkAnalysis.score}`);
  }

  // ============================================================================
  // STEP 8: Detect suspicious patterns
  // ============================================================================
  const patternAnalysis = detectSuspiciousPatterns(subject, body);
  const patternScore = Math.round(patternAnalysis.score);
  spam_score += patternScore;
  scoreBreakdown.patterns = patternAnalysis;
  
  if (debug && patternScore > 0) {
    console.log(`\n🚨 SUSPICIOUS PATTERNS DETECTED: ${patternScore}`);
    console.log(`  Types: [${Object.keys(patternAnalysis.detectedPatterns).join(', ')}]`);
  }

  // ============================================================================
  // STEP 9: GRAPH ANALYSIS - Relationship-based spam detection
  // ============================================================================
  const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  spamGraph.addEmail(emailId, senderEmail, preprocessed.tokens);
  const graphAnalysis = spamGraph.calculateGraphScore(preprocessed.tokens, senderEmail);
  const graphScore = graphAnalysis.totalScore;
  spam_score += graphScore;
  scoreBreakdown.graph = graphAnalysis;

  // ============================================================================
  // STEP 10: Calculate classification with NEW THRESHOLDS
  // ============================================================================
  // NEW SCORING RULES:
  // - score <= 3: NOT SPAM (very safe)
  // - score 4-7: BORDERLINE (could be either)
  // - score >= 8: SPAM (likely spam)
  
  const SPAM_THRESHOLD_HIGH = 8;      // High confidence spam threshold
  const SPAM_THRESHOLD_LOW = 3;       // Low confidence not-spam threshold
  
  let classification, confidence;
  
  if (spam_score <= SPAM_THRESHOLD_LOW) {
    classification = 'normal';
    confidence = Math.max(95 - Math.abs(spam_score), 85);
  } else if (spam_score >= SPAM_THRESHOLD_HIGH) {
    classification = 'spam';
    confidence = Math.min((spam_score / 15) * 100, 95);
  } else {
    // Borderline - requires ML decision in production
    classification = 'borderline';
    confidence = 50;
  }

  if (debug) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 SCORING SUMMARY:`);
    console.log(`  Safe Business Words: ${scoreBreakdown.safeBusinessWords.foundCount} × -2 = ${scoreBreakdown.safeBusinessWords.score}`);
    console.log(`  Greeting: ${greetingAnalysis.hasGreeting ? '✓' : '✗'} (${greetingAnalysis.score})`);
    console.log(`  Spam Words: ${scoreBreakdown.spamWords.count} words (${spamWordScore})`);
    console.log(`  Sender Domain: ${domainAnalysis.domain} (${domainScore})`);
    console.log(`  Links: ${linkAnalysis.linkCount} found (${linkAnalysis.score})`);
    console.log(`  Patterns: ${patternScore}`);
    console.log(`  Graph Score: ${graphScore}`);
    console.log(`  ${'─'.repeat(70)}`);
    console.log(`  FINAL SCORE: ${spam_score}`);
    console.log(`  THRESHOLD: <= ${SPAM_THRESHOLD_LOW} (NOT SPAM) | ${SPAM_THRESHOLD_HIGH}+ (SPAM)`);
    console.log(`  🎯 CLASSIFICATION: ${classification.toUpperCase()}`);
    console.log(`  CONFIDENCE: ${confidence}%`);
    console.log('='.repeat(70) + '\n');
  }

  // ============================================================================
  // STEP 11: Build result object
  // ============================================================================
  // CLAMP spam_score to 0-10 range for database compatibility
  const clampedScore = Math.max(0, Math.min(10, spam_score));
  
  return {
    // Main classification result
    classification: classification,
    spam_score: clampedScore,
    detected_words: detected_words,
    
    // Additional details
    confidence: Math.round(confidence),
    thresholdLow: SPAM_THRESHOLD_LOW,
    thresholdHigh: SPAM_THRESHOLD_HIGH,
    
    // Analysis breakdown
    scoreBreakdown: scoreBreakdown,
    
    // Email metadata
    sender: from,
    senderEmail: senderEmail,
    subject: subject.substring(0, 50),
    
    // Detailed metrics
    tokenCount: preprocessed.tokenCount,
    preprocessedTokens: preprocessed.tokens.slice(0, 10),
    
    // Bloom Filter info
    bloomFilterUsed: true,
    falsePositiveRate: (SPAM_FILTER.estimateFalsePositiveRate() * 100).toFixed(4)
  };
}

/**
 * Batch process multiple emails through spam detection engine
 * 
 * @param {Array} emailsArray - Array of email objects
 * @returns {Array} Spam detection results for all emails
 */
function detectSpamBatch(emailsArray) {
  if (!Array.isArray(emailsArray)) {
    return [];
  }

  return emailsArray.map(email => detectSpamAdvanced(email));
}

/**
 * Get spam detection engine statistics
 * 
 * @param {Array} results - Array of detection results
 * @returns {Object} Aggregated statistics
 */
function getSpamEngineStats(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      totalAnalyzed: 0,
      spamDetected: 0,
      normalDetected: 0,
      spamPercentage: 0,
      averageScore: 0,
      topSpamWords: [],
      suspiciousDomains: []
    };
  }

  const spamCount = results.filter(r => r.classification === 'spam').length;
  const normalCount = results.filter(r => r.classification === 'normal').length;
  const averageScore = (results.reduce((sum, r) => sum + r.spam_score, 0) / results.length).toFixed(2);

  // Get most common spam words
  const spamWordsMap = {};
  results.forEach(result => {
    result.detected_words.forEach(word => {
      spamWordsMap[word] = (spamWordsMap[word] || 0) + 1;
    });
  });
  const topSpamWords = Object.entries(spamWordsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Get suspicious domains
  const suspiciousDomainsMap = {};
  results.forEach(result => {
    if (result.scoreBreakdown?.senderDomain?.isSuspicious) {
      const domain = result.scoreBreakdown.senderDomain.domain;
      suspiciousDomainsMap[domain] = (suspiciousDomainsMap[domain] || 0) + 1;
    }
  });
  const suspiciousDomains = Object.entries(suspiciousDomainsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  return {
    totalAnalyzed: results.length,
    spamDetected: spamCount,
    normalDetected: normalCount,
    spamPercentage: ((spamCount / results.length) * 100).toFixed(2),
    averageScore: averageScore,
    topSpamWords: topSpamWords,
    suspiciousDomains: suspiciousDomains
  };
}

// Export functions
module.exports = {
  detectSpamAdvanced,
  detectSpamBatch,
  getSpamEngineStats,
  analyzeSenderDomain,
  detectLinks,
  detectSuspiciousPatterns,
  getGraphData: () => spamGraph.getGraphData(),
  getGraphStats: () => spamGraph.getStats()
};
