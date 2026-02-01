"use client";

import { useState, FormEvent } from "react";

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
    <form onSubmit={handleSubmit} className="ask-form">
      <label htmlFor="question" className="ask-form__label">
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
        className="ask-form__input"
        aria-describedby="question-hint"
      />
      <p id="question-hint" className="ask-form__hint">
        {question.length} / {MAX_LENGTH}
      </p>
      <button type="submit" disabled={isDisabled} className="ask-form__submit">
        {submitting ? "Getting answer…" : "Ask"}
      </button>
    </form>
  );
}
