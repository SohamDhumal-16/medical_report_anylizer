# Medical Report Analyzer

A comprehensive full-stack web application for analyzing medical reports using OCR and ML. Upload medical reports (PDF/images), extract test results, and track health progress over time.

## Features

### Backend
- User authentication (signup/login with JWT)
- Medical report upload (PDF and images)
- OCR-based text extraction using EasyOCR
- Automatic medical value parsing
- Report comparison and progress tracking
- RESTful API with FastAPI

### Frontend
- Modern React UI with Tailwind CSS
- User authentication with JWT
- Responsive dashboard
- Drag-and-drop file upload
- Real-time report processing
- Interactive report comparison
- Mobile-friendly design

## Project Structure

```
medical_report_analyzer/
├── backend/                     # FastAPI Backend
│   ├── routers/                # API endpoints
│   ├── services/               # Business logic (OCR, parsing, comparison)
│   ├── models/                 # Data models
│   ├── database/               # MongoDB connection
│   ├── utils/                  # Helper functions
│   ├── main.py                 # FastAPI app
│   └── requirements.txt        # Python dependencies
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── contexts/          # React contexts
│   │   └── App.jsx            # Main app
│   ├── package.json           # Node dependencies
│   └── README.md              # Frontend docs
├── venv/                       # Python virtual environment
├── .env.example                # Environment template
├── START_ALL.bat               # Start both servers (Windows)
└── README.md                   # This file
```

## Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **MongoDB** installed and running
- Git (optional)

## Quick Start (Windows)

**Easiest way to run both backend and frontend:**

```bash
cd medical_report_analyzer
START_ALL.bat
```

This will start:
- Backend at http://localhost:8000
- Frontend at http://localhost:5173
- API Docs at http://localhost:8000/docs

## Manual Installation & Setup

### Backend Setup

### 1. Navigate to Project Directory

```bash
cd medical_report_analyzer
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Verify Dependencies Installation

Dependencies should already be installed. To verify:

```bash
pip list
```

If you need to reinstall:

```bash
pip install -r backend/requirements.txt
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env     # Windows
cp .env.example .env       # Linux/Mac
```

Edit `.env` file with your configuration:

```env
MONGODB_URL=mongodb://localhost:27017/
DB_NAME=medical_report_analyzer
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important:** Change `SECRET_KEY` to a strong random string in production!

### 5. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

### 6. Run the Server

From the project root directory:

```bash
uvicorn backend.main:app --reload
```

Or alternatively:

```bash
cd backend
python main.py
```

The server will start at: **http://localhost:8000**

### Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
copy .env.example .env     # Windows
cp .env.example .env       # Linux/Mac
```

### 4. Start Development Server

```bash
npm run dev
```

The frontend will start at: **http://localhost:5173**

## API Documentation

Once the server is running, access interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token

### Upload

- `POST /upload/` - Upload medical report file
- `GET /upload/allowed-formats` - Get supported file formats

### Analysis

- `POST /analysis/process-report` - Upload and process report
- `GET /analysis/{report_id}` - Get report analysis
- `GET /analysis/user/reports` - Get all user reports

### Comparison

- `GET /compare/{user_id}?old_report_id=X&new_report_id=Y` - Compare two reports
- `GET /compare/user/{user_id}/latest-comparison` - Compare latest two reports

## Usage Example

### 1. Register User

```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "full_name": "John Doe",
    "password": "securepassword"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword"
```

### 3. Upload Report

```bash
curl -X POST "http://localhost:8000/analysis/process-report" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/report.pdf" \
  -F "report_type=blood_test"
```

## Development

### Project Technologies

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **EasyOCR** - OCR text extraction
- **PyMuPDF** - PDF processing
- **JWT** - Secure authentication
- **Pydantic** - Data validation

### Code Structure

- **Routers**: Handle HTTP requests and responses
- **Services**: Business logic and ML operations
- **Models**: Data validation and schemas
- **Database**: MongoDB connection and operations
- **Utils**: Helper functions (JWT, password hashing)

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env` file
- Verify MongoDB service is started

### Module Import Errors

- Activate virtual environment
- Reinstall dependencies: `pip install -r backend/requirements.txt`

### OCR Taking Too Long

- EasyOCR downloads models on first run (may take time)
- Ensure good internet connection for model download
- Models are cached after first download

### File Upload Errors

- Check `uploads/` directory exists in backend folder
- Verify file format is supported (PDF, PNG, JPG, etc.)
- Check file size (max 10MB by default)

## Future Enhancements

- [ ] Add more medical parameter patterns
- [ ] Implement data visualization (charts/graphs)
- [ ] Add AI-powered health insights
- [ ] Email notifications for abnormal values
- [ ] Multi-language OCR support
- [ ] Frontend web interface

## License

This project is for educational and development purposes.

## Support

For issues or questions, please create an issue in the project repository.

---

**Generated with Claude Code** 🤖
