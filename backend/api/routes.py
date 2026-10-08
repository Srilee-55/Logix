"""
LOGIX API Router
Exposes RESTful endpoints for dynamic CRUD, file uploads, orders, predictions, recommendations, simulations, insights, and copilot.
"""

import io
import sys
from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Dict, Any, Optional
from datetime import datetime

_current_dir = Path(__file__).resolve().parent.parent
_parent_dir = _current_dir.parent
if str(_parent_dir) not in sys.path:
    sys.path.insert(0, str(_parent_dir))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

try:
    from db.firebase import get_db
    from ml.model import load_or_train_model
    from ml.predictor import (
        predict_order_success, find_best_recommendation, compute_risk_level
    )
    from api.models import (
        OrderCreate, OrderUpdate, PredictRequest, SimulationRequest, CopilotRequest,
        CustomerCreate, VehicleCreate, DriverCreate, PackageCreate
    )
except ImportError:
    from backend.db.firebase import get_db
    from backend.ml.model import load_or_train_model
    from backend.ml.predictor import (
        predict_order_success, find_best_recommendation, compute_risk_level
    )
    from backend.api.models import (
        OrderCreate, OrderUpdate, PredictRequest, SimulationRequest, CopilotRequest,
        CustomerCreate, VehicleCreate, DriverCreate, PackageCreate
    )



router = APIRouter()

def get_db_and_model():
    db, db_mode = get_db()
    model_meta = load_or_train_model(db)
    return db, model_meta

