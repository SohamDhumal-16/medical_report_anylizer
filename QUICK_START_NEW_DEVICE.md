# Quick Start Guide - Project Already Downloaded

You already have the project files on your new device. Follow these steps to get it running.

---

## ✅ Prerequisites Check

Make sure you have these installed:

1. **Python 3.8+** → https://www.python.org/downloads/
2. **Node.js 16+** → https://nodejs.org/
3. **MongoDB** → https://www.mongodb.com/try/download/community
4. **Git** (optional) → https://git-scm.com/downloads

Verify installations:
```bash
python --version
node --version
npm --version
mongod --version
```

---

## 🚀 5-Step Setup (15-20 minutes)

### Step 1: Backend Setup (5-10 minutes)

Open terminal in project folder:

```bash
# Navigate to project
cd medical_report_anylizer

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# You should see (venv) in terminal now

# Install dependencies (takes 5-10 minutes first time)
pip install -r backend/requirements.txt
```

**Wait for installation to complete** - downloads ~1-2GB of packages including OCR models.

---

### Step 2: Frontend Setup (2-5 minutes)

Open a **NEW terminal** window:

```bash
# Navigate to frontend folder
cd medical_report_anylizer/frontend

# Install dependencies (takes 2-5 minutes)
npm install
```

---

### Step 3: MongoDB Setup

**Option A: If MongoDB is installed locally**

```bash
# Windows - Start MongoDB
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: Use MongoDB Atlas (Cloud - FREE)**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/`)

---

### Step 4: Get Google Gemini API Key (2 minutes - FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

**FREE Tier:**
- 1,500 requests per day
- No credit card required
- Perfect for development

---

### Step 5: Create Environment Files

#### Create `backend/.env` file:

```env
# Paste your Gemini API key here
GOOGLE_API_KEY=AIza-paste-your-key-here

# If using local MongoDB:
MONGODB_URL=mongodb://localhost:27017

# OR if using MongoDB Atlas (cloud):
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

# JWT Secret (any random string)
JWT_SECRET=my-super-secret-key-change-this-12345
```

#### Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Run the Application

### Option 1: Easy Way (Windows Only)

```bash
# From project root folder
START_ALL.bat
```

This starts both backend and frontend automatically!

---

### Option 2: Manual Way (All Platforms)

**Terminal 1 - Start Backend:**

```bash
# Go to project root
cd medical_report_anylizer

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Start backend server
uvicorn backend.main:app --reload

# Should see: Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Start Frontend:**

```bash
# Go to frontend folder
cd medical_report_anylizer/frontend

# Start frontend server
npm run dev

# Should see: Local: http://localhost:5173/
```

---

## 🌐 Access the Application

Once both servers are running:

- **Application:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## �� Test It Out

1. Open http://localhost:5173
2. Click "Sign Up" and create an account
3. Login with your credentials
4. Upload a sample medical report (PDF or image)
5. View the AI analysis
6. Upload another report
7. Go to "Compare" to see health trends

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Python not found"
**Fix:** Reinstall Python and check "Add Python to PATH"

### Issue: "MongoDB connection failed"
**Fix:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Check it's running by opening browser:
# http://localhost:27017
```

### Issue: "Module not found"
**Fix:**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r backend/requirements.txt
```

### Issue: "Port already in use"
**Fix:**
```bash
# Kill process on port 8000 (backend)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill
```

### Issue: "Gemini API error"
**Fix:**
- Check `backend/.env` has correct API key
- Key should start with `AIza`
- No spaces before/after the key
- Get new key: https://makersuite.google.com/app/apikey

---

## 📋 Quick Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] MongoDB running (or Atlas connection ready)
- [ ] Virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `backend/.env` file created with Gemini API key
- [ ] `frontend/.env` file created
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173

---

## 💡 Tips for Using Claude Code

Once you have the project running, you can ask me:

- **"Explain how the AI analysis works"**
- **"Help me add a new feature"**
- **"What does this error mean?"**
- **"How do I modify the comparison page?"**
- **"Show me how to add a new API endpoint"**

I have full context of:
- ✅ All your code
- ✅ The AI models being used (Gemini)
- ✅ Database structure (MongoDB)
- ✅ Features implemented
- ✅ Previous development work

---

## 📚 Need More Details?

- **CLAUDE_CODE_GUIDE.md** - Complete technical reference with AI models, architecture, data flow
- **SETUP_NEW_DEVICE.md** - Detailed installation guide
- **README.md** - Project overview

---

## 🔑 What You Need to Get:

1. **Google Gemini API Key** (FREE)
   - https://makersuite.google.com/app/apikey
   - Takes 2 minutes
   - No credit card

2. **MongoDB** (Choose one)
   - Install locally: https://www.mongodb.com/try/download/community
   - OR use Atlas cloud: https://www.mongodb.com/cloud/atlas/register

That's it! Just these two things and you're ready to go.

---

## ⏱️ Time Estimate

- **Backend setup:** 5-10 minutes
- **Frontend setup:** 2-5 minutes
- **MongoDB setup:** 2-5 minutes
- **Get API key:** 2 minutes
- **Create .env files:** 2 minutes

**Total:** ~15-20 minutes

---

## 🆘 Need Help?

Just ask me (Claude Code):
- "I'm stuck on step X"
- "This error appeared: [paste error]"
- "How do I install MongoDB?"
- "My API key isn't working"

I'm here to help! 🚀

---

**Last Updated:** 2025-11-16

**Generated with Claude Code** 🤖
