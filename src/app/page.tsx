"use client";

import { useAsk } from "@/hooks/useAsk";
import { AskForm } from "@/components/AskForm";
import { AnswerDisplay } from "@/components/AnswerDisplay";
import { AnswerHistory } from "@/components/AnswerHistory";
import styles from "./page.module.css";

export default function Home() {
  const { answer, error, loading, history, ask } = useAsk();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Video Game Wingman</h1>
        <p className={styles.subtitle}>Ask a question about video games.</p>
        <p className={styles.disclaimer}>
          Answers are AI-generated. Gameplay details (unlock conditions, exact counts, mechanics) may be inaccurate — verify against an official source for anything important.
        </p>
      </header>
      <section className={styles.formSection}>
        <AskForm onSubmit={ask} disabled={loading} />
      </section>
      <section className={styles.answerSection} aria-live="polite">
        <AnswerDisplay answer={answer} error={error} loading={loading} />
      </section>
      {history.length > 1 && (
        <section className={styles.historySection}>
          <AnswerHistory history={history.slice(1)} />
        </section>
      )}
    </main>
  );
}