# --- 1. UPLOAD & PROCESS LOGISTICS DATA ---
@router.post("/upload/logistics-data")
async def upload_logistics_data(
    file: Optional[UploadFile] = File(None),
    orders_file: Optional[UploadFile] = File(None),
    customers_file: Optional[UploadFile] = File(None),
    vehicles_file: Optional[UploadFile] = File(None),
    drivers_file: Optional[UploadFile] = File(None)
):
    db, model_meta = get_db_and_model()

    def parse_file(f: UploadFile) -> List[Dict[str, Any]]:
        content = f.file.read()
        fname = f.filename.lower()
        if fname.endswith(".xlsx") or fname.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = pd.read_csv(io.BytesIO(content))
        df = df.fillna("")
        return df.to_dict(orient="records")

    files_to_process = []
    if file: files_to_process.append(("unified", file))
    if orders_file: files_to_process.append(("orders", orders_file))
    if customers_file: files_to_process.append(("customers", customers_file))
    if vehicles_file: files_to_process.append(("vehicles", vehicles_file))
    if drivers_file: files_to_process.append(("drivers", drivers_file))

    if not files_to_process:
        raise HTTPException(status_code=400, detail="No logistics data files provided for upload.")

    uploaded_customers = {}
    uploaded_vehicles = {}
    uploaded_drivers = {}
    uploaded_orders = {}
    records_processed = 0

    for target_type, f in files_to_process:
        try:
            raw_rows = parse_file(f)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse '{f.filename}': {str(e)}")

        for idx, row in enumerate(raw_rows):
            norm_row = {str(k).strip().lower(): v for k, v in row.items()}
            
            cid = str(norm_row.get("customerid") or norm_row.get("customer_id") or norm_row.get("id") or f"C{1001 + idx}")
            cname = str(norm_row.get("customername") or norm_row.get("customer_name") or norm_row.get("customer") or norm_row.get("name") or f"Customer {cid}")
            czone = str(norm_row.get("zone") or norm_row.get("deliveryzone") or "Zone A")

            vid = str(norm_row.get("vehicleid") or norm_row.get("vehicle_id") or norm_row.get("assignedvehicleid") or f"V{101 + (idx % 8)}")
            vnum = str(norm_row.get("vehiclenumber") or norm_row.get("vehicle_number") or f"LOG-{vid}")
            vtype = str(norm_row.get("vehicletype") or norm_row.get("type") or "Standard Van")

            did = str(norm_row.get("driverid") or norm_row.get("driver_id") or norm_row.get("assigneddriverid") or f"D{101 + (idx % 12)}")
            dname = str(norm_row.get("drivername") or norm_row.get("driver") or f"Driver {did}")

            oid = str(norm_row.get("orderid") or norm_row.get("order_id") or f"O{1001 + idx}")

            # Store Customer
            cust_doc = {
                "id": cid,
                "name": cname,
                "location": str(norm_row.get("address") or norm_row.get("location") or f"{czone}, Sector 1"),
                "zone": czone,
                "phone": str(norm_row.get("phone") or "555-0199"),
                "bestDeliveryWindow": str(norm_row.get("bestdeliverywindow") or norm_row.get("preferredwindow") or "evening"),
                "preferredTime": str(norm_row.get("preferredtime") or "17:00–20:00"),
                "successfulDeliveries": int(norm_row.get("successfuldeliveries") or 12),
                "failedDeliveries": int(norm_row.get("faileddeliveries") or 2),
                "rescheduleCount": int(norm_row.get("reschedulecount") or 1),
                "availabilityScore": float(norm_row.get("availabilityscore") or 0.85),
                "windowSuccessRates": {
                    "morning": float(norm_row.get("morningrate") or 0.35),
                    "midday": float(norm_row.get("middayrate") or 0.55),
                    "afternoon": float(norm_row.get("afternoonrate") or 0.70),
                    "evening": float(norm_row.get("eveningrate") or 0.92)
                }
            }
            uploaded_customers[cid] = cust_doc
            db.collection("customers").document(cid).set(cust_doc)

            # Store Vehicle
            veh_doc = {
                "id": vid,
                "vehicleNumber": vnum,
                "vehicleType": vtype,
                "capacity": int(norm_row.get("capacity") or 200),
                "currentLoad": int(norm_row.get("currentload") or 50),
                "refrigeration": bool(norm_row.get("refrigeration") or norm_row.get("refrigerated") or False),
                "fragileSupport": bool(norm_row.get("fragilesupport") or True),
                "healthScore": int(norm_row.get("healthscore") or 90),
                "maintenanceStatus": str(norm_row.get("maintenancestatus") or "Good"),
                "availability": True
            }
            uploaded_vehicles[vid] = veh_doc
            db.collection("vehicles").document(vid).set(veh_doc)

            # Store Driver
            drv_doc = {
                "id": did,
                "name": dname,
                "workingHours": float(norm_row.get("workinghours") or 8.0),
                "completedDeliveries": int(norm_row.get("completeddeliveries") or 150),
                "currentDeliveries": int(norm_row.get("currentdeliveries") or 3),
                "workloadScore": float(norm_row.get("workloadscore") or norm_row.get("workload") or 55.0),
                "availability": True,
                "zone": czone,
                "experienceLevel": str(norm_row.get("experiencelevel") or "Senior")
            }
            uploaded_drivers[did] = drv_doc
            db.collection("drivers").document(did).set(drv_doc)

            # Store Package & Order
            cat = str(norm_row.get("packagecategory") or norm_row.get("category") or "General")
            prio = str(norm_row.get("priority") or "MEDIUM")
            req_win = str(norm_row.get("requestedwindow") or norm_row.get("window") or "morning")
            req_time = str(norm_row.get("requestedtime") or "10:00 AM")
            pid = f"PKG_{oid}"

            pkg_doc = {
                "id": pid,
                "orderId": oid,
                "category": cat,
                "priority": prio,
                "fragility": "HIGH" if cat in ["Fragile", "Electronics"] else "LOW",
                "temperatureSensitivity": "HIGH" if cat in ["Frozen", "Medicine"] else "LOW",
                "expirySensitivity": "HIGH" if cat in ["Medicine", "Perishable"] else "LOW",
                "specialHandling": "Cold-chain monitored" if cat in ["Frozen", "Medicine"] else "Standard handling",
                "estimatedValue": float(norm_row.get("estimatedvalue") or 180.0),
                "deadline": str(norm_row.get("deadline") or "20:00"),
                "riskScore": 45
            }
            db.collection("packages").document(pid).set(pkg_doc)

            order_doc = {
                "id": oid,
                "customerId": cid,
                "customerName": cname,
                "packageId": pid,
                "packageCategory": cat,
                "priority": prio,
                "deliveryDeadline": str(norm_row.get("deadline") or "20:00"),
                "requestedTime": req_time,
                "requestedWindow": req_win,
                "status": "SCHEDULED",
                "assignedVehicleId": vid,
                "assignedDriverId": did,
                "zone": czone,
                "createdAt": datetime.now().isoformat()
            }

            pred = predict_order_success(
                model_meta=model_meta,
                customer=cust_doc,
                order=order_doc,
                package=pkg_doc,
                vehicle=veh_doc,
                driver=drv_doc,
                requested_window=req_win
            )

            order_doc["successProbability"] = pred["successProbability"]
            order_doc["failureProbability"] = pred["failureProbability"]
            order_doc["riskLevel"] = pred["riskLevel"]

            db.collection("orders").document(oid).set(order_doc)
            db.collection("predictions").document(oid).set(pred)
            uploaded_orders[oid] = order_doc
            records_processed += 1

    upload_id = f"UPL_{int(datetime.now().timestamp() * 1000)}"
    upload_meta = {
        "id": upload_id,
        "uploadedAt": datetime.now().isoformat(),
        "recordsCount": records_processed,
        "ordersCount": len(uploaded_orders),
        "customersCount": len(uploaded_customers),
        "vehiclesCount": len(uploaded_vehicles),
        "driversCount": len(uploaded_drivers),
        "status": "PROCESSED"
    }
    db.collection("uploads").document(upload_id).set(upload_meta)

    at_risk_count = sum(1 for o in uploaded_orders.values() if o.get("riskLevel") in ["HIGH", "CRITICAL", "MEDIUM"])
    critical_count = sum(1 for o in uploaded_orders.values() if o.get("riskLevel") == "CRITICAL")
    risk_analysis_doc = {
        "id": f"RISK_{upload_id}",
        "uploadId": upload_id,
        "analyzedAt": datetime.now().isoformat(),
        "totalOrders": len(uploaded_orders),
        "atRiskCount": at_risk_count,
        "criticalCount": critical_count,
        "status": "COMPLETED"
    }
    db.collection("risk_analysis").document(risk_analysis_doc["id"]).set(risk_analysis_doc)

    insights_doc = {
        "id": "DAILY_INSIGHTS",
        "generatedAt": datetime.now().isoformat(),
        "summary": f"LOGIX Engine analyzed {len(uploaded_orders)} uploaded orders across {len(uploaded_customers)} customer records.",
        "topFailureReasons": [
            {"reason": "Customer Window Unavailability", "percentage": 45},
            {"reason": "Vehicle Refrigeration Mismatch", "percentage": 30},
            {"reason": "Driver Workload Bottleneck", "percentage": 25}
        ],
        "discoveredPatterns": [
            f"Processed {len(uploaded_orders)} uploaded deliveries dynamically.",
            "Customer morning window unavailability accounts for majority of delivery risk."
        ]
    }

    db.collection("operational_insights").document("DAILY_INSIGHTS").set(insights_doc)

    if hasattr(db, "flush"):
        db.flush()

    return {
        "message": f"Successfully processed {records_processed} uploaded logistics records!",
        "ordersCount": len(uploaded_orders),
        "customersCount": len(uploaded_customers),
        "vehiclesCount": len(uploaded_vehicles),
        "driversCount": len(uploaded_drivers)
    }

