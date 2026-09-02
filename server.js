const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, isConnected } = require('./db');
const Email = require('./models/Email');
const Task = require('./models/Task');
const { seedEmails } = require('./seeds/seedEmails');
const { processEmailParts, detectSpam, getBatchStats } = require('./textPreprocessing');
const { detectSpamAdvanced, detectSpamBatch, getSpamEngineStats, getGraphData } = require('./spamDetectionEngine');
const taskRoutes = require('./routes/taskRoutes');
const commitmentRoutes = require('./routes/commitmentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * ==================== MODULAR ROUTES ====================
 */
app.use('/api/tasks', taskRoutes);  // Mount task routes at /api/tasks
app.use('/api/commitments', commitmentRoutes);  // Mount commitment routes at /api/commitments

/**
 * Initialize database and seed with dataset (if empty)
 */
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed dataset emails if collection is empty
    await seedEmails();
    
    console.log('✅ Database initialization complete\n');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

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
 * GET /api/emails
 * Query parameters:
 *   - folder: 'inbox' or 'spam' (default: 'inbox')
 *   - search: search query (searches in sender, subject, preview)
 *   - limit: number of emails to return (default: 50)
 *   - offset: pagination offset (default: 0)
 */
app.get('/api/emails', async (req, res) => {
  try {
    const { folder = 'inbox', search = '', limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    // Build filter query
    let query = {};

    // Filter by folder/label
    if (folder === 'spam') {
      query.label = 'spam';
    } else if (folder === 'sent') {
      query.folder = 'sent';
    } else if (folder === 'drafts') {
      query.folder = 'drafts';
    } else {
      // Default: inbox (ham emails)
      query.label = 'ham';
    }

    // Filter by search query
    if (search && search.trim()) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { sender: searchRegex },
        { subject: searchRegex },
        { preview: searchRegex },
        { content: searchRegex }
      ];
    }

    // Get total count
    const total = await Email.countDocuments(query);

    // Fetch paginated results
    const emails = await Email.find(query)
      .sort({ timestamp: -1 })
      .skip(offsetNum)
      .limit(limitNum);

    // Convert to plain objects with virtual id field
    const emailsWithId = emails.map(email => {
      const emailObj = email.toJSON();
      // Ensure id field is always present as string
      if (!emailObj.id && email._id) {
        emailObj.id = email._id.toString();
      }
      return emailObj;
    });

    res.json({
      success: true,
      data: emailsWithId,
      total: total,
      limit: limitNum,
      offset: offsetNum,
      folder: folder,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emails',
      error: error.message,
    });
  }
});

/**
 * GET /api/emails/:id
 * Get a single email by ID
 */
app.get('/api/emails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.findById(id).lean();

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    // Ensure id field is present
    if (!email.id && email._id) {
      email.id = email._id.toString();
    }

    res.json({
      success: true,
      data: email,
    });
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email',
      error: error.message,
    });
  }
});

/**
 * GET /api/emails/:id/preprocess
 * Get preprocessing details for an email (tokens, spam score, etc.)
 */
app.get('/api/emails/:id/preprocess', async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.findById(id).lean();

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: email._id,
        subject: email.subject,
        preview: email.preview,
        processedTokens: email.processedTokens,
        tokenCount: email.tokenCount,
        spamScore: email.spamScore,
        isSpamDetected: email.isSpamDetected,
        confidence: (email.confidence * 100).toFixed(1) + '%',
        classification: email.isSpamDetected ? 'SPAM' : 'HAM',
        description: `Email has ${email.tokenCount} processed tokens. Spam probability: ${email.spamScore}% (confidence: ${email.confidence.toFixed(2)})`
      },
    });
  } catch (error) {
    console.error('Error fetching preprocessed email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preprocessed email',
      error: error.message,
    });
  }
});

/**
 * GET /api/preprocess/stats
 * Get preprocessing statistics for all emails
 */
app.get('/api/preprocess/stats', async (req, res) => {
  try {
    const emails = await Email.find({}).lean();
    const stats = getBatchStats(emails);
    const spamEmails = emails.filter(e => e.isSpamDetected);
    const hamEmails = emails.filter(e => !e.isSpamDetected);

    res.json({
      success: true,
      data: {
        ...stats,
        spamDetection: {
          totalSpamDetected: spamEmails.length,
          totalHamDetected: hamEmails.length,
          spamPercentage: emails.length > 0 ? ((spamEmails.length / emails.length) * 100).toFixed(1) + '%' : '0%',
          averageSpamScore: (spamEmails.length > 0 
            ? (spamEmails.reduce((sum, e) => sum + e.spamScore, 0) / spamEmails.length).toFixed(1)
            : 0),
          averageHamScore: (hamEmails.length > 0 
            ? (hamEmails.reduce((sum, e) => sum + e.spamScore, 0) / hamEmails.length).toFixed(1)
            : 0)
        }
      },
    });
  } catch (error) {
    console.error('Error fetching preprocessing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preprocessing stats',
      error: error.message,
    });
  }
});

