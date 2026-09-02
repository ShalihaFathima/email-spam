# MongoDB Setup Guide

This guide explains how to set up MongoDB locally for the Email Spam Filter system.

## Installation Options

### Option 1: MongoDB Community Server (Local Installation)

#### Windows

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows and download the MSI installer

2. **Run the Installer**
   - Execute the downloaded MSI file
   - Choose "Complete Setup"
   - Check the box "Install MongoDB as a Service"
   - Keep default installation path (C:\Program Files\MongoDB\Server\x.x\)

3. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   - On Windows, MongoDB should start automatically as a service
   - Verify in Services: Press Win + R → services.msc → Look for "MongoDB Server"

5. **Connect to MongoDB**
   ```bash
   mongosh
   ```
   If you see a command prompt with `>`, MongoDB is running!

#### macOS

1. **Install using Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community
   ```

3. **Connect to MongoDB**
   ```bash
   mongosh
   ```

#### Linux (Ubuntu/Debian)

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install & Start**
   ```bash
   sudo apt update
   sudo apt install mongodb-org
   sudo systemctl start mongod
   ```

4. **Verify**
   ```bash
   mongosh
   ```

---

### Option 2: MongoDB Atlas (Cloud - Recommended for Development)

1. **Sign Up**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create a free account

2. **Create a Cluster**
   - Click "Create a Deployment"
   - Select "Free Tier" (M0)
   - Choose your cloud provider and region
   - Click "Create Deployment"

3. **Create a Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Enter username and password
   - Set permissions to "Atlas Admin"

4. **Get Connection String**
   - Go to "Databases" → Click "Connect"
   - Choose "Connection String"
   - Copy the connection string

5. **Set Environment Variable**
   ```bash
   # In your terminal or .env file
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/email-spam-db?retryWrites=true&w=majority
   ```

---

## Configuration

### Connection String Format

**Local MongoDB:**
```
mongodb://localhost:27017/email-spam-db
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/email-spam-db?retryWrites=true&w=majority
```

### Set Connection in App

Add to `.env` file in project root:
```env
MONGODB_URI=mongodb://localhost:27017/email-spam-db
PORT=5000
NODE_ENV=development
```

Or use default (will connect to local MongoDB):
```
mongodb://localhost:27017/email-spam-db
```

---

## Testing MongoDB Connection

### Using mongosh (MongoDB Shell)

```bash
# Connect to MongoDB
mongosh

# Check current database
db

# List all databases
show dbs

# Switch to email-spam-db
use email-spam-db

# See collections
show collections

# Count emails
db.emails.countDocuments()

# View first email
db.emails.findOne()

# View all emails with pretty formatting
db.emails.find().pretty()

# Exit
exit
```

---

## Troubleshooting

### MongoDB won't start on Windows

1. **Check if port 27017 is available**
   ```bash
   netstat -ano | findstr :27017
   ```

2. **Remove mongod.lock file**
   ```
   C:\data\db\mongod.lock
   ```

3. **Restart MongoDB Service**
   - Press Win + R
   - Type `services.msc`
   - Find "MongoDB Server"
   - Right-click → Restart

### Connection refused error

- Ensure MongoDB service is running
- Check if port 27017 is accessible
- Verify MONGODB_URI environment variable is set correctly

### "Cannot find data directory"

Create the data directory:
```bash
# Windows
mkdir C:\data\db

# macOS/Linux
mkdir -p /data/db
sudo chown $USER /data/db
```

---

## Database Structure

### Email Collection Schema

```mongodb
{
  _id: ObjectId,
  sender: String,
  senderEmail: String,
  subject: String,
  preview: String,
  content: String,
  recipient: String,
  timestamp: Date,
  label: String, // 'ham' or 'spam'
  folder: String, // 'inbox', 'spam', etc.
  isStarred: Boolean,
  hasAttachment: Boolean,
  attachments: Array,
  isDefault: Boolean, // true for dataset emails
  engineClassification: String,
  engineSpamScore: Number,
  engineDetectedWords: Array,
  engineConfidence: Number,
  scoreBreakdown: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Database Initialization

When you run the application:

1. **First Run**
   - Connects to MongoDB
   - Checks if `emails` collection is empty
   - If empty, loads and inserts 17 dataset emails from CSV
   - Marks them with `isDefault: true`

2. **Subsequent Runs**
   - Connects to MongoDB
   - Finds existing emails (skips re-seeding)
   - All data persists permanently

3. **New Emails**
   - When you compose an email, it's saved to DB
   - Marked with `isDefault: false`
   - Persists after refresh and restart

---

## Backup & Reset

### Backup Database

```bash
# Dump to a backup folder
mongodump --db email-spam-db --out ./backup

# Restore from backup
mongorestore --db email-spam-db ./backup/email-spam-db
```

### Reset to Dataset Only

```bash
# Connect to MongoDB
mongosh

# Delete all emails
use email-spam-db
db.emails.deleteMany({})

# Exit - Next app run will re-seed dataset
exit
```

### Export to CSV

```bash
mongoexport --db email-spam-db --collection emails --out emails_export.csv
```

---

## Performance Tips

1. **Indexing**: Database automatically creates indexes on frequently queried fields
2. **Query Optimization**: Use `.lean()` in Mongoose for read-only queries
3. **Pagination**: Always use limit and offset for large datasets
4. **Connection Pooling**: Mongoose handles connection pooling automatically

---

## Next Steps

1. Choose installation method (Local or Atlas)
2. Install and start MongoDB
3. Create `.env` file with `MONGODB_URI`
4. Run `npm install` to install node dependencies
5. Run `npm run dev` to start the application
6. Dataset (17 emails) will automatically seed on first run

Enjoy your persistent email system! 🎉
