@echo off
:: Navigate to project root directory (one level up from launchers folder)
cd /d "%~dp0.."
title A2 ReVamp Gym - Auto Launcher
color 0A
cls

echo ================================================================================
echo                   A2 REVAMP GYM - AUTOMATIC APPLICATION LAUNCHER
echo ================================================================================
echo Working Directory: %CD%
echo.

:: Detect Local Network IP Address dynamically
set "LOCAL_IP=localhost"
for /f "usebackq tokens=*" %%i in (`powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp | Select-Object -First 1).IPAddress"`) do set "LOCAL_IP=%%i"

:: 1. Check Docker Status
echo [1/4] Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 goto DOCKER_OK

echo.
echo WARNING: Docker Desktop is not running!
echo Attempting to start Docker Desktop...
echo.

if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker Desktop to initialize...
    ping 127.0.0.1 -n 11 >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% EQU 0 goto DOCKER_OK
)

echo.
echo Docker is not available. Starting local Node.js mode instead...
echo.
start "A2 Gym Backend API" cmd /k "cd /d "%CD%" && npm --prefix apps/api run dev"
ping 127.0.0.1 -n 4 >nul
start "A2 Gym Frontend Web" cmd /k "cd /d "%CD%" && npm --prefix apps/web run dev"
ping 127.0.0.1 -n 5 >nul
start http://localhost:5173
echo.
echo Local Node.js servers started!
pause
exit /b 0

:DOCKER_OK
echo [OK] Docker engine is running.
echo.

:: 2. Launch Docker Containers
echo [2/4] Starting Docker containers (PostgreSQL, Express API, Vite Web App)...
docker compose up --build -d
if %ERRORLEVEL% NEQ 0 (
    docker-compose up --build -d
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker compose failed to start containers.
    pause
    exit /b 1
)

echo.
echo [3/4] Waiting 4 seconds for database and services to initialize...
ping 127.0.0.1 -n 5 >nul

:: 3. Launch Browser
echo [4/4] Opening A2 ReVamp Gym in your default web browser...
start http://localhost:5173

echo.
echo ================================================================================
echo                    SUCCESS! APPLICATION IS NOW LIVE
echo ================================================================================
echo  - Localhost (This PC)   : http://localhost:5173
echo  - Wi-Fi / Local Net     : http://%LOCAL_IP%:5173  (Use on phone/other devices)
echo  - Backend REST API      : http://localhost:5000
echo  - API Docs              : http://localhost:5000/api/docs
echo ================================================================================
echo.
echo Press any key to exit this window. (Containers will keep running in Docker)
echo Double-click "STOP_APP.bat" whenever you want to stop the containers.
echo.
pause
