"use client";
import { useState } from "react";
import { createSeed } from "@/lib/recruitment/seed";
import { filterCandidates } from "@/lib/recruitment/selectors";
import { blankFilters } from "@/lib/recruitment/catalogue";
export function ProductPreview() {
  const [data] = useState(createSeed),
    [filters, setFilters] = useState({
      trade: false,
      location: false,
      ticket: false,
    }),
    [selected, setSelected] = useState<string[]>([]),
    [signal, setSignal] = useState(false);
  const rows = filterCandidates(data, {
    ...blankFilters,
    availability: "available",
    trade: filters.trade ? "Groundworker" : "",
    town: filters.location ? "Northampton" : "",
    ticket: filters.ticket ? "cscs" : "",
  });
  return (
    <div className="rp-product-preview">
      <div className="rp-preview-chrome">
        <span>
          <i />
          <i />
          <i />
        </span>
        <p>ANTHĒON / RECRUITMENT OS</p>
        <b>LIVE DEMO</b>
      </div>
      <div className="rp-preview-body">
        <aside>
          <span className="rp-preview-mark">✳</span>
          <i>▦</i>
          <i className="active">◎</i>
          <i>▱</i>
          <i>▤</i>
          <i>⌁</i>
        </aside>
        <div className="rp-preview-workspace">
          <header>
            <div>
              <small>YOUR WORKFORCE, CONNECTED.</small>
              <h3>Who fits the next job?</h3>
            </div>
            <span>
              {rows.length}
              <small>AVAILABLE</small>
            </span>
          </header>
          <div className="rp-preview-filters">
            <button
              aria-pressed={filters.trade}
              onClick={() => {
                setFilters({ ...filters, trade: !filters.trade });
                setSelected([]);
                setSignal(false);
              }}
            >
              {filters.trade ? "✓ " : "+ "}Groundworker
            </button>
            <button
              aria-pressed={filters.location}
              onClick={() => {
                setFilters({ ...filters, location: !filters.location });
                setSelected([]);
                setSignal(false);
              }}
            >
              {filters.location ? "✓ " : "+ "}Northampton · 30 mi
            </button>
            <button
              aria-pressed={filters.ticket}
              onClick={() => {
                setFilters({ ...filters, ticket: !filters.ticket });
                setSelected([]);
                setSignal(false);
              }}
            >
              {filters.ticket ? "✓ " : "+ "}CSCS
            </button>
          </div>
          <div className="rp-preview-table">
            <div className="rp-preview-table-head">
              <span>Candidate / trade</span>
              <span>Location</span>
              <span>Availability</span>
            </div>
            {rows.slice(0, 5).map((c) => (
              <button
                className={selected.includes(c.id) ? "selected" : ""}
                key={c.id}
                onClick={() => {
                  setSelected(
                    selected.includes(c.id)
                      ? selected.filter((id) => id !== c.id)
                      : [...selected, c.id],
                  );
                  setSignal(false);
                }}
              >
                <span>
                  <i className="rp-checkbox">
                    {selected.includes(c.id) ? "✓" : ""}
                  </i>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.trade}</small>
                  </span>
                </span>
                <span>{c.town}</span>
                <span>
                  <i className="rp-status-dot" /> Available now
                </span>
              </button>
            ))}
          </div>
          <footer>
            <span>
              {selected.length
                ? `${selected.length} workers selected`
                : "Try the filters. Select your people."}
            </span>
            <button
              onClick={() => {
                if (!selected.length)
                  setSelected(rows.slice(0, 5).map((c) => c.id));
                else setSignal(true);
              }}
            >
              {signal
                ? "✓ Demo audience ready"
                : selected.length
                  ? `Message ${selected.length} →`
                  : "Select five →"}
            </button>
          </footer>
        </div>
      </div>
      <div className="rp-preview-caption">
        <span>
          <i /> REAL INTERFACE. FICTIONAL WORKFORCE.
        </span>
        <a href="/recruitment-os/demo">Open the full workspace ↗</a>
      </div>
    </div>
  );
}
