import importlib
from typing import Dict, Any, List


def _load_pulp():
    """Load PuLP lazily so importing this module does not fail without PuLP."""
    try:
        return importlib.import_module("pulp")
    except ImportError as exc:
        raise RuntimeError(
            "PuLP is required for microgrid optimization. Install it with "
            "'python -m pip install pulp'."
        ) from exc

def solve_microgrid_dispatch(
    params: Dict[str, Any], 
    weather: Dict[str, List[float]], 
    custom_load: List[float] = None
) -> Dict[str, Any]:
    pulp = _load_pulp()
    
    # 24-hour typical rural community diurnal load (kW) if custom not provided
    default_load = [
        12, 10, 9, 8, 8, 12, 18, 22, 25, 24, 23, 24,
        25, 26, 27, 28, 35, 48, 52, 45, 36, 28, 20, 15
    ]
    load = custom_load if (custom_load and len(custom_load) == 24) else default_load

    T = 24
    solar_cap = float(params.get("solar_capacity_kw", 60.0))
    wind_cap = float(params.get("wind_capacity_kw", 20.0))
    bat_cap = float(params.get("battery_capacity_kwh", 120.0))
    bat_max_p = float(params.get("battery_max_kw", 35.0))
    gen_max_p = float(params.get("diesel_max_kw", 40.0))
    fuel_cost = float(params.get("fuel_cost_per_liter", 1.50))
    co2_penalty = float(params.get("co2_penalty_per_kg", 0.05))

    # Available Renewable Output Profiles
    p_solar_avail = [(weather["irradiance"][t] / 1000.0) * solar_cap for t in range(T)]
    p_wind_avail = [min(wind_cap, (weather["wind_speed"][t] / 12.0) * wind_cap) for t in range(T)]

    # Formulate MILP
    model = pulp.LpProblem("Microgrid_Dispatch_Optimization", pulp.LpMinimize)

    # Decision variables
    p_pv = [pulp.LpVariable(f"p_pv_{t}", 0, p_solar_avail[t]) for t in range(T)]
    p_wind = [pulp.LpVariable(f"p_wind_{t}", 0, p_wind_avail[t]) for t in range(T)]
    p_gen = [pulp.LpVariable(f"p_gen_{t}", 0, gen_max_p) for t in range(T)]
    gen_on = [pulp.LpVariable(f"gen_on_{t}", cat=pulp.LpBinary) for t in range(T)]
    p_ch = [pulp.LpVariable(f"p_ch_{t}", 0, bat_max_p) for t in range(T)]
    p_dis = [pulp.LpVariable(f"p_dis_{t}", 0, bat_max_p) for t in range(T)]
    soc = [pulp.LpVariable(f"soc_{t}", 0.20 * bat_cap, 0.90 * bat_cap) for t in range(T)]

    # Generator fuel & CO2 constants: 0.28 L/kWh diesel, 2.68 kg CO2/L
    fuel_per_kwh = 0.28
    co2_per_liter = 2.68
    diesel_cost_coeff = (fuel_per_kwh * fuel_cost) + (fuel_per_kwh * co2_per_liter * co2_penalty)

    # Objective: Minimize Diesel Operating + Wear Costs
    model += pulp.lpSum([
        p_gen[t] * diesel_cost_coeff + 
        (p_dis[t] * 0.01) +          # Minor battery degradation penalty
        (p_ch[t] * 0.005)
        for t in range(T)
    ])

    # Constraints
    eta_ch = 0.92
    eta_dis = 0.92
    soc_initial = 0.50 * bat_cap

    for t in range(T):
        # 1. Power Balance
        model += (p_pv[t] + p_wind[t] + p_dis[t] + p_gen[t] - p_ch[t] == load[t])

        # 2. Generator Operating Envelopes (30% Minimum Operating Load)
        model += (p_gen[t] <= gen_max_p * gen_on[t])
        model += (p_gen[t] >= 0.30 * gen_max_p * gen_on[t])

        # 3. Battery State-of-Charge Dynamics
        prev_soc = soc_initial if t == 0 else soc[t-1]
        model += (soc[t] == prev_soc + (p_ch[t] * eta_ch) - (p_dis[t] / eta_dis))

    solver = pulp.PULP_CBC_CMD(msg=False)
    model.solve(solver)

    # Extract Outputs
    out_p_pv = [pulp.value(p_pv[t]) for t in range(T)]
    out_p_wind = [pulp.value(p_wind[t]) for t in range(T)]
    out_p_gen = [pulp.value(p_gen[t]) for t in range(T)]
    out_p_ch = [pulp.value(p_ch[t]) for t in range(T)]
    out_p_dis = [pulp.value(p_dis[t]) for t in range(T)]
    out_soc_pct = [(pulp.value(soc[t]) / bat_cap) * 100 for t in range(T)]

    total_gen_kwh = sum(out_p_gen)
    total_load_kwh = sum(load)
    
    # Baseline comparison (if 100% powered by diesel generator)
    baseline_fuel_liters = total_load_kwh * fuel_per_kwh
    optimized_fuel_liters = total_gen_kwh * fuel_per_kwh
    liters_saved = max(0.0, baseline_fuel_liters - optimized_fuel_liters)

    return {
        "timestamps": [f"{h:02d}:00" for h in range(T)],
        "load_profile": load,
        "p_pv": out_p_pv,
        "p_wind": out_p_wind,
        "p_gen": out_p_gen,
        "p_ch": out_p_ch,
        "p_dis": out_p_dis,
        "soc": out_soc_pct,
        "fuel_saved_liters": round(liters_saved, 1),
        "co2_avoided_kg": round(liters_saved * co2_per_liter, 1),
        "cost_savings_pct": round((liters_saved / (baseline_fuel_liters or 1)) * 100, 1),
        "optimized_fuel_cost": round(optimized_fuel_liters * fuel_cost, 2),
        "baseline_diesel_cost": round(baseline_fuel_liters * fuel_cost, 2),
    }