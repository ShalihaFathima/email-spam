/**
 * SpamGraph - Relationship-based Spam Detection
 * 
 * Uses a graph structure to detect spam patterns through relationships:
 * - Senders → Emails → Words
 * - Word frequency analysis
 * - Connected email detection
 * 
 * Implementation: Adjacency List using Map<string, Set<string>>
 */

class SpamGraph {
  /**
   * Initialize the spam detection graph
   * 
   * @param {number} frequencyThreshold - Word frequency threshold for suspicion (default: 3)
   */
  constructor(frequencyThreshold = 3) {
    // Adjacency list: Map<nodeId, Set<connectedNodeIds>>
    this.adjList = new Map();
    
    // Track different node types for efficient querying
    this.nodeTypes = {
      sender: new Set(),      // Sender email addresses
      email: new Set(),       // Email IDs
      word: new Set()         // Spam words/tokens
    };
    
    // Statistics tracking
    this.stats = {
      totalNodes: 0,
      totalEdges: 0,
      emailCount: 0,
      senderCount: 0,
      wordCount: 0,
      suspiciousWords: []
    };
    
    // Configuration
    this.frequencyThreshold = frequencyThreshold;
    
    // Word frequency map for quick lookups
    this.wordFrequency = new Map();
  }

  /**
   * Add a new email to the graph
   * Creates edges: sender → email, email → words, word → email
   * 
   * @param {string} emailId - Unique email identifier
   * @param {string} sender - Sender email address
   * @param {Array<string>} tokens - Array of processed tokens/words
   * @returns {Object} Result with success flag and edges added
   */
  addEmail(emailId, sender, tokens) {
    try {
      // Validation
      if (!emailId || typeof emailId !== 'string') {
        throw new Error('Invalid emailId: must be a non-empty string');
      }
      if (!sender || typeof sender !== 'string') {
        throw new Error('Invalid sender: must be a non-empty string');
      }
      if (!Array.isArray(tokens) || tokens.length === 0) {
        throw new Error('Invalid tokens: must be a non-empty array');
      }

      const edgesAdded = {
        senderToEmail: 0,
        emailToWord: 0,
        wordToEmail: 0
      };

      // Normalize sender
      const normalizedSender = sender.toLowerCase();

      // ========== EDGE 1: Sender → Email ==========
      this._addEdge(`sender_${normalizedSender}`, `email_${emailId}`);
      edgesAdded.senderToEmail = 1;

      // Track node types
      if (!this.nodeTypes.sender.has(normalizedSender)) {
        this.nodeTypes.sender.add(normalizedSender);
        this.stats.senderCount++;
      }
      if (!this.nodeTypes.email.has(emailId)) {
        this.nodeTypes.email.add(emailId);
        this.stats.emailCount++;
      }

      // ========== EDGE 2 & 3: Email ↔ Words ==========
      const uniqueTokens = [...new Set(tokens)]; // Remove duplicates

      for (const token of uniqueTokens) {
        const normalizedToken = token.toLowerCase();

        // Email → Word
        this._addEdge(`email_${emailId}`, `word_${normalizedToken}`);
        edgesAdded.emailToWord++;

        // Word → Email (for pattern detection)
        this._addEdge(`word_${normalizedToken}`, `email_${emailId}`);
        edgesAdded.wordToEmail++;

        // Track word frequency
        if (!this.wordFrequency.has(normalizedToken)) {
          this.wordFrequency.set(normalizedToken, 0);
        }
        this.wordFrequency.set(normalizedToken, this.wordFrequency.get(normalizedToken) + 1);

        // Track node type
        if (!this.nodeTypes.word.has(normalizedToken)) {
          this.nodeTypes.word.add(normalizedToken);
          this.stats.wordCount++;
        }
      }

      // Update stats
      this.stats.totalNodes = this.adjList.size;
      this.stats.totalEdges = Array.from(this.adjList.values()).reduce(
        (sum, set) => sum + set.size, 
        0
      );

      return {
        success: true,
        emailId,
        sender: normalizedSender,
        tokenCount: uniqueTokens.length,
        edgesAdded
      };
    } catch (error) {
      console.error('Error adding email to graph:', error.message);
      return {
        success: false,
        error: error.message,
        emailId,
        sender
      };
    }
  }

  /**
   * Private: Add an edge between two nodes
   * Creates bidirectional connection if not exists
   * 
   * @param {string} from - Source node
   * @param {string} to - Destination node
   */
  _addEdge(from, to) {
    // Prevent self-loops
    if (from === to) return;

    // Initialize adjacency list for 'from' if not exists
    if (!this.adjList.has(from)) {
      this.adjList.set(from, new Set());
    }

    // Add edge (avoid duplicates with Set)
    this.adjList.get(from).add(to);

    // Initialize adjacency list for 'to' if not exists (isolated node)
    if (!this.adjList.has(to)) {
      this.adjList.set(to, new Set());
    }
  }

