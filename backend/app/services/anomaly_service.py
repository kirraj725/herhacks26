"""Anomaly detection service — orchestrates anomaly detection pipeline."""

from app.services.data_store import DataStore
from app.models.anomaly_detection import detect_anomalies


def run_anomaly_detection() -> dict:
    """Detect financial anomalies and generate heatmap data."""
    DataStore.ensure_loaded()
    return detect_anomalies(DataStore.accounts, DataStore.refunds, DataStore.chargebacks)
