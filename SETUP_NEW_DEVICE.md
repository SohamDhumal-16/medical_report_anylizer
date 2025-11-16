# Setup Guide for New Device

Follow this step-by-step guide to set up the Medical Report Analyzer on your new device.

---

## Part 1: Install Required Software

### 1. Install Python (3.8 or higher)
- Download from: https://www.python.org/downloads/
- **IMPORTANT:** Check "Add Python to PATH" during installation
- Verify: Open Command Prompt and run `python --version`

### 2. Install Node.js (16 or higher)
- Download from: https://nodejs.org/
- Install the LTS (Long Term Support) version
- Verify: Run `node --version` and `npm --version`

### 3. Install MongoDB
**Option A: MongoDB Community Server (Local)**
- Download from: https://www.mongodb.com/try/download/community
- During installation, install as a service so it starts automatically
- Verify: Run `mongod --version`

**Option B: MongoDB Atlas (Cloud - FREE)**
- Sign up at: https://www.mongodb.com/cloud/atlas/register
- Create a free cluster
- Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 4. Install Git
- Download from: https://git-scm.com/downloads
- Verify: Run `git --version`

---

## Part 2: Clone the Project from GitHub

### 1. First, push your code to GitHub (on current device)

Open Command Prompt and run:

```bash
cd "c:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer"
git remote add origin https://github.com/YOUR_USERNAME/medical-report-analyzer.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

### 2. On your NEW device, clone the repository

```bash
cd Desktop
git clone https://github.com/YOUR_USERNAME/medical-report-analyzer.git
cd medical-report-analyzer
```

---

## Part 3: Backend Setup

### 1. Create Python Virtual Environment

```bash
cd medical-report-analyzer
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` at the beginning of your command prompt.

### 3. Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

This will install:
- FastAPI
- MongoDB driver
- EasyOCR (for text extraction)
- Google Generative AI (Gemini)
- And other dependencies

**Note:** First installation may take 5-10 minutes as it downloads OCR models and libraries.

### 4. Create Backend `.env` File

Create a file `backend/.env` with the following content:

```env
# Google Gemini API Key (FREE - Get from: https://makersuite.google.com/app/apikey)
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE

# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017
# OR if using MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

# JWT Secret (change to any random string)
JWT_SECRET=your-random-secret-key-change-this

# Google OAuth (Optional - for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:** Replace the placeholder values with your actual keys!

---

## Part 4: Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Node Dependencies

```bash
npm install
```

This will install:
- React
- Vite
- Tailwind CSS
- Lucide React (icons)
- Axios
- And other dependencies

### 3. Create Frontend `.env` File

Create a file `frontend/.env` with:

```env
VITE_API_URL=http://localhost:8000
```

---

## Part 5: Get Your API Keys

### 1. Google Gemini API Key (FREE - REQUIRED)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `backend/.env` as `GOOGLE_API_KEY`

**Free Tier:**
- 1,500 requests per day
- No credit card required
- Perfect for development

### 2. MongoDB Setup (if using local MongoDB)

If you installed MongoDB locally, make sure it's running:

**Windows:**
```bash
net start MongoDB
```

**Check if it's running:**
- Open browser and go to: http://localhost:27017
- You should see: "It looks like you are trying to access MongoDB over HTTP..."

---

## Part 6: Run the Application

### Method 1: Using START_ALL.bat (Easiest - Windows only)

```bash
cd medical-report-analyzer
START_ALL.bat
```

This will automatically start both backend and frontend!

### Method 2: Manual Start (Works on all platforms)

**Terminal 1 - Backend:**
```bash
cd medical-report-analyzer
venv\Scripts\activate
uvicorn backend.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd medical-report-analyzer\frontend
npm run dev
```

---

## Part 7: Access the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## Quick Checklist

- [ ] Python installed and in PATH
- [ ] Node.js installed
- [ ] MongoDB installed/running OR MongoDB Atlas account created
- [ ] Git installed
- [ ] Project cloned from GitHub
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed (`pip install -r backend/requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `backend/.env` file created with API keys
- [ ] `frontend/.env` file created
- [ ] Google Gemini API key obtained
- [ ] MongoDB running
- [ ] Backend server started
- [ ] Frontend server started

---

## Troubleshooting

### Issue: "Python not found"
**Solution:** Reinstall Python and check "Add Python to PATH"

### Issue: "MongoDB connection failed"
**Solution:**
- Check if MongoDB service is running: `net start MongoDB`
- Verify connection string in `backend/.env`

### Issue: "Module not found" errors
**Solution:**
- Make sure virtual environment is activated: `venv\Scripts\activate`
- Reinstall dependencies: `pip install -r backend/requirements.txt`

### Issue: Frontend won't start
**Solution:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Issue: "Port already in use"
**Solution:**
- Backend (8000): Close any other app using port 8000
- Frontend (5173): Close any other Vite/React app
- Or change ports in the config files

---

## Important Notes

### What NOT to Push to GitHub:
- `venv/` folder (too large, will be recreated on new device)
- `node_modules/` folder (too large, will be recreated on new device)
- `.env` files (contains secret keys - NEVER push this!)
- `__pycache__/` folders (auto-generated Python cache)

These are already in `.gitignore` so they won't be pushed.

### What TO Keep:
- All `.py` files
- All `.jsx` and `.js` files
- `requirements.txt` (Python dependencies list)
- `package.json` (Node dependencies list)
- `.env.example` files (templates)
- All documentation files

---

## Need Help?

If you get stuck:
1. Check the error message carefully
2. Make sure all prerequisites are installed
3. Verify your `.env` files have correct values
4. Check that MongoDB is running
5. Ensure virtual environment is activated (you should see `(venv)` in command prompt)

---

**Created by Claude Code** 🤖
