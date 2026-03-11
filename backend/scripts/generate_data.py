#!/usr/bin/env python3
"""
Generate a 50K-row synthetic healthcare billing dataset.

Produces claims_data.csv with realistic CPT/ICD-10 pairings and
~5% deliberate anomalies for model training:
  - Duplicate claims
  - Amount outliers (3+ std devs above CPT mean)
  - ICD-10 / CPT mismatches
"""

import os
import random
import uuid
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)
np.random.seed(42)

# ── Realistic CPT codes with typical billed amounts (mean, std) ──────────
CPT_CATALOG = {
    "99213": {"desc": "Office visit, est. patient (level 3)", "mean": 150, "std": 30,
              "icd10": ["Z00.00", "J06.9", "R10.9", "M54.5"]},
    "99214": {"desc": "Office visit, est. patient (level 4)", "mean": 220, "std": 45,
              "icd10": ["E11.9", "I10", "J44.1", "M79.3"]},
    "99215": {"desc": "Office visit, est. patient (level 5)", "mean": 350, "std": 70,
              "icd10": ["E11.65", "I25.10", "C34.90", "G43.909"]},
    "99203": {"desc": "Office visit, new patient (level 3)", "mean": 200, "std": 40,
              "icd10": ["Z00.00", "J20.9", "R05.9"]},
    "99204": {"desc": "Office visit, new patient (level 4)", "mean": 310, "std": 60,
              "icd10": ["E78.5", "I10", "J45.20"]},
    "99385": {"desc": "Preventive visit, new, 18-39", "mean": 280, "std": 50,
              "icd10": ["Z00.00", "Z23"]},
    "99395": {"desc": "Preventive visit, est., 18-39", "mean": 260, "std": 45,
              "icd10": ["Z00.00", "Z23", "Z12.31"]},
    "90834": {"desc": "Psychotherapy, 45 min", "mean": 175, "std": 35,
              "icd10": ["F32.1", "F41.1", "F43.10"]},
    "90837": {"desc": "Psychotherapy, 60 min", "mean": 220, "std": 40,
              "icd10": ["F33.1", "F41.0", "F43.12"]},
    "71046": {"desc": "Chest X-ray, 2 views", "mean": 120, "std": 25,
              "icd10": ["J18.9", "R05.9", "J44.1"]},
    "73721": {"desc": "MRI lower extremity w/o contrast", "mean": 800, "std": 150,
              "icd10": ["M23.50", "M25.561", "S83.511A"]},
    "73560": {"desc": "X-ray knee, 1-2 views", "mean": 95, "std": 20,
              "icd10": ["M17.11", "M25.561", "S82.001A"]},
    "80053": {"desc": "Comprehensive metabolic panel", "mean": 45, "std": 10,
              "icd10": ["E11.9", "E78.5", "N18.3", "Z00.00"]},
    "85025": {"desc": "CBC with auto diff", "mean": 30, "std": 8,
              "icd10": ["D64.9", "Z00.00", "R79.89"]},
    "36415": {"desc": "Venipuncture", "mean": 12, "std": 3,
              "icd10": ["Z00.00", "E11.9"]},
    "97110": {"desc": "Therapeutic exercises", "mean": 85, "std": 18,
              "icd10": ["M54.5", "M25.511", "S43.401A"]},
    "97140": {"desc": "Manual therapy", "mean": 90, "std": 20,
              "icd10": ["M54.5", "M62.830", "M79.3"]},
    "99232": {"desc": "Subsequent hospital care (level 2)", "mean": 140, "std": 30,
              "icd10": ["J18.9", "I50.9", "N17.9"]},
    "99233": {"desc": "Subsequent hospital care (level 3)", "mean": 200, "std": 45,
              "icd10": ["I21.3", "J96.01", "A41.9"]},
    "99291": {"desc": "Critical care, first 30-74 min", "mean": 500, "std": 100,
              "icd10": ["J96.01", "I46.9", "A41.9", "R57.1"]},
}

ALL_ICD10 = list({code for info in CPT_CATALOG.values() for code in info["icd10"]})
CPT_CODES = list(CPT_CATALOG.keys())

CLAIM_STATUSES = ["paid", "denied", "pending", "appealed", "adjusted"]
STATUS_WEIGHTS = [0.60, 0.12, 0.15, 0.05, 0.08]

TOTAL_ROWS = 50_000
ANOMALY_RATE = 0.05
NUM_ANOMALIES = int(TOTAL_ROWS * ANOMALY_RATE)

# Pre-generate patient / provider pools
NUM_PATIENTS = 8_000
NUM_PROVIDERS = 200
PATIENT_IDS = [f"PAT-{uuid.uuid4().hex[:8].upper()}" for _ in range(NUM_PATIENTS)]
PROVIDER_IDS = [f"PRV-{uuid.uuid4().hex[:6].upper()}" for _ in range(NUM_PROVIDERS)]


