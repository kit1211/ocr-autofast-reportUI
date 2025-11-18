@echo off
echo 🚀 Starting Vercel deployment...

REM Check if logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
  echo ❌ Not logged in to Vercel. Please login first:
  echo    vercel login
  exit /b 1
)

echo 📦 Deploying to production...
vercel --prod --yes

echo ✅ Deployment complete!

