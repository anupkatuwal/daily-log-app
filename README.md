# daily-log-app

Full-stack rebuild of a single-file daily tracker (food macros, PEDs, training log).

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** FastAPI (`backend/`)
- **Database:** PostgreSQL via Neon
- **Auth:** simple PIN/password

## Project layout

```
daily-log-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── db.py            # SQLAlchemy / Neon connection
│   │   └── routers/         # API routes (added during the port)
│   ├── migrations/
│   │   └── 001_init.sql     # full schema (8 domain tables + users)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css        # dark theme: --bg #0f0f0f, --accent #c8ff00
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Run the backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then paste your Neon DATABASE_URL
psql "$DATABASE_URL" -f migrations/001_init.sql   # create tables
uvicorn app.main:app --reload --port 8000
```

## Run the frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

## Schema

`daily_logs` is the spine (one row per user per day). Everything hangs off it:
`meals → food_items`, `peds_taken`, `training_sessions → exercises → sets`, and
`notes`. All child rows cascade-delete with their parent. See
[`backend/migrations/001_init.sql`](backend/migrations/001_init.sql).
