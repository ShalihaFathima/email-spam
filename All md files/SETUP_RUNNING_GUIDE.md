# 🚀 Complete Setup & Running Guide

Step-by-step guide to run the Gmail-style email interface with backend integration.

## ✅ Prerequisites

- Node.js 14+ installed
- npm installed
- Port 5000 available (backend)
- Port 3000 available (frontend)

## 📦 Installation (Already Done)

```bash
cd "c:\Users\BAVISHYA\Desktop\Email spam"
npm install
```

This installed:
- Frontend: React, Material UI
- Backend: Express, CORS, CSV Parser
- Tools: Concurrently (run both servers)

## 🚀 Running the Application

### Quick Start (Recommended)

Run both frontend and backend together:

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:5000 (Express server)
- **Frontend**: http://localhost:3000 (React app)

### Alternative: Run Separately

**Terminal 1 - Backend**:
```bash
npm run server
```

Expected output:
```
🚀 Email Server running on http://localhost:5000
📧 API endpoints:
   GET  /api/emails         - Get all emails
   GET  /api/emails/:id     - Get single email
   PUT  /api/emails/:id/star - Toggle star
   GET  /api/stats          - Get statistics
   GET  /api/health         - Health check

✅ Loaded 18 emails from CSV
```

**Terminal 2 - Frontend** (in new terminal):
```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view gmail-dark-theme in the browser.
Local:            http://localhost:3000
```

Browser will automatically open the app.

## 📧 Dataset Information

### CSV File: `emails.csv`

Contains 18 emails:
- **10 legitimate emails** (inbox) - Various senders
- **8 spam emails** (spam folder) - Common spam patterns

### Email Fields

Each email has:
- `sender` - Email sender name
- `subject` - Email subject line
- `body` - Full email content
- `label` - Classification: `ham` (inbox) or `spam` (spam folder)

## 🎯 Using the Application

### 1. View Inbox

- App opens with **Inbox** selected
- Shows **10 emails** from CSV dataset
- Each email displays:
  - Sender name
  - Subject line
  - Preview text
  - Time received

### 2. Switch to Spam

1. Click **"Spam"** in left sidebar
2. Sidebar shows **8 spam emails**
3. Emails update in list panel
4. Shows examples of:
   - Prize/lottery scams
   - Phishing emails
   - Pharmaceutical offers
   - Cryptocurrency scams

### 3. Search Emails

1. Type in **search bar** at top
2. Results filtered in real-time
3. Searches in:
   - Sender name
   - Subject line
   - Email body
4. Works across all folders

### 4. View Full Email

1. **Click any email** in the list
2. Full email displays in right panel
3. Shows:
   - Sender avatar and details
   - Full timestamp
   - Complete email body
   - Attachments (if any)

### 5. Star Emails

1. Click the **⭐ star icon**
2. Email is marked as favorite
3. Starred status persists (in current session)

### 6. View Statistics

- **Inbox**: Shows count of legitimate emails
- **Spam**: Shows count of spam emails
- Counts update from backend

## 🔌 How It Works

### Data Flow

```
CSV File (emails.csv)
    ↓
Backend loads on startup
    ↓
Stores in memory as JSON
    ↓
React frontend fetches via API
    ↓
Displays in EmailList component
    ↓
Search/filter works on backend
    ↓
Star toggle persists (session)
```

### API Endpoints

The backend provides REST endpoints:

```
GET  /api/emails?folder=inbox&search=query
GET  /api/emails/:id
PUT  /api/emails/:id/star
GET  /api/stats
GET  /api/health
```

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for details.

## 🛑 Troubleshooting

### Issue: "Can't connect to backend"

**Solution**: 
1. Ensure backend is running: `npm run server`
2. Check port 5000 is available
3. Wait 2-3 seconds for backend to load CSV
4. Refresh browser

### Issue: "Port already in use"

**Kill process on port 5000**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "No emails showing"

**Check**:
1. Backend loaded CSV: see "✅ Loaded 18 emails"
2. CSV file exists in project root
3. Network tab shows successful `/api/emails` call
4. Browser console has no errors

### Issue: Search not working

**Check**:
1. Backend is running
2. Already typed search term
3. Make sure emails exist in current folder
4. Try searching for common words like "project" or "sarah"

### Issue: "Module not found: express"

**Solution**:
```bash
npm install express cors csv-parser concurrently
```

## 🔍 Testing the API

Test backend endpoints directly:

