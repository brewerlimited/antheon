"use client";
import { useState } from "react";
import { useDemo } from "@/lib/recruitment/store";
import { useActions } from "./actions";
import { Icon, Modal } from "./ui";
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    [query, setQuery] = useState(""),
    [index, setIndex] = useState(0),
    q = query.toLowerCase();
  const actions = [
    {
      label: "Add candidate",
      detail: "Quick action",
      icon: "plus",
      run: () => a.editCandidate(),
    },
    {
      label: "Create job",
      detail: "Quick action",
      icon: "briefcase",
      run: a.newJob,
    },
    {
      label: "Broadcast job",
      detail: "Message available workers",
      icon: "message",
      run: () =>
        a.broadcast({
          ids: data.candidates
            .filter((c) => c.status === "available")
            .map((c) => c.id),
          jobId: "job-0",
        }),
    },
    {
      label: "View available workers",
      detail: "Saved view",
      icon: "people",
      run: () => a.navigate("candidates", { availability: "available" }),
    },
    {
      label: "View expiring tickets",
      detail: "Compliance",
      icon: "shield",
      run: () => a.navigate("compliance"),
    },
  ];
  const results = [
    ...actions.filter((x) => x.label.toLowerCase().includes(q)),
    ...data.candidates
      .filter(
        (c) => q && `${c.name} ${c.trade} ${c.town}`.toLowerCase().includes(q),
      )
      .slice(0, 7)
      .map((c) => ({
        label: c.name,
        detail: `${c.trade} · ${c.town}`,
        icon: "people",
        run: () => a.candidate(c.id),
      })),
    ...data.jobs
      .filter(
        (j) =>
          q &&
          `${j.reference} ${j.trade} ${data.sites.find((s) => s.id === j.siteId)?.town}`
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 5)
      .map((j) => ({
        label: j.reference,
        detail: `${j.required} ${j.trade}s · ${data.sites.find((s) => s.id === j.siteId)?.town}`,
        icon: "briefcase",
        run: () => a.job(j.id),
      })),
    ...data.clients
      .filter((c) => q && c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        label: c.name,
        detail: "Client",
        icon: "building",
        run: () => a.client(c.id),
      })),
    ...data.sites
      .filter((s) => q && `${s.name} ${s.town}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        label: s.name,
        detail: `Site · ${s.town}`,
        icon: "pin",
        run: () => a.site(s.id),
      })),
  ];
  const choose = (i: number) => {
    const result = results[i];
    if (result) {
      onClose();
      result.run();
    }
  };
  return (
    <Modal
      title="Find anything. Do something."
      eyebrow="WORKSPACE SEARCH / ⌘ K"
      onClose={onClose}
    >
      <div className="ro-command">
        <input
          data-initial-focus
          role="combobox"
          aria-label="Search workspace"
          aria-expanded="true"
          aria-controls="ro-command-results"
          aria-activedescendant={
            results.length
              ? `ro-result-${Math.min(index, results.length - 1)}`
              : undefined
          }
          placeholder="Candidates, jobs, clients, sites or actions…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = (index + 1) % Math.max(results.length, 1);
              setIndex(n);
              document
                .getElementById(`ro-result-${n}`)
                ?.scrollIntoView({ block: "nearest" });
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const n =
                (index - 1 + results.length) % Math.max(results.length, 1);
              setIndex(n);
              document
                .getElementById(`ro-result-${n}`)
                ?.scrollIntoView({ block: "nearest" });
            }
            if (e.key === "Enter") {
              e.preventDefault();
              choose(index);
            }
          }}
        />
        <div id="ro-command-results" role="listbox">
          {results.map((r, i) => (
            <button
              role="option"
              aria-selected={index === i}
              id={`ro-result-${i}`}
              className={index === i ? "active" : ""}
              key={`${r.label}-${i}`}
              onClick={() => choose(i)}
            >
              <Icon name={r.icon} />
              <span>
                <strong>{r.label}</strong>
                <small>{r.detail}</small>
              </span>
              <Icon name="arrow" size={15} />
            </button>
          ))}
          {!results.length && (
            <p className="ro-muted">
              No results. Try a name, trade, location or JOB-184.
            </p>
          )}
        </div>
        <footer>
          <span>↑ ↓ to navigate</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </footer>
      </div>
    </Modal>
  );
}
