"""
Global in-memory data store.

Holds pandas DataFrames loaded from CSV files.
All services read from this singleton.
"""

import os
import pandas as pd

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "sample")


class DataStore:
    """Singleton holding all ingested DataFrames."""

    accounts: pd.DataFrame = pd.DataFrame()
    payments: pd.DataFrame = pd.DataFrame()
    refunds: pd.DataFrame = pd.DataFrame()
    chargebacks: pd.DataFrame = pd.DataFrame()
    claims: pd.DataFrame = pd.DataFrame()
    audit_log: pd.DataFrame = pd.DataFrame()
    _loaded: bool = False

    @classmethod
    def load_from_directory(cls, directory: str | None = None):
        """Load all CSVs from a directory into memory."""
        d = directory or _DATA_DIR
        mapping = {
            "accounts": "accounts.csv",
            "payments": "payments.csv",
            "refunds": "refunds.csv",
            "chargebacks": "chargebacks.csv",
            "claims": "claims.csv",
            "audit_log": "audit_log.csv",
        }
        for attr, filename in mapping.items():
            path = os.path.join(d, filename)
            if os.path.exists(path):
                setattr(cls, attr, pd.read_csv(path))
        cls._loaded = True

    @classmethod
    def ensure_loaded(cls):
        if not cls._loaded:
            cls.load_from_directory()
