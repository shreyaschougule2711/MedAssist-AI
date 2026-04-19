from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Patient
from schemas import PatientCreate, PatientResponse
from auth import get_current_user

router = APIRouter(prefix="/api/patients", tags=["Patients"])


@router.get("", response_model=List[PatientResponse])
def list_patients(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patients = db.query(Patient).filter(Patient.doctor_id == user.id).order_by(Patient.created_at.desc()).all()
    result = []
    for p in patients:
        result.append(PatientResponse(
            id=p.id, name=p.name, age=p.age, gender=p.gender,
            notes=p.notes or "", created_at=p.created_at,
            scan_count=len(p.scans), report_count=len(p.reports)
        ))
    return result


@router.post("", response_model=PatientResponse)
def create_patient(req: PatientCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = Patient(doctor_id=user.id, name=req.name, age=req.age, gender=req.gender, notes=req.notes)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientResponse(
        id=patient.id, name=patient.name, age=patient.age, gender=patient.gender,
        notes=patient.notes or "", created_at=patient.created_at, scan_count=0, report_count=0
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(
        id=patient.id, name=patient.name, age=patient.age, gender=patient.gender,
        notes=patient.notes or "", created_at=patient.created_at,
        scan_count=len(patient.scans), report_count=len(patient.reports)
    )


@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}
@router.get("/{patient_id}/history_unified")
def get_patient_history(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient: raise HTTPException(status_code=404, detail="Patient not found")
    records = []
    for s in patient.scans:
        records.append({
            "id": s.id, "diagnosis": s.condition or "Analyzed Scan",
            "report": s.findings or "Shared Clinical Findings", "timestamp": s.created_at
        })
    return {"name": patient.name, "age": patient.age, "records": records}
