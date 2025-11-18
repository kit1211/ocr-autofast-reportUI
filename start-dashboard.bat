@echo off
REM Dashboard Startup Script for Windows
REM This script will start both Backend API and Frontend servers

echo 🚀 Starting Dashboard Analytics...
echo.

REM Check if bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Bun is not installed
    echo Please install Bun from https://bun.sh
    exit /b 1
)

echo ✅ Bun is installed
echo.

REM Start Backend API Server in new window
echo 📡 Starting Backend API Server on port 3001...
start "Backend API Server" cmd /k "bun run server"
echo.

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start Frontend Dev Server
echo 🎨 Starting Frontend Dashboard...
echo Press Ctrl+C to stop the frontend server
echo (You'll need to manually close the Backend API Server window)
echo.
bun run dev

echo.
echo ✅ Dashboard frontend stopped
echo ⚠️  Don't forget to close the Backend API Server window!

