"""Payment plan schemas."""

from pydantic import BaseModel


class PaymentPlanOut(BaseModel):
    account_id: str
    plan_length_months: int
    installment_amount: float
    expected_collection_probability: float
    projected_revenue: float
