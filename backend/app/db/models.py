"""SQLAlchemy ORM models for audit logging, claims, and anomaly flags."""

from sqlalchemy import Column, String, DateTime, Integer, Float, Boolean, ForeignKey, Date
from datetime import datetime, timezone
from app.db.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ExportLog(Base):
    __tablename__ = "export_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, unique=True, nullable=False, index=True)
    patient_id = Column(String, nullable=False, index=True)
    provider_id = Column(String, nullable=False, index=True)
    cpt_code = Column(String, nullable=False)
    icd10_code = Column(String, nullable=False)
    billed_amount = Column(Float, nullable=False)
    allowed_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, nullable=False)
    service_date = Column(Date, nullable=False)
    claim_status = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AnomalyFlag(Base):
    __tablename__ = "anomaly_flags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, ForeignKey("claims.claim_id"), nullable=False, index=True)
    anomaly_score = Column(Float, nullable=False)
    flag_reason = Column(String, nullable=False)
    reviewed = Column(Boolean, default=False, nullable=False)
    flagged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

