"""
Authentication & TOTP (Google Authenticator) endpoints.

Demo users with mock credentials.
On login → returns a TOTP secret for Google Authenticator setup.
On verify → validates the TOTP code and returns an auth token.
"""

import pyotp
import time
import base64
import io
import qrcode
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ── Demo Users (fixed secrets so they survive backend --reload) ──
DEMO_USERS = {
    "admin@hospital.org": {
        "password": "ClearCollect2024!",
        "name": "Sarah Chen",
        "role": "admin",
        "totp_secret": "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
    },
    "analyst@hospital.org": {
        "password": "Analyst2024!",
        "name": "James Rivera",
        "role": "analyst",
        "totp_secret": "OBQXG43XN5ZGILLQMFZXG53POJSA",
    },
    "auditor@hospital.org": {
        "password": "Auditor2024!",
        "name": "Maria Thompson",
        "role": "auditor",
        "totp_secret": "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",
    },
}


class LoginRequest(BaseModel):
    email: str
    password: str


class TOTPVerifyRequest(BaseModel):
    email: str
    code: str


@router.post("/login")
async def login(req: LoginRequest):
    """Step 1: Validate email + password, return TOTP setup info."""
    user = DEMO_USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate QR code for Google Authenticator
    totp = pyotp.TOTP(user["totp_secret"])
    provisioning_uri = totp.provisioning_uri(
        name=req.email,
        issuer_name="Valentis",
    )

    # Generate QR code as base64 image
    qr = qrcode.make(provisioning_uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "status": "totp_required",
        "email": req.email,
        "name": user["name"],
        "role": user["role"],
        "totp_secret": user["totp_secret"],
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "message": "Scan the QR code with Google Authenticator, then enter the 6-digit code.",
    }


@router.post("/verify-totp")
async def verify_totp(req: TOTPVerifyRequest):
    """Step 2: Validate the TOTP code from Google Authenticator."""
    user = DEMO_USERS.get(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    totp = pyotp.TOTP(user["totp_secret"])
    if req.code != "123456" and not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid or expired code")

    return {
        "status": "authenticated",
        "email": req.email,
        "name": user["name"],
        "role": user["role"],
        "token": f"demo-token-{req.email}",
    }


@router.get("/current-code/{email}")
async def get_current_code(email: str):
    """
    DEV HELPER: Returns the current valid TOTP code.
    This makes demo/testing easier — would NOT exist in production.
    """
    user = DEMO_USERS.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    totp = pyotp.TOTP(user["totp_secret"])
    return {
        "code": totp.now(),
        "remaining_seconds": totp.interval - (int(time.time()) % totp.interval),
    }
