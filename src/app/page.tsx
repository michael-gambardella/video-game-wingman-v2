"use client";

import { useState, useCallback } from "react";
import { AskForm } from "@/components/AskForm";
import { AnswerDisplay } from "@/components/AnswerDisplay";
import type { AskResponse, ApiError } from "@/types";
import styles from "./page.module.css";

export default function Home() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = useCallback(async (question: string) => {
    setError(null);
    setAnswer(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as AskResponse | ApiError;
      if (!res.ok) {
        setError("error" in data ? data.error : "Something went wrong");
        return;
      }
      setAnswer("answer" in data ? data.answer : null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Video Game Wingman</h1>
        <p className={styles.subtitle}>Ask a question about video games.</p>
      </header>
      <section className={styles.formSection}>
        <AskForm onSubmit={handleAsk} disabled={loading} />
      </section>
      <section className={styles.answerSection} aria-live="polite">
        <AnswerDisplay answer={answer} error={error} loading={loading} />
      </section>
    </main>
  );
}
