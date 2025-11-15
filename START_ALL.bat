@echo off
title Medical Report Analyzer - Startup
color 0A

echo ========================================
echo   Medical Report Analyzer
echo   Starting Application Servers...
echo ========================================
echo.

echo [1/3] Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo       MongoDB started successfully
) else (
    echo       MongoDB already running or failed to start
    echo       Please ensure MongoDB is installed and configured
)
echo.

echo [2/3] Starting Backend Server...
echo       Starting FastAPI on http://127.0.0.1:8000
start "Medical Report Analyzer - Backend" cmd /k "cd /d "%~dp0backend" && "..\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
echo       Backend server started
echo.

echo [3/3] Starting Frontend Server...
echo       Starting React App on http://localhost:5173
start "Medical Report Analyzer - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo       Frontend server started
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo   Backend API:  http://127.0.0.1:8000
echo   Frontend UI:  http://localhost:5173
echo   API Docs:     http://127.0.0.1:8000/docs
echo.
echo   Both servers are starting in separate windows.
echo   Please wait 10-15 seconds, then open:
echo   http://localhost:5173
echo.
echo   Press any key to open the application in browser...
pause >nul

start http://localhost:5173

echo.
echo   Application opened in your default browser.
echo   You can close this window now.
echo.
pause
