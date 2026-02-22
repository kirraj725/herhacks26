"""Fraud detection service — orchestrates the fraud detection pipeline."""

from app.services.data_store import DataStore
from app.models.fraud_detection import detect_fraud


def run_fraud_detection() -> list[dict]:
    """Load payments/refunds/chargebacks and detect fraud."""
    DataStore.ensure_loaded()
    return detect_fraud(DataStore.payments, DataStore.refunds, DataStore.chargebacks)