  /**
   * Get frequency of a word across all emails
   * 
   * @param {string} word - Word to check
   * @returns {number} Number of emails containing this word
   */
  getWordFrequency(word) {
    if (!word || typeof word !== 'string') {
      return 0;
    }
    const normalizedWord = word.toLowerCase();
    return this.wordFrequency.get(normalizedWord) || 0;
  }

  /**
   * Check if a word is suspicious based on frequency threshold
   * 
   * @param {string} word - Word to check
   * @param {number} threshold - Frequency threshold (uses class threshold if not provided)
   * @returns {boolean} True if word appears in more emails than threshold
   */
  isSuspiciousWord(word, threshold = null) {
    if (!word || typeof word !== 'string') {
      return false;
    }

    const useThreshold = threshold ?? this.frequencyThreshold;
    const frequency = this.getWordFrequency(word);
    
    return frequency > useThreshold;
  }

  /**
   * Get all emails connected to (containing) a specific word
   * 
   * @param {string} word - Word to find
   * @returns {Array<string>} Array of email IDs containing this word
   */
  getConnectedEmails(word) {
    try {
      if (!word || typeof word !== 'string') {
        return [];
      }

      const normalizedWord = word.toLowerCase();
      const wordNodeId = `word_${normalizedWord}`;

      // Check if word node exists
      if (!this.adjList.has(wordNodeId)) {
        return [];
      }

      // Get all connected email nodes
      const connectedSet = this.adjList.get(wordNodeId);
      const emailIds = [];

      for (const nodeId of connectedSet) {
        if (nodeId.startsWith('email_')) {
          emailIds.push(nodeId.replace('email_', ''));
        }
      }

      return emailIds;
    } catch (error) {
      console.error('Error getting connected emails:', error.message);
      return [];
    }
  }

  /**
   * Get all emails from a specific sender
   * 
   * @param {string} sender - Sender email address
   * @returns {Array<string>} Array of email IDs from this sender
   */
  getEmailsFromSender(sender) {
    try {
      if (!sender || typeof sender !== 'string') {
        return [];
      }

      const normalizedSender = sender.toLowerCase();
      const senderNodeId = `sender_${normalizedSender}`;

      if (!this.adjList.has(senderNodeId)) {
        return [];
      }

      const connectedSet = this.adjList.get(senderNodeId);
      const emailIds = [];

      for (const nodeId of connectedSet) {
        if (nodeId.startsWith('email_')) {
          emailIds.push(nodeId.replace('email_', ''));
        }
      }

      return emailIds;
    } catch (error) {
      console.error('Error getting emails from sender:', error.message);
      return [];
    }
  }

  /**
   * Get all words in a specific email
   * 
   * @param {string} emailId - Email ID
   * @returns {Array<string>} Array of words in this email
   */
  getWordsInEmail(emailId) {
    try {
      if (!emailId || typeof emailId !== 'string') {
        return [];
      }

      const emailNodeId = `email_${emailId}`;

      if (!this.adjList.has(emailNodeId)) {
        return [];
      }

      const connectedSet = this.adjList.get(emailNodeId);
      const words = [];

      for (const nodeId of connectedSet) {
        if (nodeId.startsWith('word_')) {
          words.push(nodeId.replace('word_', ''));
        }
      }

      return words;
    } catch (error) {
      console.error('Error getting words in email:', error.message);
      return [];
    }
  }

  /**
   * Calculate spam score based on graph relationships
   * 
   * Scoring rules:
   * - Each word appearing in > threshold emails: +2
   * - Each unique suspicious word: +1
   * - Sender with many emails: +1
   * 
   * @param {Array<string>} tokens - Tokens from current email
   * @param {string} sender - Current email sender
   * @returns {Object} Scoring breakdown
   */
  calculateGraphScore(tokens, sender) {
    try {
      let graphScore = 0;
      const scoreBreakdown = {
        suspiciousWordCount: 0,
        frequentWordCount: 0,
        senderEmailCount: 0,
        totalScore: 0,
        details: []
      };

      if (!Array.isArray(tokens) || tokens.length === 0) {
        scoreBreakdown.totalScore = 0;
        return scoreBreakdown;
      }

      // Check each token
      const uniqueTokens = [...new Set(tokens)];
      
      for (const token of uniqueTokens) {
        const frequency = this.getWordFrequency(token);

        // Rule 1: Word appearing in many emails = +2
        if (frequency > this.frequencyThreshold) {
          graphScore += 2;
          scoreBreakdown.frequentWordCount++;
          scoreBreakdown.details.push({
            token,
            frequency,
            reason: 'high_frequency',
            score: 2
          });
        }
        // Rule 2: Word appearing in 2-3 emails = +1
        else if (frequency > 1) {
          graphScore += 1;
          scoreBreakdown.suspiciousWordCount++;
          scoreBreakdown.details.push({
            token,
            frequency,
            reason: 'moderate_frequency',
            score: 1
          });
        }
      }

      // Rule 3: Sender with many emails = +1
      if (sender) {
        const senderEmails = this.getEmailsFromSender(sender);
        if (senderEmails.length > 3) {
          graphScore += 1;
          scoreBreakdown.senderEmailCount = senderEmails.length;
          scoreBreakdown.details.push({
            sender,
            emailCount: senderEmails.length,
            reason: 'prolific_sender',
            score: 1
          });
        }
      }

      scoreBreakdown.totalScore = graphScore;
      return scoreBreakdown;
    } catch (error) {
      console.error('Error calculating graph score:', error.message);
      return {
        suspiciousWordCount: 0,
        frequentWordCount: 0,
        senderEmailCount: 0,
        totalScore: 0,
        details: [],
        error: error.message
      };
    }
  }

