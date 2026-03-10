"use client";

import type { QAPair } from "@/types";
import styles from "./AnswerHistory.module.css";

export interface AnswerHistoryProps {
  history: QAPair[];
}

export function AnswerHistory({ history }: AnswerHistoryProps) {
  if (history.length === 0) return null;

  return (
    <section aria-label="Previous answers">
      <h2 className={styles.heading}>Previous answers</h2>
      <ol className={styles.list}>
        {history.map((pair, i) => (
          <li key={i} className={styles.item}>
            <p className={styles.question}>{pair.question}</p>
            <p className={styles.answer}>{pair.answer}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
