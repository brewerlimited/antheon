"use client";
import { useMemo, useState } from "react";
import {
  blankFilters,
  dateLabel,
  recruiters,
  relativeDate,
} from "@/lib/recruitment/catalogue";
import {
  constructionTickets,
  ticketShort,
} from "@/lib/recruitment/constructionTickets";
import {
  currentPlacement,
  distance,
  filterCandidates,
  locationFrom,
  parseSearch,
} from "@/lib/recruitment/selectors";
import { useDemo } from "@/lib/recruitment/store";
import type { Candidate, CandidateFilters } from "@/lib/recruitment/types";
import { useActions } from "./actions";
import {
  Avatar,
  Button,
  Empty,
  exportCsv,
  Field,
  Icon,
  IconButton,
  Modal,
  RecruiterBadge,
  Status,
} from "./ui";
import { availabilityOptions, CandidateFiltersPanel } from "./CandidateFilters";
import { AvailabilityBoard } from "./AvailabilityBoard";
export function Candidates({
  filters,
  setFilters,
  board,
  setBoard,
}: {
  filters: CandidateFilters;
  setFilters: (f: CandidateFilters) => void;
  board: boolean;
  setBoard: (b: boolean) => void;
}) {
  const { state, run, notify } = useDemo(),
    { data } = state,
    actions = useActions();
  const [filterOpen, setFilterOpen] = useState(false),
    [selected, setSelected] = useState<string[]>([]),
    [page, setPage] = useState(0),
    [sort, setSort] = useState<{ key: keyof Candidate; asc: boolean }>({
      key: "created",
      asc: false,
    }),
    [viewName, setViewName] = useState(""),
    [saving, setSaving] = useState(false),
    [assign, setAssign] = useState(false),
    [natural, setNatural] = useState("");
  const [columns, setColumns] = useState({
    placement: true,
    date: true,
    tickets: true,
    contact: true,
    recruiter: true,
  });
  const rows = useMemo(
    () =>
      filterCandidates(data, filters).sort(
        (a, b) =>
          String(a[sort.key]).localeCompare(String(b[sort.key])) *
          (sort.asc ? 1 : -1),
      ),
    [data, filters, sort],
  );
  const resultIds = new Set(rows.map((c) => c.id)),
    selection = selected.filter((id) => resultIds.has(id));
  const active = Object.entries(filters).filter(
    ([key, value]) => value && key !== "search" && key !== "radius",
  );
  const currentPage = Math.min(
      page,
      Math.max(0, Math.ceil(rows.length / 50) - 1),
    ),
    shown = rows.slice(currentPage * 50, currentPage * 50 + 50),
    origin = locationFrom(filters);
  const change = (f: CandidateFilters) => {
    setFilters(f);
    setPage(0);
    setSelected([]);
  };
  const toggle = (id: string) =>
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id],
    );
  const sortBy = (key: keyof Candidate) =>
    setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));
  const label = (key: string, value: string) =>
    key === "availability"
      ? availabilityOptions.find(([v]) => v === value)?.[1]
      : key === "ticket"
        ? value
            .split(",")
            .map(
              (id) => constructionTickets.find((t) => t.id === id)?.name || id,
            )
            .join(" + ")
        : key === "recruiterId"
          ? recruiters.find((r) => r.id === value)?.name
          : key === "clientId"
            ? data.clients.find((c) => c.id === value)?.name
            : key === "siteId"
              ? data.sites.find((s) => s.id === value)?.name
              : key === "town"
                ? `${value} · ${filters.radius} miles`
                : `${key.replace(/([A-Z])/g, " $1")}: ${value}`;
  return (
    <>
      <header className="ro-page-heading">
        <div>
          <p className="ro-eyebrow">YOUR WORKFORCE</p>
          <h1>
            Candidates{" "}
            <span>{data.candidates.length.toLocaleString()} people</span>
          </h1>
        </div>
        <Button
          icon="plus"
          variant="primary"
          onClick={() => actions.editCandidate()}
        >
          Candidate
        </Button>
      </header>
      <div className="ro-candidate-toolbar">
        <div className="ro-search">
          <Icon name="search" />
          <input
            aria-label="Search candidates"
            placeholder="Search name, trade or location…"
            value={filters.search}
            onChange={(e) => change({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <IconButton
              label="Clear search"
              name="close"
              onClick={() => change({ ...filters, search: "" })}
            />
          )}
        </div>
        <div className="ro-segment">
          <button
            className={!board ? "active" : ""}
            onClick={() => setBoard(false)}
          >
            <Icon name="list" size={15} />
            List
          </button>
          <button
            className={board ? "active" : ""}
            onClick={() => setBoard(true)}
          >
            <Icon name="board" size={15} />
            Availability board
          </button>
        </div>
      </div>
      <div className="ro-toolbar">
        <Button icon="filter" onClick={() => setFilterOpen(true)}>
          Filters
          {active.length > 0 && (
            <span className="ro-count">{active.length}</span>
          )}
        </Button>
        <details className="ro-popover">
          <summary>
            <Icon name="list" size={15} />
            Saved views
            <Icon name="down" size={13} />
          </summary>
          <div className="ro-popover-menu">
            {data.savedViews.map((v) => (
              <button
                key={v.id}
                onClick={(e) => {
                  change(v.filters);
                  e.currentTarget.closest("details")?.removeAttribute("open");
                }}
              >
                {v.name}
              </button>
            ))}
            <button
              onClick={(e) => {
                setSaving(true);
                e.currentTarget.closest("details")?.removeAttribute("open");
              }}
            >
              + Save current view
            </button>
          </div>
        </details>
        <details className="ro-popover ro-columns-menu">
          <summary>
            <Icon name="panel" size={15} />
            Columns
          </summary>
          <div className="ro-popover-menu">
            {Object.entries(columns).map(([key, value]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setColumns({ ...columns, [key]: e.target.checked })
                  }
                />
                {key}
              </label>
            ))}
          </div>
        </details>
        <span className="ro-spacer" />
        <span className="ro-muted">
          {rows.length.toLocaleString()} matching candidates
        </span>
        <Button
          variant="primary"
          icon="message"
          disabled={!rows.length}
          onClick={() => actions.broadcast({ ids: rows.map((c) => c.id) })}
        >
          Message {rows.length.toLocaleString()}
        </Button>
      </div>
      {active.length > 0 && (
        <div className="ro-filter-chips">
          {active.map(([key, value]) => (
            <button key={key} onClick={() => change({ ...filters, [key]: "" })}>
              {label(key, value)}
              <Icon name="close" size={12} />
            </button>
          ))}
          <button
            className="ro-clear"
            onClick={() => change({ ...blankFilters })}
          >
            Clear all
          </button>
        </div>
      )}
      <details className="ro-natural-search">
        <summary>
          <Icon name="spark" size={14} /> Find me people{" "}
          <span>Try a plain-English filter</span>
        </summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = parseSearch(natural);
            if (f) {
              change(f);
              notify(
                "Your request became visible filters · deterministic search",
              );
            } else
              notify(
                "Try: Groundworkers within 30 miles of Northampton available now with CSCS.",
                true,
              );
          }}
        >
          <input
            aria-label="Find me people"
            value={natural}
            onChange={(e) => setNatural(e.target.value)}
            placeholder="Groundworkers within 30 miles of Northampton available now with CSCS"
          />
          <Button type="submit">
            Apply filters <Icon name="arrow" size={14} />
          </Button>
        </form>
        <p>
          Recognises groundworkers, listed towns, distance, CSCS, “available
          now” and “Monday”. A simple parser, not AI.
        </p>
      </details>
      {board ? (
        <AvailabilityBoard candidates={rows} />
      ) : rows.length ? (
        <>
          <div className="ro-table-wrap">
            <table className="ro-table ro-candidate-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select visible candidates"
                      checked={
                        shown.length > 0 &&
                        shown.every((c) => selection.includes(c.id))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...selection,
                                  ...shown.map((c) => c.id),
                                ]),
                              ]
                            : selection.filter(
                                (id) => !shown.some((c) => c.id === id),
                              ),
                        )
                      }
                    />
                  </th>
                  <th>
                    <button onClick={() => sortBy("name")}>
                      Candidate <Icon name="sort" size={12} />
                    </button>
                  </th>
                  <th>
                    <button onClick={() => sortBy("trade")}>
                      Trade <Icon name="sort" size={12} />
                    </button>
                  </th>
                  <th>
                    <button onClick={() => sortBy("town")}>
                      Location <Icon name="sort" size={12} />
                    </button>
                  </th>
                  <th>
                    <button onClick={() => sortBy("status")}>
                      Availability <Icon name="sort" size={12} />
                    </button>
                  </th>
                  {columns.placement && <th>Current placement</th>}
                  {columns.date && (
                    <th>
                      <button onClick={() => sortBy("availableFrom")}>
                        Available <Icon name="sort" size={12} />
                      </button>
                    </th>
                  )}
                  {columns.tickets && <th>Tickets</th>}
                  {columns.contact && (
                    <th>
                      <button onClick={() => sortBy("lastContact")}>
                        Last contact <Icon name="sort" size={12} />
                      </button>
                    </th>
                  )}
                  {columns.recruiter && <th>Owner</th>}
                  <th>
                    <span className="ro-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const placement = currentPlacement(data, c.id),
                    site = data.sites.find((s) => s.id === placement?.siteId);
                  return (
                    <tr
                      key={c.id}
                      data-candidate-id={c.id}
                      className={
                        selection.includes(c.id) ? "ro-row-selected" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.name}`}
                          checked={selection.includes(c.id)}
                          onChange={() => toggle(c.id)}
                        />
                      </td>
                      <td>
                        <button
                          className="ro-person"
                          onClick={() => actions.candidate(c.id)}
                        >
                          <Avatar name={c.name} small />
                          <span>
                            <strong>{c.name}</strong>
                            <small>
                              {c.doNotContact
                                ? "Do not contact"
                                : c.secondary[0] || "Candidate record"}
                            </small>
                            <small className="ro-mobile-detail">
                              {c.trade} · {c.town}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td>{c.trade}</td>
                      <td>
                        {c.town}
                        {origin && (
                          <small>
                            {distance(origin, c.town) ?? "—"} miles · straight
                            line
                          </small>
                        )}
                      </td>
                      <td>
                        <button
                          className="ro-inline-status"
                          title="Change availability"
                          onClick={() => actions.status([c.id])}
                        >
                          <Status status={c.status} />
                        </button>
                      </td>
                      {columns.placement && (
                        <td>
                          {site ? (
                            <button
                              className="ro-link ro-truncate"
                              onClick={() => actions.site(site.id)}
                            >
                              {site.name}
                            </button>
                          ) : (
                            <span className="ro-muted">
                              {c.status === "working" ? "Self-reported" : "—"}
                            </span>
                          )}
                        </td>
                      )}
                      {columns.date && (
                        <td>
                          {c.availableFrom ? dateLabel(c.availableFrom) : "—"}
                        </td>
                      )}
                      {columns.tickets && (
                        <td>
                          <div className="ro-mini-tickets">
                            {c.qualifications.slice(0, 2).map((q) => (
                              <span
                                key={q.id}
                                title={
                                  q.verified
                                    ? "Verified demo record"
                                    : "Awaiting verification"
                                }
                              >
                                {ticketShort(q)}
                              </span>
                            ))}
                            {c.qualifications.length > 2 && (
                              <span>+{c.qualifications.length - 2}</span>
                            )}
                          </div>
                        </td>
                      )}
                      {columns.contact && (
                        <td className="ro-muted">
                          {relativeDate(c.lastContact)}
                        </td>
                      )}
                      {columns.recruiter && (
                        <td>
                          <RecruiterBadge id={c.recruiterId} />
                        </td>
                      )}
                      <td>
                        <div className="ro-row-actions">
                          <IconButton
                            name="message"
                            label={`Message ${c.name}`}
                            onClick={() => actions.broadcast({ ids: [c.id] })}
                          />
                          <IconButton
                            name="phone"
                            label={`Call ${c.name}`}
                            onClick={() => actions.call(c.id)}
                          />
                          <IconButton
                            name="chevron"
                            label={`View ${c.name}`}
                            onClick={() => actions.candidate(c.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ro-table-footer">
            <span>
              {currentPage * 50 + 1}–
              {Math.min((currentPage + 1) * 50, rows.length)} of{" "}
              {rows.length.toLocaleString()} people
            </span>
            <Button
              variant="ghost"
              onClick={() => setSelected(shown.slice(0, 20).map((c) => c.id))}
            >
              Select first {Math.min(20, shown.length)}
            </Button>
            <span className="ro-spacer" />
            <Button
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span>
              {currentPage + 1} / {Math.ceil(rows.length / 50)}
            </span>
            <Button
              disabled={(currentPage + 1) * 50 >= rows.length}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <Empty
          title="No one matches all these filters."
          action={
            <Button onClick={() => change({ ...blankFilters })}>
              Clear filters
            </Button>
          }
        >
          Try a wider radius or fewer tickets. Your workforce is still here.
        </Empty>
      )}
      {selection.length > 0 && (
        <div className="ro-bulk-bar">
          <strong>{selection.length} selected</strong>
          <Button
            icon="message"
            onClick={() => actions.broadcast({ ids: selection })}
          >
            Message {selection.length}
          </Button>
          <Button onClick={() => actions.shortlist(selection)}>
            Add to job
          </Button>
          <Button onClick={() => actions.status(selection)}>
            Change status
          </Button>
          <Button onClick={() => setAssign(true)}>Assign recruiter</Button>
          <IconButton
            name="download"
            label="Export selected candidates"
            onClick={() => {
              exportCsv("recruitment-os-candidates.csv", [
                [
                  "Name",
                  "Trade",
                  "Town",
                  "Availability",
                  "Email",
                  "Demo mobile",
                ],
                ...data.candidates
                  .filter((c) => selection.includes(c.id))
                  .map((c) => [
                    c.name,
                    c.trade,
                    c.town,
                    c.status,
                    c.email,
                    c.phone,
                  ]),
              ]);
              notify("CSV exported · demo records only");
            }}
          />
          <IconButton
            name="close"
            label="Clear selection"
            onClick={() => setSelected([])}
          />
        </div>
      )}
      {filterOpen && (
        <CandidateFiltersPanel
          filters={filters}
          onChange={change}
          data={data}
          count={rows.length}
          onClose={() => setFilterOpen(false)}
          onClear={() => change({ ...blankFilters })}
        />
      )}{" "}
      {saving && (
        <Modal title="Save this view" onClose={() => setSaving(false)}>
          <form
            className="ro-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (run({ type: "save-view", name: viewName, filters })) {
                setSaving(false);
                setViewName("");
              }
            }}
          >
            <Field label="View name">
              <input
                data-initial-focus
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                required
                placeholder="My Northampton groundworkers"
                maxLength={50}
              />
            </Field>
            <Button type="submit" variant="primary">
              Save view
            </Button>
          </form>
        </Modal>
      )}
      {assign && (
        <Modal title="Assign a recruiter" onClose={() => setAssign(false)}>
          <div className="ro-choice-list">
            {recruiters.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  run({ type: "recruiter", ids: selection, recruiterId: r.id });
                  setAssign(false);
                }}
              >
                <RecruiterBadge id={r.id} />
                <span>{r.name}</span>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
