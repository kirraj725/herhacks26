"""
Financial Anomaly Detection Model

Detects abnormal trends per service_category using statistical
deviation from expected patterns.
"""

import pandas as pd
import numpy as np


def detect_anomalies(accounts_df: pd.DataFrame, refunds_df: pd.DataFrame, chargebacks_df: pd.DataFrame) -> dict:
    """
    Detect financial anomalies across departments/service categories.

    Returns:
        {
          "anomaly_alerts": [...],
          "department_heatmap": [...],
          "severity_ranking": [...]
        }
    """
    alerts: list[dict] = []
    heatmap: list[dict] = []

    if accounts_df.empty:
        return {"anomaly_alerts": [], "department_heatmap": [], "severity_ranking": []}

    # ── Department-level metrics ──
    dept_groups = accounts_df.groupby("service_category")

    overall_mean_balance = accounts_df["patient_balance"].mean()
    overall_mean_dpd = accounts_df["days_past_due"].mean()

    for dept, group in dept_groups:
        avg_balance = group["patient_balance"].mean()
        avg_dpd = group["days_past_due"].mean()
        avg_late = group["historical_late_payments_12m"].mean()
        high_risk_pct = (group["days_past_due"] > 30).sum() / len(group) * 100
        total_at_risk = group["patient_balance"].sum()

        # Refund rate for this dept
        dept_accounts = group["account_id"].tolist()
        refund_count = 0
        if not refunds_df.empty:
            refund_count = refunds_df[refunds_df["account_id"].isin(dept_accounts)].shape[0]

        chargeback_count = 0
        if not chargebacks_df.empty:
            chargeback_count = chargebacks_df[chargebacks_df["account_id"].isin(dept_accounts)].shape[0]

        # Deviation-based severity
        balance_dev = (avg_balance - overall_mean_balance) / (overall_mean_balance or 1)
        dpd_dev = (avg_dpd - overall_mean_dpd) / (overall_mean_dpd or 1)
        risk_score = round(min(max(
            (abs(balance_dev) * 40) + (abs(dpd_dev) * 30) + (high_risk_pct * 0.3),
            0
        ), 100), 1)

        if risk_score >= 60:
            severity = "critical"
        elif risk_score >= 35:
            severity = "warning"
        else:
            severity = "normal"

        heatmap.append({
            "department": dept,
            "avg_balance": round(avg_balance, 2),
            "avg_days_past_due": round(avg_dpd, 1),
            "avg_late_payments": round(avg_late, 1),
            "high_risk_pct": round(high_risk_pct, 1),
            "total_at_risk": round(total_at_risk, 2),
            "refund_count": refund_count,
            "chargeback_count": chargeback_count,
            "risk_score": risk_score,
            "severity": severity,
        })

        # Generate alerts for anomalous departments
        if balance_dev > 0.3:
            alerts.append({
                "alert_id": f"ANM-BAL-{dept}",
                "department": dept,
                "anomaly_type": "High Average Balance",
                "severity": severity,
                "description": f"Avg balance ${avg_balance:,.2f} is {balance_dev*100:.0f}% above overall mean",
            })
        if dpd_dev > 0.5:
            alerts.append({
                "alert_id": f"ANM-DPD-{dept}",
                "department": dept,
                "anomaly_type": "High Days Past Due",
                "severity": severity,
                "description": f"Avg DPD {avg_dpd:.0f} days is {dpd_dev*100:.0f}% above overall mean",
            })
        if refund_count >= 2:
            alerts.append({
                "alert_id": f"ANM-REF-{dept}",
                "department": dept,
                "anomaly_type": "Elevated Refund Rate",
                "severity": "warning",
                "description": f"{refund_count} refunds detected for {dept} accounts",
            })

    heatmap.sort(key=lambda h: h["risk_score"], reverse=True)
    severity_ranking = [
        {"department": h["department"], "risk_score": h["risk_score"], "severity": h["severity"]}
        for h in heatmap
    ]

    return {
        "anomaly_alerts": alerts,
        "department_heatmap": heatmap,
        "severity_ranking": severity_ranking,
    }
