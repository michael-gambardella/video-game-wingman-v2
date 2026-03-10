"use client";

import { useState, FormEvent } from "react";
import styles from "./AskForm.module.css";

export interface AskFormProps {
  onSubmit: (question: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_LENGTH = 2000;

export function AskForm({ onSubmit, disabled = false }: AskFormProps) {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || submitting || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = disabled || submitting || !question.trim();

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="question" className={styles.label}>
        Your question about a video game
      </label>
      <textarea
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="e.g. When was Grand Theft Auto V released?"
        rows={3}
        maxLength={MAX_LENGTH}
        disabled={disabled}
        className={styles.input}
        aria-describedby="question-hint"
      />
      <p id="question-hint" className={styles.hint}>
        {question.length} / {MAX_LENGTH}
      </p>
      <button type="submit" disabled={isDisabled} className={styles.submit}>
        {submitting ? "Getting answer…" : "Ask"}
      </button>
    </form>
  );
}
