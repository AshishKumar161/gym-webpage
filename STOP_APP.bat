@echo off
TITLE A2 ReVamp Gym - Stop Docker App
COLOR 0C
CLS

echo ================================================================================
echo                     A2 REVAMP GYM - STOP DOCKER CONTAINERS
echo ================================================================================
echo.

echo Stopping all running containers (PostgreSQL, Express API, Vite Web App)...
docker-compose down

echo.
echo ================================================================================
echo                     ALL CONTAINERS STOPPED SUCCESSFULLY
echo ================================================================================
echo.
pause
