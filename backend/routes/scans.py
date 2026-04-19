import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Patient, Scan
from schemas import ScanResponse
from auth import get_current_user
from services.ai_vision import analyze_scan, annotate_image
from config import UPLOAD_DIR

router = APIRouter(prefix="/api/scans", tags=["Scans"])


@router.post("/upload/{patient_id}", response_model=ScanResponse)
async def upload_scan(
    patient_id: int,
    scan_type: str = Form("X-Ray"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    ext = os.path.splitext(file.filename)[1] or ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_name)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    analysis_result = analyze_scan(filepath, scan_type)
    annotated_path = annotate_image(filepath, analysis_result)

    scan = Scan(
        patient_id=patient_id,
        filename=file.filename,
        filepath=filepath,
        scan_type=scan_type,
        analysis_result=analysis_result,
        annotated_path=annotated_path
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return ScanResponse(
        id=scan.id, patient_id=scan.patient_id, filename=scan.filename,
        scan_type=scan.scan_type, analysis_result=scan.analysis_result,
        annotated_path=scan.annotated_path, uploaded_at=scan.uploaded_at
    )


@router.get("/patient/{patient_id}", response_model=List[ScanResponse])
def get_patient_scans(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient.scans


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = db.query(Scan).join(Patient).filter(Scan.id == scan_id, Patient.doctor_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/{scan_id}/image")
def get_scan_image(scan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = db.query(Scan).join(Patient).filter(Scan.id == scan_id, Patient.doctor_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if not os.path.exists(scan.filepath):
        raise HTTPException(status_code=404, detail="Image file not found")
    return FileResponse(scan.filepath)


@router.get("/{scan_id}/annotated")
def get_annotated_image(scan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = db.query(Scan).join(Patient).filter(Scan.id == scan_id, Patient.doctor_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    path = scan.annotated_path or scan.filepath
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image file not found")
    return FileResponse(path)