# MongoDB Commands Reference

Complete guide to MongoDB operations for your email spam filter system.

---

## 🚀 **Getting Started**

### **Open MongoDB Shell**
```bash
mongosh
```

You will see: `test> `

This means you're connected to MongoDB.

---

## **ESSENTIAL COMMANDS** (Use These First!)

### **1. Connect to Your Database**
```bash
use email-spam-db
```

**Response:** `switched to db email-spam-db`

You're now working with your email database.

---

### **2. Check if 17 Emails are Loaded**
```bash
db.emails.countDocuments({isDefault: true})
```

**Expected Result:** `17`

If you see `17` → ✅ Dataset loaded successfully!

---

### **3. Count Total Emails**
```bash
db.emails.countDocuments()
```

**Shows total count:**
- After first run: `17`
- After composing 3 emails: `20`
- Keeps growing as you add emails ✅

---

### **4. View All Collections**
```bash
show collections
```

**You should see:**
```
emails
```

This is your collection where all emails are stored.

---

### **5. Exit MongoDB**
```bash
exit
```

---

## **VIEW EMAILS** (See What's Stored)

### **View All Emails (Pretty Format)**
```bash
db.emails.find().pretty()
```

Shows all emails with nice formatting. Output:
```json
[
  {
    _id: ObjectId("..."),
    sender: "John Doe",
    subject: "Check this opportunity",
    engineSpamScore: 7,
    isDefault: true,
    folder: "spam",
    ...
  },
  ...
]
```

---

### **View Latest 5 Emails (Most Recent First)**
```bash
db.emails.find().sort({timestamp: -1}).limit(5).pretty()
```

Shows the 5 newest emails.

---

### **View Only First Email**
```bash
db.emails.findOne()
```

Shows just one email (useful for checking structure).

---

### **View Email by Sender**
```bash
db.emails.findOne({sender: "John Doe"})
```

Replace "John Doe" with actual sender name.

---

## **FILTER EMAILS** (Find Specific Emails)

### **View All SPAM Emails Only**
```bash
db.emails.find({label: "spam"}).pretty()
```

Shows only emails classified as spam.

---

### **View All INBOX Emails Only (Ham)**
```bash
db.emails.find({label: "ham"}).pretty()
```

Shows only legitimate emails.

---

### **View Only Dataset Emails (Original 17)**
```bash
db.emails.find({isDefault: true}).pretty()
```

Shows the 17 original emails loaded from CSV.

---

### **View Only Your New Emails (User-Composed)**
```bash
db.emails.find({isDefault: false}).pretty()
```

Shows only emails you composed in the app.

---

### **View Emails from Specific Folder**
```bash
db.emails.find({folder: "inbox"}).pretty()
```

Options: `"inbox"`, `"spam"`, `"sent"`, `"drafts"`

---

## **COUNT EMAILS** (Statistics)

### **Total Email Count**
```bash
db.emails.countDocuments()
```

Returns: Total number

---

### **Count SPAM Emails**
```bash
db.emails.countDocuments({label: "spam"})
```

Shows how many spam emails exist.

---

### **Count INBOX Emails**
```bash
db.emails.countDocuments({label: "ham"})
```

Shows how many legitimate emails exist.

---

### **Count Dataset Emails**
```bash
db.emails.countDocuments({isDefault: true})
```

Should always be **17**

---

### **Count User-Composed Emails**
```bash
db.emails.countDocuments({isDefault: false})
```

Shows emails you created in the app.

---

### **Count Starred Emails**
```bash
db.emails.countDocuments({isStarred: true})
```

Shows how many starred emails.

---

## **SEARCH EMAILS** (Find by Content)

### **Find Email by Subject (Exact Match)**
```bash
db.emails.findOne({subject: "buy now"})
```

---

### **Find Emails by Subject (Contains Text)**
```bash
db.emails.find({subject: {$regex: "free", $options: "i"}}).pretty()
```

This searches for "free" in subject (case-insensitive).

---

### **Find Emails by Sender**
```bash
db.emails.find({sender: {$regex: "amazon", $options: "i"}}).pretty()
```

Searches for "amazon" in sender field.

---

### **Find High Spam Score Emails (Score >= 5)**
```bash
db.emails.find({engineSpamScore: {$gte: 5}}).pretty()
```

Shows emails with spam score 5 or higher.

---

### **Find Low Spam Score Emails (Score <= 2)**
```bash
db.emails.find({engineSpamScore: {$lte: 2}}).pretty()
```

Shows emails with spam score 2 or lower.

---

## **DELETE EMAILS** (Remove Data)

### ⚠️ **Delete ALL Emails (CAREFUL!)**
```bash
db.emails.deleteMany({})
```

**This deletes everything!**

**What happens next:**
- On next app restart: 17 emails will be re-seeded automatically
- Good for: Testing/Reset only

---

### **Delete All SPAM Emails Only**
```bash
db.emails.deleteMany({label: "spam"})
```

Removes only spam folder emails.

---

### **Delete All User-Composed Emails**
```bash
db.emails.deleteMany({isDefault: false})
```

Removes only your new emails, keeps original 17.

---

### **Delete One Specific Email by ID**
```bash
db.emails.deleteOne({_id: ObjectId("...")})
```

Replace `...` with actual email ID from `_id` field.

---

## **UPDATE EMAILS** (Modify Data)

### **Star an Email**
```bash
db.emails.updateOne({sender: "John"}, {$set: {isStarred: true}})
```

Marks email as starred.

---

### **Unstar an Email**
```bash
db.emails.updateOne({sender: "John"}, {$set: {isStarred: false}})
```

Removes star from email.

---

