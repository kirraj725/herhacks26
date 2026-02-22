"""Revenue forecast service — orchestrates the forecasting pipeline."""

from app.services.data_store import DataStore
from app.models.revenue_forecast import forecast_revenue_risk


def run_forecast() -> dict:
    """Generate revenue-at-risk forecasts."""
    DataStore.ensure_loaded()
    return forecast_revenue_risk(DataStore.accounts)
