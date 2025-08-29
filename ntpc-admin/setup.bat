@echo off
echo ========================================
echo NTPC Press Portal Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version (recommended)
    echo.
    echo After installation, restart this batch file.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting the server...
echo The application will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
pause
