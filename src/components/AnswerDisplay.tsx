"use client";

import styles from "./AnswerDisplay.module.css";

export interface AnswerDisplayProps {
  answer: string | null;
  error: string | null;
  loading: boolean;
}

export function AnswerDisplay({ answer, error, loading }: AnswerDisplayProps) {
  if (loading) {
    return (
      <div className={`${styles.answerDisplay} ${styles.loading}`} role="status" aria-live="polite">
        Loading answer…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.answerDisplay} ${styles.error}`} role="alert">
        {error}
      </div>
    );
  }

  if (answer) {
    const paragraphs = answer.split(/\n\n+/).filter((p) => p.trim());
    return (
      <div className={`${styles.answerDisplay} ${styles.success}`}>
        <h2 className={styles.title}>Answer</h2>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return null;
}
