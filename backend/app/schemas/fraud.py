"""Fraud detection schemas."""

from pydantic import BaseModel


class FraudAlertOut(BaseModel):
    transaction_id: str
    fraud_risk_flag: bool
    confidence_score: float
    reason_code: str
