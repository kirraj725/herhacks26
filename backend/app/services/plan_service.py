"""Payment plan service — orchestrates plan recommendation engine."""

from app.services.risk_service import run_risk_scoring
from app.models.payment_plan import recommend_plans_for_all, recommend_plan


def run_all_plan_recommendations() -> list[dict]:
    """Generate optimized payment plans for all accounts."""
    scores = run_risk_scoring()
    return recommend_plans_for_all(scores)


def run_plan_for_account(account_id: str) -> dict | None:
    """Generate a plan for a single account."""
    scores = run_risk_scoring()
    acct = next((s for s in scores if s["account_id"] == account_id), None)
    if not acct:
        return None
    plan = recommend_plan(acct["risk_score"], acct["risk_category"], acct.get("patient_balance", 0))
    return {"account_id": account_id, **acct, **plan}
