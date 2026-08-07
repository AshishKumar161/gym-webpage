cd /d "%~dp0"
@echo off
TITLE A2 ReVamp Gym - Stop App
COLOR 0C
CLS

echo ================================================================================
echo                     A2 REVAMP GYM - STOPPING APPLICATION
echo ================================================================================
echo Working Directory: %CD%
echo.

echo Stopping Docker containers...
docker compose down >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    docker-compose down
)

echo.
echo ================================================================================
echo                     ALL SERVICES STOPPED SUCCESSFULLY
echo ================================================================================
echo.
pause
