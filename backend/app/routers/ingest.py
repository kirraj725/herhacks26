"""
Ingest endpoint — bulk-inserts billing CSV into PostgreSQL.

POST /api/ingest accepts a CSV upload, validates records via Pydantic,
and performs a bulk insert using session.bulk_save_objects() for performance.
"""

import io
from datetime import date

import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db, engine, Base
from app.db.models import Claim
from app.schemas.claims import ClaimRecord, IngestResponse

router = APIRouter()

REQUIRED_COLUMNS = {
    "claim_id", "patient_id", "provider_id", "cpt_code", "icd10_code",
    "billed_amount", "allowed_amount", "paid_amount", "service_date", "claim_status",
}


@router.post("/", response_model=IngestResponse)
async def ingest_claims(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Ingest a billing CSV into the claims table.

    - Validates column presence
    - Validates each row via Pydantic
    - Skips duplicate claim_ids already in DB
    - Bulk inserts valid records
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Read CSV
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    # Validate columns
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(sorted(missing))}",
        )

    # Parse service_date to date objects
    df["service_date"] = pd.to_datetime(df["service_date"]).dt.date

    # Fetch existing claim_ids to skip duplicates
    existing_ids = {
        row[0] for row in db.query(Claim.claim_id).all()
    }

    errors: list[str] = []
    orm_objects: list[Claim] = []
    duplicates_skipped = 0

    for idx, row in df.iterrows():
        row_dict = row.to_dict()

        # Skip duplicates already in DB
        if row_dict["claim_id"] in existing_ids:
            duplicates_skipped += 1
            continue

        # Validate via Pydantic
        try:
            validated = ClaimRecord(**row_dict)
        except Exception as e:
            errors.append(f"Row {idx}: {e}")
            if len(errors) >= 100:  # Cap error reporting
                errors.append("... (truncated, too many errors)")
                break
            continue

        orm_objects.append(Claim(
            claim_id=validated.claim_id,
            patient_id=validated.patient_id,
            provider_id=validated.provider_id,
            cpt_code=validated.cpt_code,
            icd10_code=validated.icd10_code,
            billed_amount=validated.billed_amount,
            allowed_amount=validated.allowed_amount,
            paid_amount=validated.paid_amount,
            service_date=validated.service_date,
            claim_status=validated.claim_status,
        ))

        # Track as existing to handle in-file duplicates
        existing_ids.add(validated.claim_id)

    # Bulk insert
    if orm_objects:
        db.bulk_save_objects(orm_objects)
        db.commit()

    return IngestResponse(
        status="success",
        records_inserted=len(orm_objects),
        duplicates_skipped=duplicates_skipped,
        errors=errors,
    )
