const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Connects to MongoDB instance (local or cloud)
 * 
 * IMPORTANT: Using ONLY email-spam-db database
 * Do NOT use the old 'email-spam' database
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-spam-db';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   URI: ${MONGODB_URI}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
}

/**
 * Get MongoDB connection status
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  mongoose
};
