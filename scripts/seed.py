"""
LOGIX — Synthetic Data Generator & Seeder
LABEL: Synthetic / simulated logistics data.
Deterministic (fixed random seed = 42), idempotent, re-runnable.
"""

import sys
import os
import random
from datetime import datetime, timedelta, time
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.db.firebase import get_db

def generate_seed_data():
    random.seed(42)
    db, db_mode = get_db()
    print(f"--- Seeding LOGIX Data (Database Mode: {db_mode}) ---")
    print("Notice: Synthetic / simulated logistics data generated for demonstration purposes.\n")

    # 1. ZONES & CATEGORIES
    ZONES = ["Zone A", "Zone B", "Zone C"]
    CATEGORIES = [
        "Medicine", "Food", "Frozen", "Perishable", 
        "Electronics", "Fragile", "Clothing", "Documents", "General"
    ]
    WINDOWS = ["morning", "midday", "afternoon", "evening"]
    WINDOW_TIMES = {
        "morning": "08:00–11:00",
        "midday": "11:00–14:00",
        "afternoon": "14:00–17:00",
        "evening": "17:00–20:00"
    }

    # 2. CUSTOMERS (40)
    customer_firsts = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia", 
                       "Kevin", "Laura", "Marcus", "Nora", "Oscar", "Penelope", "Quinn", "Rachel", "Sam", "Tina", 
                       "Ulysses", "Victoria", "Will", "Xena", "Yusuf", "Zara", "Arthur", "Beatrice", "Cyril", "Doris",
                       "Edward", "Freya", "Gideon", "Hazel", "Isaac", "Jacqueline", "Karl", "Luna", "Milo", "Nina"]
    customer_lasts = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                      "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]

    customers = []
    for i in range(40):
        cid = f"C{1000 + i}"
        name = f"{customer_firsts[i]} {customer_lasts[i % len(customer_lasts)]}"
        zone = ZONES[i % 3]

        # Behavioral personas
        persona_type = i % 4
        if persona_type == 0:  # Morning Available (8-11), Evening Unavailable
            window_rates = {"morning": 0.92, "midday": 0.60, "afternoon": 0.40, "evening": 0.15}
            best_window = "morning"
            avail_score = 0.85
            reschedules = random.randint(0, 2)
        elif persona_type == 1:  # Afternoon/Evening Available (17-20), Morning Unavailable (HERO PERSONA)
            window_rates = {"morning": 0.20, "midday": 0.45, "afternoon": 0.75, "evening": 0.95}
            best_window = "evening"
            avail_score = 0.75
            reschedules = random.randint(1, 4)
        elif persona_type == 2:  # Unreliable Rescheduler
            window_rates = {"morning": 0.40, "midday": 0.35, "afternoon": 0.45, "evening": 0.50}
            best_window = "evening"
            avail_score = 0.42
            reschedules = random.randint(5, 12)
        else:  # Highly Reliable Customer
            window_rates = {"morning": 0.90, "midday": 0.88, "afternoon": 0.94, "evening": 0.91}
            best_window = "afternoon"
            avail_score = 0.96
            reschedules = random.randint(0, 1)

        total_deliveries = random.randint(15, 60)
        avg_rate = sum(window_rates.values()) / 4.0
        succ = int(total_deliveries * avg_rate)
        fail = total_deliveries - succ

        cust_data = {
            "id": cid,
            "name": name,
            "location": f"{zone}, Sector {random.randint(1, 9)}",
            "zone": zone,
            "preferredTime": WINDOW_TIMES[best_window],
            "successfulDeliveries": succ,
            "failedDeliveries": fail,
            "rescheduleCount": reschedules,
            "availabilityScore": avail_score,
            "bestDeliveryWindow": best_window,
            "windowSuccessRates": window_rates,
            "weekdayVsWeekend": {"weekday": round(avg_rate + 0.05, 2), "weekend": round(avg_rate - 0.05, 2)}
        }
        customers.append(cust_data)
        db.collection("customers").document(cid).set(cust_data)

    print(f"[OK] Created {len(customers)} customers across 3 zones.")

    # 3. VEHICLES (8)
    vehicles = [
        {"id": "V01", "vehicleNumber": "LOG-V101", "vehicleType": "Refrigerated Van", "capacity": 150, "currentLoad": 65, "refrigeration": True, "fragileSupport": True, "healthScore": 95, "maintenanceStatus": "Optimal", "availability": True},
        {"id": "V02", "vehicleNumber": "LOG-V102", "vehicleType": "Standard Van", "capacity": 200, "currentLoad": 80, "refrigeration": False, "fragileSupport": False, "healthScore": 88, "maintenanceStatus": "Good", "availability": True},
        {"id": "V03", "vehicleNumber": "LOG-V103", "vehicleType": "Cold Storage Truck", "capacity": 300, "currentLoad": 110, "refrigeration": True, "fragileSupport": True, "healthScore": 92, "maintenanceStatus": "Optimal", "availability": True},
        {"id": "V04", "vehicleNumber": "LOG-V104", "vehicleType": "Express Sprinter", "capacity": 100, "currentLoad": 95, "refrigeration": False, "fragileSupport": True, "healthScore": 72, "maintenanceStatus": "Service Needed", "availability": True},
        {"id": "V05", "vehicleNumber": "LOG-V105", "vehicleType": "Heavy Cargo Truck", "capacity": 400, "currentLoad": 380, "refrigeration": False, "fragileSupport": False, "healthScore": 64, "maintenanceStatus": "Degraded", "availability": True},
        {"id": "V06", "vehicleNumber": "LOG-V106", "vehicleType": "Refrigerated Sprinter", "capacity": 120, "currentLoad": 40, "refrigeration": True, "fragileSupport": True, "healthScore": 98, "maintenanceStatus": "Optimal", "availability": True},
        {"id": "V07", "vehicleNumber": "LOG-V107", "vehicleType": "Standard Van", "capacity": 180, "currentLoad": 140, "refrigeration": False, "fragileSupport": True, "healthScore": 84, "maintenanceStatus": "Good", "availability": True},
        {"id": "V08", "vehicleNumber": "LOG-V108", "vehicleType": "Electric City Cargo", "capacity": 90, "currentLoad": 85, "refrigeration": False, "fragileSupport": False, "healthScore": 90, "maintenanceStatus": "Good", "availability": True},
    ]

    for v in vehicles:
        db.collection("vehicles").document(v["id"]).set(v)
    print(f"[OK] Created {len(vehicles)} vehicles.")

    # 4. DRIVERS (12)
    driver_names = ["Dave Miller", "Sarah Jenkins", "Robert Chen", "Elena Rostova", "Michael Chang", "Amanda Taylor",
                    "James Wilson", "Carlos Mendez", "Fatima Al-Mansoor", "Lukas Weber", "Chloe Dubois", "Kenji Sato"]
    drivers = []
    for i, name in enumerate(driver_names):
        did = f"D{101 + i}"
        zone = ZONES[i % 3]
        workload = round(random.uniform(30, 95), 1)
        exp = ["Junior", "Mid", "Senior"][i % 3]
        d_data = {
            "id": did,
            "name": name,
            "workingHours": round(random.uniform(4.0, 9.5), 1),
            "completedDeliveries": random.randint(120, 650),
            "currentDeliveries": random.randint(3, 14),
            "workloadScore": workload,
            "availability": True,
            "zone": zone,
            "experienceLevel": exp
        }
        drivers.append(d_data)
        db.collection("drivers").document(did).set(d_data)
    print(f"[OK] Created {len(drivers)} drivers.")

    # 5. HISTORICAL DELIVERIES (~1500 over 30 days)
    print("Generating ~1500 historical delivery logs with realistic risk factors...")
    hist_records = []
    now = datetime.now()

    for h in range(1500):
        hid = f"HIST_{10000 + h}"
        days_ago = random.randint(1, 30)
        dt = now - timedelta(days=days_ago)

        cust = random.choice(customers)
        vh = random.choice(vehicles)
        drv = random.choice(drivers)
        cat = random.choice(CATEGORIES)
        win = random.choice(WINDOWS)

        # Baseline probability from customer window success rate
        base_prob = cust["windowSuccessRates"][win]

        # Rule penalizations
        # 1. Zone B between 10AM-1PM penalty
        if cust["zone"] == "Zone B" and win in ["morning", "midday"]:
            base_prob -= 0.25

        # 2. Frozen package on non-refrigerated vehicle penalty
        if cat == "Frozen" and not vh["refrigeration"]:
            base_prob -= 0.50

        # 3. Medicine on degraded vehicle penalty
        if cat == "Medicine" and vh["healthScore"] < 75:
            base_prob -= 0.20

        # 4. Overloaded driver penalty
        if drv["workloadScore"] > 80:
            base_prob -= 0.15

        # 5. Friday evening penalty
        if dt.weekday() == 4 and win == "evening":
            base_prob -= 0.12

        base_prob = max(0.05, min(0.98, base_prob))
        success = random.random() < base_prob

        fail_reason = None
        if not success:
            if cat == "Frozen" and not vh["refrigeration"]:
                fail_reason = "Temperature Breach - Vehicle Non-Refrigerated"
            elif cust["windowSuccessRates"][win] < 0.35:
                fail_reason = "Customer Unavailable in Time Window"
            elif drv["workloadScore"] > 80:
                fail_reason = "Driver Workload Delays & Exceeded Window"
            else:
                fail_reason = random.choice([
                    "Customer Unavailable", "Access Code Failure", 
                    "Address Unreachable", "Recipient Refused"
                ])

        record = {
            "id": hid,
            "timestamp": dt.isoformat(),
            "date": dt.strftime("%Y-%m-%d"),
            "dayOfWeek": dt.strftime("%A"),
            "hour": random.choice([9, 11, 14, 18]),
            "window": win,
            "customerId": cust["id"],
            "zone": cust["zone"],
            "packageCategory": cat,
            "vehicleId": vh["id"],
            "driverId": drv["id"],
            "vehicleRefrigerated": vh["refrigeration"],
            "vehicleHealth": vh["healthScore"],
            "driverWorkload": drv["workloadScore"],
            "customerWindowSuccessRate": cust["windowSuccessRates"][win],
            "customerRescheduleCount": cust["rescheduleCount"],
            "delivered": success,
            "failureReason": fail_reason
        }
        hist_records.append(record)
        # Store in delivery_history collection
        db.collection("delivery_history").document(hid).set(record)

    print(f"[OK] Generated {len(hist_records)} historical delivery records.")

    # 6. TODAY'S PACKAGES & ORDERS (80)
    print("Generating today's 80 orders including Hero Order O1024...")
    packages = []
    orders = []

    # HERO ORDER PREPARATION: O1024
    # Customer: Persona 1 (Evening available, morning unavailable) e.g., C1001 or index 1
    hero_cust = [c for c in customers if c["bestDeliveryWindow"] == "evening"][0]
    hero_vehicle = vehicles[0]  # Refrigerated V01
    hero_driver = drivers[0]    # D101

    for o_idx in range(80):
        oid = f"O{1001 + o_idx}"
        pid = f"PKG_{2001 + o_idx}"

        if oid == "O1024":
            # Hero order explicit requirements
            cust = hero_cust
            cat = "Medicine"
            priority = "CRITICAL"
            req_window = "morning"  # Assigned morning, but customer is evening available!
            veh = hero_vehicle
            drv = hero_driver
            req_time = "10:00 AM"
            deadline = "20:00"
            fragility = "HIGH"
            temp_sens = "HIGH"
            expiry_sens = "HIGH"
            spec_handling = "Cold-chain temperature monitoring"
            est_value = 450.0
        elif o_idx == 5:
            # Frozen order on non-refrigerated vehicle requirement
            cust = customers[5]
            cat = "Frozen"
            priority = "HIGH"
            req_window = "midday"
            veh = [v for v in vehicles if not v["refrigeration"]][0]  # V02 (Non-refrigerated)
            drv = drivers[1]
            req_time = "12:30 PM"
            deadline = "16:00"
            fragility = "MEDIUM"
            temp_sens = "CRITICAL"
            expiry_sens = "HIGH"
            spec_handling = "Keep frozen below -5C"
            est_value = 180.0
        else:
            cust = customers[o_idx % len(customers)]
            cat = CATEGORIES[o_idx % len(CATEGORIES)]
            priority = random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            req_window = random.choice(WINDOWS)
            veh = vehicles[o_idx % len(vehicles)]
            drv = drivers[o_idx % len(drivers)]
            req_time = f"{random.randint(8, 19)}:00"
            deadline = "20:00"
            fragility = random.choice(["LOW", "MEDIUM", "HIGH"])
            temp_sens = "HIGH" if cat in ["Frozen", "Medicine", "Food"] else "LOW"
            expiry_sens = "HIGH" if cat in ["Medicine", "Perishable", "Food"] else "LOW"
            spec_handling = "Standard care" if cat not in ["Fragile", "Medicine"] else "Fragile - Handle with care"
            est_value = round(random.uniform(25, 600), 2)

        # Compute package risk score (0-100)
        p_risk = 10
        if priority in ["HIGH", "CRITICAL"]: p_risk += 25
        if fragility == "HIGH": p_risk += 20
        if temp_sens == "HIGH": p_risk += 20
        if expiry_sens == "HIGH": p_risk += 15
        p_risk = min(95, p_risk)

        pkg_doc = {
            "id": pid,
            "orderId": oid,
            "category": cat,
            "priority": priority,
            "fragility": fragility,
            "temperatureSensitivity": temp_sens,
            "expirySensitivity": expiry_sens,
            "specialHandling": spec_handling,
            "estimatedValue": est_value,
            "deadline": deadline,
            "riskScore": p_risk
        }
        packages.append(pkg_doc)
        db.collection("packages").document(pid).set(pkg_doc)

        # Estimate order risk level & probability for initial setup
        window_rate = cust["windowSuccessRates"].get(req_window, 0.70)
        compat = True
        if cat == "Frozen" and not veh["refrigeration"]: compat = False

        if not compat:
            succ_prob = 0.22
        elif oid == "O1024":
            succ_prob = 0.22  # ~78% failure risk on morning window
        elif window_rate < 0.4:
            succ_prob = round(random.uniform(0.25, 0.45), 2)
        elif drv["workloadScore"] > 85:
            succ_prob = round(random.uniform(0.40, 0.60), 2)
        else:
            succ_prob = round(random.uniform(0.82, 0.98), 2)

        fail_prob = round(1.0 - succ_prob, 2)
        if fail_prob > 0.70: risk_level = "CRITICAL"
        elif fail_prob > 0.50: risk_level = "HIGH"
        elif fail_prob > 0.25: risk_level = "MEDIUM"
        else: risk_level = "LOW"

        order_doc = {
            "id": oid,
            "customerId": cust["id"],
            "customerName": cust["name"],
            "packageId": pid,
            "packageCategory": cat,
            "priority": priority,
            "deliveryDeadline": deadline,
            "requestedTime": req_time,
            "requestedWindow": req_window,
            "status": "SCHEDULED",
            "assignedVehicleId": veh["id"],
            "assignedDriverId": drv["id"],
            "zone": cust["zone"],
            "successProbability": succ_prob,
            "failureProbability": fail_prob,
            "riskLevel": risk_level,
            "createdAt": datetime.now().isoformat()
        }
        orders.append(order_doc)
        db.collection("orders").document(oid).set(order_doc)

    print(f"[OK] Created {len(packages)} packages and {len(orders)} orders.")
    print(f"[OK] Hero Order O1024 configured at ~78% risk level (Morning Window).")

    # 7. INITIAL OPERATIONAL INSIGHTS
    insights_doc = {
        "id": "DAILY_INSIGHTS",
        "generatedAt": datetime.now().isoformat(),
        "summary": "AI detected 10 orders at critical risk due to window availability mismatches and non-refrigerated vehicle assignments.",
        "topFailureReasons": [
            {"reason": "Customer Unavailable in Time Window", "percentage": 48},
            {"reason": "Vehicle Refrigeration Mismatch", "percentage": 24},
            {"reason": "Driver Workload Saturation", "percentage": 18},
            {"reason": "Zone B Midday Traffic/Access Delay", "percentage": 10}
        ],
        "discoveredPatterns": [
            "Zone B deliveries between 11 AM and 1 PM experience 34% higher unavailability.",
            "Frozen packages assigned to standard vans have a 91% failure rate.",
            "Customers in Zone C show 40% higher responsiveness in evening windows (5–8 PM)."
        ]
    }
    db.collection("operational_insights").document("DAILY_INSIGHTS").set(insights_doc)

    if hasattr(db, "flush"):
        db.flush()

    print("=== SEED COMPLETE ===")
    print(f"Summary: 40 Customers, 8 Vehicles, 12 Drivers, 80 Orders, 1500 Historical Logs written to DB.")

if __name__ == "__main__":
    generate_seed_data()