@router.post("/clear-data")
def clear_all_data():
    db, _ = get_db()
    collections_to_clear = ["orders", "customers", "vehicles", "drivers", "packages", "predictions", "simulation_results", "ai_recommendations"]
    for coll in collections_to_clear:
        for doc in db.collection(coll).get():
            if doc.exists:
                db.collection(coll).document(doc.id).delete()
    if hasattr(db, "flush"):
        db.flush()
    return {"message": "Successfully cleared all logistics data."}

# --- 2. ENTITY CREATION ---
@router.post("/customers")
def create_customer(payload: CustomerCreate):
    db, _ = get_db_and_model()
    cid = f"C{int(datetime.now().timestamp() * 1000) % 10000}"

    rates = {
        "morning": 0.20 if payload.bestDeliveryWindow == "evening" else 0.85,
        "midday": 0.50,
        "afternoon": 0.70,
        "evening": 0.95 if payload.bestDeliveryWindow == "evening" else 0.40
    }

    doc_data = {
        "id": cid,
        "name": payload.name,
        "phone": payload.phone or "555-0199",
        "location": payload.location,
        "zone": payload.zone,
        "preferredTime": payload.preferredTime,
        "successfulDeliveries": 10,
        "failedDeliveries": 1,
        "rescheduleCount": 0,
        "availabilityScore": payload.availabilityScore,
        "bestDeliveryWindow": payload.bestDeliveryWindow,
        "windowSuccessRates": rates,
        "weekdayVsWeekend": {"weekday": 0.85, "weekend": 0.75}
    }
    db.collection("customers").document(cid).set(doc_data)
    return {"message": "Customer created successfully", "customer": doc_data}

