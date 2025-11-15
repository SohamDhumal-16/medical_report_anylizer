# How to Run the Medical Report Analyzer Project

This guide provides complete step-by-step instructions to set up and run the Medical Report Analyzer application on your local machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Optional: Google OAuth Setup](#optional-google-oauth-setup)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software:
1. **Python 3.10 or higher**
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version`

2. **Node.js 16.x or higher** (includes npm)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

3. **MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Verify installation: `mongod --version`

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/downloads

---

## Initial Setup

### Step 1: Download the Project
If you haven't already, download or clone the project to your computer:
```bash
cd "C:\Users\soham\OneDrive\Desktop\report anylisis"
```

### Step 2: Verify Project Structure
Your project should have this structure:
```
medical_report_analyzer/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/
│   ├── services/
│   ├── models/
│   └── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
└── venv/
```

---

## Database Setup

### Step 1: Start MongoDB Service

**On Windows:**
1. Open **Services** (search in Start menu)
2. Find **MongoDB Server**
3. Right-click and select **Start**

OR use Command Prompt (as Administrator):
```cmd
net start MongoDB
```

### Step 2: Verify MongoDB is Running
Open Command Prompt and run:
```cmd
mongosh
```
You should see the MongoDB shell. Type `exit` to quit.

**Default Connection:** `mongodb://localhost:27017`

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```cmd
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\backend"
```

### Step 2: Activate Virtual Environment
```cmd
cd ..
venv\Scripts\activate
```
You should see `(venv)` prefix in your command prompt.

### Step 3: Install Python Dependencies
```cmd
cd backend
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- PyMongo (MongoDB driver)
- EasyOCR (text extraction)
- Google Auth (OAuth support)
- And other dependencies

**Installation time:** 2-5 minutes depending on your internet speed.

### Step 4: Create Environment File (Optional)
Create a `.env` file in the `backend/` directory:
```cmd
copy .env.example .env
```

Edit `.env` file with your configurations:
```env
MONGODB_URL=mongodb://localhost:27017
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secret-key-change-this
```

**Note:** Google OAuth is optional. Skip GOOGLE_CLIENT_ID if not using it.

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
Open a **NEW Command Prompt** window:
```cmd
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\frontend"
```

### Step 2: Install Node Dependencies
```cmd
npm install
```

This will install:
- React (UI framework)
- Vite (build tool)
- Axios (HTTP client)
- React Router (navigation)
- Tailwind CSS (styling)
- And other dependencies

**Installation time:** 1-3 minutes depending on your internet speed.

---

## Running the Application

You need to run **both** backend and frontend servers simultaneously.

### Option 1: Using Two Command Prompt Windows (Recommended)

#### Window 1 - Backend Server:
```cmd
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\backend"
..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Backend URL:** http://127.0.0.1:8000

#### Window 2 - Frontend Server:
```cmd
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\frontend"
npm run dev
```

**Expected Output:**
```
VITE v7.1.12  ready in 1546 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend URL:** http://localhost:5173

### Option 2: Using Batch Script

Create a file named `start_servers.bat` in the project root:
```batch
@echo off
echo Starting Medical Report Analyzer...

echo Starting Backend Server...
start cmd /k "cd /d "%~dp0backend" && ..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 5 /nobreak

echo Starting Frontend Server...
start cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
```

Double-click `start_servers.bat` to run both servers.

---

## Accessing the Application

### Step 1: Open Your Browser
Navigate to: **http://localhost:5173**

### Step 2: Create an Account
1. Click **"Sign up"** on the login page
2. Fill in:
   - Full Name
   - Email
   - Password (minimum 6 characters)
3. Click **"Create Account"**
4. You'll be redirected to the login page

### Step 3: Login
1. Enter your email and password
2. Click **"Sign In"**
3. You'll be redirected to the Dashboard

### Step 4: Start Using the Application
- **Upload Report**: Click "Upload Report" to analyze medical reports
- **View Reports**: See all your uploaded reports
- **Compare Reports**: Compare two reports to track changes
- **Profile**: Update your profile information
- **Logout**: Click your name in the navbar

---

## Troubleshooting

### Backend Issues

#### Error: "No module named 'fastapi'"
**Solution:** Install dependencies:
```cmd
cd backend
pip install -r requirements.txt
```

#### Error: "Address already in use"
**Solution:** Port 8000 is occupied. Kill the process:
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

#### Error: "MongoDB connection failed"
**Solution:** Ensure MongoDB is running:
```cmd
net start MongoDB
```

#### Error: "ImportError: Optional not defined"
**Solution:** This should be fixed. If it occurs, check that `from typing import Optional` is in `backend/routers/auth.py`

### Frontend Issues

#### Error: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

#### Error: "Module not found"
**Solution:** Install dependencies:
```cmd
cd frontend
npm install
```

#### Error: "Port 5173 is already in use"
**Solution:** Kill the process:
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

#### Blank page or errors in browser
**Solution:**
1. Check browser console (F12 → Console tab)
2. Ensure backend is running on port 8000
3. Clear browser cache (Ctrl+Shift+Delete)

### Database Issues

#### Error: "Connection refused" or "MongoDB not found"
**Solutions:**
1. Check MongoDB service is running:
   ```cmd
   net start MongoDB
   ```
2. Verify MongoDB installation:
   ```cmd
   mongosh
   ```
3. Check connection string in `.env` file

### General Issues

#### "Servers start but can't access website"
**Solutions:**
1. Wait 10-15 seconds after starting servers
2. Try accessing http://localhost:5173 instead of http://127.0.0.1:5173
3. Check firewall settings - allow Node.js and Python

#### "Reports not uploading"
**Solutions:**
1. Check file size (max 10MB recommended)
2. Ensure file is PDF format
3. Check backend logs for errors
4. Verify `uploads/` folder exists in backend directory

---

## Optional: Google OAuth Setup

To enable "Sign in with Google" functionality:

### Step 1: Get Google Client ID
1. Follow the detailed guide in `GOOGLE_OAUTH_SETUP.md`
2. Visit https://console.cloud.google.com/
3. Create OAuth 2.0 credentials
4. Copy your Client ID

### Step 2: Configure Backend
Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

### Step 3: Configure Frontend
1. Open `frontend/src/pages/Login.jsx`
2. Line 31: Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`

3. Open `frontend/src/pages/Signup.jsx`
4. Line 36: Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`

### Step 4: Restart Servers
Stop both servers (Ctrl+C) and start them again.

---

## Stopping the Application

### Stop Backend:
Press **Ctrl+C** in the backend command prompt window

### Stop Frontend:
Press **Ctrl+C** in the frontend command prompt window

### Stop MongoDB (if needed):
```cmd
net stop MongoDB
```

---

## Quick Reference Commands

### Start Everything:
```cmd
# Terminal 1 - Backend
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\backend"
..\venv\Scripts\python.exe -m uvicorn main:app --reload

# Terminal 2 - Frontend
cd "C:\Users\soham\OneDrive\Desktop\report anylisis\medical_report_analyzer\frontend"
npm run dev
```

### Check if servers are running:
```cmd
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

### View backend API documentation:
Visit: http://127.0.0.1:8000/docs

---

## Features Overview

### Authentication
- Email/Password registration and login
- Google OAuth login (optional)
- Secure JWT token authentication
- Password change functionality

### Profile Management
- Update full name
- Add phone number
- Set date of birth
- Select gender
- Write bio/description

### Report Analysis
- Upload PDF medical reports
- AI-powered text extraction (OCR)
- Extract 150+ medical parameters
- Support multiple report formats
- Store reports in database

### Report Comparison
- Compare two reports
- Track parameter changes
- Calculate health score (0-100)
- View category-wise analysis
- Identify critical changes
- Get AI-generated insights

---

## Support

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review backend logs in the terminal
3. Check browser console (F12) for frontend errors
4. Verify all prerequisites are installed correctly
5. Ensure MongoDB service is running

---

## System Requirements

### Minimum:
- OS: Windows 10, macOS 10.14, or Linux
- RAM: 4GB
- Storage: 2GB free space
- Internet: Required for initial setup

### Recommended:
- OS: Windows 11, macOS 12, or Ubuntu 20.04+
- RAM: 8GB or more
- Storage: 5GB free space
- Internet: Stable connection

---

## File Locations

- **Backend Code:** `backend/`
- **Frontend Code:** `frontend/`
- **Python Virtual Environment:** `venv/`
- **Uploaded Reports:** `backend/uploads/`
- **Database:** MongoDB (separate installation)
- **Logs:** Console output in terminal windows

---

## Next Steps

After successfully running the application:

1. **Test Upload Feature**: Upload a sample medical report
2. **Explore Dashboard**: View your uploaded reports
3. **Try Comparison**: Upload a second report and compare
4. **Update Profile**: Add your personal information
5. **Optional**: Set up Google OAuth for easier login

---

**Happy Analyzing! 🏥📊**

For detailed Google OAuth setup, see: `GOOGLE_OAUTH_SETUP.md`
For technical documentation, visit: http://127.0.0.1:8000/docs (when backend is running)
