"""Risk scoring schemas."""

from pydantic import BaseModel


class RiskScoreOut(BaseModel):
    account_id: str
    risk_score: float
    risk_category: str  # Low / Medium / High
    expected_collection_probability: float
