import axios from 'axios';
import type { PatientInput, PredictionResponse } from '../types';

// In production (Vercel): set VITE_API_URL to your Render backend URL
// e.g. https://qheal-backend.onrender.com
// In development: falls back to localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

export async function predict(patient: PatientInput): Promise<PredictionResponse> {
  const { data } = await client.post<PredictionResponse>('/predict', patient);
  return data;
}

export async function fetchMetrics(): Promise<{ patientsAnalyzed: number; accuracyGain: number; livePredictions: number }> {
  const { data } = await client.get('/metrics');
  return data;
}

export async function healthCheck(): Promise<{ status: string; quantum_available: boolean; models_loaded: boolean }> {
  const { data } = await client.get('/health');
  return data;
}