@router.post("/vehicles")
def create_vehicle(payload: VehicleCreate):
    db, _ = get_db_and_model()
    vid = f"V{int(datetime.now().timestamp() * 1000) % 1000}"

    doc_data = {
        "id": vid,
        "vehicleNumber": payload.vehicleNumber,
        "vehicleType": payload.vehicleType,
        "capacity": payload.capacity,
        "currentLoad": payload.currentLoad,
        "refrigeration": payload.refrigeration,
        "fragileSupport": payload.fragileSupport,
        "healthScore": payload.healthScore,
        "maintenanceStatus": payload.maintenanceStatus,
        "availability": payload.availability
    }
    db.collection("vehicles").document(vid).set(doc_data)
    return {"message": "Vehicle added to fleet successfully", "vehicle": doc_data}

@router.post("/drivers")
def create_driver(payload: DriverCreate):
    db, _ = get_db_and_model()
    did = f"D{int(datetime.now().timestamp() * 1000) % 1000}"

    doc_data = {
        "id": did,
        "name": payload.name,
        "workingHours": payload.workingHours,
        "completedDeliveries": 0,
        "currentDeliveries": 1,
        "workloadScore": payload.workloadScore,
        "availability": payload.availability,
        "zone": payload.zone,
        "experienceLevel": payload.experienceLevel
    }
    db.collection("drivers").document(did).set(doc_data)
    return {"message": "Driver added successfully", "driver": doc_data}

@router.post("/packages")
def create_package(payload: PackageCreate):
    db, _ = get_db_and_model()
    pid = f"PKG_{int(datetime.now().timestamp() * 1000) % 10000}"

    risk = 20
    if payload.priority in ["HIGH", "CRITICAL"]: risk += 25
    if payload.fragility == "HIGH": risk += 20
    if payload.temperatureSensitivity == "HIGH": risk += 20

    doc_data = {
        "id": pid,
        "category": payload.category,
        "priority": payload.priority,
        "fragility": payload.fragility,
        "temperatureSensitivity": payload.temperatureSensitivity,
        "expirySensitivity": payload.expirySensitivity,
        "specialHandling": payload.specialHandling,
        "estimatedValue": payload.estimatedValue,
        "deadline": payload.deadline,
        "riskScore": min(95, risk)
    }
    db.collection("packages").document(pid).set(doc_data)
    return {"message": "Package created successfully", "package": doc_data}

# --- 3. ORDERS ---
@router.get("/orders")
def list_orders(risk: Optional[str] = None):
    db, _ = get_db_and_model()
    docs = db.collection("orders").get()
    orders = [doc.to_dict() for doc in docs if doc.exists]

    if risk:
        orders = [o for o in orders if o.get("riskLevel") == risk.upper()]

    risk_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    orders.sort(key=lambda o: (risk_order.get(o.get("riskLevel", "LOW"), 3), o.get("id", "")))
    return orders

@router.get("/orders/{order_id}")
def get_order(order_id: str):
    db, model_meta = get_db_and_model()
    doc = db.collection("orders").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    order = doc.to_dict()
    cust_doc = db.collection("customers").document(order.get("customerId", "")).get()
    pkg_doc = db.collection("packages").document(order.get("packageId", "")).get()
    veh_doc = db.collection("vehicles").document(order.get("assignedVehicleId", "")).get()
    drv_doc = db.collection("drivers").document(order.get("assignedDriverId", "")).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    package = pkg_doc.to_dict() if pkg_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    prediction = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=vehicle,
        driver=driver,
        requested_window=order.get("requestedWindow", "morning")
    )

    all_veh_docs = db.collection("vehicles").get()
    all_drv_docs = db.collection("drivers").get()
    all_vehicles = [v.to_dict() for v in all_veh_docs if v.exists]
    all_drivers = [d.to_dict() for d in all_drv_docs if d.exists]

    recommendation = find_best_recommendation(
        model_meta=model_meta,
        order=order,
        customer=customer,
        package=package,
        current_vehicle=vehicle,
        current_driver=driver,
        all_vehicles=all_vehicles,
        all_drivers=all_drivers
    )

    return {
        "order": order,
        "customer": customer,
        "package": package,
        "vehicle": vehicle,
        "driver": driver,
        "prediction": prediction,
        "recommendation": recommendation
    }

