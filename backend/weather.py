import requests
from typing import Dict, List

def fetch_weather_forecast(lat: float, lon: float) -> Dict[str, List[float]]:
    """
    Retrieves 24-hour hourly solar irradiance and wind velocity 
    from Open-Meteo public meteorological APIs.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["direct_normal_irradiance", "wind_speed_10m", "temperature_2m"],
        "forecast_days": 1,
        "timezone": "auto"
    }

    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json().get("hourly", {})

        irradiance = data.get("direct_normal_irradiance", [0.0] * 24)[:24]
        wind_speed = data.get("wind_speed_10m", [10.0] * 24)[:24]
        temp = data.get("temperature_2m", [25.0] * 24)[:24]

        return {
            "irradiance": [max(0.0, float(x)) for x in irradiance],
            "wind_speed": [max(0.0, float(w)) for w in wind_speed],
            "temperature": [float(t) for t in temp],
        }
    except Exception as e:
        # Fallback realistic diurnal curve if network is unavailable
        print(f"Fallback weather triggered: {e}")
        irradiance_fallback = [
            0, 0, 0, 0, 0, 10, 120, 420, 750, 920, 980, 950, 
            820, 600, 350, 110, 20, 0, 0, 0, 0, 0, 0, 0
        ]
        return {
            "irradiance": irradiance_fallback,
            "wind_speed": [12.0] * 24,
            "temperature": [24.0] * 24,
        }