"use client";

export interface AnswerDisplayProps {
  answer: string | null;
  error: string | null;
  loading: boolean;
}

export function AnswerDisplay({ answer, error, loading }: AnswerDisplayProps) {
  if (loading) {
    return (
      <div className="answer-display answer-display--loading" role="status" aria-live="polite">
        Loading answer…
      </div>
    );
  }

  if (error) {
    return (
      <div className="answer-display answer-display--error" role="alert">
        {error}
      </div>
    );
  }

  if (answer) {
    return (
      <div className="answer-display answer-display--success">
        <h2 className="answer-display__title">Answer</h2>
        <p className="answer-display__text">{answer}</p>
      </div>
    );
  }

  return null;
}