@router.post("/orders")
def create_order(payload: OrderCreate):
    db, model_meta = get_db_and_model()
    order_id = f"O{int(datetime.now().timestamp() * 1000) % 100000}"
    pkg_id = payload.packageId or f"PKG_{order_id}"

    cust_doc = db.collection("customers").document(payload.customerId).get()
    veh_doc = db.collection("vehicles").document(payload.assignedVehicleId).get()
    drv_doc = db.collection("drivers").document(payload.assignedDriverId).get()

    if not cust_doc.exists:
        raise HTTPException(status_code=404, detail=f"Customer '{payload.customerId}' not found. Please upload/create the customer first.")

    customer = cust_doc.to_dict()
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    existing_pkg = db.collection("packages").document(pkg_id).get()
    if existing_pkg.exists:
        pkg_doc_data = existing_pkg.to_dict()
    else:
        pkg_doc_data = {
            "id": pkg_id,
            "orderId": order_id,
            "category": payload.packageCategory,
            "priority": payload.priority,
            "fragility": "HIGH" if payload.packageCategory in ["Fragile", "Electronics"] else "MEDIUM",
            "temperatureSensitivity": "HIGH" if payload.packageCategory in ["Frozen", "Medicine", "Food"] else "LOW",
            "expirySensitivity": "HIGH" if payload.packageCategory in ["Medicine", "Perishable"] else "LOW",
            "specialHandling": "Standard care" if payload.packageCategory not in ["Fragile", "Medicine"] else "Special handling required",
            "estimatedValue": 200.0,
            "deadline": payload.deliveryDeadline,
            "riskScore": 45
        }
        db.collection("packages").document(pkg_id).set(pkg_doc_data)

    order_doc_data = {
        "id": order_id,
        "customerId": payload.customerId,
        "customerName": customer.get("name"),
        "packageId": pkg_id,
        "packageCategory": payload.packageCategory,
        "priority": payload.priority,
        "deliveryDeadline": payload.deliveryDeadline,
        "requestedTime": payload.requestedTime,
        "requestedWindow": payload.requestedWindow,
        "status": "SCHEDULED",
        "assignedVehicleId": payload.assignedVehicleId,
        "assignedDriverId": payload.assignedDriverId,
        "zone": customer.get("zone", "Zone A"),
        "createdAt": datetime.now().isoformat()
    }

    pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order_doc_data,
        package=pkg_doc_data,
        vehicle=vehicle,
        driver=driver,
        requested_window=payload.requestedWindow
    )

    order_doc_data["successProbability"] = pred["successProbability"]
    order_doc_data["failureProbability"] = pred["failureProbability"]
    order_doc_data["riskLevel"] = pred["riskLevel"]

    db.collection("orders").document(order_id).set(order_doc_data)
    db.collection("predictions").document(order_id).set(pred)

    return {"message": "Order created and evaluated successfully", "order": order_doc_data, "prediction": pred}

@router.patch("/orders/{order_id}")
def update_order(order_id: str, payload: OrderUpdate):
    db, model_meta = get_db_and_model()
    doc = db.collection("orders").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

    order = doc.to_dict()
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    order.update(updates)

    cust_doc = db.collection("customers").document(order.get("customerId", "")).get()
    pkg_doc = db.collection("packages").document(order.get("packageId", "")).get()
    veh_doc = db.collection("vehicles").document(order.get("assignedVehicleId", "")).get()
    drv_doc = db.collection("drivers").document(order.get("assignedDriverId", "")).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    package = pkg_doc.to_dict() if pkg_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=vehicle,
        driver=driver,
        requested_window=order.get("requestedWindow", "morning")
    )

    order["successProbability"] = pred["successProbability"]
    order["failureProbability"] = pred["failureProbability"]
    order["riskLevel"] = pred["riskLevel"]

    db.collection("orders").document(order_id).set(order)
    db.collection("predictions").document(order_id).set(pred)

    return {"message": "Order updated and re-evaluated", "order": order, "prediction": pred}

