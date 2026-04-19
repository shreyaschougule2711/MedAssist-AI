from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    medical_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    specialty = Column(String(100), default="General Medicine")
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    patients = relationship("Patient", back_populates="doctor")
    notes = relationship("DoctorNote", back_populates="doctor")
    chat_messages = relationship("ChatMessage", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    doctor = relationship("User", back_populates="patients")
    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")
    doctor_notes = relationship("DoctorNote", back_populates="patient", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="patient", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    scan_type = Column(String(50), default="X-Ray")
    analysis_result = Column(JSON, nullable=True)
    annotated_path = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    patient = relationship("Patient", back_populates="scans")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")


class DoctorNote(Base):
    __tablename__ = "doctor_notes"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="observation")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    patient = relationship("Patient", back_populates="doctor_notes")
    doctor = relationship("User", back_populates="notes")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    patient = relationship("Patient", back_populates="chat_messages")
    doctor = relationship("User", back_populates="chat_messages")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    findings = Column(Text, default="")
    diagnosis = Column(Text, default="")
    affected_area = Column(Text, default="")
    advice = Column(Text, default="")
    severity = Column(String(20), default="Moderate")
    confidence = Column(Float, default=0.85)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    scan = relationship("Scan", back_populates="reports")
    patient = relationship("Patient", back_populates="reports")