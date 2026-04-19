from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class LoginRequest(BaseModel):
    medical_id: str
    password: str

class RegisterRequest(BaseModel):
    medical_id: str
    name: str
    specialty: str = "General Medicine"
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    doctor: dict

class UserResponse(BaseModel):
    id: int
    medical_id: str
    name: str
    specialty: str
    created_at: datetime
    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    notes: str = ""

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    notes: str
    created_at: datetime
    scan_count: int = 0
    report_count: int = 0
    class Config:
        from_attributes = True

class ScanResponse(BaseModel):
    id: int
    patient_id: int
    filename: str
    scan_type: str
    analysis_result: Optional[dict] = None
    annotated_path: Optional[str] = None
    uploaded_at: datetime
    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    content: str
    category: str = "observation"

class NoteResponse(BaseModel):
    id: int
    patient_id: int
    content: str
    category: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[int] = None

class ChatResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: int
    scan_id: int
    patient_id: int
    findings: str
    diagnosis: str
    affected_area: str
    advice: str
    severity: str
    confidence: float
    created_at: datetime
    class Config:
        from_attributes = True