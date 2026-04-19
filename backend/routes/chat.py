from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Patient, ChatMessage
from schemas import ChatRequest, ChatResponse
from auth import get_current_user
from services.ai_chat import generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    patient_context = None
    if req.patient_id:
        patient = db.query(Patient).filter(Patient.id == req.patient_id, Patient.doctor_id == user.id).first()
        if patient:
            patient_context = {
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "notes": patient.notes,
            }
            if patient.scans:
                latest = patient.scans[-1]
                if latest.analysis_result:
                    patient_context["latest_scan"] = {
                        "scan_type": latest.scan_type,
                        **latest.analysis_result
                    }

    user_msg = ChatMessage(
        patient_id=req.patient_id, doctor_id=user.id,
        role="user", content=req.message
    )
    db.add(user_msg)
    db.commit()

    ai_response = generate_chat_response(req.message, patient_context)

    ai_msg = ChatMessage(
        patient_id=req.patient_id, doctor_id=user.id,
        role="assistant", content=ai_response
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg


@router.get("/history/{patient_id}", response_model=List[ChatResponse])
def get_chat_history(patient_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.patient_id == patient_id,
        ChatMessage.doctor_id == user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages


@router.get("/history", response_model=List[ChatResponse])
def get_general_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.doctor_id == user.id,
        ChatMessage.patient_id == None
    ).order_by(ChatMessage.created_at.asc()).limit(50).all()
    return messages