"""Audit & access monitoring endpoints."""

from fastapi import APIRouter
from app.services.audit_service import get_audit_logs, get_suspicious_access, get_export_logs

router = APIRouter()


@router.get("/logs")
async def get_logs():
    """Return audit log entries."""
    logs = get_audit_logs()
    return {"logs": logs, "total": len(logs)}


@router.get("/access")
async def get_access_alerts():
    """Return suspicious access pattern alerts."""
    alerts = get_suspicious_access()
    return {"alerts": alerts, "total": len(alerts)}


@router.get("/exports")
async def get_exports():
    """Return CSV export history."""
    exports = get_export_logs()
    return {"exports": exports, "total": len(exports)}


@router.get("/user/{user_id}")
async def get_user_activity(user_id: str):
    """Return all audit log entries for a specific user."""
    from app.services.data_store import DataStore
    DataStore.ensure_loaded()
    if DataStore.audit_log.empty:
        return {"user_id": user_id, "logs": [], "total": 0}

    user_logs = DataStore.audit_log[DataStore.audit_log["user_id"] == user_id].copy()
    user_logs = user_logs.fillna("")
    rows = user_logs.to_dict(orient="records")
    return {
        "user_id": user_id,
        "logs": rows,
        "total": len(rows),
        "columns": list(user_logs.columns),
    }
