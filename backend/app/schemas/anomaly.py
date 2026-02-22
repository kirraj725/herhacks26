"""Anomaly detection schemas."""

from pydantic import BaseModel


class AnomalyAlertOut(BaseModel):
    alert_id: str
    department: str
    anomaly_type: str
    severity: str
    description: str
