"""
LOGIX API End-to-End Tests
Tests core FastAPI endpoints using TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "tagline" in data

def test_risk_summary_empty():
    res = client.get("/risk-summary")
    assert res.status_code == 200
    data = res.json()
    assert "headline" in data
    assert data["totalDeliveries"] == 0

def test_list_orders_empty():
    res = client.get("/orders")
    assert res.status_code == 200
    assert res.json() == []

def test_dynamic_order_lifecycle():
    # 1. Create Customer
    cust_res = client.post("/customers", json={
        "name": "Test Customer",
        "location": "Zone A",
        "zone": "Zone A",
        "bestDeliveryWindow": "evening",
        "preferredTime": "17:00–20:00",
        "availabilityScore": 0.85
    })
    assert cust_res.status_code == 200
    customer_id = cust_res.json()["customer"]["id"]

    # 2. Create Vehicle
    veh_res = client.post("/vehicles", json={
        "vehicleNumber": "LOG-TEST-01",
        "vehicleType": "Refrigerated Van",
        "capacity": 200,
        "currentLoad": 50,
        "refrigeration": True,
        "fragileSupport": True,
        "healthScore": 95,
        "maintenanceStatus": "Good",
        "availability": True
    })
    assert veh_res.status_code == 200
    vehicle_id = veh_res.json()["vehicle"]["id"]

    # 3. Create Driver
    drv_res = client.post("/drivers", json={
        "name": "Test Driver",
        "workingHours": 6.0,
        "workloadScore": 40.0,
        "availability": True,
        "zone": "Zone A",
        "experienceLevel": "Senior"
    })
    assert drv_res.status_code == 200
    driver_id = drv_res.json()["driver"]["id"]

    # 4. Create Order
    order_res = client.post("/orders", json={
        "customerId": customer_id,
        "packageCategory": "General",
        "priority": "HIGH",
        "deliveryDeadline": "20:00",
        "requestedTime": "09:00 AM",
        "requestedWindow": "morning",
        "assignedVehicleId": vehicle_id,
        "assignedDriverId": driver_id
    })
    assert order_res.status_code == 200
    order_id = order_res.json()["order"]["id"]

    # 5. Fetch Order Details
    detail_res = client.get(f"/orders/{order_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["order"]["id"] == order_id
    assert "prediction" in detail
    assert "recommendation" in detail

    # 6. Simulation
    sim_res = client.post("/simulate", json={
        "orderId": order_id,
        "requestedWindow": "evening",
        "assignedVehicleId": vehicle_id
    })
    assert sim_res.status_code == 200
    assert "current" in sim_res.json()
    assert "whatIf" in sim_res.json()

    # 7. Apply Recommendation
    rec_res = client.post(f"/orders/{order_id}/apply-recommendation")
    assert rec_res.status_code == 200
    assert "afterSuccess" in rec_res.json()

def test_copilot_query_endpoint():
    payload = {"query": "Why are today's deliveries at risk?"}
    res = client.post("/copilot/query", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert data["grounded"] is True

