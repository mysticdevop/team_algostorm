import { type MicrogridParams } from './api';

export interface DistrictGridNode {
  id: string;
  name: string;
  county: string;
  coordinates: { lat: number; lng: number };
  mapCoords: { x: number; y: number }; // Percentage position on SVG map
  status: 'OPTIMAL' | 'DEGRADED' | 'ISLANDED';
  primaryLoadType: string;
  renewableFraction: number;
  solarIrradianceAvg: number; // kWh/m²/day
  windSpeedAvg: number; // m/s
  params: MicrogridParams;
}

export const DISTRICT_MICROGRIDS: DistrictGridNode[] = [
  {
    id: 'dist-01',
    name: 'Kitui Central Health Hub',
    county: 'Kitui District Alpha',
    coordinates: { lat: -1.3670, lng: 38.0106 },
    mapCoords: { x: 48, y: 52 },
    status: 'OPTIMAL',
    primaryLoadType: 'Critical Clinic Cold-Chain & Surgical Ward',
    renewableFraction: 92,
    solarIrradianceAvg: 5.8,
    windSpeedAvg: 4.2,
    params: {
      latitude: -1.3670,
      longitude: 38.0106,
      solar_capacity_kw: 85,
      wind_capacity_kw: 15,
      battery_capacity_kwh: 180,
      battery_max_kw: 45,
      diesel_max_kw: 30,
      fuel_cost_per_liter: 1.80,
      co2_penalty_per_kg: 0.08,
    },
  },
  {
    id: 'dist-02',
    name: 'Mwingi North Agro-Irrigation Unit',
    county: 'Mwingi Sector',
    coordinates: { lat: -0.9350, lng: 38.0580 },
    mapCoords: { x: 55, y: 22 },
    status: 'OPTIMAL',
    primaryLoadType: 'Deep-well Submersible Water Pumps',
    renewableFraction: 88,
    solarIrradianceAvg: 6.2,
    windSpeedAvg: 6.8,
    params: {
      latitude: -0.9350,
      longitude: 38.0580,
      solar_capacity_kw: 110,
      wind_capacity_kw: 30,
      battery_capacity_kwh: 140,
      battery_max_kw: 40,
      diesel_max_kw: 35,
      fuel_cost_per_liter: 1.40,
      co2_penalty_per_kg: 0.04,
    },
  },
  {
    id: 'dist-03',
    name: 'Mutomo Southern Settlement',
    county: 'Mutomo Dryland Cluster',
    coordinates: { lat: -1.8430, lng: 38.2140 },
    mapCoords: { x: 68, y: 78 },
    status: 'DEGRADED',
    primaryLoadType: '120 Off-Grid Households & Public Lighting',
    renewableFraction: 74,
    solarIrradianceAvg: 5.4,
    windSpeedAvg: 3.5,
    params: {
      latitude: -1.8430,
      longitude: 38.2140,
      solar_capacity_kw: 50,
      wind_capacity_kw: 10,
      battery_capacity_kwh: 90,
      battery_max_kw: 25,
      diesel_max_kw: 45,
      fuel_cost_per_liter: 1.60,
      co2_penalty_per_kg: 0.05,
    },
  },
  {
    id: 'dist-04',
    name: 'Ikutha Highland Ridge',
    county: 'Ikutha Ridge',
    coordinates: { lat: -2.0710, lng: 38.1790 },
    mapCoords: { x: 30, y: 84 },
    status: 'OPTIMAL',
    primaryLoadType: 'High-Altitude Communication Repeater Node',
    renewableFraction: 96,
    solarIrradianceAvg: 5.1,
    windSpeedAvg: 8.9,
    params: {
      latitude: -2.0710,
      longitude: 38.1790,
      solar_capacity_kw: 40,
      wind_capacity_kw: 50,
      battery_capacity_kwh: 150,
      battery_max_kw: 35,
      diesel_max_kw: 20,
      fuel_cost_per_liter: 1.95,
      co2_penalty_per_kg: 0.06,
    },
  },
];