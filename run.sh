#!/bin/bash
# Single command to run the entire project with Docker

echo "Starting App Generator..."

# Remove old containers if any
docker compose down 2>/dev/null

# Build and start all services
docker compose up --build -d

echo "Services starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "PostgreSQL: localhost:5432"