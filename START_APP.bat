@echo off
TITLE A2 ReVamp Gym - Auto Docker Launcher
COLOR 0A
CLS

echo ================================================================================
echo                   A2 REVAMP GYM - AUTOMATIC DOCKER LAUNCHER
echo ================================================================================
echo.

:: 1. Check if Docker is installed and running
echo [1/4] Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo --------------------------------------------------------------------------------
    echo WARNING: Docker Desktop is not running or not started yet!
    echo Attempting to start Docker Desktop automatically...
    echo --------------------------------------------------------------------------------
    
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo ERROR: Docker Desktop installation not found at default location.
        echo Please launch Docker Desktop manually and run this script again.
        pause
        exit /b 1
    )
    
    echo Waiting for Docker engine to initialize (this may take up to 30 seconds)...
    :WAIT_LOOP
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Still waiting for Docker engine...
        goto WAIT_LOOP
    )
    echo Docker Desktop is now running!
)

echo [OK] Docker engine is ready.
echo.

:: 2. Build and Start Docker Containers
echo [2/4] Building and launching containers (PostgreSQL, Express API, Vite Web App)...
echo Please wait a moment while containers build and initialize...
echo.

docker-compose up --build -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Docker containers! Please check Docker logs.
    pause
    exit /b 1
)

echo.
echo [3/4] Waiting 5 seconds for services and database schema setup...
timeout /t 5 /nobreak >nul

:: 3. Launch Web Application in Default Browser
echo [4/4] Opening A2 ReVamp Gym Web App in your default web browser...
start http://localhost:5173

echo.
echo ================================================================================
echo                    SUCCESS! APPLICATION IS RUNNING
echo ================================================================================
echo  - Frontend Web App : http://localhost:5173
echo  - Backend REST API : http://localhost:5000
echo  - API Health Check : http://localhost:5000/health
echo  - API Docs         : http://localhost:5000/api/docs
echo ================================================================================
echo.
echo To stop the application later, simply double-click "STOP_APP.bat".
echo.
pause
