@echo off
echo Setting up App Generator...

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install
cd .

echo Setup complete!
echo.
echo To start development:
echo 1. Start PostgreSQL
echo 2. cd backend && npm run dev
echo 3. cd frontend && npm run dev
echo 4. Open http://localhost:3000
pause
