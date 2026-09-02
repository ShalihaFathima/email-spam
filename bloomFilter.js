/**
 * Bloom Filter Implementation for Spam Word Detection
 * 
 * A probabilistic data structure that efficiently checks membership in a set
 * - Fast insertion and lookup: O(k) where k = number of hash functions
 * - Space efficient: uses bit array instead of storing words
 * - Trade-off: allows false positives but no false negatives
 * 
 * For spam detection: if word is NOT in bloom filter -> definitely not spam word
 *                      if word IS in bloom filter -> probably spam word (may be false positive)
 */

class BloomFilter {
  /**
   * Initialize Bloom Filter
   * @param {number} size - Size of bit array (must be power of 2 for optimal performance)
   * @param {number} hashFunctions - Number of hash functions to use (default: 3)
   */
  constructor(size = 1024, hashFunctions = 4) {
    this.size = size;
    this.numHashFunctions = hashFunctions;
    
    // Initialize bit array as Uint8Array (each byte = 8 bits)
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
    this.insertCount = 0;
  }

  /**
   * Hash Function 1: Simple character code summation with modulo
   * Fast, simple distribution
   */
  _hash1(word) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash += word.charCodeAt(i);
    }
    return hash % this.size;
  }

  /**
   * Hash Function 2: Prime multiplier hash (similar to Java's String.hashCode())
   * Better distribution for similar strings
   */
  _hash2(word) {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * prime + word.charCodeAt(i)) % this.size;
    }
    return Math.abs(hash) % this.size;
  }

  /**
   * Hash Function 3: DJB2 algorithm variant (Bernstein's hash)
   * Excellent distribution, resistant to collision
   */
  _hash3(word) {
    let hash = 5381;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) + hash) ^ word.charCodeAt(i); // hash * 33 ^ char
    }
    return Math.abs(hash) % this.size;
  }

  /**
   * Hash Function 4: Multiplicative hashing with golden ratio
   * Uses properties of golden ratio for good distribution
   */
  _hash4(word) {
    let hash = 0;
    const A = 0x9e3779b9; // Golden ratio constant
    
    for (let i = 0; i < word.length; i++) {
      hash = (hash + word.charCodeAt(i)) * A;
      hash = hash >>> 0; // Keep as 32-bit unsigned integer
    }
    return hash % this.size;
  }

  /**
   * Get all hash positions for a word
   * @param {string} word - Word to hash
   * @returns {Array<number>} Array of bit positions
   */
  _getHashPositions(word) {
    const positions = [];
    const lowerWord = word.toLowerCase();
    
    positions.push(this._hash1(lowerWord));
    positions.push(this._hash2(lowerWord));
    positions.push(this._hash3(lowerWord));
    positions.push(this._hash4(lowerWord));
    
    // Return only the requested number of hash functions
    return positions.slice(0, this.numHashFunctions);
  }

  /**
   * Set a bit at given position
   * @param {number} position - Bit position
   */
  _setBit(position) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    this.bitArray[byteIndex] |= (1 << bitIndex);
  }

  /**
   * Get a bit at given position
   * @param {number} position - Bit position
   * @returns {boolean} True if bit is set
   */
  _getBit(position) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    return (this.bitArray[byteIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * Insert a word into the filter
   * @param {string} word - Word to insert
   */
  insert(word) {
    if (!word || typeof word !== 'string') return;
    
    const positions = this._getHashPositions(word);
    positions.forEach(pos => this._setBit(pos));
    this.insertCount++;
  }

  /**
   * Insert multiple words
   * @param {Array<string>} words - Array of words to insert
   */
  insertBatch(words) {
    if (!Array.isArray(words)) return;
    words.forEach(word => this.insert(word));
  }

  /**
   * Check if a word possibly exists in the filter
   * Returns false if word is DEFINITELY not in the filter
   * Returns true if word POSSIBLY is in the filter (may be false positive)
   * 
   * @param {string} word - Word to check
   * @returns {boolean} True if word possibly exists, false if definitely not
   */
  possiblyContains(word) {
    if (!word || typeof word !== 'string') return false;
    
    const positions = this._getHashPositions(word);
    return positions.every(pos => this._getBit(pos));
  }

  /**
   * Get filter statistics
   * @returns {Object} Statistics including size, fill rate, load factor
   */
  getStats() {
    let setBitsCount = 0;
    
    // Count set bits
    for (let i = 0; i < this.bitArray.length; i++) {
      let byte = this.bitArray[i];
      while (byte) {
        setBitsCount += byte & 1;
        byte >>= 1;
      }
    }

    const fillRate = (setBitsCount / this.size * 100).toFixed(2);
    const loadFactor = (this.insertCount / this.size).toFixed(2);
    
    return {
      filterSize: this.size,
      bitArraySize: this.bitArray.length,
      hashFunctions: this.numHashFunctions,
      insertedWords: this.insertCount,
      setBits: setBitsCount,
      fillRate: `${fillRate}%`,
      loadFactor: loadFactor,
      memoryUsage: `${this.bitArray.length} bytes`
    };
  }

  /**
   * Clear the filter (reset all bits)
   */
  clear() {
    this.bitArray.fill(0);
    this.insertCount = 0;
  }

  /**
   * Estimate false positive probability
   * Formula: (1 - e^(-k*n/m))^k
   * where k = hash functions, n = inserted words, m = filter size
   * 
   * @returns {number} Estimated false positive rate (0.0 to 1.0)
   */
  estimateFalsePositiveRate() {
    const k = this.numHashFunctions;
    const n = this.insertCount;
    const m = this.size;
    
    const exponent = (-k * n) / m;
    const innerValue = Math.pow(Math.E, exponent);
    const fpRate = Math.pow(1 - innerValue, k);
    
    return fpRate;
  }
}

// Export Bloom Filter class
module.exports = BloomFilter;