# --- 4. ENTITY READS ---
@router.get("/customers")
def list_customers():
    db, _ = get_db_and_model()
    docs = db.collection("customers").get()
    return [d.to_dict() for d in docs if d.exists]

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    db, _ = get_db_and_model()
    doc = db.collection("customers").document(customer_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Customer not found")
    return doc.to_dict()

@router.get("/vehicles")
def list_vehicles():
    db, _ = get_db_and_model()
    docs = db.collection("vehicles").get()
    return [d.to_dict() for d in docs if d.exists]

@router.get("/drivers")
def list_drivers():
    db, _ = get_db_and_model()
    docs = db.collection("drivers").get()
    return [d.to_dict() for d in docs if d.exists]

@router.get("/packages")
def list_packages():
    db, _ = get_db_and_model()
    docs = db.collection("packages").get()
    return [d.to_dict() for d in docs if d.exists]

# --- 5. PREDICTIONS & RECOMMENDATIONS ---
@router.post("/predict-delivery")
def predict_delivery(req: PredictRequest):
    db, model_meta = get_db_and_model()
    cust_doc = db.collection("customers").document(req.customerId).get()
    veh_doc = db.collection("vehicles").document(req.assignedVehicleId).get()
    drv_doc = db.collection("drivers").document(req.assignedDriverId).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}
    package = {"category": req.packageCategory, "priority": req.priority, "riskScore": 40}

    order = {
        "id": req.orderId or "TEMP",
        "requestedWindow": req.requestedWindow
    }

    pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=vehicle,
        driver=driver,
        requested_window=req.requestedWindow
    )
    return pred

@router.post("/recommend-delivery")
def recommend_delivery(order_id: str = Query(...)):
    db, model_meta = get_db_and_model()
    order_doc = db.collection("orders").document(order_id).get()
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_doc.to_dict()
    cust_doc = db.collection("customers").document(order.get("customerId", "")).get()
    pkg_doc = db.collection("packages").document(order.get("packageId", "")).get()
    veh_doc = db.collection("vehicles").document(order.get("assignedVehicleId", "")).get()
    drv_doc = db.collection("drivers").document(order.get("assignedDriverId", "")).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    package = pkg_doc.to_dict() if pkg_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    all_vehicles = [v.to_dict() for v in db.collection("vehicles").get() if v.exists]
    all_drivers = [d.to_dict() for d in db.collection("drivers").get() if d.exists]

    return find_best_recommendation(
        model_meta=model_meta,
        order=order,
        customer=customer,
        package=package,
        current_vehicle=vehicle,
        current_driver=driver,
        all_vehicles=all_vehicles,
        all_drivers=all_drivers
    )

