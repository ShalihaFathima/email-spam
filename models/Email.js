const mongoose = require('mongoose');

/**
 * Email Schema for MongoDB
 * Stores all email data including spam detection results
 */

const emailSchema = new mongoose.Schema({
  // Basic email info
  sender: {
    type: String,
    required: true,
    trim: true,
  },
  senderEmail: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  preview: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    default: 'you@example.com',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  
  // Categorization
  label: {
    type: String,
    enum: ['ham', 'spam'],
    required: true,
  },
  folder: {
    type: String,
    enum: ['inbox', 'spam', 'sent', 'drafts'],
    default: 'inbox',
  },
  
  // UI state
  isStarred: {
    type: Boolean,
    default: false,
  },
  hasAttachment: {
    type: Boolean,
    default: false,
  },
  attachments: {
    type: Array,
    default: [],
  },
  
  // Dataset tracking
  isDefault: {
    type: Boolean,
    default: false,
    description: 'True if email is from the original dataset',
  },
  
  // NLP Preprocessing data
  processedTokens: {
    type: Array,
    default: [],
  },
  tokenCount: {
    type: Number,
    default: 0,
  },
  spamScore: {
    type: Number,
    default: 0,
  },
  isSpamDetected: {
    type: Boolean,
    default: false,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  detectedSpamWords: {
    type: Array,
    default: [],
  },
  detectedSpamCount: {
    type: Number,
    default: 0,
  },
  spamTokenRatio: {
    type: Number,
    default: 0,
  },
  bloomFilterUsed: {
    type: Boolean,
    default: false,
  },
  
  // Spam Detection Engine data
  engineClassification: {
    type: String,
    enum: ['spam', 'normal'],
    required: true,
  },
  engineSpamScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  engineDetectedWords: {
    type: Array,
    default: [],
  },
  engineConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  scoreBreakdown: {
    spamWords: {
      count: Number,
      score: Number,
    },
    senderDomain: {
      domain: String,
      reason: String,
      score: Number,
    },
    links: {
      linkCount: Number,
      score: Number,
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

// Convert _id to id in API responses
emailSchema.virtual('id').get(function() {
  return this._id.toString();
});

/**
 * Indexes for performance
 */
emailSchema.index({ label: 1 });
emailSchema.index({ folder: 1 });
emailSchema.index({ isDefault: 1 });
emailSchema.index({ engineClassification: 1 });
emailSchema.index({ timestamp: -1 });
emailSchema.index({ subject: 'text', content: 'text', sender: 'text' });

/**
 * Instance method to convert to API response format
 */
emailSchema.methods.toAPIResponse = function() {
  return {
    id: this._id,
    sender: this.sender,
    senderEmail: this.senderEmail,
    subject: this.subject,
    preview: this.preview,
    content: this.content,
    timestamp: this.timestamp,
    isStarred: this.isStarred,
    hasAttachment: this.hasAttachment,
    attachments: this.attachments,
    recipient: this.recipient,
    label: this.label,
    folder: this.folder,
    isDefault: this.isDefault,
    processedTokens: this.processedTokens,
    tokenCount: this.tokenCount,
    spamScore: this.spamScore,
    isSpamDetected: this.isSpamDetected,
    confidence: this.confidence,
    detectedSpamWords: this.detectedSpamWords,
    detectedSpamCount: this.detectedSpamCount,
    spamTokenRatio: this.spamTokenRatio,
    bloomFilterUsed: this.bloomFilterUsed,
    engineClassification: this.engineClassification,
    engineSpamScore: this.engineSpamScore,
    engineDetectedWords: this.engineDetectedWords,
    engineConfidence: this.engineConfidence,
    scoreBreakdown: this.scoreBreakdown,
  };
};

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
