@echo off
setlocal

cd /d %~dp0

echo [1/4] Installing backend dependencies...
python -m pip install -r backend\requirements.txt
if errorlevel 1 goto :fail

echo [2/4] Running database migrations...
python -m alembic upgrade head
if errorlevel 1 goto :fail

echo [3/4] Running production seed...
cd backend
python -m app.scripts.seed_demo_full
if errorlevel 1 goto :fail

echo [4/4] Starting stable backend server...
uvicorn app.main:app --host 127.0.0.1 --port 8000
goto :eof

:fail
echo Production startup failed.
exit /b 1
