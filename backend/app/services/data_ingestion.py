"""
Data Ingestion Service

Handles ZIP extraction, CSV validation, and storage
for upstream analysis pipelines.
"""

import zipfile
import os
import pandas as pd
from app.utils.csv_validator import validate_csv_schema


REQUIRED_FILES = [
    "accounts.csv",
    "payments.csv",
    "refunds.csv",
    "chargebacks.csv",
    "audit_log.csv",
]

OPTIONAL_FILES = [
    "claims.csv",
]


def extract_zip(zip_path: str, dest_dir: str) -> list[str]:
    """Extract ZIP and return list of extracted file paths."""
    # TODO: Implement
    pass


def validate_upload(dest_dir: str) -> dict:
    """Validate that all required CSVs are present and well-formed."""
    # TODO: Implement
    pass
