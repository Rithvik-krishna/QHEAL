import { useState, useCallback } from 'react';
import { predict } from '../lib/api';
import type { PatientInput, PredictionResponse, LoadingState } from '../types';

export function usePrediction() {
  const [state, setState] = useState<LoadingState>('idle');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (patient: PatientInput) => {
    setState('loading');
    setError(null);
    setResult(null);
    try {
      const [data] = await Promise.all([
        predict(patient),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
      setResult(data);
      setState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Prediction failed';
      setError(msg);
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  return { state, result, error, run, reset };
}
