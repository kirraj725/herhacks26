"""Payment plan optimization endpoints."""

from fastapi import APIRouter
from app.services.plan_service import run_all_plan_recommendations, run_plan_for_account

router = APIRouter()


@router.get("/")
async def get_all_plans():
    """Return recommended payment plans for all accounts."""
    plans = run_all_plan_recommendations()
    return {"plans": plans, "total": len(plans)}


@router.get("/{account_id}")
async def get_recommended_plan(account_id: str):
    """Return an optimized payment plan for a specific account."""
    plan = run_plan_for_account(account_id)
    if not plan:
        return {"error": "Account not found"}
    return plan


@router.get("/{account_id}/history")
async def get_payment_history(account_id: str):
    """Return payment history for a specific account."""
    from app.services.data_store import DataStore
    DataStore.ensure_loaded()

    payments = DataStore.payments
    if payments.empty:
        return {"account_id": account_id, "payments": [], "total": 0}

    acct_payments = payments[payments["account_id"] == account_id].copy()
    acct_payments = acct_payments.fillna("")

    rows = acct_payments.to_dict(orient="records")
    return {
        "account_id": account_id,
        "payments": rows,
        "total": len(rows),
        "columns": list(acct_payments.columns),
    }
