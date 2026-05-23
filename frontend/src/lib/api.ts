import axios from 'axios';
import type { PatientInput, PredictionResponse } from '../types';

const client = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

export async function predict(patient: PatientInput): Promise<PredictionResponse> {
  const { data } = await client.post<PredictionResponse>('/predict', patient);
  return data;
}

export async function healthCheck(): Promise<{ status: string; quantum_available: boolean; models_loaded: boolean }> {
  const { data } = await client.get('/health');
  return data;
}