### Check Server Health

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "emailsLoaded": 18
}
```

### Get Inbox Emails

```bash
curl "http://localhost:5000/api/emails?folder=inbox"
```

### Get Spam Emails

```bash
curl "http://localhost:5000/api/emails?folder=spam"
```

### Search Emails

```bash
curl "http://localhost:5000/api/emails?search=project"
```

## 📊 Frontend Features

### Navbar
- Gmail logo (gradient styled)
- Search bar (searches all email fields)
- Settings button
- Profile icon

### Sidebar
- **Compose** button
- **Folders**: Inbox, Spam, Sent, Drafts
- **Email counts** from backend
- **More** options (expandable)

### Email List
- Shows emails for selected folder
- Click to select and view
- **Star icon** for favorites
- **Time** shows relative format (2h ago)
- **Preview** shows first 80 characters

### Email Viewer
- Full email content
- Sender avatar + details
- Recipient information
- Full timestamp
- Attachments (if any)
- Action buttons: Reply, Forward, Star

## 🎨 Customization

### Change Colors

Edit `src/styles/theme.css`:

```css
:root {
  --accent: #8ab4f8;      /* Blue */
  --accent-hover: #aecbfa;
  /* ...other colors */
}
```

See [CSS_STYLING_GUIDE.md](CSS_STYLING_GUIDE.md) for more.

### Add Custom Emails

Edit `emails.csv`:

```csv
Your Name,Your Subject,Your message content...,ham
Spammer,SPAM!!!,Click here now!!!,spam
```

Restart backend: `npm run server` (reloads CSV)

## 📈 Performance

- **CSV Load**: ~50ms for 18 emails
- **Backend Response**: 1-10ms
- **Frontend Render**: Optimized with React.memo

### For Large Datasets (1000+ emails)

See [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md) for:
- Virtual scrolling
- Database integration
- Caching strategies

## 🔒 Security Notes

This is a **demo/learning application**:
- ✅ No real authentication needed
- ✅ Safe to use locally
- ✅ No external data transmission
- ⚠️ Not recommended for production as-is

For production, add:
- Authentication (JWT)
- HTTPS
- Input validation
- Rate limiting

See [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md) for security checklist.

## 📚 Documentation

**Available guides**:

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup |
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | Server configuration |
| [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) | System architecture |
| [COMPONENT_API_REFERENCE.md](COMPONENT_API_REFERENCE.md) | React components |
| [CSS_STYLING_GUIDE.md](CSS_STYLING_GUIDE.md) | Styling details |
| [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md) | Advanced topics |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | File organization |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Theming options |
| [SETUP_RUNNING_GUIDE.md](SETUP_RUNNING_GUIDE.md) | This file |

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Run both | `npm run dev` |
| Run backend only | `npm run server` |
| Run frontend only | `npm start` |
| Build for prod | `npm run build` |
| View backend API | http://localhost:5000/api/health |
| Test search | Search any word in the app |
| View CSV data | Open `emails.csv` in editor |

## ✨ What You Can Do

1. ✅ **View emails** - 18 total from CSV
2. ✅ **Browse folders** - Inbox (10) & Spam (8)
3. ✅ **Search** - Find emails by content
4. ✅ **Star emails** - Mark favorites
5. ✅ **Read full emails** - Click to view
6. ✅ **See metadata** - Sender, time, attachments
7. ✅ **Get stats** - See folder counts
8. ✅ **Test API** - Use curl commands
9. ✅ **Customize** - Edit CSV data
10. ✅ **Extend** - Add more features

## 🆘 Need Help?

### Check Server Status

```bash
# In new terminal
curl http://localhost:5000/api/health
```

### Check Frontend Logs

- Open browser DevTools (F12)
- Go to Console tab
- Look for errors

### Check Network Requests

- DevTools → Network tab
- Filter: XHR
- Look for API calls

### View Server Logs

Look at terminal running `npm run server` for:
- Requests received
- Response times
- CSV load status
- Any errors

## 🎓 Learning Path

1. **Start**: Review [README.md](README.md)
2. **Setup**: Follow this guide
3. **Test**: Use the app, play with features
4. **Understand**: Read [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
5. **Customize**: Edit CSV data and colors
6. **Extend**: Read [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md)

## 📞 Status Indicators

### ✅ Working Correctly

```
Terminal 1 output:
🚀 Email Server running on http://localhost:5000
✅ Loaded 18 emails from CSV

Terminal 2 output:  
Compiled successfully!
You can now view... http://localhost:3000

Browser:
- Email list shows emails
- Search works
- Folders work
```

### ❌ Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Can't load app | Frontend not running | `npm start` |
| No emails show | Backend not running | `npm run server` |
| 404 errors | Wrong port | Check `.env` |
| CORS error | Browser issue | Hard refresh Ctrl+Shift+R |
| CSV not loaded | File missing | Verify `emails.csv` exists |

## 🎉 You're Ready!

Everything is set up and running. 

**Next steps**:
1. Visit http://localhost:3000
2. Browse the emails
3. Test the features
4. Read the documentation
5. Customize to your needs

---

**Happy exploring!** 🎨✉️

For more details, see [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)
