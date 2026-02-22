"""
Revenue at Risk Forecasting Model

Calculates projected delinquency, bad debt, collection rate,
and revenue at risk from accounts data.
"""

import pandas as pd
import numpy as np


def forecast_revenue_risk(accounts_df: pd.DataFrame) -> dict:
    """
    Generate macro-level financial forecasts.

    Returns executive dashboard metrics + monthly forecast series.
    """
    if accounts_df.empty:
        return {
            "projected_delinquency_30d": 0,
            "estimated_bad_debt": 0,
            "expected_collection_rate": 0,
            "revenue_at_risk": 0,
            "total_outstanding": 0,
            "total_charges": 0,
            "high_risk_count": 0,
            "total_accounts": 0,
            "forecast_series": [],
        }

    total_outstanding = accounts_df["patient_balance"].sum()
    total_charges = accounts_df["total_charges"].sum()
    total_accounts = len(accounts_df)

    # Accounts likely to become delinquent (DPD > 30 or high late payment history)
    delinquent_mask = (accounts_df["days_past_due"] > 30) | (
        accounts_df["historical_late_payments_12m"] >= 3
    )
    delinquent_balance = accounts_df.loc[delinquent_mask, "patient_balance"].sum()
    high_risk_count = int(delinquent_mask.sum())

    # Bad debt: accounts > 90 DPD with self_pay or high late payments
    bad_debt_mask = (accounts_df["days_past_due"] > 90) | (
        (accounts_df["historical_late_payments_12m"] >= 5)
        & (accounts_df["payer_type"] == "self_pay")
    )
    estimated_bad_debt = accounts_df.loc[bad_debt_mask, "patient_balance"].sum()

    # Collection rate estimate
    insurance_paid = accounts_df["insurance_paid"].sum()
    expected_collection_rate = round(
        (insurance_paid / total_charges * 100) if total_charges else 0, 1
    )

    revenue_at_risk = round(delinquent_balance + estimated_bad_debt * 0.5, 2)

    # Generate a 6-month forecast series
    base_risk = revenue_at_risk
    forecast_series = []
    for month in range(1, 7):
        # Simple trend: risk grows by ~8% per month if unaddressed
        projected = round(base_risk * (1 + 0.08 * month), 2)
        collected = round(base_risk * 0.15 * month, 2)
        forecast_series.append({
            "month": f"Month {month}",
            "projected_risk": projected,
            "projected_collections": min(collected, projected),
            "net_risk": round(projected - min(collected, projected), 2),
        })

    return {
        "projected_delinquency_30d": round(delinquent_balance, 2),
        "estimated_bad_debt": round(estimated_bad_debt, 2),
        "expected_collection_rate": expected_collection_rate,
        "revenue_at_risk": revenue_at_risk,
        "total_outstanding": round(total_outstanding, 2),
        "total_charges": round(total_charges, 2),
        "high_risk_count": high_risk_count,
        "total_accounts": total_accounts,
        "forecast_series": forecast_series,
    }
