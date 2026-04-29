@echo off
REM Single command to run the entire project

echo Building and starting App Generator...
docker compose up --build -d

echo.
echo Services starting...
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo - PostgreSQL: localhost:5432
echo.
echo To stop: docker compose down
pause