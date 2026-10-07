"use client";
import { useState } from "react";
import { useDemo } from "@/lib/recruitment/store";
import {
  dateLabel,
  daysUntil,
  money,
  recruiters,
} from "@/lib/recruitment/catalogue";
import {
  constructionTickets,
  ticketName,
} from "@/lib/recruitment/constructionTickets";
import type { Candidate, Qualification } from "@/lib/recruitment/types";
import { useActions } from "./actions";
import {
  Avatar,
  Button,
  Combo,
  Empty,
  Field,
  Icon,
  Modal,
  RecruiterBadge,
  Status,
  Tabs,
} from "./ui";
export function Placements() {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Current"),
    [days, setDays] = useState(14),
    [search, setSearch] = useState("");
  const rows = data.placements.filter(
    (p) =>
      (tab === "Current"
        ? p.status === "current"
        : tab === "Starting soon"
          ? p.status === "upcoming"
          : tab === "Completed"
            ? p.status === "completed"
            : p.status === "current" &&
              daysUntil(p.finish) >= 0 &&
              daysUntil(p.finish) <= days) &&
      `${data.candidates.find((c) => c.id === p.candidateId)?.name} ${p.role} ${data.sites.find((s) => s.id === p.siteId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">PLACEMENTS / PEOPLE ON THE GROUND</p>
          <h1>
            Placements{" "}
            <span>
              {data.placements.filter((p) => p.status === "current").length}{" "}
              current
            </span>
          </h1>
          <p>Know where your workforce is. See what comes next.</p>
        </div>
        <Button
          icon="plus"
          onClick={() =>
            a.navigate("candidates", { availability: "available" })
          }
        >
          Find a worker to place
        </Button>
      </div>
      <div className="ro-toolbar">
        <Tabs
          items={["Current", "Starting soon", "Ending soon", "Completed"]}
          value={tab}
          onChange={setTab}
        />
        <input
          aria-label="Search placements"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search worker, role or site…"
        />
        {tab === "Ending soon" && (
          <select
            aria-label="Ending within"
            value={days}
            onChange={(e) => setDays(+e.target.value)}
          >
            {[7, 14, 30].map((d) => (
              <option value={d} key={d}>
                Next {d} days
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="ro-table-wrap">
        <table className="ro-table">
          <thead>
            <tr>
              <th>Candidate / role</th>
              <th>Client / site</th>
              <th>Start</th>
              <th>
                {tab === "Completed" ? "Actual finish" : "Expected finish"}
              </th>
              <th>Rate</th>
              <th>Owner</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const c = data.candidates.find((c) => c.id === p.candidateId)!;
              return (
                <tr key={p.id}>
                  <td>
                    <button
                      className="ro-person"
                      onClick={() => a.candidate(c.id)}
                    >
                      <Avatar small name={c.name} />
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {p.role} · {p.id}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <button
                      className="ro-person-label"
                      onClick={() => a.site(p.siteId)}
                    >
                      <strong>
                        {data.sites.find((s) => s.id === p.siteId)?.name}
                      </strong>
                      <small>
                        {data.clients.find((c) => c.id === p.clientId)?.name}
                      </small>
                    </button>
                  </td>
                  <td>{dateLabel(p.start)}</td>
                  <td>
                    {dateLabel(p.actualFinish || p.finish)}
                    {p.status === "current" && (
                      <small>{daysUntil(p.finish)} days remaining</small>
                    )}
                  </td>
                  <td>{money(p.rate)}/hr</td>
                  <td>
                    <RecruiterBadge id={c.recruiterId} />
                  </td>
                  <td>
                    <span className="ro-small-pill">{p.status}</span>
                  </td>
                  <td>
                    {p.status === "current" ? (
                      <Button
                        variant="ghost"
                        onClick={() => a.status([c.id], "available")}
                      >
                        End placement
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => a.candidate(c.id)}>
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <Empty title="No placements in this view">
          Change the period or search to see more placements.
        </Empty>
      )}
      <p className="ro-hint">
        These are agency-managed bookings. Self-reported working statuses are
        visible in Candidates.
      </p>
    </>
  );
}
export function Clients() {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Clients"),
    [query, setQuery] = useState("");
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">RELATIONSHIPS / BUILT AROUND THE SITE</p>
          <h1>
            Clients & sites{" "}
            <span>
              {data.clients.length} partners · {data.sites.length} sites
            </span>
          </h1>
          <p>Every requirement and worker, in the right place.</p>
        </div>
      </div>
      <div className="ro-toolbar">
        <Tabs items={["Clients", "Sites"]} value={tab} onChange={setTab} />
        <input
          aria-label="Search clients and sites"
          placeholder="Search name or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="ro-entity-grid">
        {tab === "Clients"
          ? data.clients
              .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
              .map((c) => (
                <button
                  className="ro-entity-card"
                  key={c.id}
                  onClick={() => a.client(c.id)}
                >
                  <Icon name="building" />
                  <h3>{c.name}</h3>
                  <p>{c.contact}</p>
                  <div>
                    <span>
                      <b>
                        {
                          data.jobs.filter(
                            (j) => j.clientId === c.id && j.status === "open",
                          ).length
                        }
                      </b>{" "}
                      open jobs
                    </span>
                    <span>
                      <b>
                        {
                          data.placements.filter(
                            (p) =>
                              p.clientId === c.id && p.status === "current",
                          ).length
                        }
                      </b>{" "}
                      workers
                    </span>
                    <Icon name="arrow" size={16} />
                  </div>
                </button>
              ))
          : data.sites
              .filter((s) =>
                `${s.name} ${s.town}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((s) => (
                <button
                  className="ro-entity-card"
                  key={s.id}
                  onClick={() => a.site(s.id)}
                >
                  <span className="ro-eyebrow">
                    {s.town} / {s.postcode}
                  </span>
                  <h3>{s.name}</h3>
                  <p>{data.clients.find((c) => c.id === s.clientId)?.name}</p>
                  <div>
                    <span>
                      <b>
                        {
                          data.placements.filter(
                            (p) => p.siteId === s.id && p.status === "current",
                          ).length
                        }
                      </b>{" "}
                      on site
                    </span>
                    <span>
                      <b>
                        {
                          data.jobs.filter(
                            (j) => j.siteId === s.id && j.status === "open",
                          ).length
                        }
                      </b>{" "}
                      jobs
                    </span>
                    <Icon name="arrow" size={16} />
                  </div>
                </button>
              ))}
      </div>
      {!(
        tab === "Clients"
          ? data.clients.filter((c) =>
              c.name.toLowerCase().includes(query.toLowerCase()),
            )
          : data.sites.filter((s) =>
              `${s.name} ${s.town}`.toLowerCase().includes(query.toLowerCase()),
            )
      ).length && <Empty title="No matching records" />}
    </>
  );
}
export function EntityDrawer({
  id,
  kind,
  onClose,
}: {
  id: string;
  kind: "client" | "site";
  onClose: () => void;
}) {
  const {
      state: { data },
      run,
    } = useDemo(),
    a = useActions(),
    [note, setNote] = useState(""),
    site = kind === "site" ? data.sites.find((s) => s.id === id) : undefined,
    client = data.clients.find((c) => c.id === (site?.clientId || id));
  if (!client) return null;
  const placements = data.placements.filter((p) =>
      kind === "site" ? p.siteId === id : p.clientId === id,
    ),
    current = placements.filter((p) => p.status === "current"),
    jobs = data.jobs.filter(
      (j) =>
        (kind === "site" ? j.siteId === id : j.clientId === id) &&
        j.status === "open",
    );
  return (
    <Modal
      title={site?.name || client.name}
      eyebrow={
        site
          ? `SITE / ${site.town.toUpperCase()}`
          : "CLIENT / CONSTRUCTION PARTNER"
      }
      wide
      drawer
      onClose={onClose}
    >
      <p className="ro-muted">
        {site
          ? `${client.name} · ${site.postcode}`
          : `${client.contact} · ${client.email} · ${client.phone}`}
      </p>
      <div className="ro-composer-counts">
        <div>
          <strong>{current.length}</strong>
          <span>Current workforce</span>
        </div>
        <div>
          <strong>
            {
              current.filter(
                (p) => daysUntil(p.finish) >= 0 && daysUntil(p.finish) <= 30,
              ).length
            }
          </strong>
          <span>Finishing within 30 days</span>
        </div>
        <div>
          <strong>{jobs.length}</strong>
          <span>Open jobs</span>
        </div>
        <div>
          <strong>
            {placements.filter((p) => p.status === "completed").length}
          </strong>
          <span>Past placements</span>
        </div>
      </div>
      {site && (
        <dl className="ro-details">
          <div>
            <dt>Site contact</dt>
            <dd>{site.contact}</dd>
          </div>
          <div>
            <dt>Project dates</dt>
            <dd>
              {dateLabel(site.start)} – {dateLabel(site.finish)}
            </dd>
          </div>
        </dl>
      )}
      <p className="ro-info">{site?.notes || client.notes}</p>
      <h3 className="ro-subheading">Current workforce</h3>
      {!current.length && <Empty title="No current workers here" />}
      {current.map((p) => {
        const c = data.candidates.find((c) => c.id === p.candidateId)!;
        return (
          <div className="ro-person-row" key={p.id}>
            <Avatar small name={c.name} />
            <button
              className="ro-person-label"
              onClick={() => a.candidate(c.id)}
            >
              <strong>{c.name}</strong>
              <small>
                {p.role} · finishes {dateLabel(p.finish)}
              </small>
            </button>
            <Status status={c.status} />
            <RecruiterBadge id={c.recruiterId} />
          </div>
        );
      })}
      <h3 className="ro-subheading">Open requirements</h3>
      {jobs.map((j) => (
        <button
          className="ro-linked-record"
          key={j.id}
          onClick={() => a.job(j.id)}
        >
          <span>
            <strong>
              {j.required} × {j.trade}
            </strong>
            <small>
              {j.reference} · starts {dateLabel(j.start)}
            </small>
          </span>
          <Icon name="arrow" />
        </button>
      ))}
      {!jobs.length && <p className="ro-muted">No open requirements.</p>}
      {!site && (
        <>
          <h3 className="ro-subheading">Sites</h3>
          {data.sites
            .filter((s) => s.clientId === id)
            .map((s) => (
              <button
                className="ro-linked-record"
                key={s.id}
                onClick={() => a.site(s.id)}
              >
                <span>
                  <strong>{s.name}</strong>
                  <small>
                    {s.town} · {s.postcode}
                  </small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
        </>
      )}
      <h3 className="ro-subheading">Client notes</h3>
      <form
        className="ro-note-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            run({
              type: "note",
              clientId: client.id,
              text: site ? `${site.name}: ${note}` : note,
            })
          )
            setNote("");
        }}
      >
        <textarea
          aria-label="Client note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a site or client update…"
          required
        />
        <Button type="submit" disabled={!note.trim()}>
          Add note
        </Button>
      </form>
      {data.notes
        .filter((n) => n.clientId === client.id)
        .map((n) => (
          <div className="ro-history-card" key={n.id}>
            <p>{n.text}</p>
            <small>{n.author}</small>
          </div>
        ))}
    </Modal>
  );
}
export function Compliance() {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Expiring soon"),
    [days, setDays] = useState(30),
    [ticket, setTicket] = useState(""),
    [search, setSearch] = useState(""),
    [recruiter, setRecruiter] = useState(""),
    [limit, setLimit] = useState(50);
  const rows = data.candidates
      .filter(
        (c) =>
          (!recruiter || c.recruiterId === recruiter) &&
          c.name.toLowerCase().includes(search.toLowerCase()),
      )
      .flatMap<{ c: Candidate; q: Qualification | undefined }>((c) => {
        if (tab === "Missing")
          return (
            !ticket
              ? !c.qualifications.length
              : !c.qualifications.some((q) => q.typeId === ticket)
          )
            ? [{ c, q: undefined }]
            : [];
        return c.qualifications
          .filter(
            (q) =>
              (!ticket || q.typeId === ticket) &&
              (tab === "Awaiting verification"
                ? !q.verified
                : !!q.expiry &&
                  (tab === "Expired"
                    ? daysUntil(q.expiry) < 0
                    : daysUntil(q.expiry) >= 0 && daysUntil(q.expiry) <= days)),
          )
          .map((q) => ({ c, q }));
      }),
    ids = [...new Set(rows.map((r) => r.c.id))];
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">COMPLIANCE / KEEP PEOPLE SITE-READY</p>
          <h1>
            Compliance <span>{rows.length} records in view</span>
          </h1>
          <p>Small checks now. Fewer delays on Monday.</p>
        </div>
        <Button
          variant="primary"
          icon="message"
          disabled={!ids.length}
          onClick={() =>
            a.broadcast({ ids, kind: "renewal", templateId: "renewal" })
          }
        >
          Message {ids.length} candidates
        </Button>
      </div>
      <Tabs
        items={["Expiring soon", "Expired", "Missing", "Awaiting verification"]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setLimit(50);
        }}
      />
      <div className="ro-compliance-filters">
        <Field label="Period">
          <select
            value={days}
            onChange={(e) => setDays(+e.target.value)}
            disabled={tab !== "Expiring soon"}
          >
            {[30, 60, 90].map((n) => (
              <option key={n} value={n}>
                Next {n} days
              </option>
            ))}
          </select>
        </Field>
        <Combo
          label="Qualification"
          value={ticket}
          onChange={setTicket}
          options={constructionTickets.map((t) => ({
            label: t.name,
            value: t.id,
          }))}
          placeholder="All qualifications"
        />
        <Field label="Candidate">
          <input
            placeholder="Search a candidate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        <Field label="Recruiter">
          <select
            value={recruiter}
            onChange={(e) => setRecruiter(e.target.value)}
          >
            <option value="">All recruiters</option>
            {recruiters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {tab === "Missing" && (
        <p className="ro-info">
          {ticket
            ? "Workers with no record of this qualification."
            : "Workers with no qualifications recorded. Select a qualification to check for a specific missing ticket."}{" "}
          This is a record check, not a determination of legal eligibility.
        </p>
      )}
      <div className="ro-table-wrap">
        <table className="ro-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Qualification</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Recruiter</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map(({ c, q }) => (
              <tr key={`${c.id}-${q?.id || "missing"}`}>
                <td>
                  <button
                    className="ro-person"
                    onClick={() => a.candidate(c.id)}
                  >
                    <Avatar small name={c.name} />
                    <span>
                      <strong>{c.name}</strong>
                      <small>
                        {c.trade} · {c.town}
                      </small>
                    </span>
                  </button>
                </td>
                <td>
                  {q
                    ? ticketName(q)
                    : ticket
                      ? constructionTickets.find((t) => t.id === ticket)?.name
                      : "No qualifications recorded"}
                  <small>{q?.number}</small>
                </td>
                <td>{q?.expiry ? dateLabel(q.expiry) : "Not recorded"}</td>
                <td>
                  <Status
                    status={
                      !q
                        ? "unknown"
                        : q.expiry && daysUntil(q.expiry) < 0
                          ? "expired"
                          : q.verified
                            ? "finishing"
                            : "unknown"
                    }
                    label={
                      !q
                        ? "Missing"
                        : !q.verified
                          ? "Awaiting verification"
                          : q.expiry && daysUntil(q.expiry) < 0
                            ? "Expired"
                            : `${daysUntil(q.expiry)} days remaining`
                    }
                  />
                </td>
                <td>
                  <RecruiterBadge id={c.recruiterId} />
                </td>
                <td>
                  <Button onClick={() => a.qualification(c.id, q?.id)}>
                    {q ? "Review ticket" : "Add record"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <Empty
          title="Nothing needs attention in this view"
          action={
            <Button
              onClick={() => {
                setTicket("");
                setSearch("");
                setRecruiter("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}{" "}
      {rows.length > limit && (
        <Button onClick={() => setLimit(limit + 50)}>
          Show 50 more records
        </Button>
      )}
    </>
  );
}
