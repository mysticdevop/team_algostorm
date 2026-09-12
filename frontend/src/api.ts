export interface MicrogridParams {
  latitude: number;
  longitude: number;
  solar_capacity_kw: number;
  wind_capacity_kw: number;
  battery_capacity_kwh: number;
  battery_max_kw: number;
  diesel_max_kw: number;
  fuel_cost_per_liter: number;
  co2_penalty_per_kg: number;
}

export interface OptimizationResponse {
  timestamps: string[];
  load_profile: number[];
  p_pv: number[];
  p_wind: number[];
  p_gen: number[];
  p_ch: number[];
  p_dis: number[];
  soc: number[];
  fuel_saved_liters: number;
  co2_avoided_kg: number;
  cost_savings_pct: number;
  optimized_fuel_cost: number;
  baseline_diesel_cost: number;
}

const API_BASE = "http://127.0.0.1:8000";

export async function fetchOptimization(params: MicrogridParams): Promise<OptimizationResponse> {
  const response = await fetch(`${API_BASE}/api/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}