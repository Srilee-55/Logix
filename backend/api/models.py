from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    location: str
    zone: str = "Zone A"
    preferredTime: str = "17:00–20:00"
    bestDeliveryWindow: str = "evening"
    availabilityScore: float = 0.85

class VehicleCreate(BaseModel):
    vehicleNumber: str
    vehicleType: str = "Standard Van"
    capacity: int = 200
    currentLoad: int = 50
    refrigeration: bool = False
    fragileSupport: bool = False
    healthScore: int = 90
    maintenanceStatus: str = "Optimal"
    availability: bool = True

class DriverCreate(BaseModel):
    name: str
    workingHours: float = 8.0
    experienceLevel: str = "Mid"
    workloadScore: float = 50.0
    zone: str = "Zone A"
    availability: bool = True

class PackageCreate(BaseModel):
    category: str
    priority: str = "MEDIUM"
    fragility: str = "LOW"
    temperatureSensitivity: str = "LOW"
    expirySensitivity: str = "LOW"
    specialHandling: str = "Standard care"
    estimatedValue: float = 150.0
    deadline: str = "20:00"

class OrderCreate(BaseModel):
    customerId: str
    packageCategory: str
    priority: str = "MEDIUM"
    requestedTime: str = "10:00 AM"
    requestedWindow: str = "morning"
    assignedVehicleId: str
    assignedDriverId: str
    deliveryDeadline: str = "20:00"
    packageId: Optional[str] = None

class OrderUpdate(BaseModel):
    requestedTime: Optional[str] = None
    requestedWindow: Optional[str] = None
    assignedVehicleId: Optional[str] = None
    assignedDriverId: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None

class PredictRequest(BaseModel):
    orderId: Optional[str] = None
    customerId: str
    packageCategory: str
    priority: str = "MEDIUM"
    requestedWindow: str = "morning"
    assignedVehicleId: str
    assignedDriverId: str

class SimulationRequest(BaseModel):
    orderId: str
    requestedWindow: Optional[str] = None
    assignedVehicleId: Optional[str] = None
    assignedDriverId: Optional[str] = None
    priority: Optional[str] = None
    customerWindowOverride: Optional[str] = None

class CopilotRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