  /**
   * Get graph statistics
   * 
   * @returns {Object} Current graph statistics
   */
  getStats() {
    return {
      totalNodes: this.adjList.size,
      totalEdges: Array.from(this.adjList.values()).reduce(
        (sum, set) => sum + set.size, 
        0
      ),
      emailCount: this.nodeTypes.email.size,
      senderCount: this.nodeTypes.sender.size,
      wordCount: this.nodeTypes.word.size,
      wordFrequencyMap: Object.fromEntries(Array.from(this.wordFrequency.entries())),
      suspiciousWords: Array.from(this.wordFrequency.entries())
        .filter(([word, freq]) => freq > this.frequencyThreshold)
        .map(([word, freq]) => ({ word, frequency: freq }))
        .sort((a, b) => b.frequency - a.frequency)
    };
  }

  /**
   * Get graph data for visualization
   * 
   * @returns {Object} Graph structure with nodes and edges
   */
  getGraphData() {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Create nodes
    let nodeId = 0;

    // Add sender nodes
    for (const sender of this.nodeTypes.sender) {
      nodes.push({
        id: nodeId,
        label: sender,
        type: 'sender',
        originalId: `sender_${sender}`,
        size: 15
      });
      nodeMap.set(`sender_${sender}`, nodeId);
      nodeId++;
    }

    // Add email nodes
    for (const email of this.nodeTypes.email) {
      nodes.push({
        id: nodeId,
        label: email,
        type: 'email',
        originalId: `email_${email}`,
        size: 12
      });
      nodeMap.set(`email_${email}`, nodeId);
      nodeId++;
    }

    // Add word nodes
    for (const word of this.nodeTypes.word) {
      const frequency = this.wordFrequency.get(word) || 0;
      const isSuspicious = frequency > this.frequencyThreshold;
      
      nodes.push({
        id: nodeId,
        label: word,
        type: 'word',
        originalId: `word_${word}`,
        frequency: frequency,
        isSuspicious: isSuspicious,
        size: Math.min(8 + frequency * 2, 20)
      });
      nodeMap.set(`word_${word}`, nodeId);
      nodeId++;
    }

    // Create edges
    for (const [from, connectedSet] of this.adjList) {
      const fromNodeId = nodeMap.get(from);

      for (const to of connectedSet) {
        const toNodeId = nodeMap.get(to);

        if (fromNodeId !== undefined && toNodeId !== undefined) {
          edges.push({
            source: fromNodeId,
            target: toNodeId,
            weight: 1
          });
        }
      }
    }

    return {
      nodes,
      edges,
      stats: this.getStats()
    };
  }

  /**
   * Clear all graph data
   */
  clear() {
    this.adjList.clear();
    this.nodeTypes = {
      sender: new Set(),
      email: new Set(),
      word: new Set()
    };
    this.wordFrequency.clear();
    this.stats = {
      totalNodes: 0,
      totalEdges: 0,
      emailCount: 0,
      senderCount: 0,
      wordCount: 0,
      suspiciousWords: []
    };
  }

  /**
   * Export graph as JSON
   * 
   * @returns {Object} Serializable graph representation
   */
  toJSON() {
    return {
      adjList: Object.fromEntries(
        Array.from(this.adjList.entries()).map(([key, set]) => [key, Array.from(set)])
      ),
      nodeTypes: {
        sender: Array.from(this.nodeTypes.sender),
        email: Array.from(this.nodeTypes.email),
        word: Array.from(this.nodeTypes.word)
      },
      wordFrequency: Object.fromEntries(this.wordFrequency),
      frequencyThreshold: this.frequencyThreshold,
      stats: this.getStats()
    };
  }
}

module.exports = SpamGraph;
