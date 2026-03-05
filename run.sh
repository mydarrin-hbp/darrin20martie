#!/bin/bash
echo "Starting My Darrin platform..."
docker-compose -f infra/docker-compose.yml up -d
echo "Database started. Now starting backend..."
cd backend && uvicorn app.main:app --reload --port 8000 &
echo "Backend running on http://localhost:8000"
cd ../frontend && npm run dev &
echo "Frontend running on http://localhost:3000"