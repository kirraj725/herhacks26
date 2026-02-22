"""Financial anomaly detection endpoints."""

from fastapi import APIRouter
from app.services.anomaly_service import run_anomaly_detection

router = APIRouter()


@router.get("/alerts")
async def get_anomaly_alerts():
    """Return detected financial anomalies."""
    result = run_anomaly_detection()
    return {"anomalies": result["anomaly_alerts"], "total": len(result["anomaly_alerts"])}


@router.get("/heatmap")
async def get_department_heatmap():
    """Return department-level risk heatmap data."""
    result = run_anomaly_detection()
    return {"heatmap": result["department_heatmap"], "severity_ranking": result["severity_ranking"]}


@router.get("/department")
async def get_department_detail(name: str):
    """Return detailed account data for a specific department."""
    from app.services.data_store import DataStore
    DataStore.ensure_loaded()

    result = run_anomaly_detection()
    dept_info = next((d for d in result["department_heatmap"] if d["department"] == name), None)
    if not dept_info:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Department '{name}' not found")

    accounts = DataStore.accounts
    dept_accounts = accounts[accounts["service_category"] == name].copy()
    dept_accounts = dept_accounts.fillna("")

    return {
        "department": name,
        "summary": dept_info,
        "accounts": dept_accounts.to_dict(orient="records"),
        "columns": list(dept_accounts.columns),
        "total_accounts": len(dept_accounts),
    }
