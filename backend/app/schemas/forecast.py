"""Revenue forecast schemas."""

from pydantic import BaseModel


class ForecastOut(BaseModel):
    projected_delinquency_30d: float
    estimated_bad_debt: float
    expected_collection_rate: float
    revenue_at_risk: float
