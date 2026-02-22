"""Risk scoring service — orchestrates the risk scoring pipeline."""

from app.services.data_store import DataStore
from app.models.risk_scoring import calculate_risk_scores


def run_risk_scoring() -> list[dict]:
    """Load accounts data and produce risk scores."""
    DataStore.ensure_loaded()
    return calculate_risk_scores(DataStore.accounts)
