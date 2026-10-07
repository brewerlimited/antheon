"use client";
import "@/components/recruitment/recruitment.css";
export default function DemoError({ reset }: { reset: () => void }) {
  return (
    <div className="ro-app">
      <main className="ro-empty" style={{ margin: "auto" }}>
        <p className="ro-eyebrow">RECRUITMENT OS / DEMO WORKSPACE</p>
        <h1>Let’s reopen your workspace.</h1>
        <p>
          The local demo could not render this record. Retry, or restore the
          fictional seed data if the browser’s saved copy is damaged.
        </p>
        <button className="ro-button ro-primary" onClick={reset}>
          Try again
        </button>
        <button
          className="ro-button"
          onClick={() => {
            try {
              localStorage.removeItem("antheon:recruitment-os:v1");
            } catch {
              /* Storage may be unavailable in private browsing. */
            }
            window.location.reload();
          }}
        >
          Reset local demo & reopen
        </button>
        <a href="/recruitment-os">Return to the product page ↗</a>
      </main>
    </div>
  );
}
