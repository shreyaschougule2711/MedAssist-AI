from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Patient, Scan, Report
from schemas import ReportResponse
from auth import get_current_user
from services.ai_report import generate_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/generate/{scan_id}", response_model=ReportResponse)
def create_report(scan_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    scan = db.query(Scan).join(Patient).filter(Scan.id == scan_id, Patient.doctor_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    patient = scan.patient
    patient_info = {"name": patient.name, "age": patient.age, "gender": patient.gender}
    analysis = scan.analysis_result or {}

    report_data = generate_report(patient_info, analysis)

    report = Report(
        scan_id=scan.id,
        patient_id=patient.id,
        findings=report_data.get("findings", ""),
        diagnosis=report_data.get("diagnosis", ""),
        affected_area=report_data.get("affected_area", ""),
        advice=report_data.get("advice", ""),
        severity=report_data.get("severity", "Moderate"),
        confidence=float(report_data.get("confidence", 0.85))
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(Report).join(Patient).filter(Report.id == report_id, Patient.doctor_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/patient/{patient_id}", response_model=List[ReportResponse])
def get_patient_reports(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    reports = db.query(Report).filter(Report.patient_id == patient_id).join(Patient).filter(
        Patient.doctor_id == user.id
    ).order_by(Report.created_at.desc()).all()
    return reports