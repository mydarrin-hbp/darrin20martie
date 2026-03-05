@echo off
echo Pornire server FastAPI...
py -m uvicorn backend.app.main:app --reload --port 8000
pause