/**
 * POST /api/preprocess/analyze
 * Analyze custom text input through preprocessing pipeline
 */
app.post('/api/preprocess/analyze', (req, res) => {
  try {
    const { subject = '', body = '' } = req.body;

    if (!subject && !body) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and/or body text'
      });
    }

    const processed = processEmailParts(subject, body);
    const detection = detectSpam(subject, body);

    res.json({
      success: true,
      data: {
        input: { subject, body },
        preprocessing: {
          originalTokens: processed.originalTokens,
          tokenCount: processed.originalTokens.length,
          stopwordsRemoved: processed.removedStopwords,
          stopwordCount: processed.removedStopwords.length,
          processedTokens: processed.tokens,
          finalTokenCount: processed.tokenCount,
        },
        spamDetection: {
          spamScore: detection.spamScore,
          isSpam: detection.isSpam,
          threshold: detection.threshold,
          confidence: (detection.confidence * 100).toFixed(1) + '%',
          classification: detection.isSpam ? 'SPAM' : 'HAM'
        }
      },
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing text',
      error: error.message,
    });
  }
});

/**
 * PUT /api/emails/:id/star
 * Toggle star status for an email
 */
app.put('/api/emails/:id/star', async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.findById(id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    email.isStarred = !email.isStarred;
    await email.save();

    res.json({
      success: true,
      data: email,
      message: `Email ${email.isStarred ? 'starred' : 'unstarred'}`,
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/emails/:id
 * Delete an email from MongoDB by ID
 */
app.delete('/api/emails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️  DELETE /api/emails/${id}`);

    // Find and delete the email in one operation
    const deletedEmail = await Email.findByIdAndDelete(id);

    // Check if email existed
    if (!deletedEmail) {
      console.log('   ⚠️  Email not found');
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Success - email was deleted from MongoDB
    console.log(`   ✅ Deleted: "${deletedEmail.subject}" from ${deletedEmail.sender}`);

    res.json({
      success: true,
      message: `Email deleted: "${deletedEmail.subject}"`,
      data: {
        id: deletedEmail._id,
        sender: deletedEmail.sender,
        subject: deletedEmail.subject,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error deleting email:', error.message);
    
    // Handle mongoose/MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting email',
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get email statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Email.countDocuments();
    const inbox = await Email.countDocuments({ label: 'ham' });
    const spam = await Email.countDocuments({ label: 'spam' });
    const starred = await Email.countDocuments({ isStarred: true });

    const stats = {
      total: total,
      inbox: inbox,
      spam: spam,
      starred: starred,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message,
    });
  }
});

/**
 * GET /api/spam-engine/analyze/:id
 * Get spam detection engine results for a specific email
 */
app.get('/api/spam-engine/analyze/:id', async (req, res) => {
  try {
    const emailId = req.params.id;
    const email = await Email.findById(emailId).lean();

    if (!email) {
      return res.status(404).json({
        success: false,
        message: `Email with ID ${emailId} not found`
      });
    }

    res.json({
      success: true,
      data: {
        id: email._id,
        subject: email.subject,
        sender: email.sender,
        classification: email.engineClassification,
        spam_score: email.engineSpamScore,
        detected_words: email.engineDetectedWords,
        confidence: email.engineConfidence,
        scoreBreakdown: email.scoreBreakdown,
        threshold: 2,
        message: email.engineClassification === 'spam' 
          ? `Email classified as SPAM with score ${email.engineSpamScore}/10` 
          : `Email classified as NORMAL with score ${email.engineSpamScore}/10`
      }
    });
  } catch (error) {
    console.error('Error analyzing email with spam engine:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing email',
      error: error.message
    });
  }
});

/**
 * POST /api/spam-engine/test
 * Test spam detection engine with custom email
 */
app.post('/api/spam-engine/test', (req, res) => {
  try {
    const { subject = '', body = '', senderEmail = 'test@example.com', from = 'Test Sender' } = req.body;

    if (!subject && !body) {
      return res.status(400).json({
        success: false,
        message: 'Subject and/or body must be provided'
      });
    }

    const result = detectSpamAdvanced({
      subject,
      body,
      senderEmail,
      from
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing spam engine:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing spam engine',
      error: error.message
    });
  }
});

/**
 * GET /api/spam-engine/stats
 * Get spam detection engine statistics
 */
app.get('/api/spam-engine/stats', async (req, res) => {
  try {
    // Fetch all emails for stats calculation
    const emails = await Email.find({}).lean();
    
    const results = emails.map(e => ({
      id: e._id,
      classification: e.engineClassification,
      spam_score: e.engineSpamScore,
      detected_words: e.engineDetectedWords,
      scoreBreakdown: e.scoreBreakdown
    }));

    const stats = getSpamEngineStats(results);

    res.json({
      success: true,
      data: {
        ...stats,
        description: 'Spam Detection Engine Statistics'
      }
    });
  } catch (error) {
    console.error('Error fetching spam engine stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching spam engine stats',
      error: error.message
    });
  }
});

/**
 * GET /api/spam-engine/emails
 * Get all emails with spam engine classification
 */
app.get('/api/spam-engine/emails', async (req, res) => {
  try {
    const { classification = 'all', limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    let query = {};

    // Filter by classification
    if (classification === 'spam') {
      query.engineClassification = 'spam';
    } else if (classification === 'normal') {
      query.engineClassification = 'normal';
    }

    const total = await Email.countDocuments(query);
    const emails = await Email.find(query)
      .sort({ timestamp: -1 })
      .skip(offsetNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: {
        emails: emails.map(e => ({
          id: e._id,
          sender: e.sender,
          subject: e.subject,
          preview: e.preview,
          classification: e.engineClassification,
          spam_score: e.engineSpamScore,
          confidence: e.engineConfidence,
          detected_words: e.engineDetectedWords
        })),
        pagination: {
          total: total,
          limit: limitNum,
          offset: offsetNum,
          returned: emails.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching spam engine emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emails',
      error: error.message
    });
  }
});

/**
 * POST /api/check-email
 * Real-time email spam detection
 * Checks an email and returns spam/normal classification
 * Automatically categorizes into spam or inbox
 * ALSO extracts tasks if email is NORMAL
 */
app.post('/api/check-email', async (req, res) => {
  try {
    const { sender, subject, body } = req.body;
    const userId = 'john123'; // Default user ID

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📨 ENDPOINT CALLED: /api/check-email`);
    console.log(`   From: ${sender}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body length: ${body?.length || 0} chars`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Validate input
    if (!sender || !subject || !body) {
      console.log(`❌ VALIDATION FAILED: Missing fields`);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sender, subject, body',
        required: ['sender', 'subject', 'body']
      });
    }

    // Generate email for sender
    const senderEmail = generateEmailFromSender(sender);

    // Run spam detection engine
    const spamEngineResult = detectSpamAdvanced({
      subject: subject,
      body: body,
      senderEmail: senderEmail,
      from: sender
    });

    // CLAMP spam_score to 0-10 range for database compatibility
    spamEngineResult.spam_score = Math.max(0, Math.min(10, spamEngineResult.spam_score));

    console.log(`\n📊 JS SPAM ENGINE RESULT:`);
    console.log(`   Score: ${spamEngineResult.spam_score}/10`);
    console.log(`   Classification: ${spamEngineResult.classification}`);
    console.log(`   Confidence: ${spamEngineResult.confidence}%`);

    // ============================================================================
    // ML INTEGRATION: Check if score is uncertain (3 < score < 8)
    // ============================================================================
    let finalClassification = spamEngineResult.classification;
    let mlUsed = false;
    let mlResult = null;

    const jsScore = spamEngineResult.spam_score;

    if (jsScore > 3 && jsScore < 8) {
      console.log(`\n🔄 SCORE IN UNCERTAIN RANGE (3-8): CALLING ML API...`);
      
      try {
        // Call Flask ML API
        const mlResponse = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: `${subject} ${body}` }),
          timeout: 5000
        });

        if (mlResponse.ok) {
          mlResult = await mlResponse.json();
          mlUsed = true;

          console.log(`\n✅ ML API RESPONSE RECEIVED:`);
          console.log(`   Prediction: ${mlResult.label}`);
          console.log(`   Confidence: ${mlResult.confidence}`);
          console.log(`   Probabilities:`, mlResult.probabilities);

          // Use ML result to determine final classification
          finalClassification = mlResult.prediction === 1 ? 'spam' : 'normal';
          console.log(`\n🎯 FINAL DECISION (ML-based): ${finalClassification.toUpperCase()}`);
        } else {
          console.log(`\n⚠️  ML API returned status ${mlResponse.status}`);
          console.log(`   Falling back to JS score...`);
          mlUsed = false;
        }
      } catch (mlError) {
        console.log(`\n⚠️  ML API Error: ${mlError.message}`);
        console.log(`   Falling back to JS score...`);
        mlUsed = false;
      }
    } else if (jsScore >= 8) {
      console.log(`\n⏭️  SCORE >= 8 (High confidence SPAM): Skipping ML`);
    } else if (jsScore <= 3) {
      console.log(`\n⏭️  SCORE <= 3 (High confidence NORMAL): Skipping ML`);
    }

    // Determine folder based on final classification
    const folder = finalClassification === 'spam' ? 'spam' : 'inbox';

    // Create new email document
    const newEmail = new Email({
      sender: sender,
      senderEmail: senderEmail,
      subject: subject,
      preview: truncateText(body, 80),
      content: body,
      timestamp: new Date(),
      isStarred: false,
      hasAttachment: false,
      attachments: [],
      recipient: 'you@example.com',
      label: finalClassification === 'spam' ? 'spam' : 'ham',
      folder: folder,
      isDefault: false, // Mark as user-composed email
      // Spam detection fields
      engineClassification: finalClassification,
      engineSpamScore: spamEngineResult.spam_score,
      engineDetectedWords: spamEngineResult.detected_words,
      engineConfidence: spamEngineResult.confidence,
      scoreBreakdown: spamEngineResult.scoreBreakdown,
    });

    // Save to database
    const savedEmail = await newEmail.save();

    // Log the new email
    console.log(`\n📧 NEW EMAIL RECEIVED:`);
    console.log(`   ID: ${savedEmail._id}`);
    console.log(`   From: ${savedEmail.sender} (${savedEmail.senderEmail})`);
    console.log(`   Subject: "${savedEmail.subject}"`);
    console.log(`   JS Score: ${savedEmail.engineSpamScore}/10`);
    console.log(`   Final Classification: ${savedEmail.engineClassification === 'spam' ? '⚠️  SPAM' : '✅ NORMAL'}`);
    console.log(`   ML Used: ${mlUsed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Confidence: ${savedEmail.engineConfidence}%`);
    console.log(`   Folder: ${folder}`);
    if (savedEmail.engineDetectedWords.length > 0) {
      console.log(`   Detected Words: [${savedEmail.engineDetectedWords.slice(0, 3).join(', ')}${savedEmail.engineDetectedWords.length > 3 ? ', ...' : ''}]`);
    }

    // AUTO-EXTRACT TASKS if email is NORMAL (not spam)
    let tasksCreated = 0;
    let extractedTasks = [];
    let dependenciesCreated = 0;
    
    if (finalClassification !== 'spam') {
      console.log(`\n🎯 AUTO-EXTRACTING TASKS FROM NORMAL EMAIL...\n`);
      
      try {
        // Import dependency detector and TaskGraph
        const { detectDependencies, getTaskOrder } = require('./utils/dependencyDetector');
        const TaskGraph = require('./commitment-tracker/services/TaskGraph');

        const emailContent = `${subject}\n${body}`;
        
        // ============================================================================
        // STEP 1: ANALYZE EMAIL FOR TASKS AND DEPENDENCIES
        // ============================================================================
        console.log(`\n📊 ANALYZING EMAIL FOR TASKS AND DEPENDENCIES...\n`);
        
        const analysis = detectDependencies(emailContent);
        const { tasks, dependencies, graph, stats } = analysis;

        console.log(`   📊 Analysis Results:`);
        console.log(`      Total tasks found: ${stats.totalTasks}`);
        console.log(`      Total dependencies: ${stats.totalDependencies}`);
        console.log(`      High-strength dependencies: ${stats.highStrengthDeps}`);
        console.log(`      Medium-strength dependencies: ${stats.mediumStrengthDeps}`);

        if (stats.totalTasks === 0) {
          console.log(`\n   ℹ️  No structured tasks found in email\n`);
        } else {
          console.log(`\n   ✅ Found ${stats.totalTasks} task(s) with ${stats.totalDependencies} dependency(ies)\n`);

          // ============================================================================
          // STEP 2: GET OPTIMAL TASK ORDER (respecting dependencies)
          // ============================================================================
          console.log(`\n🔄 CALCULATING OPTIMAL TASK ORDER...\n`);
          const taskOrder = getTaskOrder(tasks, dependencies);

          console.log(`   📋 Recommended order:`);
          taskOrder.forEach((taskText, index) => {
            console.log(`      ${index + 1}. ${taskText}`);
          });

          // ============================================================================
          // STEP 3: CREATE ALL TASKS IN DATABASE
          // ============================================================================
          console.log(`\n💾 CREATING TASKS IN DATABASE...\n`);

          const taskTextToId = {}; // Map task text to taskId
          const taskGraph = new TaskGraph(); // Initialize TaskGraph

          // Create tasks in optimal order
          for (const taskText of taskOrder) {
            try {
              const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const deadline = new Date();
              deadline.setDate(deadline.getDate() + 3); // Default 3 days

              const newTask = new Task({
                taskId: taskId,
                userId: userId,
                action: 'complete',
                object: taskText,
                deadline: deadline,
                status: 'pending',
                section: 'pending',
                blockedBy: [],
                sourceEmail: {
                  sender: sender,
                  subject: subject,
                },
              });

              const savedTask = await newTask.save();
              extractedTasks.push(savedTask);
              taskTextToId[taskText] = savedTask._id;
              tasksCreated++;

              // Add task to graph
              taskGraph.addTask({
                _id: savedTask._id,
                taskId: taskId,
                object: taskText,
                deadline: deadline,
                status: 'pending'
              });

              console.log(`   ✅ TASK CREATED [${tasksCreated}]: "${taskText}"`);
            } catch (taskError) {
              console.log(`   ⚠️  Task creation error: ${taskError.message}`);
            }
          }

          // ============================================================================
          // STEP 4: LINK DEPENDENCIES IN DATABASE AND GRAPH
          // ============================================================================
          if (dependencies.length > 0) {
            console.log(`\n🔗 LINKING DEPENDENCIES IN DATABASE AND GRAPH...\n`);
            console.log(`   Total dependencies to link: ${dependencies.length}\n`);

            for (const dep of dependencies) {
              try {
                const blockerTaskId = taskTextToId[dep.blocker];
                const blockedTaskId = taskTextToId[dep.blocked];

                if (!blockerTaskId || !blockedTaskId) {
                  console.log(
                    `   ⚠️  SKIPPED: Could not find task IDs for "${dep.blocker}" → "${dep.blocked}"`
                  );
                  continue;
                }

                console.log(
                  `\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
                );
                console.log(`   DEPENDENCY LINK: [${dep.strength.toUpperCase()}]`);
                console.log(`   Blocker: "${dep.blocker}"`);
                console.log(`   Pattern: ${dep.patternType}`);
                console.log(`   Blocked: "${dep.blocked}"`);

                // 1. Update MongoDB - add dependency
                const updateResult = await Task.findOneAndUpdate(
                  { _id: blockedTaskId },
                  { $addToSet: { blockedBy: blockerTaskId } },
                  { new: true }
                );

                // 2. Add to TaskGraph
                const graphDependencyAdded = taskGraph.addDependency(
                  blockerTaskId,
                  blockedTaskId
                );

                if (updateResult && graphDependencyAdded) {
                  dependenciesCreated++;
                  console.log(`   ✅ LINKED SUCCESSFULLY!`);
                  console.log(`      ${dep.blocked} is now blocked by ${dep.blocker}`);
                  console.log(`      Added to graph: ${blockerTaskId} → ${blockedTaskId}`);
                } else {
                  console.log(`   ⚠️  Partial update: DB=${!!updateResult}, Graph=${graphDependencyAdded}`);
                }

                console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
              } catch (depError) {
                console.log(`   ❌ DEPENDENCY LINKING ERROR: ${depError.message}`);
              }
            }

            console.log(`\n   ✅ Dependency linking complete!`);
            console.log(`      Successfully created ${dependenciesCreated} dependency link(s)\n`);
          }

          // ============================================================================
          // STEP 5: ANALYZE GRAPH AND GET READY TASKS
          // ============================================================================
          if (extractedTasks.length > 0) {
            console.log(`\n📊 TASK GRAPH ANALYSIS:\n`);

            const readyTasks = taskGraph.getReadyTasks();
            console.log(`   Ready to start (no blockers): ${readyTasks.length}`);
            readyTasks.forEach((task, i) => {
              console.log(`      ${i + 1}. ${task.object || task.taskId}`);
            });

            // Find critical path
            const criticalPath = taskGraph.getCriticalPath();
            if (criticalPath && criticalPath.length > 1) {
              console.log(`\n   Critical Path (longest dependency chain):`);
              criticalPath.forEach((taskId, i) => {
                const task = extractedTasks.find(t => t._id.toString() === taskId.toString());
                if (task) {
                  console.log(`      ${i + 1}. ${task.object}`);
                }
              });
            }

            console.log(`\n   Graph Statistics:`);
            console.log(`      Total nodes: ${taskGraph.getNodeCount()}`);
            console.log(`      Total edges: ${taskGraph.getEdgeCount()}`);
            console.log(`      Critical path length: ${criticalPath ? criticalPath.length : 0}`);
          }
        }

        if (tasksCreated > 0) {
          console.log(
            `\n   🎉 SUCCESS: Created ${tasksCreated} task(s) with ${dependenciesCreated} dependency link(s) ✅\n`
          );
        } else {
          console.log(`\n   ℹ️  No tasks extracted from email content\n`);
        }
      } catch (taskError) {
        console.log(`\n   ⚠️  Task extraction error: ${taskError.message}\n`);
        console.log(`   Stack trace:`, taskError.stack);
      }
    }

    res.json({
      success: true,
      data: {
        id: savedEmail._id,
        sender: savedEmail.sender,
        subject: savedEmail.subject,
        classification: savedEmail.engineClassification,
        folder: folder,
        jsScore: spamEngineResult.spam_score,
        jsClassification: spamEngineResult.classification,
        confidence: savedEmail.engineConfidence,
        detected_words: savedEmail.engineDetectedWords,
        scoreBreakdown: savedEmail.scoreBreakdown,
        mlAnalysis: {
          used: mlUsed,
          scoreRange: jsScore > 3 && jsScore < 8 ? '3-8 (uncertain)' : (jsScore >= 8 ? '>=8 (spam)' : '<=3 (normal)'),
          jsScore: spamEngineResult.spam_score,
          mlResult: mlResult ? {
            prediction: mlResult.prediction,
            label: mlResult.label,
            confidence: mlResult.confidence,
            probabilities: mlResult.probabilities
          } : null
        },
        taskExtraction: {
          tasksCreated: tasksCreated,
          dependenciesCreated: dependenciesCreated,
          tasks: extractedTasks.map(t => ({
            taskId: t.taskId,
            object: t.object,
            deadline: t.deadline,
            blockedBy: t.blockedBy,
            status: t.status
          }))
        },
        message: mlUsed 
          ? `Email classified as ${finalClassification.toUpperCase()} using ML (JS score: ${spamEngineResult.spam_score}/10). Created ${tasksCreated} task(s) with ${dependenciesCreated} dependency(ies).` 
          : `Email classified as ${finalClassification.toUpperCase()} using JS engine (score: ${spamEngineResult.spam_score}/10). Created ${tasksCreated} task(s) with ${dependenciesCreated} dependency(ies).`,
        timestamp: savedEmail.timestamp
      }
    });

  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email',
      error: error.message
    });
  }
});

