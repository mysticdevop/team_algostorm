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


```

[ Open-Meteo Weather API ]
│ (Hourly Irradiance & Wind)
▼
[ FastAPI Backend Engine ] ──▶ [ PuLP / CBC Solver ]
│                       │ (MILP Setpoints: PV, Wind, BESS, Diesel)
▼                       ▼
[ REST / JSON API ] ──────▶ [ React + Vite + Tailwind Dashboard ]

```

---

## Tech Stack

- **Backend / Optimization Engine:** Python 3.11+, FastAPI, Uvicorn, PuLP (COIN-OR CBC Solver), Pydantic
- **Frontend / Operator UI:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React
- **Data Ingestion:** Open-Meteo Meteorological Forecast APIs

---

## Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/mysticdevop/team_algostorm.git](https://github.com/mysticdevop/team_algostorm.git)
cd team_algostorm

```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000

```

The backend API and interactive documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev

```

The operator dashboard will be accessible at `http://localhost:5173`.

---

## Mathematical Formulation Overview

The core solver minimizes total operating cost $J$ over a 24-hour horizon ($T=24$):

$$\min J = \sum_{t=1}^{T} \left( C_{\text{fuel}} \cdot P_{\text{gen}}(t) + C_{\text{deg}} \cdot P_{\text{dis}}(t) \right)$$

Subject to:

1. **Power Balance:**
$$P_{\text{pv}}(t) + P_{\text{wind}}(t) + P_{\text{dis}}(t) + P_{\text{gen}}(t) - P_{\text{ch}}(t) = P_{\text{load}}(t), \quad \forall t$$


2. **State of Charge (SOC) Evolution:**
$$\text{SOC}(t) = \text{SOC}(t-1) + \eta_{\text{ch}} P_{\text{ch}}(t)\Delta t - \frac{1}{\eta_{\text{dis}}} P_{\text{dis}}(t)\Delta t$$


3. **Storage Health Limits:**
$$0.20 \cdot C_{\text{bat}} \le \text{SOC}(t) \le 0.90 \cdot C_{\text{bat}}$$


4. **Generator Operating Envelope:**
$$0.30 \cdot P_{\text{gen,max}} \cdot u_{\text{gen}}(t) \le P_{\text{gen}}(t) \le P_{\text{gen,max}} \cdot u_{\text{gen}}(t), \quad u_{\text{gen}}(t) \in \{0, 1\}$$



---

## License

MIT

```

---

### Commit and Push the README

Run these commands in your PowerShell terminal at `D:\microgridsys`:

```powershell
git add README.md
git commit -m "docs: add comprehensive project overview and architecture guide"
git push origin main

```
