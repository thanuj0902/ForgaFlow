# Instructions for Friend (No PostgreSQL Installed)

## What You Need
- **Docker Desktop** (only requirement): https://www.docker.com/products/docker-desktop/

## Steps

### 1. Unzip the project
```powershell
# Unzip addo.zip to a folder
cd addo
```

### 2. Start everything with Docker
```powershell
docker-compose up -d
```

This single command will:
- Download PostgreSQL 16 (inside Docker)
- Create `appgen` database automatically
- Build and start the backend (Node.js)
- Build and start the frontend (Next.js)

Wait about 60 seconds for everything to start.

### 3. Access the app
Open browser: http://localhost:3000

### 4. Create account & use
- Click "Register" to create an account
- Paste the contents of `sample-config.json` into the config box
- Click "Save Config"
- Your app is ready!

---

## Commands Reference

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart
docker-compose restart
```

## Troubleshooting

**Port already in use:**
Edit `docker-compose.yml` and change:
```yaml
# For frontend
frontend:
  ports:
    - "3001:3000"  # Change 3001 to any free port

# For backend  
backend:
  ports:
    - "8001:8000"  # Change 8001 to any free port
```

**Clean restart (if something breaks):**
```powershell
docker-compose down -v
docker-compose up -d
```

---

## No Local PostgreSQL Needed!
Docker handles everything. You don't need to:
- Install PostgreSQL
- Create databases
- Configure users

Just install Docker and run `docker-compose up -d`!
