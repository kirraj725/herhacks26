"""Upload endpoint — accepts one or more CSV/ZIP files."""

import os
import zipfile
import tempfile
import shutil
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.data_store import DataStore

router = APIRouter()

REQUIRED_FILES = {"accounts.csv", "payments.csv", "refunds.csv", "chargebacks.csv", "audit_log.csv"}


def _process_csv_dir(csv_dir: str) -> dict:
    """Validate required files and reload DataStore."""
    found = {f for f in os.listdir(csv_dir) if f.endswith(".csv")}
    missing = REQUIRED_FILES - found

    if missing:
        return {
            "status": "error",
            "message": f"Missing required files: {', '.join(sorted(missing))}",
            "files_found": sorted(found),
        }

    DataStore.load_from_directory(csv_dir)
    return {
        "status": "success",
        "message": "Data uploaded and loaded successfully",
        "files_found": sorted(found),
    }


@router.post("/")
async def upload_data(files: List[UploadFile] = File(...)):
    """Accept one or more CSV/ZIP files."""
    tmp_dir = tempfile.mkdtemp()
    try:
        for f in files:
            if not f.filename:
                continue
            fname = f.filename.lower()
            basename = os.path.basename(f.filename)
            saved = os.path.join(tmp_dir, basename)
            with open(saved, "wb") as out:
                out.write(await f.read())

            # If it's a zip, extract it
            if fname.endswith(".zip"):
                with zipfile.ZipFile(saved, "r") as zf:
                    zf.extractall(tmp_dir)
                os.remove(saved)

        # Find directory with CSVs (may be nested from zip)
        csv_dir = tmp_dir
        for root, dirs, dir_files in os.walk(tmp_dir):
            if any(df.endswith(".csv") for df in dir_files):
                csv_dir = root
                break

        return _process_csv_dir(csv_dir)
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.get("/files")
async def list_files():
    """Return list of loaded CSV file names and their row counts."""
    DataStore.ensure_loaded()
    mapping = {
        "accounts.csv": DataStore.accounts,
        "payments.csv": DataStore.payments,
        "refunds.csv": DataStore.refunds,
        "chargebacks.csv": DataStore.chargebacks,
        "claims.csv": DataStore.claims,
        "audit_log.csv": DataStore.audit_log,
    }
    files = []
    for name, df in mapping.items():
        if not df.empty:
            files.append({"name": name, "rows": len(df), "columns": len(df.columns)})
    return {"files": files}


@router.get("/files/{filename}")
async def get_file_data(filename: str):
    """Return contents of a loaded CSV as JSON."""
    DataStore.ensure_loaded()
    mapping = {
        "accounts.csv": DataStore.accounts,
        "payments.csv": DataStore.payments,
        "refunds.csv": DataStore.refunds,
        "chargebacks.csv": DataStore.chargebacks,
        "claims.csv": DataStore.claims,
        "audit_log.csv": DataStore.audit_log,
    }
    df = mapping.get(filename)
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found or empty")
    return {
        "filename": filename,
        "columns": list(df.columns),
        "rows": df.fillna("").to_dict(orient="records"),
        "total": len(df),
    }
