/**
 * Visualization Engine for Spam Detection Pipeline
 * 
 * Generates detailed step-by-step analysis data for frontend visualization
 * Shows how emails flow through:
 * - Tokenization
 * - Bloom Filter
 * - Hash Table (Set)
 * - Trie
 * - Scoring
 */

const { processEmailParts, SPAM_FILTER, SPAM_KEYWORDS } = require('./textPreprocessing');
const { detectSpamAdvanced } = require('./spamDetectionEngine');
const natural = require('natural');

const PorterStemmer = natural.PorterStemmer;

/**
 * Create a visualizable Trie structure from spam keywords
 */
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.word = '';
  }
}

function buildSpamTrie(keywords) {
  const root = new TrieNode();
  
  keywords.forEach(keyword => {
    let node = root;
    keyword.forEach((char, index) => {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
      node.word = keyword.substring(0, index + 1);
    });
    node.isEndOfWord = true;
  });
  
  return root;
}

/**
 * Generate visualization data for an email
 * 
 * Returns complete analysis pipeline data
 */
function generateVisualization(sender, subject, body) {
  const result = {
    email: {
      sender,
      subject,
      body,
      fullText: `${subject} ${subject} ${body}`,
    },
    pipeline: [],
    finalResult: null,
    metadata: {
      timestamp: new Date(),
      tokenCount: 0,
      spamWordsFound: 0,
    }
  };

  // =========================================================================
  // STEP 1: EMAIL INPUT
  // =========================================================================
  result.pipeline.push({
    step: 1,
    name: 'Email Input',
    description: 'Original email received',
    data: {
      sender,
      subject,
      bodyPreview: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
    }
  });

  // =========================================================================
  // STEP 2: TOKENIZATION
  // =========================================================================
  const processed = processEmailParts(subject, body);
  const originalTokens = processed.originalTokens;
  const finalTokens = processed.tokens;
  const removedStopwords = processed.removedStopwords;

  result.metadata.tokenCount = finalTokens.length;

  result.pipeline.push({
    step: 2,
    name: 'Tokenization',
    description: 'Break email into words and apply preprocessing',
    data: {
      originalTokens,
      removedStopwords,
      afterStemming: finalTokens,
      totalOriginal: originalTokens.length,
      totalFinal: finalTokens.length,
      removed: removedStopwords.length,
    },
    animation: {
      type: 'sequence',
      duration: 1000,
    }
  });

  // =========================================================================
  // STEP 3: BLOOM FILTER CHECK
  // =========================================================================
  const bloomFilterData = {
    tokens: [],
    filterSize: SPAM_FILTER.size,
    hashFunctions: SPAM_FILTER.numHashFunctions,
    stats: SPAM_FILTER.getStats(),
  };

  finalTokens.forEach(token => {
    const isInFilter = SPAM_FILTER.possiblyContains(token);
    const positions = token.toLowerCase().split('').map((char, idx) => {
      // Generate pseudo-hash positions for visualization
      return (char.charCodeAt(0) * (idx + 1)) % SPAM_FILTER.size;
    });

    bloomFilterData.tokens.push({
      token,
      found: isInFilter,
      positions: positions.slice(0, 4), // Show up to 4 positions
      confidence: isInFilter ? 'high' : 'none',
    });
  });

  result.pipeline.push({
    step: 3,
    name: 'Bloom Filter',
    description: 'Check tokens against Bloom Filter (fast probabilistic lookup)',
    data: bloomFilterData,
    animation: {
      type: 'flow',
      duration: 1500,
    }
  });

  // =========================================================================
  // STEP 4: HASH TABLE (SET) CHECK
  // =========================================================================
  const setData = {
    foundWords: [],
    notFoundWords: [],
    spamKeywords: SPAM_KEYWORDS,
  };

  finalTokens.forEach(token => {
    // Check if token or any stemmed variation is in spam keywords
    const foundKeyword = SPAM_KEYWORDS.find(keyword => {
      return keyword.includes(token) || token.includes(keyword);
    });

    if (foundKeyword) {
      setData.foundWords.push({
        token,
        matchedKeyword: foundKeyword,
        weight: 2,
      });
    } else {
      setData.notFoundWords.push(token);
    }
  });

  result.metadata.spamWordsFound = setData.foundWords.length;

  result.pipeline.push({
    step: 4,
    name: 'Hash Table (Set)',
    description: 'Look up tokens in spam keyword set (O(1) lookup)',
    data: setData,
    animation: {
      type: 'scatter',
      duration: 800,
    }
  });

  // =========================================================================
  // STEP 5: TRIE TRAVERSAL
  // =========================================================================
  const triePaths = [];
  
  finalTokens.forEach(token => {
    let node = '';
    const path = [];
    
    for (let i = 0; i < token.length; i++) {
      node += token[i];
      path.push({
        character: token[i],
        depth: i + 1,
        partial: node,
      });
    }

    const isSpamWord = SPAM_KEYWORDS.some(kw => kw.includes(token) || token.includes(kw));

    triePaths.push({
      token,
      path,
      isSpamWord,
      depth: token.length,
    });
  });

  result.pipeline.push({
    step: 5,
    name: 'Trie Traversal',
    description: 'Traverse Trie structure character by character',
    data: {
      paths: triePaths,
      totalPaths: triePaths.length,
      successfulMatches: triePaths.filter(p => p.isSpamWord).length,
    },
    animation: {
      type: 'tree',
      duration: 1200,
    }
  });

  // =========================================================================
  // STEP 6: SPAM SCORING
  // =========================================================================
  const scoreBreakdown = [];
  let totalScore = 0;

  // Add points for spam words
  setData.foundWords.forEach(item => {
    scoreBreakdown.push({
      reason: `Spam word: "${item.token}"`,
      points: item.weight,
      type: 'spam_word',
      color: '#ff6b6b',
    });
    totalScore += item.weight;
  });

  const urlMatch = body.match(/https?:\/\/[^\s]+|www\.[^\s]+/gi);
  if (urlMatch && urlMatch.length > 0) {
    scoreBreakdown.push({
      reason: `Contains ${urlMatch.length} link(s)`,
      points: urlMatch.length,
      type: 'links',
      color: '#ffa94d',
    });
    totalScore += urlMatch.length;
  }

  const isSpam = totalScore >= 3;

  result.pipeline.push({
    step: 6,
    name: 'Scoring',
    description: 'Calculate spam score from weighted factors',
    data: {
      breakdown: scoreBreakdown,
      totalScore,
      threshold: 3,
      isAboveThreshold: isSpam,
    },
    animation: {
      type: 'accumulate',
      duration: 1000,
    }
  });

  // =========================================================================
  // STEP 7: FINAL CLASSIFICATION DECISION
  // =========================================================================
  result.pipeline.push({
    step: 7,
    name: 'Final Decision',
    description: 'Classify email based on total score',
    data: {
      classification: isSpam ? 'SPAM' : 'HAM',
      isSpam,
      score: totalScore,
      threshold: 3,
      confidence: Math.min(100, Math.abs(totalScore - 3) * 20),
    },
    animation: {
      type: 'reveal',
      duration: 800,
    }
  });

  result.finalResult = {
    classification: isSpam ? 'SPAM' : 'HAM',
    isSpam,
    score: totalScore,
    threshold: 3,
    confidence: Math.min(100, Math.abs(totalScore - 3) * 20),
    message: isSpam 
      ? `🚫 This email is likely SPAM (Score: ${totalScore}/${10})` 
      : `✅ This email appears to be LEGITIMATE (Score: ${totalScore}/${10})`,
  };

  return result;
}

module.exports = {
  generateVisualization,
  TrieNode,
  buildSpamTrie,
};
