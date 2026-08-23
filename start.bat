@echo off
echo =====================================
echo Accessible Form Assistant
echo =====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo WARNING: .env file not found in backend directory!
    echo.
    echo Please create backend\.env file with your API keys:
    echo   1. Copy backend\.env.example to backend\.env
    echo   2. Add your OPENAI_API_KEY
    echo.
    echo Press any key to continue anyway, or Ctrl+C to exit and configure...
    pause
)

echo =====================================
echo Starting servers...
echo =====================================
echo.
echo Backend API will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo =====================================
echo.

REM Start both servers
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 >nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting in separate windows...
echo Open http://localhost:5173 in your browser
echo.
pause
