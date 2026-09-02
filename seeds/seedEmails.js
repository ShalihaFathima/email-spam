const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Email = require('../models/Email');
const { processEmailParts, detectSpam, getBatchStats } = require('../textPreprocessing');
const { detectSpamAdvanced } = require('../spamDetectionEngine');

/**
 * Helper function to generate email address from sender name
 */
function generateEmailFromSender(sender) {
  const name = sender
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');

  const domains = ['example.com', 'gmail.com', 'company.com', 'mail.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  return `${name || 'sender'}@${randomDomain}`;
}

/**
 * Helper function to truncate text
 */
function truncateText(text, length) {
  return text.substring(0, length) + (text.length > length ? '...' : '');
}

/**
 * Load emails from CSV file and add to database
 * Only seeds if collection is empty (to avoid duplication)
 * 
 * @returns {Promise<number>} Number of emails seeded
 */
async function seedEmails() {
  try {
    // Check if collection already has emails
    const existingCount = await Email.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️  Database already has ${existingCount} emails. Skipping seeding.`);
      return existingCount;
    }

    console.log('\n🌱 Starting email dataset seeding...');

    const csvPath = path.join(__dirname, '../emails.csv');

    if (!fs.existsSync(csvPath)) {
      console.warn(`⚠️  Warning: ${csvPath} not found. Skipping seeding.`);
      return 0;
    }

    const emailsToSeed = [];
    let processedCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Preprocess email text
            const preprocessed = processEmailParts(row.subject || '', row.body || '');
            const spamDetection = detectSpam(row.subject || '', row.body || '');
            
            // Run advanced spam detection engine
            const senderEmail = generateEmailFromSender(row.sender || 'unknown@example.com');
            const spamEngineResult = detectSpamAdvanced({
              subject: row.subject || '',
              body: row.body || '',
              senderEmail: senderEmail,
              from: row.sender || 'Unknown Sender'
            });

            const emailData = {
              sender: row.sender || row.from || 'Unknown Sender',
              senderEmail: senderEmail,
              subject: row.subject || '(no subject)',
              preview: truncateText(row.body || '', 80),
              content: row.body || '',
              timestamp: new Date(),
              isStarred: false,
              hasAttachment: false,
              attachments: [],
              recipient: 'you@example.com',
              label: (row.label || 'ham').toLowerCase(),
              folder: (row.label || 'ham').toLowerCase() === 'spam' ? 'spam' : 'inbox',
              isDefault: true, // Mark as dataset email
              // NLP Preprocessing
              processedTokens: preprocessed.tokens,
              tokenCount: preprocessed.tokenCount,
              spamScore: spamDetection.spamScore,
              isSpamDetected: spamDetection.isSpam,
              confidence: spamDetection.confidence,
              detectedSpamWords: spamDetection.detectedSpamWords,
              detectedSpamCount: spamDetection.detectedSpamCount,
              spamTokenRatio: spamDetection.spamTokenRatio,
              bloomFilterUsed: spamDetection.bloomFilterUsed,
              // Spam Detection Engine
              engineClassification: spamEngineResult.classification,
              engineSpamScore: spamEngineResult.spam_score,
              engineDetectedWords: spamEngineResult.detected_words,
              engineConfidence: spamEngineResult.confidence,
              scoreBreakdown: spamEngineResult.scoreBreakdown,
            };

            emailsToSeed.push(emailData);
            processedCount++;
          } catch (error) {
            console.error(`Error processing row:`, error);
          }
        })
        .on('end', async () => {
          try {
            if (emailsToSeed.length === 0) {
              console.warn('⚠️  No emails found in CSV file');
              resolve(0);
              return;
            }

            // Insert all emails at once
            const insertedEmails = await Email.insertMany(emailsToSeed);

            console.log(`✅ Successfully seeded ${insertedEmails.length} dataset emails`);
            console.log(`   From: ${csvPath}`);
            
            // Display statistics
            const inboxCount = insertedEmails.filter(e => e.label === 'ham').length;
            const spamCount = insertedEmails.filter(e => e.label === 'spam').length;
            
            console.log(`\n📊 Dataset Statistics:`);
            console.log(`   Total emails: ${insertedEmails.length}`);
            console.log(`   Inbox (ham): ${inboxCount}`);
            console.log(`   Spam: ${spamCount}`);
            
            const avgSpamScore = (insertedEmails.reduce((sum, e) => sum + e.engineSpamScore, 0) / insertedEmails.length).toFixed(2);
            const avgConfidence = (insertedEmails.reduce((sum, e) => sum + e.engineConfidence, 0) / insertedEmails.length).toFixed(1);
            
            console.log(`\n🚀 Spam Engine Statistics:`);
            console.log(`   Average spam score: ${avgSpamScore}/10`);
            console.log(`   Average confidence: ${avgConfidence}%`);
            console.log(`   Database ready for use ✨\n`);

            resolve(insertedEmails.length);
          } catch (insertError) {
            console.error('Error inserting emails into database:', insertError);
            reject(insertError);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });

  } catch (error) {
    console.error('Error in seedEmails:', error);
    throw error;
  }
}

module.exports = {
  seedEmails
};
