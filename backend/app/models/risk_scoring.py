"""
Patient Payment Risk Scoring Model

Weighted scoring system to predict likelihood of payment delinquency.

Weights:
  - days_past_due:                30%
  - historical_late_payments_12m: 25%
  - balance / charges ratio:      20%
  - payer_type:                   15%
  - deductible_remaining:         10%
"""

import pandas as pd
import numpy as np


# Payer-type risk multipliers (higher = riskier)
PAYER_RISK = {
    "commercial": 0.2,
    "medicare": 0.3,
    "medicaid": 0.4,
    "self_pay": 0.9,
}


def _score_row(row: pd.Series) -> dict:
    # --- component scores (each normalised to 0-100) ---
    dpd = min(row.get("days_past_due", 0) / 120 * 100, 100)
    late = min(row.get("historical_late_payments_12m", 0) / 6 * 100, 100)

    total_charges = row.get("total_charges", 1) or 1
    balance_ratio = min((row.get("patient_balance", 0) / total_charges) * 100, 100)

    payer = PAYER_RISK.get(str(row.get("payer_type", "")).lower(), 0.5) * 100

    deductible = min(row.get("deductible_remaining_est", 0) / 500 * 100, 100)

    # Weighted sum
    score = (
        dpd * 0.30
        + late * 0.25
        + balance_ratio * 0.20
        + payer * 0.15
        + deductible * 0.10
    )
    score = round(min(max(score, 0), 100), 1)

    if score >= 65:
        category = "High"
    elif score >= 35:
        category = "Medium"
    else:
        category = "Low"

    collection_prob = round(max(100 - score, 5), 1)

    return {
        "account_id": row.get("account_id", ""),
        "risk_score": score,
        "risk_category": category,
        "expected_collection_probability": collection_prob,
        "patient_balance": row.get("patient_balance", 0),
        "total_charges": row.get("total_charges", 0),
        "days_past_due": row.get("days_past_due", 0),
        "payer_type": row.get("payer_type", ""),
        "service_category": row.get("service_category", ""),
    }


def calculate_risk_scores(accounts_df: pd.DataFrame) -> list[dict]:
    """Calculate risk scores for every account."""
    if accounts_df.empty:
        return []
    results = accounts_df.apply(_score_row, axis=1).tolist()
    return sorted(results, key=lambda r: r["risk_score"], reverse=True)