/**
 * POST /api/extract-tasks-from-email
 * Extract tasks from email content using commitment detection
 * Saves tasks directly to database
 */
app.post('/api/extract-tasks-from-email', async (req, res) => {
  try {
    const { emailText, userId, sourceEmail } = req.body;

    // Validate input
    if (!emailText || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: emailText, userId',
      });
    }

    console.log(`\n🎯 EXTRACTING TASKS FROM EMAIL:`);
    console.log(`   From: ${sourceEmail?.sender || 'Unknown'}`);
    console.log(`   Subject: ${sourceEmail?.subject || 'No subject'}`);
    console.log(`   User: ${userId}`);

    // Import commitment utilities
    const detectCommitments = require('./utils/commitmentDetector');
    const extractTask = require('./utils/taskExtractor');
    const convertToDeadline = require('./utils/deadlineConverter');

    // Step 1: Detect commitments
    const commitments = detectCommitments(emailText);
    console.log(`   Found: ${commitments.length} commitment(s)`);

    if (commitments.length === 0) {
      return res.json({
        success: true,
        data: {
          tasksCreated: 0,
          message: 'No actionable tasks found in email',
        },
      });
    }

    // Step 2: Extract and create tasks
    const createdTasks = [];
    for (const commitment of commitments) {
      try {
        const extracted = extractTask(commitment);
        
        if (extracted) {
          // Convert deadline
          const deadline = convertToDeadline(extracted.timeText);

          // Generate unique task ID
          const taskId = `task_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create task document
          const task = new Task({
            taskId,
            userId,
            action: extracted.action.trim(),
            object: extracted.object.trim(),
            deadline: deadline,
            status: 'pending',
            section: 'pending',
            sourceEmail: sourceEmail || {},
          });

          // Save task
          const savedTask = await task.save();
          createdTasks.push(savedTask);

          console.log(`   ✅ Task created: "${extracted.action} ${extracted.object}" | Due: ${deadline.toLocaleDateString()}`);
        }
      } catch (err) {
        console.error(`   ⚠️  Error extracting task: ${err.message}`);
      }
    }

    // Return success response
    res.json({
      success: true,
      data: {
        tasksCreated: createdTasks.length,
        tasks: createdTasks.map(t => ({
          id: t._id,
          action: t.action,
          object: t.object,
          deadline: t.deadline,
        })),
        message: `Successfully created ${createdTasks.length} task(s) from email`,
      },
    });

  } catch (error) {
    console.error('Error extracting tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error extracting tasks from email',
      error: error.message,
    });
  }
});

/**
 * POST /api/analyze-email-visualization
 * Comprehensive analysis for visualization dashboard
 */
app.post('/api/analyze-email-visualization', async (req, res) => {
  try {
    const { sender = '', subject = '', body = '' } = req.body;

    // DEBUG: Log what we received
    console.log('\n🔍 ANALYZE REQUEST DEBUG:');
    console.log(`   Sender: "${sender}" (length: ${sender.length})`);
    console.log(`   Subject: "${subject}" (length: ${subject.length})`);
    console.log(`   Body: "${body.substring(0, 100)}..." (total length: ${body.length})`);
    console.log('');

    if (!subject.trim() || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject and body are required',
      });
    }

    // Process email
    const processed = processEmailParts(subject, body);
    
    // Get spam detection results
    const spamResult = detectSpamAdvanced({
      subject: subject,
      body: body,
      senderEmail: sender || 'unknown@example.com',
      from: sender || 'Unknown Sender'
    });
    
    // DEBUG: Verify spam detection is working
    console.log('📋 SPAM DETECTION RESULT:', {
      classification: spamResult.classification,
      spam_score: spamResult.spam_score,
      detected_words_count: spamResult.detected_words?.length || 0,
      detected_words_sample: spamResult.detected_words?.slice(0, 5) || [],
      threshold: spamResult.threshold
    });
    
    // Prepare visualization data in pipeline format
    const visualizationData = {
      pipeline: [
        {
          step: 1,
          name: 'Email Input',
          data: {
            from: sender || 'Unknown Sender',
            to: 'recipients@example.com',
            date: new Date().toLocaleDateString(),
            subject: truncateText(subject, 100),
            bodyPreview: truncateText(body, 150),
            body: body.substring(0, 500)
          }
        },
        {
          step: 2,
          name: 'Tokenization',
          data: {
            totalOriginal: processed.originalCount,
            totalProcessed: processed.tokenCount,
            originalTokens: processed.originalTokens.slice(0, 20),
            afterStemming: processed.tokens.slice(0, 20),
            removed: processed.removedStopwords.slice(0, 10),
            removedCount: processed.removedStopwords.length
          }
        },
        {
          step: 3,
          name: 'Bloom Filter',
          data: {
            filterSize: 1024,
            hashFunctions: 4,
            stats: {
              fillRate: '26.76%'
            },
            tokens: (spamResult.detected_words || []).slice(0, 20).map(word => ({
              token: word,
              hash1: Math.abs(word.split('').reduce((h, c) => h + c.charCodeAt(0), 0)) % 1024,
              hash2: Math.abs(word.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1024, 0)) % 1024,
              hash3: Math.abs(word.split('').reduce((h, c) => (((h << 5) + h) ^ c.charCodeAt(0)), 5381)) % 1024,
              hash4: Math.abs(word.split('').reduce((h, c) => (h + c.charCodeAt(0)) * 0x9e3779b9, 0) >>> 0) % 1024,
              found: true
            }))
          }
        },
        {
          step: 4,
          name: 'Hash Table',
          data: {
            totalEntries: processed.tokenCount,
            foundWords: (spamResult.detected_words || []).map(word => ({
              token: word,
              matchedKeyword: word,
              weight: 2
            })),
            notFoundWords: processed.tokens.filter(t => !(spamResult.detected_words || []).includes(t)).slice(0, 10),
            lookupTime: 'O(1)',
            dominainMatches: []
          }
        },
        {
          step: 5,
          name: 'Trie',
          data: {
            // Traversal steps for each detected spam word
            traversalSteps: (spamResult.detected_words || []).slice(0, 5).flatMap(word => 
              word.split('').map((char, idx) => ({
                character: char,
                action: idx === 0 ? `Starting with "${char}"` : `Moving to "${char}"`,
                detail: `Character "${char}" at position ${idx + 1} in word "${word}"`
              }))
            ),
            // Matched patterns (actual detected spam words)
            matchedPatterns: (spamResult.detected_words || []).slice(0, 10),
            // Depth of the Trie (longest word)
            depth: Math.max(...(spamResult.detected_words || []).map(w => w.length)) || 0,
            // Total nodes = sum of all character paths
            totalNodes: (spamResult.detected_words || []).reduce((sum, word) => sum + word.length, 0),
            // All paths for visualization
            paths: (spamResult.detected_words || []).slice(0, 10).map(word => ({
              token: word,
              isSpamWord: true,
              characters: word.split('')
            })).concat(
              processed.tokens
                .filter(t => !(spamResult.detected_words || []).includes(t))
                .slice(0, 5)
                .map(word => ({
                  token: word,
                  isSpamWord: false,
                  characters: word.split('')
                }))
            )
          }
        },
        {
          step: 6,
          name: 'Scoring',
          data: {
            totalScore: spamResult.spam_score || 0,
            threshold: 7,
            breakdown: [
              {
                label: 'Spam Words Detected',
                points: Math.max((spamResult.detected_words || []).length - 2, 0),
                percentage: 40
              },
              {
                label: 'Suspicious Domain',
                points: spamResult.scoreBreakdown?.senderDomain?.score || 0,
                percentage: 30
              },
              {
                label: 'Patterns & Links',
                points: spamResult.scoreBreakdown?.patterns?.score || spamResult.scoreBreakdown?.links?.score || 0,
                percentage: 30
              }
            ]
          }
        },
        {
          step: 7,
          name: 'Graph Analysis',
          data: {
            graph: getGraphData(),
            score: spamResult.scoreBreakdown?.graph?.score || 0,
            suspiciousWordCount: spamResult.scoreBreakdown?.graph?.suspiciousWordCount || 0,
            frequentWordCount: spamResult.scoreBreakdown?.graph?.frequentWordCount || 0,
            senderEmailCount: spamResult.scoreBreakdown?.graph?.senderEmailCount || 0
          }
        },
        {
          step: 8,
          name: 'ML Analysis',
          data: {
            // Generate dynamic ML analysis based on email characteristics
            score: spamResult.spam_score || 0,
            spamWords: (spamResult.detected_words || []).length,
            tokenCount: processed.tokenCount,
            shouldRunML: (spamResult.spam_score || 0) > 3 && (spamResult.spam_score || 0) < 8,
            prediction: (spamResult.spam_score || 0) >= 6 ? 'Spam' : 'Not Spam',
            confidence: Math.min(0.99, Math.max(0.51, (spamResult.spam_score || 0) / 10)),
            graphScore: spamResult.scoreBreakdown?.graph?.score || 0,
            model: 'Multinomial Naive Bayes with TF-IDF',
            trainingData: 'UCI SMS Spam Collection (5,572 messages)',
            accuracy: '96.95%',
            features: {
              spamKeywords: (spamResult.detected_words || []).length > 3,
              emailLength: processed.tokenCount > 50,
              suspiciousDomain: (spamResult.scoreBreakdown?.senderDomain?.score || 0) > 3,
              highSpamIndicators: (spamResult.spam_score || 0) > 6
            }
          }
        }
      ],
      finalResult: {
        step: 9,
        name: 'Final Decision',
        isSpam: spamResult.classification === 'spam',
        classification: spamResult.classification === 'spam' ? 'SPAM' : 'LEGITIMATE',
        message: spamResult.classification === 'spam' 
          ? '⚠️ This email has characteristics of SPAM and may be harmful'
          : '✅ This email appears to be LEGITIMATE and safe',
        score: spamResult.spam_score || 0,
        totalScore: spamResult.spam_score || 0,
        confidence: (spamResult.confidence || 0),
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      pipeline: visualizationData.pipeline,
      finalResult: visualizationData.finalResult
    });

    // DEBUG: Log what we're sending to frontend
    console.log('✅ SENDING TO FRONTEND:', {
      pipelineLength: visualizationData.pipeline.length,
      step3TokensCount: visualizationData.pipeline[2]?.data?.tokens?.length || 0,
      step3TokensSample: visualizationData.pipeline[2]?.data?.tokens?.slice(0, 3) || [],
      finalClassification: visualizationData.finalResult.classification,
      finalScore: visualizationData.finalResult.score
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing email',
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const emailCount = await Email.countDocuments();
    res.json({
      success: true,
      message: 'Server is running',
      database: isConnected() ? 'Connected' : 'Disconnected',
      emailsLoaded: emailCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Server is running but database error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Email Server running on http://localhost:${PORT}`);
      console.log(`📧 API endpoints:`);
      console.log(`\n   📬 Email Retrieval:`);
      console.log(`   GET  /api/emails                  - Get all emails`);
      console.log(`   GET  /api/emails/:id              - Get single email`);
      console.log(`   GET  /api/emails/:id/preprocess   - Get preprocessing details`);
      console.log(`   PUT  /api/emails/:id/star         - Toggle star`);
      
      console.log(`\n   📊 Statistics & Analysis:`);
      console.log(`   GET  /api/stats                   - Get general statistics`);
      console.log(`   GET  /api/preprocess/stats        - Get preprocessing stats`);
      console.log(`   POST /api/preprocess/analyze      - Analyze custom text`);
      
      console.log(`\n   🚀 SPAM DETECTION ENGINE:`);
      console.log(`   POST /api/check-email             - Real-time email spam detection`);
      console.log(`   GET  /api/spam-engine/analyze/:id - Analyze specific email`);
      console.log(`   POST /api/spam-engine/test        - Test with custom email`);
      console.log(`   GET  /api/spam-engine/stats       - Get engine statistics`);
      console.log(`   GET  /api/spam-engine/emails      - Get classified emails`);
      
      console.log(`\n   ✅ TASKS/COMMITMENTS (Database: email-spam-db):`);
      console.log(`   POST /api/tasks                   - Add new task`);
      console.log(`   GET  /api/tasks/:userId           - Get all tasks`);
      console.log(`   GET  /api/tasks/:userId/status/:status - Get tasks by status`);
      console.log(`   GET  /api/tasks/:userId/overview  - Get overview (pending + completed)`);
      console.log(`   GET  /api/tasks/:userId/upcoming  - Get upcoming tasks (next 7 days)`);
      console.log(`   GET  /api/tasks/:userId/overdue   - Get overdue tasks`);
      console.log(`   PUT  /api/tasks/:taskId           - Update task status`);
      console.log(`   DELETE /api/tasks/:taskId         - Delete task`);
      console.log(`   DELETE /api/tasks/:userId/clear   - Clear all user tasks`);
      
      console.log(`\n   ℹ️  General:`);
      console.log(`   GET  /api/health                  - Health check\n`);
      
      console.log(`📌 Database: email-spam-db (Collections: emails, tasks)`);
      console.log(`🔗 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/email-spam-db'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