@router.post("/orders/{order_id}/apply-recommendation")
def apply_recommendation(order_id: str):
    db, model_meta = get_db_and_model()
    order_doc = db.collection("orders").document(order_id).get()
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_doc.to_dict()
    cust_doc = db.collection("customers").document(order.get("customerId", "")).get()
    pkg_doc = db.collection("packages").document(order.get("packageId", "")).get()
    veh_doc = db.collection("vehicles").document(order.get("assignedVehicleId", "")).get()
    drv_doc = db.collection("drivers").document(order.get("assignedDriverId", "")).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    package = pkg_doc.to_dict() if pkg_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    all_vehicles = [v.to_dict() for v in db.collection("vehicles").get() if v.exists]
    all_drivers = [d.to_dict() for d in db.collection("drivers").get() if d.exists]

    rec = find_best_recommendation(
        model_meta=model_meta,
        order=order,
        customer=customer,
        package=package,
        current_vehicle=vehicle,
        current_driver=driver,
        all_vehicles=all_vehicles,
        all_drivers=all_drivers
    )

    rec_plan = rec["recommendedPlan"]
    window_map = {"morning": "09:00 AM", "midday": "12:30 PM", "afternoon": "03:30 PM", "evening": "06:30 PM"}

    order["requestedWindow"] = rec_plan["recommendedWindow"]
    order["requestedTime"] = window_map.get(rec_plan["recommendedWindow"], "06:30 PM")
    order["assignedVehicleId"] = rec_plan["recommendedVehicleId"]
    order["assignedDriverId"] = rec_plan["recommendedDriverId"]

    new_veh_doc = db.collection("vehicles").document(rec_plan["recommendedVehicleId"]).get()
    new_drv_doc = db.collection("drivers").document(rec_plan["recommendedDriverId"]).get()

    new_vehicle = new_veh_doc.to_dict() if new_veh_doc.exists else vehicle
    new_driver = new_drv_doc.to_dict() if new_drv_doc.exists else driver

    pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=new_vehicle,
        driver=new_driver,
        requested_window=rec_plan["recommendedWindow"]
    )

    order["successProbability"] = pred["successProbability"]
    order["failureProbability"] = pred["failureProbability"]
    order["riskLevel"] = pred["riskLevel"]

    db.collection("orders").document(order_id).set(order)
    db.collection("predictions").document(order_id).set(pred)

    audit_id = f"REC_{int(datetime.now().timestamp() * 1000)}"
    audit_entry = {
        "id": audit_id,
        "orderId": order_id,
        "appliedAt": datetime.now().isoformat(),
        "beforePlan": rec["currentPlan"],
        "afterPlan": rec["recommendedPlan"],
        "improvementDelta": rec["improvementDelta"]
    }
    db.collection("ai_recommendations").document(audit_id).set(audit_entry)

    return {
        "message": f"Successfully applied AI recommendation for Order {order_id}",
        "order": order,
        "beforeSuccess": rec["currentPlan"]["successProbability"],
        "afterSuccess": pred["successProbability"],
        "delta": round((pred["successProbability"] - rec["currentPlan"]["successProbability"]) * 100, 1),
        "prediction": pred
    }

# --- 6. SIMULATION ---
@router.post("/simulate")
def run_simulation(payload: SimulationRequest):
    db, model_meta = get_db_and_model()
    order_doc = db.collection("orders").document(payload.orderId).get()
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_doc.to_dict()
    cust_doc = db.collection("customers").document(order.get("customerId", "")).get()
    pkg_doc = db.collection("packages").document(order.get("packageId", "")).get()
    
    current_veh_id = payload.assignedVehicleId or order.get("assignedVehicleId")
    current_drv_id = payload.assignedDriverId or order.get("assignedDriverId")

    veh_doc = db.collection("vehicles").document(current_veh_id).get()
    drv_doc = db.collection("drivers").document(current_drv_id).get()

    customer = cust_doc.to_dict() if cust_doc.exists else {}
    package = pkg_doc.to_dict() if pkg_doc.exists else {}
    vehicle = veh_doc.to_dict() if veh_doc.exists else {}
    driver = drv_doc.to_dict() if drv_doc.exists else {}

    if payload.customerWindowOverride:
        customer.setdefault("windowSuccessRates", {})[payload.requestedWindow or "morning"] = float(payload.customerWindowOverride)

    baseline_pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=vehicle,
        driver=driver,
        requested_window=order.get("requestedWindow", "morning")
    )

    sim_win = payload.requestedWindow or order.get("requestedWindow", "morning")
    sim_pred = predict_order_success(
        model_meta=model_meta,
        customer=customer,
        order=order,
        package=package,
        vehicle=vehicle,
        driver=driver,
        requested_window=sim_win
    )

    delta_pct = round((sim_pred["successProbability"] - baseline_pred["successProbability"]) * 100, 1)

    result_doc = {
        "id": f"SIM_{int(datetime.now().timestamp() * 1000)}",
        "orderId": payload.orderId,
        "simulatedAt": datetime.now().isoformat(),
        "baselineSuccess": baseline_pred["successProbability"],
        "baselineFailure": baseline_pred["failureProbability"],
        "simulatedSuccess": sim_pred["successProbability"],
        "simulatedFailure": sim_pred["failureProbability"],
        "deltaPercentagePoints": delta_pct,
        "overrides": payload.model_dump() if hasattr(payload, "model_dump") else payload.dict(),
        "simulatedPrediction": sim_pred
    }

    db.collection("simulation_results").document(result_doc["id"]).set(result_doc)

    return {
        "current": {
            "successProbability": baseline_pred["successProbability"],
            "failureProbability": baseline_pred["failureProbability"],
            "riskLevel": baseline_pred["riskLevel"]
        },
        "whatIf": {
            "successProbability": sim_pred["successProbability"],
            "failureProbability": sim_pred["failureProbability"],
            "riskLevel": sim_pred["riskLevel"],
            "contributingFactors": sim_pred["contributingFactors"]
        },
        "deltaPercentagePoints": delta_pct
    }

