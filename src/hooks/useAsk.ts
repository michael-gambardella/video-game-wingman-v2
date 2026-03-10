"use client";

/**
 * React hook for the ask Q&A flow.
 * Thin state wrapper around askApi — all business logic lives in askApi.ts.
 */

import { useState, useCallback } from "react";
import { askApi, AskApiError } from "@/lib/ask/askApi";
import type { QAPair } from "@/types";

export interface UseAskState {
  answer: string | null;
  error: string | null;
  loading: boolean;
  history: QAPair[];
}

export interface UseAskResult extends UseAskState {
  ask: (question: string) => Promise<void>;
}

export function useAsk(): UseAskResult {
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAPair[]>([]);

  const ask = useCallback(async (question: string) => {
    setError(null);
    setAnswer(null);
    setLoading(true);
    try {
      const result = await askApi(question);
      setAnswer(result.answer);
      setHistory((prev) => [{ question, answer: result.answer }, ...prev]);
    } catch (err) {
      setError(err instanceof AskApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { answer, error, loading, history, ask };
}
