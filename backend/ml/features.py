"""
LOGIX ML Feature Engineering Pipeline
Extracts structured numerical and categorical features for model training and prediction.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_NAMES = [
    "customer_success_rate",
    "customer_reschedule_rate",
    "customer_window_success_rate",
    "hour_of_day",
    "day_of_week",
    "package_priority_num",
    "package_risk",
    "vehicle_health",
    "vehicle_capacity_remaining",
    "vehicle_package_compatibility",
    "driver_workload",
    "driver_experience_num",
    "delivery_distance",
    "traffic_level",
    "deadline_pressure",
    "zone_success_rate",
    # Categorical indicator flags
    "is_frozen_package",
    "is_medicine_package",
    "is_fragile_package",
    "is_zone_b"
]

PRIORITY_MAP = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
EXPERIENCE_MAP = {"Junior": 1, "Mid": 2, "Senior": 3}
ZONE_SUCCESS_BASELINE = {"Zone A": 0.88, "Zone B": 0.72, "Zone C": 0.82}

def compute_vehicle_package_compatibility(vehicle: Dict[str, Any], package_cat: str, fragility: str = "LOW") -> float:
    score = 1.0
    # Frozen requirement
    if package_cat == "Frozen" and not vehicle.get("refrigeration", False):
        score -= 0.65
    # Perishable/Food preference
    if package_cat in ["Perishable", "Food"] and not vehicle.get("refrigeration", False):
        score -= 0.25
    # Fragile requirement
    if (fragility == "HIGH" or package_cat == "Fragile") and not vehicle.get("fragileSupport", False):
        score -= 0.35
    # Vehicle health penalty
    v_health = vehicle.get("healthScore", 90)
    if v_health < 70:
        score -= 0.20
    elif v_health < 80:
        score -= 0.10
    return max(0.0, min(1.0, score))

def extract_features_from_context(
    customer: Dict[str, Any],
    order: Dict[str, Any],
    package: Dict[str, Any],
    vehicle: Dict[str, Any],
    driver: Dict[str, Any],
    requested_window: str = "morning",
    hour: int = 10,
    day_of_week: int = 4  # Friday = 4
) -> Dict[str, float]:
    total_cust_del = max(1, customer.get("successfulDeliveries", 10) + customer.get("failedDeliveries", 2))
    cust_succ_rate = customer.get("successfulDeliveries", 10) / total_cust_del
    cust_resched_rate = min(1.0, customer.get("rescheduleCount", 0) / max(1, total_cust_del / 5))

    window_rates = customer.get("windowSuccessRates", {})
    cust_win_rate = window_rates.get(requested_window, 0.75)

    p_priority = PRIORITY_MAP.get(package.get("priority", "MEDIUM"), 2)
    p_risk = package.get("riskScore", 30)

    v_health = vehicle.get("healthScore", 90)
    cap = max(1, vehicle.get("capacity", 200))
    load = vehicle.get("currentLoad", 50)
    rem_cap = max(0.0, (cap - load) / cap)

    p_cat = package.get("category", "General")
    fragility = package.get("fragility", "LOW")
    v_compat = compute_vehicle_package_compatibility(vehicle, p_cat, fragility)

    d_workload = driver.get("workloadScore", 50.0)
    d_exp = EXPERIENCE_MAP.get(driver.get("experienceLevel", "Mid"), 2)

    zone = customer.get("zone", "Zone A")
    zone_rate = ZONE_SUCCESS_BASELINE.get(zone, 0.80)

    # Traffic level: Zone B midday traffic peak
    traffic = 0.3
    if zone == "Zone B" and 11 <= hour <= 14:
        traffic = 0.8
    elif 17 <= hour <= 19:
        traffic = 0.65

    # Distance estimation
    dist = 5.5 + (hash(customer.get("id", "C1")) % 10)

    # Deadline pressure
    deadline_pressure = 0.3
    if p_priority in [3, 4]:
        deadline_pressure = 0.8

    return {
        "customer_success_rate": float(cust_succ_rate),
        "customer_reschedule_rate": float(cust_resched_rate),
        "customer_window_success_rate": float(cust_win_rate),
        "hour_of_day": float(hour),
        "day_of_week": float(day_of_week),
        "package_priority_num": float(p_priority),
        "package_risk": float(p_risk),
        "vehicle_health": float(v_health),
        "vehicle_capacity_remaining": float(rem_cap),
        "vehicle_package_compatibility": float(v_compat),
        "driver_workload": float(d_workload),
        "driver_experience_num": float(d_exp),
        "delivery_distance": float(dist),
        "traffic_level": float(traffic),
        "deadline_pressure": float(deadline_pressure),
        "zone_success_rate": float(zone_rate),
        "is_frozen_package": 1.0 if p_cat == "Frozen" else 0.0,
        "is_medicine_package": 1.0 if p_cat == "Medicine" else 0.0,
        "is_fragile_package": 1.0 if fragility == "HIGH" or p_cat == "Fragile" else 0.0,
        "is_zone_b": 1.0 if zone == "Zone B" else 0.0
    }

def convert_history_record_to_features(record: Dict[str, Any]) -> Dict[str, float]:
    win = record.get("window", "morning")
    window_hour_map = {"morning": 9, "midday": 12, "afternoon": 15, "evening": 18}
    hour = record.get("hour", window_hour_map.get(win, 10))

    cat = record.get("packageCategory", "General")
    v_refrig = record.get("vehicleRefrigerated", False)
    v_compat = 1.0
    if cat == "Frozen" and not v_refrig:
        v_compat = 0.25
    elif cat in ["Medicine", "Perishable"] and not v_refrig:
        v_compat = 0.65

    zone = record.get("zone", "Zone A")
    traffic = 0.8 if (zone == "Zone B" and win in ["morning", "midday"]) else 0.3

    return {
        "customer_success_rate": 0.85,
        "customer_reschedule_rate": min(1.0, record.get("customerRescheduleCount", 1) / 4.0),
        "customer_window_success_rate": float(record.get("customerWindowSuccessRate", 0.75)),
        "hour_of_day": float(hour),
        "day_of_week": 4.0,  # Default Friday
        "package_priority_num": 3.0 if cat == "Medicine" else 2.0,
        "package_risk": 70.0 if cat in ["Frozen", "Medicine"] else 30.0,
        "vehicle_health": float(record.get("vehicleHealth", 88)),
        "vehicle_capacity_remaining": 0.4,
        "vehicle_package_compatibility": float(v_compat),
        "driver_workload": float(record.get("driverWorkload", 50)),
        "driver_experience_num": 2.0,
        "delivery_distance": 6.0,
        "traffic_level": float(traffic),
        "deadline_pressure": 0.5,
        "zone_success_rate": float(ZONE_SUCCESS_BASELINE.get(zone, 0.80)),
        "is_frozen_package": 1.0 if cat == "Frozen" else 0.0,
        "is_medicine_package": 1.0 if cat == "Medicine" else 0.0,
        "is_fragile_package": 1.0 if cat == "Fragile" else 0.0,
        "is_zone_b": 1.0 if zone == "Zone B" else 0.0
    }
