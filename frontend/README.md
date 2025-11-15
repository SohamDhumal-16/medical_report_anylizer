# Medical Report Analyzer - Frontend

Modern React frontend for the Medical Report Analyzer application. Built with Vite, React Router, Tailwind CSS, and Axios.

## Features

- **User Authentication** - Secure login and signup with JWT
- **Dashboard** - Overview of all reports and quick actions
- **Upload Reports** - Drag-and-drop file upload with real-time processing
- **View Reports** - Browse and search through all uploaded reports
- **Report Details** - View extracted medical values with detailed analysis
- **Compare Reports** - Track health progress by comparing reports over time
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library
- **Recharts** - Charting library (for future enhancements)

## Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Backend server running (see backend README)

## Installation

### 1. Navigate to Frontend Directory

```bash
cd medical_report_analyzer/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
copy .env.example .env     # Windows
cp .env.example .env       # Linux/Mac
```

Edit `.env` if your backend is running on a different URL:

```env
VITE_API_URL=http://localhost:8000
```

## Development

### Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Guide

### 1. Sign Up / Login

- Navigate to http://localhost:5173
- Create a new account or login with existing credentials
- You'll be redirected to the dashboard after authentication

### 2. Upload Report

- Click "Upload Report" from the dashboard or navigation
- Select report type (Blood Test, X-Ray, etc.)
- Drag and drop your file or click to browse
- Supported formats: PDF, PNG, JPG (up to 10MB)
- Click "Upload & Analyze" to process

### 3. View Reports

- Click "My Reports" to see all uploaded reports
- Use search and filters to find specific reports
- Click on any report to view details

### 4. View Report Details

- See all extracted medical values
- View parameters with their values and units
- Check reference ranges and status

### 5. Compare Reports

- Click "Compare" from navigation
- Select two reports to compare
- View side-by-side comparison with trends
- See improvement rate and detailed changes

## Troubleshooting

### Backend Connection Error

**Problem:** Cannot connect to backend API

**Solution:**
- Ensure backend server is running on port 8000
- Check `VITE_API_URL` in `.env` file
- Verify CORS is enabled in backend

### Authentication Issues

**Problem:** Getting logged out unexpectedly

**Solution:**
- Check if JWT token is expired (default: 30 minutes)
- Clear localStorage and login again
- Verify backend authentication is working

### Build Errors

**Problem:** Build fails with dependency errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

This project is for educational and development purposes.

---

**Generated with Claude Code** 🤖

For backend setup, see the main project README.md
