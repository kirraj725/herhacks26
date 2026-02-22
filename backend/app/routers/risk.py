"""Patient payment risk scoring endpoints."""

from fastapi import APIRouter
from app.services.risk_service import run_risk_scoring

router = APIRouter()


@router.get("/scores")
async def get_risk_scores():
    """Return risk scores for all accounts."""
    scores = run_risk_scoring()
    return {
        "scores": scores,
        "total": len(scores),
        "high_risk": len([s for s in scores if s["risk_category"] == "High"]),
        "medium_risk": len([s for s in scores if s["risk_category"] == "Medium"]),
        "low_risk": len([s for s in scores if s["risk_category"] == "Low"]),
    }


@router.get("/scores/{account_id}")
async def get_account_risk(account_id: str):
    """Return risk details for a single account."""
    scores = run_risk_scoring()
    acct = next((s for s in scores if s["account_id"] == account_id), None)
    if not acct:
        return {"error": "Account not found"}
    return acct
