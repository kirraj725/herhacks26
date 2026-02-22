"""
Fraudulent Payment Detection Model

Rule-based + Z-score anomaly detection on refunds, chargebacks,
and payment patterns.
"""

import pandas as pd
import numpy as np
from collections import Counter


def detect_fraud(
    payments_df: pd.DataFrame,
    refunds_df: pd.DataFrame,
    chargebacks_df: pd.DataFrame,
) -> list[dict]:
    """Identify suspicious transactions and return fraud alerts."""
    alerts: list[dict] = []

    # ── 1. Duplicate refunds (same account + same amount) ──
    if not refunds_df.empty:
        dup_key = refunds_df.groupby(["account_id", "refund_amount"]).size()
        for (acct, amt), count in dup_key.items():
            if count >= 2:
                txns = refunds_df[
                    (refunds_df["account_id"] == acct)
                    & (refunds_df["refund_amount"] == amt)
                ]["transaction_id"].tolist()
                alerts.append({
                    "transaction_id": ", ".join(str(t) for t in txns),
                    "account_id": acct,
                    "fraud_risk_flag": True,
                    "confidence_score": round(min(0.5 + count * 0.15, 0.95), 2),
                    "reason_code": "DUPLICATE_REFUND",
                    "amount": float(amt),
                    "description": f"Duplicate refund of ${amt:.2f} — seen {count}x (transactions: {', '.join(str(t) for t in txns)})",
                })

    # ── 2. Repeated chargebacks per account ──
    if not chargebacks_df.empty:
        cb_counts = chargebacks_df["account_id"].value_counts()
        for acct, count in cb_counts.items():
            if count >= 2:
                txns = chargebacks_df[chargebacks_df["account_id"] == acct][
                    "transaction_id"
                ].tolist()
                total_amt = float(chargebacks_df[chargebacks_df["account_id"] == acct]["amount"].sum())
                alerts.append({
                    "transaction_id": ", ".join(str(t) for t in txns),
                    "account_id": acct,
                    "fraud_risk_flag": True,
                    "confidence_score": round(min(0.6 + count * 0.1, 0.95), 2),
                    "reason_code": "REPEATED_CHARGEBACK",
                    "amount": total_amt,
                    "description": f"Account {acct} has {count} chargebacks totaling ${total_amt:.2f}",
                })

    # ── 3. Z-score on refund amounts ──
    if not refunds_df.empty and len(refunds_df) >= 3:
        mean_r = refunds_df["refund_amount"].mean()
        std_r = refunds_df["refund_amount"].std()
        if std_r and std_r > 0:
            refunds_df = refunds_df.copy()
            refunds_df["z"] = (refunds_df["refund_amount"] - mean_r) / std_r
            outliers = refunds_df[refunds_df["z"].abs() > 1.5]
            for _, row in outliers.iterrows():
                tid = row["transaction_id"]
                if not any(a["transaction_id"] == tid for a in alerts):
                    alerts.append({
                        "transaction_id": tid,
                        "account_id": row["account_id"],
                        "fraud_risk_flag": True,
                        "confidence_score": round(min(abs(row["z"]) * 0.3, 0.95), 2),
                        "reason_code": "UNUSUAL_REFUND_AMOUNT",
                        "amount": float(row["refund_amount"]),
                        "description": f"Refund amount ${row['refund_amount']:.2f} is {abs(row['z']):.1f}σ from mean",
                    })

    # De-duplicate by transaction_id (keep highest confidence)
    seen: dict[str, dict] = {}
    for a in alerts:
        tid = a["transaction_id"]
        if tid not in seen or a["confidence_score"] > seen[tid]["confidence_score"]:
            seen[tid] = a
    return sorted(seen.values(), key=lambda x: x["confidence_score"], reverse=True)
