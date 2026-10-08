import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import FRONTEND_URL, PORT, HOST
from backend.db.firebase import get_db
from backend.api.routes import router as api_router
from backend.api.copilot import process_copilot_query
from backend.api.models import CopilotRequest

app = FastAPI(
    title="LOGIX — AI Delivery Success Intelligence",
    description="Predicts whether deliveries will succeed, explains failure risks, and recommends risk-mitigating actions.",
    version="1.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if FRONTEND_URL and FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.post("/copilot/query")
def copilot_query(payload: CopilotRequest):
    return process_copilot_query(payload.query)

@app.get("/health")
def health_check():
    _, mode = get_db()
    return {
        "status": "ok",
        "service": "LOGIX AI Intelligence",
        "database_mode": mode,
        "tagline": "Don't just optimize the route. Predict whether the delivery will succeed."
    }

# Single Application URL: Static assets & Single Page App routing
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude internal API routes
        api_prefixes = ["upload", "orders", "customers", "vehicles", "drivers", "packages", "predict-delivery", "recommend-delivery", "simulate", "risk-summary", "insights", "clear-data", "copilot"]
        first_segment = full_path.split("/")[0]
        if first_segment in api_prefixes or full_path in ["health", "docs", "openapi.json"]:
            raise HTTPException(status_code=404, detail=f"API endpoint '{full_path}' not found")

        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "LOGIX Application Server"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
