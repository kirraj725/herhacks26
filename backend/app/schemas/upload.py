"""Upload request / response schemas."""

from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    status: str
    files_found: list[str] = []
    validation_errors: list[str] = []
