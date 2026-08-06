@echo off
:: Set working directory to the directory where this script is located
cd /d "%~dp0"
TITLE A2 ReVamp Gym - Auto Launcher
COLOR 0A
CLS

echo ================================================================================
echo                   A2 REVAMP GYM - AUTOMATIC APPLICATION LAUNCHER
echo ================================================================================
echo Working Directory: %CD%
echo.

:: Check Docker Engine Status
echo [1/4] Checking Docker Desktop status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo --------------------------------------------------------------------------------
    echo WARNING: Docker Desktop is not running or initializing!
    echo Attempting to start Docker Desktop...
    echo --------------------------------------------------------------------------------
    
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo Waiting up to 25 seconds for Docker Engine to start...
        
        set /a count=0
        :WAIT_DOCKER
        timeout /t 3 /nobreak >nul
        docker info >nul 2>&1
        if %ERRORLEVEL% EQU 0 goto DOCKER_READY
        set /a count+=1
        if %count% LSS 8 (
            echo Waiting for Docker Engine... (%count%/8)
            goto WAIT_DOCKER
        )
    )
    
    echo.
    echo Docker Desktop could not be detected. Starting local Node.js mode instead...
    echo.
    echo [STARTING LOCAL MODE] Launching API and Frontend dev servers...
    start "A2 Gym Backend API" cmd /k "cd /d "%~dp0" && npm --prefix apps/api run dev"
    timeout /t 3 /nobreak >nul
    start "A2 Gym Frontend Web" cmd /k "cd /d "%~dp0" && npm --prefix apps/web run dev"
    timeout /t 4 /nobreak >nul
    start http://localhost:5173
    echo.
    echo Local servers launched!
    pause
    exit /b 0
)

:DOCKER_READY
echo [OK] Docker Engine is active.
echo.

:: Launch Docker Compose Stack
echo [2/4] Launching Docker containers (PostgreSQL, Express API, Vite Web App)...
docker compose up --build -d >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    docker-compose up --build -d
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker compose failed. Starting fallback local Node.js mode...
    start "A2 Gym Backend API" cmd /k "cd /d "%~dp0" && npm --prefix apps/api run dev"
    timeout /t 3 /nobreak >nul
    start "A2 Gym Frontend Web" cmd /k "cd /d "%~dp0" && npm --prefix apps/web run dev"
    timeout /t 4 /nobreak >nul
    start http://localhost:5173
    echo.
    pause
    exit /b 0
)

echo.
echo [3/4] Waiting 4 seconds for database and service readiness...
timeout /t 4 /nobreak >nul

:: Launch Web Browser
echo [4/4] Opening Web App in your browser...
start http://localhost:5173

echo.
echo ================================================================================
echo                    SUCCESS! APPLICATION IS NOW LIVE
echo ================================================================================
echo  - Frontend Web App  : http://localhost:5173
echo  - Backend REST API  : http://localhost:5000
echo  - API Docs          : http://localhost:5000/api/docs
echo ================================================================================
echo.
echo Leave this window open, or double-click "STOP_APP.bat" when you want to stop.
echo.
pause
