"""Revenue at risk forecasting endpoints."""

from fastapi import APIRouter
from app.services.forecast_service import run_forecast

router = APIRouter()


@router.get("/")
async def get_revenue_forecast():
    """Return revenue-at-risk forecast metrics."""
    return run_forecast()
