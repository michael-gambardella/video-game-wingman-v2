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
    const paragraphs = answer.split(/\n\n+/).filter((p) => p.trim());
    return (
      <div className="answer-display answer-display--success">
        <h2 className="answer-display__title">Answer</h2>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="answer-display__paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return null;
}
