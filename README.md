# ClearCollect AI

**Hospital Revenue & Payment Risk Intelligence Platform**

ClearCollect AI is a predictive revenue intelligence and fraud detection layer that helps hospitals proactively protect revenue, detect suspicious financial activity, and optimize collections before accounts reach bad debt.

## Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| **Frontend**| React 18, Vite, Recharts, React Router       |
| **Backend** | Python, FastAPI, Pandas, NumPy, Scikit-learn  |
| **Database**| SQLite (demo) / in-memory processing          |
| **ML**      | Logistic Regression, Isolation Forest, Z-score|

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs available at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at **http://localhost:5173**

## Project Structure

```
hackhers/
├── backend/          # FastAPI + ML models
│   ├── app/
│   │   ├── routers/  # API endpoints
│   │   ├── models/   # ML scoring models
│   │   ├── services/ # Business logic
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── db/       # SQLAlchemy / SQLite
│   │   └── utils/    # Shared utilities
│   └── tests/
├── frontend/         # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
└── data/             # Synthetic sample data
    └── sample/
```

## Data Upload

Upload a ZIP file containing:
- `accounts.csv` (required)
- `payments.csv` (required)
- `refunds.csv` (required)
- `chargebacks.csv` (required)
- `audit_log.csv` (required)
- `claims.csv` (optional)

All data must be de-identified. See `data/sample/` for examples.

## Security

- Designed with HIPAA-aligned principles of data minimization, encryption, and access control
- De-identified account IDs only — no PHI
- Role-based access control
- Audit logging on all actions
