# Complete Guide for Claude Code Setup on New Device

This guide explains everything about the Medical Report Analyzer project - AI models used, how it works, dependencies needed, and setup instructions.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [AI Models & How They Work](#ai-models--how-they-work)
3. [Technology Stack](#technology-stack)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Dependencies Needed](#dependencies-needed)
6. [Step-by-Step Setup](#step-by-step-setup)
7. [Environment Variables](#environment-variables)
8. [How to Run](#how-to-run)
9. [Features Implemented](#features-implemented)
10. [File Structure](#file-structure)
11. [API Endpoints](#api-endpoints)
12. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

**Medical Report Analyzer** is a full-stack web application that:
- Allows users to upload medical reports (PDF/images)
- Extracts text using OCR (Optical Character Recognition)
- Analyzes reports using AI (Google Gemini)
- Tracks health progress by comparing reports over time
- Provides insights and visualizations

**Key Capabilities:**
- User authentication and profile management
- Multi-format file upload (PDF, PNG, JPG, JPEG)
- Automatic medical parameter extraction
- AI-powered health analysis
- Report comparison with trend analysis
- Interactive dashboard with visualizations

---

## 🤖 AI Models & How They Work

### 1. **Google Gemini API** (Primary AI Model)

**Model Used:** `gemini-1.5-flash`

**Purpose:** Medical report analysis and parameter extraction

**How It Works:**
1. User uploads a medical report (PDF or image)
2. OCR extracts raw text from the document
3. Extracted text is sent to Gemini API
4. Gemini analyzes the text and extracts:
   - Patient information
   - Test parameters (name, value, unit, reference range)
   - Report metadata (date, lab name, etc.)
5. Structured data is stored in MongoDB
6. Data is displayed in user-friendly format

**Gemini Prompt Structure:**
```python
prompt = f"""
Analyze this medical report and extract all test parameters.
Return a JSON object with:
- patient_name
- report_date
- lab_name
- parameters: [{{
    name: string,
    value: number,
    unit: string,
    reference_range: string,
    status: "normal" | "high" | "low"
}}]

Report Text:
{extracted_text}
"""
```

**Why Gemini?**
- ✅ **FREE:** 1,500 requests/day, no credit card needed
- ✅ **Accurate:** Understands medical terminology
- ✅ **Fast:** Processes reports in 2-5 seconds
- ✅ **Structured Output:** Returns clean JSON data

**API Key:**
- Get FREE key from: https://makersuite.google.com/app/apikey
- No billing required
- 1,500 requests/day limit (more than enough for development)

---

### 2. **EasyOCR** (Text Extraction)

**Purpose:** Extract text from images and PDFs

**How It Works:**
1. PDF files are converted to images using PyMuPDF (fitz)
2. Each page is processed through EasyOCR
3. Text is extracted with position coordinates
4. Text is cleaned and formatted
5. Sent to Gemini for analysis

**Languages Supported:** English (can be extended to other languages)

**Models Downloaded:**
- On first run, EasyOCR downloads recognition models (~100-200MB)
- Models are cached locally for future use
- Supports GPU acceleration if available

**Alternative:** Tesseract OCR (can be swapped if needed)

---

### 3. **Comparison Algorithm** (Custom Logic)

**Purpose:** Compare two medical reports and identify trends

**How It Works:**
```python
# Pseudocode
for each parameter in new_report:
    old_value = find_parameter_in_old_report(parameter.name)

    if old_value exists:
        change = new_value - old_value
        change_percentage = (change / old_value) * 100

        # Determine trend based on parameter type
        if parameter_improves_when_lower(parameter.name):
            trend = "improved" if change < 0 else "worsened"
        else:
            trend = "improved" if change > 0 else "worsened"

        if abs(change_percentage) < 5:
            trend = "stable"

    return comparison_result
```

**Trend Classification:**
- **Improved:** Parameter moved towards healthy range
- **Worsened:** Parameter moved away from healthy range
- **Stable:** Change less than 5%

---

## 🛠 Technology Stack

### Backend
- **FastAPI:** Modern Python web framework
- **Python 3.8+:** Programming language
- **MongoDB:** NoSQL database for flexible schema
- **Motor:** Async MongoDB driver
- **PyMongo:** Sync MongoDB driver
- **JWT:** Token-based authentication
- **Passlib:** Password hashing (bcrypt)
- **EasyOCR:** Text extraction from images
- **PyMuPDF (fitz):** PDF processing
- **Pillow:** Image processing
- **Google Generative AI:** Gemini API client
- **Uvicorn:** ASGI server

### Frontend
- **React 18:** UI library
- **Vite:** Build tool and dev server
- **Tailwind CSS:** Utility-first CSS framework
- **React Router:** Client-side routing
- **Axios:** HTTP client
- **Lucide React:** Icon library
- **Context API:** State management

### Database
- **MongoDB:** Document-based storage
  - `users` collection: User accounts
  - `reports` collection: Medical reports and analysis

---

## 🏗 Architecture & Data Flow

### System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ───> │   Frontend   │ ───> │   Backend   │
│  (React)    │ <─── │  (Vite:5173) │ <─── │  (API:8000) │
└─────────────┘      └──────────────┘      └─────────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │   MongoDB     │
                                            │  (localhost)  │
                                            └───────────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │  Google       │
                                            │  Gemini API   │
                                            └───────────────┘
```

### Data Flow: Upload & Analysis

```
1. User uploads PDF/image
   ↓
2. Frontend sends file to backend (/gemini-analysis/process-report)
   ↓
3. Backend saves file temporarily
   ↓
4. OCR Service extracts text (EasyOCR)
   ↓
5. Gemini Parser sends text to Gemini API
   ↓
6. Gemini returns structured JSON (parameters, values, etc.)
   ↓
7. Backend saves to MongoDB
   ↓
8. Frontend receives report_id
   ↓
9. Frontend displays analysis results
```

### Data Flow: Report Comparison

```
1. User selects two reports
   ↓
2. Frontend sends report IDs (/compare/{user_id}?old=X&new=Y)
   ↓
3. Backend fetches both reports from MongoDB
   ↓
4. Comparison Service analyzes differences
   ↓
5. Calculates: change, percentage, trend (improved/worsened/stable)
   ↓
6. Returns comparison data with summary statistics
   ↓
7. Frontend displays categorized results (improved/worsened/stable)
```

---

## 📦 Dependencies Needed

### System Requirements

#### 1. **Python 3.8 or higher**
- Download: https://www.python.org/downloads/
- **Important:** Check "Add Python to PATH" during installation
- Verify: `python --version`

#### 2. **Node.js 16 or higher**
- Download: https://nodejs.org/ (LTS version)
- Includes npm package manager
- Verify: `node --version` and `npm --version`

#### 3. **MongoDB**

**Option A: Local Installation**
- Download: https://www.mongodb.com/try/download/community
- Install as a service (auto-start)
- Default port: 27017
- Verify: `mongod --version`

**Option B: MongoDB Atlas (Cloud - FREE)**
- Sign up: https://www.mongodb.com/cloud/atlas/register
- Create free cluster (512MB storage)
- Get connection string
- No local installation needed

#### 4. **Git**
- Download: https://git-scm.com/downloads
- For cloning repository
- Verify: `git --version`

---

### Backend Python Dependencies

**File:** `backend/requirements.txt`

```
fastapi==0.104.1          # Web framework
uvicorn==0.24.0           # ASGI server
motor==3.3.2              # Async MongoDB driver
pymongo==4.6.0            # Sync MongoDB driver
python-multipart==0.0.6   # File upload support
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4    # Password hashing
easyocr==1.7.0            # OCR text extraction
PyMuPDF==1.23.8           # PDF processing (fitz)
Pillow==10.1.0            # Image processing
google-generativeai==0.3.1  # Gemini API
python-dotenv==1.0.0      # Environment variables
pydantic==2.5.0           # Data validation
```

**Installation Size:** ~1-2 GB (includes OCR models)

**Install Command:**
```bash
pip install -r backend/requirements.txt
```

**Note:** First installation takes 10-15 minutes due to:
- PyTorch (for OCR) - Large ML library
- EasyOCR models download
- Cryptography dependencies compilation

---

### Frontend Node Dependencies

**File:** `frontend/package.json`

```json
{
  "dependencies": {
    "react": "^18.2.0",              // UI library
    "react-dom": "^18.2.0",          // React DOM renderer
    "react-router-dom": "^6.20.0",   // Routing
    "axios": "^1.6.2",               // HTTP client
    "lucide-react": "^0.294.0"       // Icons
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",  // Vite React plugin
    "vite": "^5.0.8",                   // Build tool
    "tailwindcss": "^3.3.6",            // CSS framework
    "postcss": "^8.4.32",               // CSS processor
    "autoprefixer": "^10.4.16",         // CSS vendor prefixes
    "eslint": "^8.55.0"                 // Code linting
  }
}
```

**Installation Size:** ~300-500 MB

**Install Command:**
```bash
npm install
```

**Note:** Installation takes 2-5 minutes

---

## 🚀 Step-by-Step Setup

### Step 1: Clone Repository

```bash
# Navigate to desired location
cd Desktop

# Clone the repository
git clone https://github.com/SohamDhumal-16/medical_report_anylizer.git

# Enter project directory
cd medical_report_anylizer
```

---

### Step 2: Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# You should see (venv) in your terminal prompt

# Install dependencies
pip install -r backend/requirements.txt

# Wait for installation to complete (10-15 minutes first time)
```

---

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Wait for installation to complete (2-5 minutes)

# Go back to root
cd ..
```

---

### Step 4: MongoDB Setup

**If using local MongoDB:**
```bash
# Windows - Start MongoDB service
net start MongoDB

# Verify it's running
# Open browser: http://localhost:27017
# Should see: "It looks like you are trying to access MongoDB over HTTP..."
```

**If using MongoDB Atlas (Cloud):**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign in and create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password

---

### Step 5: Get API Keys

#### Google Gemini API Key (REQUIRED - FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Keep it safe for next step

**Free Tier Details:**
- 1,500 requests per day
- No credit card required
- No billing ever (unless you upgrade)
- Perfect for development and testing

---

### Step 6: Create Environment Files

#### Backend Environment File

Create file: `backend/.env`

```env
# Google Gemini API Key (REQUIRED)
GOOGLE_API_KEY=AIza-your-actual-key-here

# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017
# OR if using MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

# JWT Secret (change to any random string)
JWT_SECRET=my-super-secret-jwt-key-change-this-12345

# Optional: Google OAuth (for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:** Replace placeholder values with your actual keys!

#### Frontend Environment File

Create file: `frontend/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

---

### Step 7: Verify Setup

Check that all files are in place:

```bash
# Check backend .env
cat backend/.env    # Mac/Linux
type backend\.env   # Windows

# Check frontend .env
cat frontend/.env    # Mac/Linux
type frontend\.env   # Windows

# Check MongoDB is running
# Should see success message
```

---

## ▶️ How to Run

### Option 1: Using START_ALL.bat (Windows Only - Easiest)

```bash
# From project root directory
START_ALL.bat
```

This will automatically:
- Start MongoDB (if not running)
- Activate virtual environment
- Start backend server (port 8000)
- Start frontend dev server (port 5173)

---

### Option 2: Manual Start (All Platforms)

**Terminal 1 - Backend:**
```bash
# From project root
cd medical_report_anylizer

# Activate virtual environment
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Start backend
uvicorn backend.main:app --reload

# Should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```bash
# From project root
cd medical_report_anylizer/frontend

# Start frontend
npm run dev

# Should see:
# ➜  Local:   http://localhost:5173/
```

---

### Access the Application

Once both servers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **API Docs (ReDoc):** http://localhost:8000/redoc

---

## 🎯 Features Implemented

### 1. User Authentication
- **Signup:** Create new account with email/password
- **Login:** JWT token-based authentication
- **Profile:** View and manage user information
- **Protected Routes:** Secure pages requiring login

**Files:**
- Backend: `backend/routers/auth.py`
- Frontend: `frontend/src/pages/Login.jsx`, `Signup.jsx`, `Profile.jsx`
- Auth Context: `frontend/src/contexts/AuthContext.jsx`

---

### 2. Report Upload & Processing
- **Multi-format Support:** PDF, PNG, JPG, JPEG
- **Drag & Drop:** Easy file upload interface
- **OCR Extraction:** Automatic text extraction
- **AI Analysis:** Gemini-powered parameter extraction
- **Real-time Progress:** Loading indicators

**How It Works:**
1. User drags/selects medical report file
2. File uploaded to backend
3. OCR extracts text from document
4. Gemini AI analyzes and structures data
5. Report saved to database with user_id
6. User redirected to report details page

**Files:**
- Backend: `backend/routers/gemini_analysis.py`
- Services: `backend/services/ocr_service.py`, `gemini_parser.py`
- Frontend: `frontend/src/pages/Upload.jsx`

---

### 3. Report Analysis & Details
- **Parameter List:** All extracted medical values
- **Status Indicators:** Normal/High/Low badges
- **Reference Ranges:** Show healthy value ranges
- **Visual Cards:** Color-coded by status
- **Download Option:** Export report data

**Files:**
- Frontend: `frontend/src/pages/ReportDetails.jsx`
- Backend: `backend/routers/gemini_analysis.py` (GET endpoint)

---

### 4. Report Comparison
- **Select Two Reports:** Compare older vs newer
- **Trend Analysis:** Improved/Worsened/Stable
- **Statistics:** Summary cards with counts
- **Visual Charts:** Pie chart and bar charts
- **Categorized Lists:** Separate sections for each trend
- **Health Score:** Overall improvement percentage
- **Medical Insights:** AI-generated recommendations

**Comparison Algorithm:**
```python
# For each parameter in both reports:
1. Calculate change = new_value - old_value
2. Calculate percentage = (change / old_value) * 100
3. Determine trend:
   - If |percentage| < 5%: "stable"
   - If parameter type "lower_is_better" (e.g., cholesterol):
       - If change < 0: "improved"
       - If change > 0: "worsened"
   - If parameter type "higher_is_better" (e.g., hemoglobin):
       - If change > 0: "improved"
       - If change < 0: "worsened"
4. Categorize into: improved_list, worsened_list, stable_list
5. Return summary statistics
```

**Files:**
- Backend: `backend/routers/comparison.py`
- Service: `backend/services/compare_service.py`
- Frontend: `frontend/src/pages/Compare.jsx`

**Recent Updates:**
- Removed detailed table, replaced with categorized cards
- Added comprehensive summary section at bottom
- Color-coded categories (green/red/gray)
- Staggered animations for better UX

---

### 5. Dashboard
- **Overview Cards:** Total reports, latest report, trends
- **Quick Actions:** Upload new report, view all reports
- **Recent Reports:** List of latest uploads
- **Health Metrics:** Visual indicators

**Files:**
- Frontend: `frontend/src/pages/Dashboard.jsx`

---

### 6. Reports List
- **All Reports:** View all uploaded reports
- **Filters:** Sort by date, type
- **Quick Actions:** View details, compare, delete
- **Search:** Find specific reports

**Files:**
- Frontend: `frontend/src/pages/Reports.jsx`

---

## 📁 File Structure

```
medical_report_anylizer/
│
├── backend/                          # FastAPI Backend
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py             # MongoDB connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                   # User schema
│   │   └── report.py                 # Report schema
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py                   # Authentication endpoints
│   │   ├── upload.py                 # File upload
│   │   ├── gemini_analysis.py        # AI analysis endpoints
│   │   └── comparison.py             # Comparison endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ocr_service.py            # EasyOCR text extraction
│   │   ├── gemini_parser.py          # Gemini AI integration
│   │   └── compare_service.py        # Comparison logic
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── token_handler.py          # JWT token handling
│   │
│   ├── main.py                       # FastAPI app entry point
│   ├── requirements.txt              # Python dependencies
│   └── .env                          # Environment variables (create this)
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   └── PrivateRoute.jsx      # Protected route wrapper
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Signup.jsx            # Signup page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Upload.jsx            # Upload page
│   │   │   ├── Reports.jsx           # Reports list
│   │   │   ├── ReportDetails.jsx     # Single report view
│   │   │   ├── Compare.jsx           # Comparison page
│   │   │   └── Profile.jsx           # User profile
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   ├── index.css                 # Global styles
│   │   └── App.css                   # App-specific styles
│   │
│   ├── public/
│   │   └── vite.svg                  # Logo
│   │
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── index.html                    # HTML entry point
│   └── .env                          # Environment variables (create this)
│
├── venv/                             # Python virtual environment
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
├── SETUP_NEW_DEVICE.md               # Setup guide
├── CLAUDE_CODE_GUIDE.md              # This file
├── START_ALL.bat                     # Windows startup script
└── CREDENTIALS_BACKUP.txt            # API keys template
```

---

## 🔌 API Endpoints

### Authentication

**POST /auth/signup**
- Register new user
- Body: `{ email, password, full_name }`
- Returns: User object

**POST /auth/login**
- Login user
- Body: `{ username (email), password }`
- Returns: JWT token

---

### Report Processing

**POST /gemini-analysis/process-report**
- Upload and process medical report
- Headers: `Authorization: Bearer <token>`
- Body: Form-data with `file`
- Returns: `{ report_id, message }`

**GET /gemini-analysis/{report_id}**
- Get single report details
- Headers: `Authorization: Bearer <token>`
- Returns: Report object with parameters

**GET /gemini-analysis/user/reports**
- Get all user reports
- Headers: `Authorization: Bearer <token>`
- Returns: `{ reports: [...] }`

**DELETE /gemini-analysis/{report_id}**
- Delete a report
- Headers: `Authorization: Bearer <token>`
- Returns: Success message

---

### Comparison

**GET /compare/{user_id}**
- Compare two reports
- Query params: `?old_report_id=X&new_report_id=Y`
- Headers: `Authorization: Bearer <token>`
- Returns: Comparison object with trends

---

## 🐛 Troubleshooting

### Issue: "Python not found"

**Solution:**
1. Reinstall Python from https://www.python.org/downloads/
2. **Important:** Check "Add Python to PATH" during installation
3. Restart terminal
4. Verify: `python --version`

---

### Issue: "MongoDB connection failed"

**Solution for Local MongoDB:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Solution for MongoDB Atlas:**
1. Check connection string in `backend/.env`
2. Ensure password is correct (no special characters issue)
3. Whitelist your IP address in Atlas dashboard
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/`

---

### Issue: "Module not found" errors

**Backend:**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r backend/requirements.txt
```

**Frontend:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json   # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

---

### Issue: "Port already in use"

**Backend (port 8000):**
```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill
```

**Frontend (port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill
```

---

### Issue: OCR taking too long

**Reason:** First run downloads models

**Solution:**
- Wait for initial download (5-10 minutes)
- Models cached for future use
- Ensure good internet connection
- Check: `~/.EasyOCR/model/` for downloaded models

---

### Issue: Gemini API errors

**"API key not valid":**
- Check `backend/.env` has correct key
- Key should start with `AIza`
- Get new key from: https://makersuite.google.com/app/apikey

**"Quota exceeded":**
- Free tier: 1,500 requests/day
- Wait 24 hours or upgrade to paid tier
- Check usage: https://makersuite.google.com/

**"Safety filters triggered":**
- Some medical terms might trigger safety filters
- Try rephrasing or use different report
- Usually rare for medical reports

---

### Issue: Frontend can't connect to backend

**Check:**
1. Backend is running on port 8000
2. Frontend `.env` has: `VITE_API_URL=http://localhost:8000`
3. No CORS errors in browser console
4. JWT token is valid (check localStorage)

**Solution:**
```bash
# Restart both servers
# Terminal 1 - Backend
uvicorn backend.main:app --reload

# Terminal 2 - Frontend
npm run dev
```

---

## 💡 Tips for Claude Code on New Device

### When you first open the project, tell me:

1. **"Set up this project"** - I'll guide you through installation
2. **"What AI models does this use?"** - I'll explain Gemini integration
3. **"How do I run this?"** - I'll provide run commands
4. **"Something is broken"** - I'll help troubleshoot

### Helpful prompts:

- "Install backend dependencies"
- "Create .env files for me"
- "Start the development servers"
- "Explain how the comparison algorithm works"
- "What does the Gemini API do here?"
- "How is OCR implemented?"
- "Show me the database schema"

### Context I have:

- ✅ All code files and structure
- ✅ Dependencies and requirements
- ✅ API endpoints and routes
- ✅ Previous development decisions
- ✅ Features implemented so far

### What I can help with:

- ✅ Setup and installation
- ✅ Debugging errors
- ✅ Adding new features
- ✅ Explaining how things work
- ✅ Optimizing code
- ✅ Database queries
- ✅ API integration
- ✅ UI improvements

---

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  user_id: "unique-uuid",
  email: "user@example.com",
  full_name: "John Doe",
  hashed_password: "bcrypt-hash",
  created_at: ISODate,
  updated_at: ISODate
}
```

### Reports Collection

```javascript
{
  _id: ObjectId,
  report_id: "unique-uuid",
  user_id: "user-uuid-reference",
  file_name: "blood_test_2024.pdf",
  file_path: "/uploads/...",
  report_type: "blood_test",
  report_date: ISODate,
  upload_date: ISODate,

  // Extracted data
  patient_name: "John Doe",
  lab_name: "ABC Diagnostics",

  // Parameters array
  parameters: [
    {
      parameter_name: "Hemoglobin",
      value: 14.5,
      unit: "g/dL",
      reference_range: "13-17",
      status: "normal",
      category: "Complete Blood Count"
    },
    // ... more parameters
  ],

  // AI Analysis
  ai_summary: "Overall health indicators are within normal range...",

  // Metadata
  ocr_text: "Raw extracted text...",
  processing_status: "completed",
  created_at: ISODate
}
```

---

## 🎓 Key Concepts

### 1. JWT Authentication Flow

```
1. User signs up → Password hashed → Stored in DB
2. User logs in → Password verified → JWT token generated
3. Frontend stores token → Sent with every request
4. Backend verifies token → Allows access to protected routes
5. Token expires after 30 minutes → User must re-login
```

### 2. OCR Processing Flow

```
PDF/Image → PyMuPDF converts to image → EasyOCR extracts text
→ Text cleaning & formatting → Ready for AI analysis
```

### 3. AI Analysis Flow

```
Raw OCR text → Structured prompt → Gemini API
→ JSON response → Parsed & validated → Stored in MongoDB
```

### 4. Comparison Logic

```
Old Report + New Report → Match parameters by name
→ Calculate changes → Classify trends → Generate summary
→ Return categorized results (improved/worsened/stable)
```

---

## 🚀 Next Steps After Setup

1. **Test the application:**
   - Sign up with test account
   - Upload sample medical report
   - View analysis results
   - Upload second report
   - Compare two reports

2. **Explore the code:**
   - Read through key files
   - Understand API structure
   - Check database collections

3. **Try adding features:**
   - Export reports to PDF
   - Email notifications
   - Health trend graphs
   - Multi-language support

---

## 📞 Getting Help

**With Claude Code:**
Just ask me anything! Examples:
- "Why is MongoDB not connecting?"
- "How do I add a new API endpoint?"
- "Explain the comparison algorithm"
- "Help me add a new feature"
- "What does this error mean?"

**Documentation:**
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- MongoDB: https://www.mongodb.com/docs/
- Gemini API: https://ai.google.dev/docs

---

## ✅ Setup Checklist

Use this checklist on your new device:

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] MongoDB installed/running (or Atlas account created)
- [ ] Git installed
- [ ] Repository cloned
- [ ] Virtual environment created (`python -m venv venv`)
- [ ] Virtual environment activated
- [ ] Backend dependencies installed (`pip install -r backend/requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `backend/.env` file created with API keys
- [ ] `frontend/.env` file created
- [ ] Gemini API key obtained
- [ ] MongoDB connection verified
- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] Can access http://localhost:5173
- [ ] Can create account and login

---

**Last Updated:** 2025-11-16

**Repository:** https://github.com/SohamDhumal-16/medical_report_anylizer

**Generated with Claude Code** 🤖

---

## 📝 Notes

- This guide covers EVERYTHING you need to know
- Keep this file open when setting up on new device
- Refer to specific sections as needed
- Ask Claude Code if anything is unclear

**Happy Coding! 🚀**
