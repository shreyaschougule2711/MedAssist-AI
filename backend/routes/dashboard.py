from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Patient, Scan, Report, DoctorNote, ChatMessage
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patients = db.query(Patient).filter(Patient.doctor_id == user.id).all()
    patient_ids = [p.id for p in patients]

    total_patients = len(patients)
    total_scans = db.query(Scan).filter(Scan.patient_id.in_(patient_ids)).count() if patient_ids else 0
    total_reports = db.query(Report).filter(Report.patient_id.in_(patient_ids)).count() if patient_ids else 0
    total_notes = db.query(DoctorNote).filter(DoctorNote.doctor_id == user.id).count()
    total_chats = db.query(ChatMessage).filter(ChatMessage.doctor_id == user.id, ChatMessage.role == "user").count()

    from sqlalchemy import func
    high_severity = 0
    moderate_severity = 0
    low_severity = 0
    if patient_ids:
        # Single efficient aggregate query instead of fetching all scans
        severity_counts = db.query(
            func.json_extract(Scan.analysis_result, '$.severity').label('sev'),
            func.count(Scan.id)
        ).filter(Scan.patient_id.in_(patient_ids)).group_by('sev').all()
        for sev, count in severity_counts:
            s = str(sev).strip('"') if sev else "Low"
            if s == "High": high_severity = count
            elif s == "Moderate": moderate_severity = count
            else: low_severity += count

    recent_patients = db.query(Patient).filter(
        Patient.doctor_id == user.id
    ).order_by(Patient.created_at.desc()).limit(5).all()

    recent_activity = []
    for p in recent_patients:
        recent_activity.append({
            "type": "patient",
            "message": f"Patient {p.name} registered",
            "time": p.created_at.isoformat() if p.created_at else "",
            "patient_id": p.id,
            "patient_name": p.name,
        })

    if patient_ids:
        recent_scans = db.query(Scan).filter(
            Scan.patient_id.in_(patient_ids)
        ).order_by(Scan.uploaded_at.desc()).limit(5).all()
        for s in recent_scans:
            condition = s.analysis_result.get("condition", "Analysis") if s.analysis_result else "Analysis"
            recent_activity.append({
                "type": "scan",
                "message": f"{s.scan_type} scan analyzed: {condition}",
                "time": s.uploaded_at.isoformat() if s.uploaded_at else "",
                "patient_id": s.patient_id,
            })

        recent_reports = db.query(Report).filter(
            Report.patient_id.in_(patient_ids)
        ).order_by(Report.created_at.desc()).limit(5).all()
        for r in recent_reports:
            recent_activity.append({
                "type": "report",
                "message": f"Report generated (Severity: {r.severity})",
                "time": r.created_at.isoformat() if r.created_at else "",
                "patient_id": r.patient_id,
            })

    recent_activity.sort(key=lambda x: x.get("time", ""), reverse=True)

    return {
        "total_patients": total_patients,
        "total_scans": total_scans,
        "total_reports": total_reports,
        "total_notes": total_notes,
        "total_chats": total_chats,
        "severity_distribution": {
            "high": high_severity,
            "moderate": moderate_severity,
            "low": low_severity,
        },
        "recent_activity": recent_activity[:8],
        "doctor": {
            "name": user.name,
            "specialty": user.specialty,
            "medical_id": user.medical_id,
        },
    }
