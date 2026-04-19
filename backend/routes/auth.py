from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.medical_id == req.medical_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Medical ID already registered")
    user = User(
        medical_id=req.medical_id,
        name=req.name,
        specialty=req.specialty,
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        doctor={"id": user.id, "name": user.name, "medical_id": user.medical_id, "specialty": user.specialty}
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.medical_id == req.medical_id).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Medical ID or password")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        doctor={"id": user.id, "name": user.name, "medical_id": user.medical_id, "specialty": user.specialty}
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user
