"""
CSV schema validation utilities.

Validates uploaded CSV files against expected column schemas.
"""

import pandas as pd

EXPECTED_SCHEMAS = {
    "accounts.csv": [
        "account_id",
        "patient_balance",
        "total_charges",
        "insurance_paid",
        "historical_late_payments_12m",
        "days_past_due",
        "service_category",
        "payer_type",
    ],
    "payments.csv": [
        "transaction_id",
        "account_id",
        "amount",
        "payment_date",
        "payment_method",
    ],
    "refunds.csv": [
        "transaction_id",
        "account_id",
        "refund_amount",
        "refund_date",
        "reason",
    ],
    "chargebacks.csv": [
        "transaction_id",
        "account_id",
        "amount",
        "chargeback_date",
        "reason",
    ],
    "audit_log.csv": [
        "log_id",
        "user_id",
        "action",
        "resource",
        "timestamp",
    ],
}


def validate_csv_schema(filepath: str, filename: str) -> list[str]:
    """
    Validate a CSV file against its expected schema.
    Returns a list of error messages (empty = valid).
    """
    # TODO: Implement
    return []
