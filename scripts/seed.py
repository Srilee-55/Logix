"""
LOGIX — Synthetic Data Generator & Seeder
LABEL: Synthetic / simulated logistics data.
Deterministic (fixed random seed = 42), idempotent, re-runnable.
Configured to maintain exactly 5 scheduled customer & order records.
"""

import sys
import os
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.db.firebase import get_db

def generate_seed_data(num_customers=5):
    random.seed(42)
    db, db_mode = get_db()
    print(f"--- Seeding LOGIX Data (Database Mode: {db_mode}) ---")
    
    # 0. CLEAR EXISTING DATA FOR CLEAN 5-RECORD STATE
    collections_to_clear = [
        "orders", "customers", "vehicles", "drivers", "packages", 
        "predictions", "delivery_history", "risk_analysis", 
        "operational_insights", "uploads", "ai_recommendations"
    ]
    for coll in collections_to_clear:
        for doc in db.collection(coll).get():
            if doc.exists:
                db.collection(coll).document(doc.id).delete()

    # 1. ZONES & CATEGORIES
    ZONES = ["Zone A", "Zone B", "Zone C"]
    CATEGORIES = ["Medicine", "Frozen", "Electronics", "Medicine", "General"]

    # 2. CUSTOMERS (Exactly 5)
    customer_data_list = [
        {"id": "C1001", "name": "Apex Healthcare", "zone": "Zone A", "best_window": "morning", "window_rates": {"morning": 0.92, "midday": 0.60, "afternoon": 0.40, "evening": 0.15}, "avail": 0.88, "phone": "555-0101"},
        {"id": "C1002", "name": "Metro Fresh Foods", "zone": "Zone B", "best_window": "evening", "window_rates": {"morning": 0.20, "midday": 0.45, "afternoon": 0.75, "evening": 0.95}, "avail": 0.75, "phone": "555-0102"},
        {"id": "C1003", "name": "TechWorld Electronics", "zone": "Zone A", "best_window": "afternoon", "window_rates": {"morning": 0.45, "midday": 0.55, "afternoon": 0.90, "evening": 0.60}, "avail": 0.85, "phone": "555-0103"},
        {"id": "C1004", "name": "Global Pharma Labs", "zone": "Zone C", "best_window": "evening", "window_rates": {"morning": 0.18, "midday": 0.35, "afternoon": 0.60, "evening": 0.96}, "avail": 0.72, "phone": "555-0104"},
        {"id": "C1005", "name": "Urban Retailers", "zone": "Zone B", "best_window": "midday", "window_rates": {"morning": 0.60, "midday": 0.91, "afternoon": 0.70, "evening": 0.40}, "avail": 0.94, "phone": "555-0105"}
    ]

    customers = []
    for c_info in customer_data_list[:num_customers]:
        cid = c_info["id"]
        cust_data = {
            "id": cid,
            "name": c_info["name"],
            "location": f"{c_info['zone']}, Commercial Hub Sector {cid[-1]}",
            "zone": c_info["zone"],
            "phone": c_info["phone"],
            "preferredTime": "17:00–20:00" if c_info["best_window"] == "evening" else "08:00–11:00",
            "successfulDeliveries": random.randint(15, 30),
            "failedDeliveries": random.randint(1, 4),
            "rescheduleCount": random.randint(0, 2),
            "availabilityScore": c_info["avail"],
            "bestDeliveryWindow": c_info["best_window"],
            "windowSuccessRates": c_info["window_rates"],
            "weekdayVsWeekend": {"weekday": 0.88, "weekend": 0.72}
        }
        customers.append(cust_data)
        db.collection("customers").document(cid).set(cust_data)

    print(f"[OK] Created {len(customers)} customers.")

    # 3. VEHICLES (5)
    vehicles = [
        {"id": "V101", "vehicleNumber": "LOG-V101", "vehicleType": "Refrigerated Van", "capacity": 200, "currentLoad": 65, "refrigeration": True, "fragileSupport": True, "healthScore": 95, "maintenanceStatus": "Optimal", "availability": True},
        {"id": "V102", "vehicleNumber": "LOG-V102", "vehicleType": "Standard Van", "capacity": 180, "currentLoad": 80, "refrigeration": False, "fragileSupport": False, "healthScore": 88, "maintenanceStatus": "Good", "availability": True},
        {"id": "V103", "vehicleNumber": "LOG-V103", "vehicleType": "Express Sprinter", "capacity": 150, "currentLoad": 95, "refrigeration": False, "fragileSupport": True, "healthScore": 90, "maintenanceStatus": "Good", "availability": True},
        {"id": "V104", "vehicleNumber": "LOG-V104", "vehicleType": "Cold Storage Truck", "capacity": 300, "currentLoad": 110, "refrigeration": True, "fragileSupport": True, "healthScore": 92, "maintenanceStatus": "Optimal", "availability": True},
        {"id": "V105", "vehicleNumber": "LOG-V105", "vehicleType": "Electric Cargo", "capacity": 120, "currentLoad": 45, "refrigeration": False, "fragileSupport": False, "healthScore": 96, "maintenanceStatus": "Optimal", "availability": True}
    ]
    for v in vehicles[:num_customers]:
        db.collection("vehicles").document(v["id"]).set(v)
    print(f"[OK] Created {len(vehicles)} vehicles.")

    # 4. DRIVERS (5)
    drivers = [
        {"id": "D101", "name": "Marcus Vance", "workingHours": 8.0, "completedDeliveries": 240, "currentDeliveries": 3, "workloadScore": 45.0, "availability": True, "zone": "Zone A", "experienceLevel": "Senior"},
        {"id": "D102", "name": "Sarah Jenkins", "workingHours": 7.5, "completedDeliveries": 180, "currentDeliveries": 2, "workloadScore": 55.0, "availability": True, "zone": "Zone B", "experienceLevel": "Mid"},
        {"id": "D103", "name": "Robert Chen", "workingHours": 6.0, "completedDeliveries": 310, "currentDeliveries": 4, "workloadScore": 60.0, "availability": True, "zone": "Zone A", "experienceLevel": "Senior"},
        {"id": "D104", "name": "Elena Rostova", "workingHours": 8.5, "completedDeliveries": 140, "currentDeliveries": 2, "workloadScore": 70.0, "availability": True, "zone": "Zone C", "experienceLevel": "Mid"},
        {"id": "D105", "name": "Michael Chang", "workingHours": 5.0, "completedDeliveries": 90, "currentDeliveries": 1, "workloadScore": 35.0, "availability": True, "zone": "Zone B", "experienceLevel": "Junior"}
    ]
    for d in drivers[:num_customers]:
        db.collection("drivers").document(d["id"]).set(d)
    print(f"[OK] Created {len(drivers)} drivers.")

    # 5. PACKAGES & ORDERS (Exactly 5)
    packages = []
    orders = []

    order_specs = [
        {"oid": "O1001", "cid": "C1001", "cat": "Medicine", "prio": "CRITICAL", "win": "morning", "time": "09:30 AM", "vid": "V101", "did": "D101", "fail_prob": 0.12, "risk": "LOW"},
        {"oid": "O1002", "cid": "C1002", "cat": "Frozen", "prio": "HIGH", "win": "midday", "time": "12:30 PM", "vid": "V102", "did": "D102", "fail_prob": 0.78, "risk": "CRITICAL"},  # Refrigeration mismatch!
        {"oid": "O1003", "cid": "C1003", "cat": "Electronics", "prio": "MEDIUM", "win": "afternoon", "time": "03:00 PM", "vid": "V103", "did": "D103", "fail_prob": 0.15, "risk": "LOW"},
        {"oid": "O1004", "cid": "C1004", "cat": "Medicine", "prio": "CRITICAL", "win": "morning", "time": "10:00 AM", "vid": "V101", "did": "D104", "fail_prob": 0.78, "risk": "CRITICAL"},  # Morning window for evening customer!
        {"oid": "O1005", "cid": "C1005", "cat": "General", "prio": "LOW", "win": "midday", "time": "01:30 PM", "vid": "V105", "did": "D105", "fail_prob": 0.10, "risk": "LOW"}
    ]

    for spec in order_specs[:num_customers]:
        oid = spec["oid"]
        cid = spec["cid"]
        cust = [c for c in customers if c["id"] == cid][0]
        cat = spec["cat"]
        prio = spec["prio"]
        pid = f"PKG_{oid}"

        pkg_doc = {
            "id": pid,
            "orderId": oid,
            "category": cat,
            "priority": prio,
            "fragility": "HIGH" if cat in ["Medicine", "Electronics"] else "LOW",
            "temperatureSensitivity": "HIGH" if cat in ["Medicine", "Frozen"] else "LOW",
            "expirySensitivity": "HIGH" if cat == "Medicine" else "LOW",
            "specialHandling": "Cold-chain temperature monitoring" if cat in ["Medicine", "Frozen"] else "Standard handling",
            "estimatedValue": 350.0 if cat == "Medicine" else 150.0,
            "deadline": "20:00",
            "riskScore": 75 if spec["risk"] == "CRITICAL" else 20
        }
        packages.append(pkg_doc)
        db.collection("packages").document(pid).set(pkg_doc)

        fail_p = spec["fail_prob"]
        succ_p = round(1.0 - fail_p, 2)

        order_doc = {
            "id": oid,
            "customerId": cid,
            "customerName": cust["name"],
            "packageId": pid,
            "packageCategory": cat,
            "priority": prio,
            "deliveryDeadline": "20:00",
            "requestedTime": spec["time"],
            "requestedWindow": spec["win"],
            "status": "SCHEDULED",
            "assignedVehicleId": spec["vid"],
            "assignedDriverId": spec["did"],
            "zone": cust["zone"],
            "successProbability": succ_p,
            "failureProbability": fail_p,
            "riskLevel": spec["risk"],
            "createdAt": datetime.now().isoformat()
        }
        orders.append(order_doc)
        db.collection("orders").document(oid).set(order_doc)

    print(f"[OK] Created exactly {len(packages)} packages and {len(orders)} scheduled orders.")

    # 6. OPERATIONAL INSIGHTS
    insights_doc = {
        "id": "DAILY_INSIGHTS",
        "generatedAt": datetime.now().isoformat(),
        "summary": "LOGIX AI Engine analyzed 5 scheduled customer orders: 2 critical risk deliveries detected due to window mismatch and non-refrigerated vehicle assignment.",
        "topFailureReasons": [
            {"reason": "Customer Window Unavailability", "percentage": 50},
            {"reason": "Vehicle Refrigeration Mismatch", "percentage": 50}
        ],
        "discoveredPatterns": [
            "Global Pharma Labs (C1004) has 96% evening availability but was scheduled in morning window.",
            "Metro Fresh Foods (O1002) requires frozen refrigeration but was assigned non-refrigerated V102."
        ]
    }
    db.collection("operational_insights").document("DAILY_INSIGHTS").set(insights_doc)

    if hasattr(db, "flush"):
        db.flush()

    print("=== SEED COMPLETE ===")
    print(f"Summary: {len(customers)} Customers, {len(vehicles)} Vehicles, {len(drivers)} Drivers, {len(orders)} Scheduled Orders written to DB.")

if __name__ == "__main__":
    generate_seed_data()
