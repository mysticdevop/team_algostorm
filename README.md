# OptiGrid — Autonomous Microgrid Energy Dispatch Optimizer

> **Theme:** Renewable Energy Intelligence  
> **Target Audience:** Microgrid operators, rural electrification agencies, NGOs, and off-grid communities.

OptiGrid is an automated dispatch optimization engine designed for off-grid communities reliant on hybrid energy systems (Solar PV, Wind, Battery Energy Storage, and Diesel Backup). By coupling Open-Meteo real-time weather forecasts with Mixed-Integer Linear Programming (MILP), the system computes real-time power dispatch setpoints to minimize expensive diesel consumption and carbon emissions while guaranteeing 100% uptime for critical community loads.

---

## Key Features

- **Predictive Optimization (MILP):** Formulated in Python using PuLP/CBC to balance energy generation, storage constraints, and load profiles 24 hours ahead.
- **Physical Feasibility Guardrails:** Strict battery cycling bounds ($20\% \le \text{SOC} \le 90\%$) and generator minimum operating thresholds ($\ge 30\%$) to prevent engine wet-stacking and premature battery degradation.
- **Meteorological Forecast Ingestion:** Ingests live solar irradiance ($W/m^2$), wind speeds, and ambient temperatures via Open-Meteo REST APIs.
- **Interactive Control Dashboard:** Built with React 19, TypeScript, Tailwind CSS, and Recharts, allowing operators to run scenario stress tests, adjust fuel pricing, and inspect hourly power flows.
- **Quantifiable Impact Scoring:** Computes liters of diesel displaced, metric kilograms of $CO_2$ avoided, and operational cost savings against a 100% diesel baseline.

---

## System Architecture
