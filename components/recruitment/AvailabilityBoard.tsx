"use client";
import { useState } from "react";
import { dateLabel, statusLabels } from "@/lib/recruitment/catalogue";
import { currentPlacement, finishing } from "@/lib/recruitment/selectors";
import { ticketShort } from "@/lib/recruitment/constructionTickets";
import { useDemo } from "@/lib/recruitment/store";
import type { Candidate } from "@/lib/recruitment/types";
import { useActions } from "./actions";
import { Avatar, Button, Icon, IconButton, Status } from "./ui";
const columns = [
  "available",
  "open",
  "working",
  "finishing",
  "not-looking",
  "unknown",
] as const;
export function AvailabilityBoard({ candidates }: { candidates: Candidate[] }) {
  const { state } = useDemo(),
    actions = useActions(),
    [over, setOver] = useState(""),
    [limits, setLimits] = useState<Record<string, number>>({});
  return (
    <>
      <p className="ro-board-hint">
        <Icon name="board" size={15} />
        Drag a worker to change availability. A placement is always confirmed
        before it changes.{" "}
        <span>On touch or keyboard, use each card’s status menu.</span>
      </p>
      <div className="ro-board">
        {columns.map((status) => {
          const items = candidates.filter((c) =>
            status === "finishing"
              ? finishing(state.data, c)
              : c.status === status &&
                (status !== "working" || !finishing(state.data, c)),
          );
          return (
            <section
              key={status}
              className={`ro-board-column ${over === status ? "ro-drop-target" : ""}`}
              data-drop-status={status}
              onDragOver={(e) => {
                if (status === "finishing") return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOver(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOver("");
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOver("");
                const id = e.dataTransfer.getData("text/plain");
                if (
                  candidates.some((c) => c.id === id) &&
                  status !== "finishing"
                )
                  actions.status([id], status);
              }}
            >
              <header>
                <Status
                  status={status}
                  label={
                    status === "finishing"
                      ? "Finishing ≤14 days"
                      : statusLabels[status]
                  }
                />
                <span>{items.length}</span>
              </header>
              <div className="ro-board-stack">
                {items.slice(0, limits[status] ?? 20).map((c) => {
                  const placement = currentPlacement(state.data, c.id);
                  return (
                    <article
                      key={c.id}
                      draggable
                      data-candidate-id={c.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setOver("")}
                      className="ro-worker-card"
                    >
                      <button
                        className="ro-worker-name"
                        onClick={() => actions.candidate(c.id)}
                      >
                        <Avatar name={c.name} small />
                        <strong>{c.name}</strong>
                        <Icon name="chevron" size={13} />
                      </button>
                      <p>{c.trade}</p>
                      <span className="ro-muted">
                        <Icon name="pin" size={12} />
                        {c.town}
                      </span>
                      <div className="ro-mini-tickets">
                        {c.qualifications.slice(0, 2).map((q) => (
                          <span key={q.id}>{ticketShort(q)}</span>
                        ))}
                      </div>
                      <footer>
                        <span>
                          {placement
                            ? `Finishes ${dateLabel(placement.finish)}`
                            : statusLabels[c.status]}
                        </span>
                        <IconButton
                          name="dots"
                          label={`Change status for ${c.name}`}
                          onClick={() => actions.status([c.id])}
                        />
                      </footer>
                    </article>
                  );
                })}
                {items.length > (limits[status] ?? 20) && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setLimits({
                        ...limits,
                        [status]: (limits[status] ?? 20) + 30,
                      })
                    }
                  >
                    Show 30 more
                  </Button>
                )}
                {!items.length && (
                  <p className="ro-column-empty">No workers in this view</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