### **Update Email Folder**
```bash
db.emails.updateOne({_id: ObjectId("...")}, {$set: {folder: "spam"}})
```

Moves email to specified folder.

---

## **DATABASE MANAGEMENT** (Admin Tasks)

### **Show All Databases**
```bash
show databases
```

Lists all databases. You should see `email-spam-db` here.

---

### **Show Current Database**
```bash
db
```

Shows which database you're in.

---

### **Get DATABASE Statistics**
```bash
db.stats()
```

Shows database size, number of collections, etc.

---

### **Get COLLECTION Statistics**
```bash
db.emails.stats()
```

Shows emails collection info (size, count, indexes, etc.).

---

### **List All Indexes**
```bash
db.emails.getIndexes()
```

Shows all indexes on emails collection (used for performance).

---

## **EXPORT/BACKUP**

### **Export Emails to CSV (In Terminal, NOT MongoDB Shell)**

First exit MongoDB:
```bash
exit
```

Then in terminal:
```bash
mongoexport --db email-spam-db --collection emails --out my_emails.csv
```

Creates file: `my_emails.csv` with all emails.

---

### **Export Only Spam Emails**
```bash
mongoexport --db email-spam-db --collection emails --query '{"label":"spam"}' --out spam_emails.csv
```

---

### **Backup Entire Database (In Terminal)**
```bash
mongodump --db email-spam-db --out ./backup
```

Creates folder `backup/` with database backup.

---

### **Restore from Backup (In Terminal)**
```bash
mongorestore --db email-spam-db ./backup/email-spam-db
```

Restores database from backup.

---

## **ADVANCED QUERIES**

### **Count Emails by Classification**
```bash
db.emails.aggregate([
  {$group: {_id: "$engineClassification", count: {$sum: 1}}}
])
```

Shows breakdown:
```
spam: 4
normal: 15
```

---

### **Count Emails by Sender**
```bash
db.emails.aggregate([
  {$group: {_id: "$sender", count: {$sum: 1}}},
  {$sort: {count: -1}}
])
```

Shows which senders sent the most emails.

---

### **Get Average Spam Score**
```bash
db.emails.aggregate([
  {$group: {_id: null, avgScore: {$avg: "$engineSpamScore"}}}
])
```

Shows average spam score across all emails.

---

### **Top 5 Most Common Detected Words**
```bash
db.emails.aggregate([
  {$unwind: "$engineDetectedWords"},
  {$group: {_id: "$engineDetectedWords", count: {$sum: 1}}},
  {$sort: {count: -1}},
  {$limit: 5}
])
```

---

## **PRACTICAL EXAMPLES**

### **Example 1: Find All Phishing Attempts (High Spam Score + Contains "click")**
```bash
db.emails.find({
  engineSpamScore: {$gte: 7},
  content: {$regex: "click", $options: "i"}
}).pretty()
```

---

### **Example 2: Find Emails from Past 24 Hours**
```bash
db.emails.find({
  timestamp: {$gte: new Date(new Date().getTime() - 24*60*60*1000)}
}).pretty()
```

---

### **Example 3: Find Emails with Low Confidence**
```bash
db.emails.find({
  engineConfidence: {$lt: 50}
}).pretty()
```

Shows emails the system was unsure about.

---

### **Example 4: Find All Starred Entries from Last 7 Days**
```bash
db.emails.find({
  isStarred: true,
  timestamp: {$gte: new Date(new Date().getTime() - 7*24*60*60*1000)}
}).pretty()
```

---

## **TROUBLESHOOTING**

### **Error: "not connected to a database"**
```
Solution: Type: use email-spam-db
```

---

### **Error: "doesn't have a collection"**
```
Solution: The collection doesn't exist yet
Wait for app to run first and seed emails
```

---

### **Can't connect to mongosh**
```
Solution: MongoDB service not running
1. Press Windows Key + R
2. Type: services.msc
3. Find "MongoDB Server"
4. Right-click → Start
```

---

### **Query returns no results**
```
Solutions:
1. Make sure you're in correct database: use email-spam-db
2. Check spelling of field names (case-sensitive)
3. Use findOne() to see what data actually exists
```

---

## **QUICK REFERENCE** (Copy-Paste These)

```bash
# Open MongoDB
mongosh

# Switch to database
use email-spam-db

# Check if setup works (should show 17)
db.emails.countDocuments({isDefault: true})

# View all emails
db.emails.find().pretty()

# Count total
db.emails.countDocuments()

# View spam only
db.emails.find({label: "spam"}).pretty()

# View inbox only
db.emails.find({label: "ham"}).pretty()

# Delete all (for reset)
db.emails.deleteMany({})

# Exit
exit
```

---

## **CHEAT SHEET**

| Task | Command |
|------|---------|
| Open MongoDB | `mongosh` |
| Switch DB | `use email-spam-db` |
| View all | `db.emails.find().pretty()` |
| Count total | `db.emails.countDocuments()` |
| Count dataset | `db.emails.countDocuments({isDefault: true})` |
| Count new | `db.emails.countDocuments({isDefault: false})` |
| View spam | `db.emails.find({label: "spam"}).pretty()` |
| View inbox | `db.emails.find({label: "ham"}).pretty()` |
| Reset DB | `db.emails.deleteMany({})` |
| Exit | `exit` |

---

## **NEXT STEPS**

1. ✅ Open MongoDB: `mongosh`
2. ✅ Connect to database: `use email-spam-db`
3. ✅ Check if 17 emails loaded: `db.emails.countDocuments({isDefault: true})`
4. ✅ View them: `db.emails.find().pretty()`
5. ✅ Exit: `exit`

**Enjoy exploring your database!** 🎉
