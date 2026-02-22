"""Audit & security schemas."""

from pydantic import BaseModel
from datetime import datetime


class AuditLogOut(BaseModel):
    log_id: str
    user_id: str
    action: str
    resource: str
    timestamp: datetime


class AccessAlertOut(BaseModel):
    alert_id: str
    user_id: str
    reason: str
    severity: str
    timestamp: datetime
