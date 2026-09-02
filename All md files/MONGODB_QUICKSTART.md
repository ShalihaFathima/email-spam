# 🚀 Email Spam Filter - MongoDB Setup & Quick Start

## What's New?

Your email spam filter now uses **MongoDB** for permanent data persistence!

### ✅ Features
- **Permanent Storage**: All emails are saved to MongoDB
- **Dataset Protected**: Original 17 emails are never deleted
- **New Emails Persist**: Newly composed emails survive refresh and restart
- **No Duplication**: Smart merging ensures data integrity
- **Scalable**: Can grow from 17 to thousands of emails

---

## Prerequisites

### Option A: Local MongoDB (Recommended for Development)

1. **Download & Install MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Download for Windows/Mac/Linux
   - Run installer and follow prompts
   - **Windows**: Installation creates a service automatically

2. **Start MongoDB**
   - **Windows**: Already running as service (verify in Services)
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. **Verify Installation**
   ```bash
   mongosh
   # You should see: "test> " prompt
   # Type: exit
   ```

### Option B: MongoDB Atlas (Cloud - Also Recommended)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 (free) cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/email-spam-db`
5. Add to `.env` file (see step 2 below)

---

## Installation & Setup

### Step 1: Navigate to Project
```bash
cd "c:\Users\BAVISHYA\Desktop\Email spam"
```

### Step 2: Create `.env` File
Create a file named `.env` in the project root with:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/email-spam-db
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/email-spam-db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Step 3: Ensure Dependencies are Installed
```bash
npm install
```
(Already done! mongoose is installed)

### Step 4: Start MongoDB
- **Local**: Ensure service is running ([see MONGODB_SETUP.md](./MONGODB_SETUP.md))
- **Atlas**: Already running in cloud (no action needed)

### Step 5: Start the Application
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
   Database: email-spam-db
   URI: mongodb://localhost:27017/email-spam-db

🌱 Starting email dataset seeding...
✅ Successfully seeded 17 dataset emails

📊 Dataset Statistics:
   Total emails: 17
   Inbox (ham): 13
   Spam: 4

🚀 Email Server running on http://localhost:5000
```

---

## Architecture Overview

### Before (In-Memory Storage)
```
Request → Spam Detection → Add to Array → Lost on Restart ❌
```

### After (MongoDB)
```
Request → Spam Detection → Save to MongoDB → Persists Forever ✅
```

### Database Structure

```
MongoDB Atlas / Local Server
           ↓
[email-spam-db]
           ↓
[emails collection]
           ↓
[Original 17 Dataset Emails (isDefault: true)]
[+ New Composed Emails (isDefault: false)]
[+ Starred/Modified Emails]
```

---

## Usage & Testing

### 1. **Access the App**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 2. **Send a New Email**
- Click "Compose" button
- Fill: Sender, Subject, Body
- Click "Check Email"
- Email is automatically:
  - Classified (Spam/Normal)
  - Saved to MongoDB
  - Displayed in UI

### 3. **Refresh the Page**
- Press F5 or Cmd+R
- ✅ All emails still there (including your new ones!)
- Email count increased (17 → 18 → ...)

### 4. **Verify in Database**
```bash
mongosh
use email-spam-db
db.emails.countDocuments()     # Should show total count
db.emails.countDocuments({isDefault: true})  # Should show 17
db.emails.countDocuments({isDefault: false}) # Should show your new emails

# View recent emails
db.emails.find().sort({timestamp: -1}).limit(5).pretty()
```

---

## API Endpoints (Updated)

All endpoints now use MongoDB:

### Email Operations
```
GET  /api/emails                    - Get all emails (paginated)
GET  /api/emails/:id                - Get single email
GET  /api/emails/:id/preprocess     - Get preprocessing data
PUT  /api/emails/:id/star           - Toggle star status
POST /api/check-email               - Compose & detect spam
```

### Statistics
```
GET  /api/stats                     - Email counts
GET  /api/preprocess/stats          - Preprocessing statistics
GET  /api/spam-engine/stats         - Spam detection statistics
```

### Health Check
```
GET  /api/health                    - Server & DB status
```

---

## Troubleshooting

### "Connect ECONNREFUSED 127.0.0.1:27017"
**Solution**: Start MongoDB
- **Windows**: Check Services for "MongoDB Server"
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### "ENOENT: no such file or directory, open '.env'"
**Solution**: Create `.env` file with MONGODB_URI (see Step 2)

### "Email doesn't appear after refresh"
**Likely Causes**:
1. MongoDB not connected (check console)
2. Email saved but not in current folder filter (check Spam folder)
3. Browser cache issue (hard refresh: Ctrl+Shift+R)

### "Only see 17 emails, my new ones disappeared"
**Solution**: Database might have been reset
1. Verify MongoDB is running
2. Check `.env` file has correct MONGODB_URI
3. All new emails try to save to DB (check error logs)

---

## Data Backup

### Export All Emails
```bash
mongoexport --db email-spam-db --collection emails --out emails_backup.csv
```

### Backup Database
```bash
mongodump --db email-spam-db --out ./backup
```

### Restore from Backup
```bash
mongorestore --db email-spam-db ./backup/email-spam-db
```

---

## Reset to Default

### Delete All Emails (Keep Next 17 on App Restart)
```bash
mongosh
use email-spam-db
db.emails.deleteMany({})
exit
```

Then run: `npm run dev` (will re-seed 17 emails)

---

## Performance Notes

- First app run: ~2-3 seconds (seeding 17 emails)
- Subsequent runs: ~1 second (skip seeding)
- Each new email: ~500ms (spam detection + DB save)
- All operations are optimized with indexes

---

## Next Steps

1. ✅ Install MongoDB (Local or Atlas)
2. ✅ Create `.env` file
3. ✅ Run `npm run dev`
4. ✅ Compose an email and verify persistence
5. ✅ Refresh page and confirm email still there
6. 🎉 Enjoy permanent data persistence!

---

## File Structure

```
.
├── db.js                      # MongoDB connection
├── models/
│   └── Email.js              # Mongoose schema
├── seeds/
│   └── seedEmails.js         # Dataset loader
├── server.js                 # Backend (updated for DB)
├── .env                      # DB connection (create this)
├── .env.example              # Example configuration
├── MONGODB_SETUP.md          # Detailed MongoDB guide
└── README.md                 # Main documentation
```

---

## Support

- **MongoDB Docs**: https://docs.mongodb.com
- **Mongoose Docs**: https://mongoosejs.com
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Local MongoDB**: https://docs.mongodb.com/manual/administration/install-community/

---

**Your email is now persistent! 🎉** 

Store, search, and manage emails with confidence. All data saved to MongoDB!
