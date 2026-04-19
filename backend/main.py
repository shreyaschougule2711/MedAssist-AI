from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal
from models import User
from auth import hash_password
from config import UPLOAD_DIR
import os

from routes.auth import router as auth_router
from routes.patients import router as patients_router
from routes.scans import router as scans_router
from routes.chat import router as chat_router
from routes.reports import router as reports_router
from routes.notes import router as notes_router
from routes.dashboard import router as dashboard_router

app = FastAPI(
    title="MedAssist AI - Doctor Co-Pilot System",
    description="AI-powered medical assistant for scan analysis, report generation, and clinical decision support",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(scans_router)
app.include_router(chat_router)
app.include_router(reports_router)
app.include_router(notes_router)
app.include_router(dashboard_router)

if os.path.isdir(UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.medical_id == "DOC001").first():
            demo_doc = User(
                medical_id="DOC001",
                name="Dr. Sarah Chen",
                specialty="Radiology",
                password_hash=hash_password("password123")
            )
            db.add(demo_doc)
            db.commit()
            print("Demo doctor created: DOC001 / password123")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "MedAssist AI API is running", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}

# serve_frontend
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
