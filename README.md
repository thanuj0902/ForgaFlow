# App Generator - Config-Driven App Generator

A config-driven app generator that reads a JSON config and dynamically generates a working web app (UI + API + database) without hardcoding anything.

## Stack

- **Backend**: Node.js, Express, TypeScript, Sequelize ORM
- **Database**:PostgreSQL
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Auth**: JWT + bcrypt
- **Deployment**: Docker Compose

## Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Express app entry
│   ├── config-parser/             # Validates + normalises config
│   ├── route-factory/             # Dynamically creates routes
│   ├── schema-factory/            # Creates Sequelize models
│   ├── models/                    # User, ConfigStore models
│   ├── middleware/                # Auth middleware
│   └── routes/                   # Auth, Configs, Import, i18n, Notifications
├── package.json
├── tsconfig.json
└── Dockerfile

frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Config upload/paste
│   └── app/[appId]/page.tsx      # Generated app
├── components/
│   ├── renderers/                # Form, Table, Dashboard renderers
│   ├── ConfigUpload.tsx
│   └── AppRenderer.tsx
├── lib/                          # API client, validators
├── types/                        # TypeScript types
└── package.json

docker-compose.yml
```

## Features Implemented

### 1. Config Parser (`config-parser/`)
- Accepts partial/incomplete configs
- Fills sensible defaults for missing fields
- Logs warnings (not crashes) for unknown keys
- Returns ParseResult with: normalised_config, warnings[], errors[]

### 2. Dynamic Route Factory (`route-factory/`)
- Creates Express routes from config.apis
- Routes are user-scoped (filter by user_id from JWT)
- Supports CRUD: list, create, read, update, delete
- Uses registry pattern (no if/elif chains)

### 3. Dynamic Schema Factory (`schema-factory/`)
- Creates Sequelize models from config.database.tables
- Always adds: id (UUID), created_at, updated_at, user_id
- Handles type mapping: string→STRING, integer→INTEGER, etc.
- Defaults unknown types to STRING with warning

### 4. Frontend Renderers
- **FormRenderer**: Renders forms from config, submits to bound API
- **TableRenderer**: Fetches from list endpoint, renders rows
- **DashboardRenderer**: Composes multiple renderers
- All handle: loading, empty state, error state

### 5. Authentication
- POST /auth/register → hash password, store user
- POST /auth/login → verify, return JWT
- GET /auth/me → return current user
- All dynamic routes require valid JWT

### 6. CSV Import System
- POST /import/csv (file upload + table name)
- Parses CSV, maps columns to table fields
- Returns import summary (success count, error rows)

### 7. Multi-language / i18n
- Config can include locale: { "default": "en", "supported": ["en", "hi", "es"] }
- UI labels rendered from translation map
- Language switcher in app shell
- User preference stored in localStorage

### 8. Event-based Email Notifications (Mock)
- Config can define triggers for record_created events
- After matching API action, logs "email sent" to notifications table
- Mock implementation (prints to console)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- Docker (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
npm install --prefix backend
npm install --prefix frontend
```

2. **Set up environment variables:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

3. **Start PostgreSQL** (if not using Docker):
```bash
# Create database
createdb appgen
```

4. **Start backend:**
```bash
cd backend
npm run dev
```

5. **Start frontend:**
```bash
cd frontend
npm run dev
```

6. **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Using Docker Compose

```bash
docker-compose up -d
```

## Sample Config

See `sample-config.json` for a complete example. Paste this in the config upload screen to generate a Task Manager app.

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Configs
- `GET /configs/` - List user's configs
- `POST /configs/` - Create new config
- `GET /configs/:id` - Get config by ID
- `PUT /configs/:id` - Update config
- `DELETE /configs/:id` - Delete config

### Dynamic API (Mounted from config)
- `GET /api/{path}` - List records
- `POST /api/{path}` - Create record
- `GET /api/{path}/{id}` - Read record
- `PUT /api/{path}/{id}` - Update record
- `DELETE /api/{path}/{id}` - Delete record

### Import
- `POST /import/csv` - Import CSV file

### i18n
- `GET /i18n/translations/:lang` - Get translations
- `GET /i18n/supported-languages` - Get supported languages

### Notifications
- `GET /notifications/` - List notifications

## Extensibility

- **New UI component types**: Add new Renderer file + register in REGISTRY
- **New API actions**: Register in route-factory ACTION_REGISTRY
- No if/elif chains - uses registry/factory patterns

## Edge Cases Handled

- Config with ui entry referencing non-existent API → renders error card
- Unknown field types → defaults to string, shows warning
- CSV import with mismatched columns → skips bad rows, reports in response
- JWT expired → returns 401, frontend redirects to login
- Empty/null config → shows "paste your config" placeholder
