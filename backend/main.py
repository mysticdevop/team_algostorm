from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from weather import fetch_weather_forecast
from optimizer import solve_microgrid_dispatch

app = FastAPI(title="OptiGrid Autonomous Microgrid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizationRequest(BaseModel):
    latitude: float = -1.3670
    longitude: float = 38.0106
    solar_capacity_kw: float = 60.0
    wind_capacity_kw: float = 20.0
    battery_capacity_kwh: float = 120.0
    battery_max_kw: float = 35.0
    diesel_max_kw: float = 40.0
    fuel_cost_per_liter: float = 1.50
    co2_penalty_per_kg: float = 0.05
    custom_load_profile: Optional[List[float]] = None

@app.get("/api/health")
def health():
    return {"status": "operational", "engine": "MILP PuLP/CBC"}

@app.post("/api/optimize")
def optimize(req: OptimizationRequest):
    weather = fetch_weather_forecast(req.latitude, req.longitude)
    result = solve_microgrid_dispatch(
        params=req.model_dump(), 
        weather=weather, 
        custom_load=req.custom_load_profile
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)