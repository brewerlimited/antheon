"use client";
import { useState } from "react";
import { constructionTickets } from "@/lib/recruitment/constructionTickets";
import { Icon } from "./ui";
export function TicketPicker({
  value,
  onChange,
  multiple = true,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
}) {
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().split(/\s+/).filter(Boolean),
    results = constructionTickets.filter((t) =>
      words.every((word) =>
        `${t.name} ${t.family} ${t.code ?? ""}`.toLowerCase().includes(word),
      ),
    );
  return (
    <div className="ro-ticket-picker">
      <div className="ro-search">
        <Icon name="search" size={16} />
        <input
          aria-label="Search qualifications"
          placeholder="Search tickets, e.g. cpcs dum…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {value.length > 0 && (
        <div className="ro-chips">
          {value.map((id) => (
            <button
              type="button"
              key={id}
              onClick={() => onChange(value.filter((v) => v !== id))}
            >
              {constructionTickets.find((t) => t.id === id)?.name ?? id}
              <Icon name="close" size={12} />
            </button>
          ))}
        </div>
      )}
      <div className="ro-ticket-options">
        {results.map((t, i) => (
          <div key={t.id}>
            {(i === 0 || t.family !== results[i - 1].family) && (
              <p className="ro-option-group">{t.family}</p>
            )}
            <label>
              <input
                type={multiple ? "checkbox" : "radio"}
                name="ticket-choice"
                checked={value.includes(t.id)}
                onChange={() =>
                  onChange(
                    value.includes(t.id)
                      ? value.filter((id) => id !== t.id)
                      : multiple
                        ? [...value, t.id]
                        : [t.id],
                  )
                }
              />
              <span>
                {t.name}
                {t.code && <small>{t.code}</small>}
              </span>
            </label>
          </div>
        ))}
        {!results.length && (
          <p className="ro-muted">
            No predefined ticket found. Use Add other qualification for a custom
            record.
          </p>
        )}
      </div>
    </div>
  );
}
