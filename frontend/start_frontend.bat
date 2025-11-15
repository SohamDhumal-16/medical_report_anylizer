@echo off
echo ========================================
echo Medical Report Analyzer - Starting Frontend
echo ========================================
echo.

cd %~dp0

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
)

echo Starting development server...
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
