@echo off
setlocal

REM This script must be placed inside the "frontend" folder
REM (filmzone\frontend\start-frontend.bat) and double-clicked from there.

cd /d "%~dp0"

echo ============================================
echo  Filmzone frontend - automatic setup
echo ============================================

if not exist ".env" (
    echo Creating .env from .env.example ...
    copy /y ".env.example" ".env" >nul
) else (
    echo .env already exists, skipping.
)

echo.
echo [1/2] Installing npm packages... this can take a few minutes.
call npm install
if errorlevel 1 (
    echo.
    echo *** npm install FAILED. See the error above. ***
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Setup complete. Starting the frontend...
echo  Once it's ready, open this in your browser:
echo  http://localhost:5173
echo ============================================
echo.
echo [2/2] Starting dev server...
call npm run dev

pause
