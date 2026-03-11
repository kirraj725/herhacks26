# Valentis

**Hospital Revenue & Payment Risk Intelligence Platform**

Valentis is a predictive revenue intelligence and fraud detection layer that helps hospitals proactively protect revenue, detect suspicious financial activity, and optimize collections before accounts reach bad debt.

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| **Frontend** | React 18, Vite, Recharts, React Router        |
| **Backend**  | Python, FastAPI, Pandas, NumPy, Scikit-learn   |
| **Database** | PostgreSQL (production) / SQLite (local dev)   |
| **ML**       | Logistic Regression, Isolation Forest, Z-score |
| **Infra**    | Docker, Docker Compose, Render / Railway       |

## Quick Start

### Option 1: Docker (recommended)

```bash
# Copy env template and fill in values
cp .env.example .env

# Generate a secret key
python -c "import secrets; print(secrets.token_hex(32))"

# Start all services (Postgres + Backend + Frontend)
docker compose up --build
```

- **Backend API**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

### Option 2: Local Dev

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at **http://localhost:8000/docs**

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at **http://localhost:5173**

## Project Structure

```
valentis/
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── models/       # ML scoring models
│   │   ├── services/     # Business logic
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── db/           # SQLAlchemy ORM + Postgres
│   │   └── utils/        # Shared utilities
│   ├── scripts/          # Data generation tools
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
├── docker-compose.yml    # Postgres + Backend + Frontend
├── render.yaml           # Render deployment config
└── data/                 # Synthetic sample data
    └── sample/
```

## Data Pipeline

### Generate Synthetic Data

```bash
cd backend
python scripts/generate_data.py
```

Produces a 50K-row billing dataset (`claims_data.csv`) with realistic CPT/ICD-10 pairings and ~5% deliberate anomalies (duplicate claims, amount outliers, code mismatches).

### Ingest into Database

```bash
curl -X POST http://localhost:8000/api/ingest -F 'file=@scripts/claims_data.csv'
```

Bulk-inserts validated records via `POST /api/ingest`. Deduplicates against existing data.

## Data Upload

Upload a ZIP file containing:
- `accounts.csv` (required)
- `payments.csv` (required)
- `refunds.csv` (required)
- `chargebacks.csv` (required)
- `audit_log.csv` (required)
- `claims.csv` (optional)

All data must be de-identified. See `data/sample/` for examples.

## Database Schema

| Table | Purpose |
|---|---|
| `claims` | Raw billing records (claim_id, CPT, ICD-10, amounts, status) |
| `anomaly_flags` | Model output — flagged claims with score, reason, and review status |
| `audit_logs` | User action audit trail |
| `export_logs` | Data export tracking |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://valentis:valentis@localhost:5432/valentis
SECRET_KEY=<generate-with-python-secrets>
OPENAI_API_KEY=<your-key>
ENVIRONMENT=development
```

> ⚠️ Never commit `.env` files. All secrets are excluded via `.gitignore`.

## Security

- Designed with HIPAA-aligned principles of data minimization, encryption, and access control
- De-identified account IDs only — no PHI
- Role-based access control
- Audit logging on all actions
- Secrets managed via environment variables, never hardcoded
