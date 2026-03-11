"""Pydantic schemas for claims and anomaly flags."""

from datetime import date, datetime
from pydantic import BaseModel, Field


class ClaimRecord(BaseModel):
    """Schema for validating a single CSV claim row on ingest."""
    claim_id: str
    patient_id: str
    provider_id: str
    cpt_code: str
    icd10_code: str
    billed_amount: float = Field(ge=0)
    allowed_amount: float = Field(ge=0)
    paid_amount: float = Field(ge=0)
    service_date: date
    claim_status: str


class ClaimOut(BaseModel):
    """Response schema for a claim record."""
    id: int
    claim_id: str
    patient_id: str
    provider_id: str
    cpt_code: str
    icd10_code: str
    billed_amount: float
    allowed_amount: float
    paid_amount: float
    service_date: date
    claim_status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AnomalyFlagOut(BaseModel):
    """Response schema for an anomaly flag."""
    id: int
    claim_id: str
    anomaly_score: float
    flag_reason: str
    reviewed: bool
    flagged_at: datetime

    model_config = {"from_attributes": True}


class IngestResponse(BaseModel):
    """Response from the /api/ingest endpoint."""
    status: str
    records_inserted: int
    duplicates_skipped: int
    errors: list[str]
