"use client";

/**
 * React hook for the ask Q&A flow.
 * Thin state wrapper around askApi — all business logic lives in askApi.ts.
 */

import { useState, useCallback } from "react";
import { askApi, AskApiError } from "@/lib/ask/askApi";

export interface UseAskState {
  answer: string | null;
  error: string | null;
  loading: boolean;
}

export interface UseAskResult extends UseAskState {
  ask: (question: string) => Promise<void>;
}

export function useAsk(): UseAskResult {
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (question: string) => {
    setError(null);
    setAnswer(null);
    setLoading(true);
    try {
      const result = await askApi(question);
      setAnswer(result.answer);
    } catch (err) {
      setError(err instanceof AskApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { answer, error, loading, ask };
}
