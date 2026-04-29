# Quick Start Guide for Friends

## Prerequisites
- Docker & Docker Compose installed
- That's it! No need to install Node.js, PostgreSQL, etc.

## Steps

1. **Clone/download this folder**
   ```bash
   git clone <repo-url>  # or download ZIP
   cd addo
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Pull PostgreSQL 16 image
   - Build backend Node.js image
   - Build frontend Next.js image
   - Start all containers
   - Create the database automatically

3. **Wait for startup (about 30-60 seconds)**
   Check status:
   ```bash
   docker-compose ps
   ```

4. **Access the app**
   - Open http://localhost:3000 in your browser
   - Register a new account
   - Paste the sample config (see `sample-config.json`) or create your own

## Stopping
```bash
docker-compose down
```

## Viewing Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Rebuilding After Changes
If you modify code:
```bash
docker-compose up -d --build
```

## Troubleshooting

**Database connection issues:**
```bash
docker-compose restart backend
```

**Port conflicts:**
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "3001:3000"  # Change host port
```

**Clean restart:**
```bash
docker-compose down -v  # -v removes volumes too
docker-compose up -d
```