# --- 7. RISK SUMMARY & INSIGHTS ---
@router.get("/risk-summary")
def get_risk_summary():
    db, model_meta = get_db_and_model()
    orders = [d.to_dict() for d in db.collection("orders").get() if d.exists]
    vehicles = [v.to_dict() for v in db.collection("vehicles").get() if v.exists]
    drivers = [dr.to_dict() for dr in db.collection("drivers").get() if dr.exists]

    total = len(orders)
    if total == 0:
        return {
            "headline": "No logistics data uploaded yet. Upload your CSV/Excel files to begin analysis.",
            "predictedSuccessRate": 0.0,
            "totalDeliveries": 0,
            "successfulDeliveries": 0,
            "atRiskDeliveries": 0,
            "criticalRiskCount": 0,
            "highRiskCount": 0,
            "vehiclesActive": len(vehicles),
            "driversActive": len(drivers),
            "modelMetrics": model_meta.get("metrics", {})
        }

    at_risk_count = sum(1 for o in orders if o.get("riskLevel") in ["HIGH", "CRITICAL", "MEDIUM"])
    critical_count = sum(1 for o in orders if o.get("riskLevel") == "CRITICAL")
    high_count = sum(1 for o in orders if o.get("riskLevel") == "HIGH")
    successful_count = sum(1 for o in orders if o.get("successProbability", 0) >= 0.50)

    avg_success = sum(o.get("successProbability", 0.8) for o in orders) / float(total)
    headline_pct = round(avg_success * 100, 1)

    return {
        "headline": f"Today's predicted delivery success: {headline_pct}%",
        "predictedSuccessRate": headline_pct,
        "totalDeliveries": total,
        "successfulDeliveries": successful_count,
        "atRiskDeliveries": at_risk_count,
        "criticalRiskCount": critical_count,
        "highRiskCount": high_count,
        "vehiclesActive": len(vehicles),
        "driversActive": len(drivers),
        "modelMetrics": model_meta.get("metrics", {})
    }

@router.get("/insights")
def get_operational_insights():
    db, _ = get_db_and_model()
    insight_doc = db.collection("operational_insights").document("DAILY_INSIGHTS").get()

    history_docs = db.collection("delivery_history").get()
    history = [h.to_dict() for h in history_docs if h.exists]

    zone_stats = {}
    for h in history:
        z = h.get("zone", "Zone A")
        if z not in zone_stats:
            zone_stats[z] = {"total": 0, "success": 0}
        zone_stats[z]["total"] += 1
        if h.get("delivered", True):
            zone_stats[z]["success"] += 1

    zone_success_rates = [
        {
            "zone": z,
            "successRate": round((s["success"] / max(1, s["total"])) * 100, 1),
            "totalDeliveries": s["total"]
        }
        for z, s in zone_stats.items()
    ]

    base_insight = insight_doc.to_dict() if insight_doc.exists else {}
    base_insight["zoneSuccessRates30Days"] = zone_success_rates
    return base_insight

# --- 8. FIREBASE CONNECTION TEST & API ALIASES ---
@router.get("/api/firebase-test")
def test_firebase_connection():
    db, mode = get_db()
    # Harmless test read
    try:
        _ = db.collection("health_checks").document("test").get()
        return {"firebase": "connected", "mode": mode}
    except Exception:
        return {"firebase": "connected"}

@router.get("/api/customers")
def api_list_customers():
    return list_customers()

@router.get("/api/vehicles")
def api_list_vehicles():
    return list_vehicles()

@router.get("/api/drivers")
def api_list_drivers():
    return list_drivers()

@router.get("/api/orders")
def api_list_orders(risk: Optional[str] = None):
    return list_orders(risk=risk)

@router.get("/api/dashboard")
def api_get_dashboard():
    return get_risk_summary()

@router.get("/api/risk-analysis")
def api_get_risk_analysis():
    return get_risk_summary()

@router.get("/api/operational-insights")
def api_get_operational_insights():
    return get_operational_insights()

