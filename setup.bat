@echo off
echo =====================================
echo Accessible Form Assistant Setup
echo =====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found:
node --version
echo.

REM Install backend dependencies
echo [1/2] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

REM Install frontend dependencies
echo [2/2] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

REM Check .env file
if not exist "backend\.env" (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy backend\.env.example backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your AWS credentials
    echo.
)

echo =====================================
echo Setup Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Verify AWS credentials in backend\.env
echo 2. Run start.bat to launch the application
echo.
pause
