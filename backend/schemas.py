"""
QHeal — Pydantic schemas for request/response validation.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Literal


class PatientInput(BaseModel):
    """Incoming patient health metrics from the frontend."""

    age: float = Field(..., ge=1, le=120, description="Patient age in years")
    cholesterol: float = Field(..., ge=50, le=600, description="Total cholesterol mg/dL")
    blood_pressure: float = Field(..., ge=60, le=250, description="Resting systolic BP mmHg")
    glucose: float = Field(..., ge=50, le=500, description="Fasting glucose mg/dL")
    max_heart_rate: float = Field(..., ge=40, le=250, description="Maximum heart rate achieved")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise")
    st_slope: int = Field(..., ge=1, le=3, description="Slope of peak exercise ST segment (1=up,2=flat,3=down)")

    model_config = {"json_schema_extra": {
        "example": {
            "age": 55,
            "cholesterol": 280,
            "blood_pressure": 160,
            "glucose": 140,
            "max_heart_rate": 120,
            "oldpeak": 2.5,
            "st_slope": 2,
        }
    }}


class Recommendation(BaseModel):
    text: str = Field(..., description="Recommendation text")
    category: str = Field(..., description="Category group")
    urgency: str = Field(..., description="Urgency level")
    icon: str = Field(..., description="Emoji/icon representing recommendation state")

class PredictionResponse(BaseModel):
    """Prediction result returned to the frontend."""

    classical_risk: float = Field(..., description="Classical ML risk percentage 0-100")
    quantum_risk: float = Field(..., description="Quantum-hybrid ML risk percentage 0-100")
    improvement: float = Field(..., description="Quantum improvement over classical (pp)")
    risk_level: Literal["Low", "Moderate", "High"] = Field(..., description="Risk tier")
    recommendations: List[Recommendation] = Field(..., description="Personalised prevention recommendations")
    quantum_features_dim: int = Field(16, description="Dimensionality of quantum feature space")
    quantum_available: bool = Field(True, description="Whether real PennyLane circuit was used")


class HealthResponse(BaseModel):
    status: str = "ok"
    quantum_available: bool
    models_loaded: bool
