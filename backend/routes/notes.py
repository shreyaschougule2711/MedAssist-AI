from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Patient, DoctorNote
from schemas import NoteCreate, NoteResponse
from auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["Doctor Notes"])


@router.post("/{patient_id}", response_model=NoteResponse)
def add_note(patient_id: int, req: NoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.doctor_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    note = DoctorNote(patient_id=patient_id, doctor_id=user.id, content=req.content, category=req.category)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{patient_id}", response_model=List[NoteResponse])
def get_notes(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notes = db.query(DoctorNote).filter(
        DoctorNote.patient_id == patient_id, DoctorNote.doctor_id == user.id
    ).order_by(DoctorNote.created_at.desc()).all()
    return notes


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(DoctorNote).filter(DoctorNote.id == note_id, DoctorNote.doctor_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}