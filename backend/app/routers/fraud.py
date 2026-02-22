"""Fraudulent payment detection endpoints."""

from fastapi import APIRouter
from app.services.fraud_service import run_fraud_detection

router = APIRouter()


@router.get("/alerts")
async def get_fraud_alerts():
    """Return flagged fraudulent transactions."""
    alerts = run_fraud_detection()
    return {
        "alerts": alerts,
        "total_flagged": len(alerts),
        "high_confidence": len([a for a in alerts if a["confidence_score"] >= 0.7]),
    }


@router.get("/alerts/{transaction_id}")
async def get_fraud_detail(transaction_id: str):
    """Return fraud detail for a specific transaction."""
    alerts = run_fraud_detection()
    alert = next((a for a in alerts if a["transaction_id"] == transaction_id), None)
    if not alert:
        return {"error": "Transaction not found or not flagged"}
    return alert
