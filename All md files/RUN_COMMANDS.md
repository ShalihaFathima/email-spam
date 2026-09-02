# 🚀 Email Spam Detection - Run Commands Guide

## Separate Run Commands for Each Component

---

## **1. BACKEND SERVER (Node.js + Express)**

```bash
npm run server
```

- **Port:** http://localhost:3001
- **Serves:** All API endpoints
- **Includes:** Spam detection engine, email routes, ML integration
- **Connects to:** MongoDB (localhost:27017)

---

## **2. FRONTEND (React)**

```bash
npm start
```

- **Port:** http://localhost:3000
- **Features:** Development server with hot reload
- **Automatically:** Opens browser window
- **UI:** Gmail-style interface with dark theme

---

## **3. FLASK ML API SERVER (Python)**

```bash
python spam_api.py
```

- **Port:** http://localhost:5000
- **Endpoint:** `/predict` for ML predictions
- **Model:** Multinomial Naive Bayes classifier
- **Dataset:** Trained on SMS Spam Collection
- **Requires:** Python 3.7+, Flask, scikit-learn

---

## **📋 SETUP BEFORE RUNNING**

### Install Node Dependencies

```bash
npm install
```

### Install Python Dependencies (Optional - for ML server)

```bash
pip install flask scikit-learn numpy
```

### MongoDB Setup

Ensure MongoDB is running on local port 27017, or set environment variable:

**PowerShell:**
```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/email-spam-db"
```

**Command Prompt:**
```cmd
set MONGODB_URI=mongodb://localhost:27017/email-spam-db
```

**Bash/Linux/Mac:**
```bash
export MONGODB_URI="mongodb://localhost:27017/email-spam-db"
```

---

## **🔄 THREE WAYS TO RUN**

### **Option 1: Run Everything Together (Recommended)**

```bash
npm run dev
```

- Starts backend (port 3001) + frontend (port 3000) concurrently
- Uses `concurrently` package to manage both processes
- **Note:** Doesn't start Flask ML API (run separately if needed)
- Best for: Development workflow

---

### **Option 2: Run Separately (Full Control)**

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```

**Terminal 2 - Start Frontend React:**
```bash
npm start
```

**Terminal 3 - Start Flask ML API (optional):**
```bash
python spam_api.py
```

- Gives you: Independent control of each service
- Easy to: Stop/restart individual components
- Best for: Debugging and testing

---

### **Option 3: Run Individual Demo Scripts**

**Test Spam Detection Engine:**
```bash
node spamDetectionEngineDemo.js
```

**Test Bloom Filter:**
```bash
node bloomFilterDemo.js
```

**Test Full ML Integration:**
```bash
node ML_INTEGRATION_TESTING.js
```

**Check ML Model:**
```bash
node checkML.js
```

---

## **🧪 TESTING & VERIFICATION**

### React Tests

```bash
npm test
```

### Run Specific Node Script

```bash
node server.js
```

---

## **⚙️ ENVIRONMENT VARIABLES (Optional)**

Create a `.env` file in the root directory:

```
MONGODB_URI=mongodb://localhost:27017/email-spam-db
FLASK_API_URL=http://localhost:5000
NODE_ENV=development
PORT=3001
```

---

## **✅ VERIFICATION COMMANDS**

### Check Backend Health

```bash
curl http://localhost:3001/api/health
```

### Open Frontend

```
http://localhost:3000
```

### Check Flask API

```bash
curl http://localhost:5000/health
```

---

## **📊 DEFAULT PORTS**

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 3000 | http://localhost:3000 |
| Express Backend | 3001 | http://localhost:3001 |
| Flask ML API | 5000 | http://localhost:5000 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## **🔧 BUILD & PRODUCTION**

### Build React for Production

```bash
npm run build
```

Creates optimized build in `build/` folder

---

## **❌ TROUBLESHOOTING**

### MongoDB Connection Error

- Ensure MongoDB is installed and running
- Check MongoDB service status
- Verify port 27017 is not blocked

### Port Already in Use

- Check what's running on the port: `netstat -ano | findstr :3000` (Windows)
- Kill the process or use a different port

### ML API Not Working

- Ensure Python 3.7+ is installed
- Install packages: `pip install -r requirements.txt` (if file exists)
- Check Flask server logs for errors

### Node Modules Issues

- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

---

## **📝 QUICK REFERENCE**

| What to Do | Command |
|-----------|---------|
| Run everything | `npm run dev` |
| Run backend only | `npm run server` |
| Run frontend only | `npm start` |
| Run ML API only | `python spam_api.py` |
| Test spam engine | `node spamDetectionEngineDemo.js` |
| Install dependencies | `npm install` |
| Build for production | `npm run build` |
| Run tests | `npm test` |

---

## **💡 RECOMMENDED WORKFLOW**

1. **Start MongoDB** (ensure it's running)
2. **Terminal 1:** `npm run server` (backend)
3. **Terminal 2:** `npm start` (frontend)
4. **Terminal 3:** `python spam_api.py` (ML API - optional)
5. **Browser:** Navigate to `http://localhost:3000`
6. **Test:** Go to compose, write an email, click "Check for Spam"

---

**Happy coding! 🎉**
