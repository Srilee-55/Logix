"""
LOGIX ML Engine Unit Tests
Verifies feature engineering, risk classification, and recommendation engine logic.
"""

import pytest
from backend.ml.features import compute_vehicle_package_compatibility, extract_features_from_context
from backend.ml.predictor import compute_risk_level, generate_plain_language_explanations

def test_vehicle_package_compatibility():
    # Frozen on standard non-refrigerated vehicle must score very low
    v_std = {"refrigeration": False, "fragileSupport": False, "healthScore": 90}
    score_frozen = compute_vehicle_package_compatibility(v_std, "Frozen")
    assert score_frozen < 0.40

    # Frozen on refrigerated vehicle must score high
    v_refrig = {"refrigeration": True, "fragileSupport": True, "healthScore": 95}
    score_refrig = compute_vehicle_package_compatibility(v_refrig, "Frozen")
    assert score_refrig >= 0.90

def test_risk_level_thresholds():
    assert compute_risk_level(0.75) == "CRITICAL"
    assert compute_risk_level(0.55) == "HIGH"
    assert compute_risk_level(0.35) == "MEDIUM"
    assert compute_risk_level(0.15) == "LOW"

def test_extract_features_structure():
    customer = {
        "id": "C1001", "successfulDeliveries": 20, "failedDeliveries": 5, 
        "rescheduleCount": 2, "windowSuccessRates": {"morning": 0.20}, "zone": "Zone A"
    }
    order = {"id": "O1024", "requestedWindow": "morning"}
    package = {"category": "Medicine", "priority": "CRITICAL", "riskScore": 80, "fragility": "HIGH"}
    vehicle = {"capacity": 200, "currentLoad": 50, "healthScore": 90, "refrigeration": True}
    driver = {"workloadScore": 45.0, "experienceLevel": "Senior"}

    feats = extract_features_from_context(customer, order, package, vehicle, driver, requested_window="morning")
    assert "customer_window_success_rate" in feats
    assert feats["customer_window_success_rate"] == 0.20
    assert feats["package_priority_num"] == 4.0
    assert feats["is_medicine_package"] == 1.0

def test_plain_language_explanations():
    customer = {"name": "Alice", "windowSuccessRates": {"morning": 0.15}, "rescheduleCount": 6}
    package = {"category": "Frozen"}
    vehicle = {"vehicleNumber": "V102", "refrigeration": False, "healthScore": 60}
    driver = {"workloadScore": 88.0}
    feats = extract_features_from_context(customer, {}, package, vehicle, driver, requested_window="morning")

    explanations = generate_plain_language_explanations(feats, customer, package, vehicle, driver, "morning")
    assert len(explanations) >= 3
    # Check plain language - NO ML jargon allowed!
    for item in explanations:
        text = item["factor"]
        assert "SHAP" not in text
        assert "logit" not in text
        assert "feature importance" not in text