def _generate_normal_row(idx: int) -> dict:
    """Generate a single normal (non-anomalous) claim row."""
    cpt = random.choice(CPT_CODES)
    info = CPT_CATALOG[cpt]
    icd10 = random.choice(info["icd10"])

    billed = round(max(10, np.random.normal(info["mean"], info["std"])), 2)
    # Allowed is typically 60-90% of billed
    allowed = round(billed * random.uniform(0.60, 0.90), 2)
    # Paid depends on status
    status = random.choices(CLAIM_STATUSES, weights=STATUS_WEIGHTS, k=1)[0]
    if status == "denied":
        paid = 0.0
    elif status == "pending":
        paid = 0.0
    elif status == "adjusted":
        paid = round(allowed * random.uniform(0.50, 0.85), 2)
    else:
        paid = round(allowed * random.uniform(0.85, 1.0), 2)

    service_date = fake.date_between(
        start_date=datetime(2023, 1, 1), end_date=datetime(2025, 12, 31)
    )

    return {
        "claim_id": f"CLM-{idx:07d}",
        "patient_id": random.choice(PATIENT_IDS),
        "provider_id": random.choice(PROVIDER_IDS),
        "cpt_code": cpt,
        "icd10_code": icd10,
        "billed_amount": billed,
        "allowed_amount": allowed,
        "paid_amount": paid,
        "service_date": service_date.isoformat(),
        "claim_status": status,
    }


def _inject_anomalies(rows: list[dict]) -> list[dict]:
    """Inject ~5% anomalies across three types."""
    anomaly_indices = random.sample(range(len(rows)), NUM_ANOMALIES)
    random.shuffle(anomaly_indices)

    # Split evenly across three anomaly types
    chunk = NUM_ANOMALIES // 3

    # Type 1: Duplicate claims — reuse an existing claim_id
    dup_indices = anomaly_indices[:chunk]
    for i in dup_indices:
        donor = random.choice(rows[:i]) if i > 0 else rows[0]
        rows[i]["claim_id"] = donor["claim_id"]  # duplicate ID

    # Type 2: Amount outliers — billed 3+ std devs above CPT mean
    outlier_indices = anomaly_indices[chunk : chunk * 2]
    for i in outlier_indices:
        cpt = rows[i]["cpt_code"]
        info = CPT_CATALOG[cpt]
        # 3 to 6 standard deviations above mean
        multiplier = random.uniform(3.0, 6.0)
        rows[i]["billed_amount"] = round(info["mean"] + multiplier * info["std"], 2)
        rows[i]["allowed_amount"] = round(rows[i]["billed_amount"] * 0.85, 2)
        rows[i]["paid_amount"] = round(rows[i]["allowed_amount"] * 0.90, 2)

    # Type 3: ICD-10 / CPT mismatches — assign an ICD-10 from a different CPT
    mismatch_indices = anomaly_indices[chunk * 2:]
    for i in mismatch_indices:
        correct_icd10s = set(CPT_CATALOG[rows[i]["cpt_code"]]["icd10"])
        wrong_codes = [c for c in ALL_ICD10 if c not in correct_icd10s]
        if wrong_codes:
            rows[i]["icd10_code"] = random.choice(wrong_codes)

    return rows


def main():
    print(f"Generating {TOTAL_ROWS:,} billing records...")

    # Generate all normal rows
    rows = [_generate_normal_row(i) for i in range(TOTAL_ROWS)]

    # Inject anomalies
    rows = _inject_anomalies(rows)

    df = pd.DataFrame(rows)

    # Shuffle so anomalies aren't clustered
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Stats
    dup_count = df["claim_id"].duplicated(keep=False).sum()
    print(f"  Duplicate claim_id rows:  {dup_count}")

    # Count amount outliers (billed > mean + 3*std for its CPT)
    outlier_count = 0
    for cpt, group in df.groupby("cpt_code"):
        info = CPT_CATALOG[cpt]
        threshold = info["mean"] + 3 * info["std"]
        outlier_count += (group["billed_amount"] > threshold).sum()
    print(f"  Amount outliers (3+ σ):   {outlier_count}")

    print(f"  Total anomaly rate:       ~{(dup_count + outlier_count) / len(df) * 100:.1f}%")

    out_path = os.path.join(os.path.dirname(__file__), "claims_data.csv")
    df.to_csv(out_path, index=False)
    print(f"  Saved to: {out_path}")
    print(f"  Shape:    {df.shape[0]:,} rows × {df.shape[1]} columns")


if __name__ == "__main__":
    main()
