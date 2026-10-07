"use client";
import { useState } from "react";
import { useDemo } from "@/lib/recruitment/store";
import {
  day,
  dateLabel,
  daysUntil,
  money,
  payTypes,
  recruiters,
  trades,
} from "@/lib/recruitment/catalogue";
import { filled, matchCandidates } from "@/lib/recruitment/selectors";
import { constructionTickets } from "@/lib/recruitment/constructionTickets";
import type { Job } from "@/lib/recruitment/types";
import { useActions } from "./actions";
import {
  Avatar,
  Button,
  Combo,
  Empty,
  Field,
  Modal,
  RecruiterBadge,
  Status,
  Tabs,
} from "./ui";
import { TicketPicker } from "./TicketPicker";
export function Jobs() {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Open"),
    [search, setSearch] = useState("");
  const jobs = data.jobs.filter(
    (j) =>
      (tab === "Completed"
        ? j.status === "completed"
        : j.status === "open" &&
          (tab === "Starting soon"
            ? daysUntil(j.start) >= 0 && daysUntil(j.start) <= 7
            : tab === "Filled"
              ? filled(data, j.id) >= j.required
              : true)) &&
      `${j.reference} ${j.trade} ${data.sites.find((s) => s.id === j.siteId)?.town} ${data.clients.find((c) => c.id === j.clientId)?.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">REQUIREMENTS / LIVE PIPELINE</p>
          <h1>
            Jobs{" "}
            <span>
              {data.jobs.filter((j) => j.status === "open").length} open
            </span>
          </h1>
          <p>The next job starts with the right people.</p>
        </div>
        <Button icon="plus" variant="primary" onClick={a.newJob}>
          New job
        </Button>
      </div>
      <div className="ro-toolbar">
        <Tabs
          items={["Open", "Starting soon", "Filled", "Completed"]}
          value={tab}
          onChange={setTab}
        />
        <input
          aria-label="Search jobs"
          placeholder="Search role, client or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="ro-job-grid">
        {jobs.map((j) => {
          const site = data.sites.find((s) => s.id === j.siteId),
            count = filled(data, j.id);
          return (
            <article className="ro-job-card" key={j.id}>
              <header>
                <button
                  className="ro-text-button ro-mono"
                  onClick={() => a.job(j.id)}
                >
                  {j.reference}
                </button>
                <span
                  className={`ro-priority ro-priority-${j.urgency.toLowerCase()}`}
                >
                  {j.urgency}
                </span>
              </header>
              <h2>
                <button onClick={() => a.job(j.id)}>
                  {j.required} × {j.trade}
                  {j.required > 1 ? "s" : ""}
                </button>
              </h2>
              <p>
                {site?.town} <span> / </span>{" "}
                {data.clients.find((c) => c.id === j.clientId)?.name}
              </p>
              <div className="ro-job-facts">
                <span>
                  {money(j.rate)}
                  <small>/hr {j.payType}</small>
                </span>
                <span>
                  {dateLabel(j.start)}
                  <small>Start date</small>
                </span>
              </div>
              <div className="ro-fill-track">
                <i
                  style={{
                    width: `${Math.min(100, (count / j.required) * 100)}%`,
                  }}
                />
              </div>
              <footer>
                <span>
                  <b>
                    {count} / {j.required}
                  </b>{" "}
                  filled · {j.shortlist.length} shortlisted
                </span>
                <RecruiterBadge id={j.recruiterId} />
              </footer>
              <Button icon="search" onClick={() => a.job(j.id)}>
                View matches
              </Button>
            </article>
          );
        })}
      </div>
      {!jobs.length && (
        <Empty
          title="No jobs in this view"
          action={
            <Button
              onClick={() => {
                setTab("Open");
                setSearch("");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </>
  );
}
export function JobForm({ onClose }: { onClose: () => void }) {
  const {
    state: { data },
    run,
  } = useDemo();
  const [job, setJob] = useState<Job>({
    id: `job-${data.sequence + 1}`,
    reference: `JOB-${184 + data.jobs.length}`,
    trade: "Groundworker",
    clientId: "client-0",
    siteId: "site-0",
    required: 2,
    start: day(5),
    finish: day(35),
    rate: 19.5,
    payType: "CIS",
    hours: 9,
    tickets: ["cscs"],
    desirable: [],
    description: "",
    recruiterId: "am",
    urgency: "Normal",
    status: "open",
    shortlist: [],
  });
  const set = <K extends keyof Job>(k: K, v: Job[K]) =>
    setJob({ ...job, [k]: v });
  return (
    <Modal
      title="Create a job"
      eyebrow="NEW REQUIREMENT"
      drawer
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (run({ type: "job", job })) onClose();
        }}
      >
        <div className="ro-form-grid">
          <Combo
            label="Primary trade"
            value={job.trade}
            options={trades.map((t) => ({ value: t.name, label: t.name }))}
            onChange={(v) => set("trade", v)}
            required
          />
          <Field label="Workers required">
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={job.required}
              onChange={(e) => set("required", Number(e.target.value))}
            />
          </Field>
          <Combo
            label="Client"
            value={job.clientId}
            options={data.clients.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) =>
              setJob({
                ...job,
                clientId: v,
                siteId: data.sites.find((s) => s.clientId === v)?.id || "",
              })
            }
            required
          />
          <Combo
            label="Site"
            value={job.siteId}
            options={data.sites
              .filter((s) => s.clientId === job.clientId)
              .map((s) => ({ value: s.id, label: `${s.name} · ${s.town}` }))}
            onChange={(v) => set("siteId", v)}
            required
          />
          <Field label="Start date">
            <input
              type="date"
              required
              value={job.start}
              onChange={(e) => set("start", e.target.value)}
            />
          </Field>
          <Field label="Expected finish">
            <input
              type="date"
              required
              min={job.start}
              value={job.finish}
              onChange={(e) => set("finish", e.target.value)}
            />
          </Field>
          <Field label="Rate (£/hr)">
            <input
              type="number"
              min="1"
              step=".5"
              required
              value={job.rate}
              onChange={(e) => set("rate", Number(e.target.value))}
            />
          </Field>
          <Field label="Employment basis">
            <select
              value={job.payType}
              onChange={(e) => set("payType", e.target.value as Job["payType"])}
            >
              {payTypes.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Hours per day">
            <input
              type="number"
              min="1"
              max="24"
              value={job.hours}
              onChange={(e) => set("hours", Number(e.target.value))}
            />
          </Field>
          <Field label="Urgency">
            <select
              value={job.urgency}
              onChange={(e) => set("urgency", e.target.value as Job["urgency"])}
            >
              {["Normal", "Priority", "Urgent"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Recruiter">
            <select
              value={job.recruiterId}
              onChange={(e) => set("recruiterId", e.target.value)}
            >
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <h3 className="ro-subheading">Required qualifications</h3>
        <TicketPicker value={job.tickets} onChange={(v) => set("tickets", v)} />
        <Field label="Job description">
          <textarea
            required
            placeholder="Work involved, induction and requirements…"
            value={job.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="ro-form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Create job
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function JobDrawer({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const {
      state: { data },
      run,
    } = useDemo(),
    a = useActions(),
    job = data.jobs.find((j) => j.id === id),
    [tab, setTab] = useState("Find candidates");
  if (!job) return null;
  const site = data.sites.find((s) => s.id === job.siteId);
  return (
    <Modal
      title={`${job.required} × ${job.trade}s`}
      eyebrow={`${job.reference} / ${job.status.toUpperCase()} REQUIREMENT`}
      drawer
      wide
      onClose={onClose}
    >
      <div className="ro-job-detail-head">
        <p>
          <button
            className="ro-text-button"
            onClick={() => a.client(job.clientId)}
          >
            {data.clients.find((c) => c.id === job.clientId)?.name}
          </button>{" "}
          /{" "}
          <button className="ro-text-button" onClick={() => a.site(job.siteId)}>
            {site?.name}
          </button>
        </p>
        <div className="ro-job-detail-stats">
          <div>
            <strong>
              {money(job.rate)}
              <small>/hr</small>
            </strong>
            <span>
              {job.payType} · {job.hours} hours/day
            </span>
          </div>
          <div>
            <strong>{dateLabel(job.start)}</strong>
            <span>
              {site?.town} · {site?.postcode}
            </span>
          </div>
          <div>
            <strong>
              {filled(data, id)} / {job.required}
            </strong>
            <span>Positions filled</span>
          </div>
        </div>
        <p>{job.description}</p>
        <div className="ro-chips">
          {job.tickets.map((t) => (
            <span key={t}>
              {constructionTickets.find((q) => q.id === t)?.name || t} required
            </span>
          ))}
          {job.desirable.map((t) => (
            <span key={t}>
              {constructionTickets.find((q) => q.id === t)?.name || t} desirable
            </span>
          ))}
        </div>
      </div>
      <Tabs
        items={["Find candidates", "Shortlist", "Activity"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Find candidates" && <JobMatching job={job} />}{" "}
      {tab === "Shortlist" && (
        <div className="ro-tab-body">
          <div className="ro-section-heading">
            <h3>{job.shortlist.length} shortlisted</h3>
            <Button
              disabled={!job.shortlist.length}
              onClick={() => a.broadcast({ ids: job.shortlist, jobId: id })}
            >
              Message shortlist
            </Button>
          </div>
          {!job.shortlist.length && (
            <Empty
              title="Your shortlist starts here"
              action={
                <Button onClick={() => setTab("Find candidates")}>
                  Find candidates
                </Button>
              }
            />
          )}{" "}
          {job.shortlist.map((cid) => {
            const c = data.candidates.find((c) => c.id === cid);
            return (
              c && (
                <div className="ro-person-row" key={cid}>
                  <Avatar small name={c.name} />
                  <button
                    className="ro-person-label"
                    onClick={() => a.candidate(cid)}
                  >
                    <strong>{c.name}</strong>
                    <small>
                      {c.trade} · {c.town}
                    </small>
                  </button>
                  <Status status={c.status} />
                  <Button onClick={() => a.status([cid], "working", id)}>
                    Place
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      run({
                        type: "shortlist",
                        jobId: id,
                        ids: [cid],
                        remove: true,
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              )
            );
          })}
        </div>
      )}
      {tab === "Activity" && (
        <div className="ro-tab-body ro-timeline">
          {data.activity
            .filter((x) => x.jobId === id)
            .map((x) => (
              <div key={x.id}>
                <i />
                <section>
                  <strong>{x.title}</strong>
                  <p>{x.detail}</p>
                  <small>
                    {x.created.slice(11, 16)} ·{" "}
                    {dateLabel(x.created.slice(0, 10))}
                  </small>
                </section>
              </div>
            ))}
          {!data.activity.some((x) => x.jobId === id) && (
            <Empty title="No activity on this requirement yet" />
          )}
        </div>
      )}
    </Modal>
  );
}
export function JobMatching({ job }: { job: Job }) {
  const {
      state: { data },
      run,
    } = useDemo(),
    a = useActions(),
    [radius, setRadius] = useState(30),
    [window, setWindow] = useState(0),
    [trade, setTrade] = useState(job.trade),
    [tickets, setTickets] = useState(job.tickets),
    [selected, setSelected] = useState<string[]>([]),
    [limit, setLimit] = useState(30),
    [showTickets, setShowTickets] = useState(false);
  const matches = matchCandidates(data, job, {
      radius,
      window,
      trade,
      tickets,
    }),
    selectedIds = selected.filter((id) =>
      matches.some((m) => m.candidate.id === id),
    );
  return (
    <div className="ro-tab-body">
      <div className="ro-match-controls">
        <Field label="Radius">
          <select value={radius} onChange={(e) => setRadius(+e.target.value)}>
            {[10, 20, 30, 50, 100, 200].map((n) => (
              <option value={n} key={n}>
                {n} miles
              </option>
            ))}
          </select>
        </Field>
        <Field label="Availability window">
          <select value={window} onChange={(e) => setWindow(+e.target.value)}>
            <option value="0">By job start</option>
            <option value="7">Within 7 days of start</option>
            <option value="14">Within 14 days of start</option>
          </select>
        </Field>
        <Combo
          label="Trade"
          value={trade}
          onChange={setTrade}
          options={trades.map((t) => ({ label: t.name, value: t.name }))}
        />
        <Button onClick={() => setShowTickets(!showTickets)}>
          Required tickets ({tickets.length})
        </Button>
      </div>
      {showTickets && <TicketPicker value={tickets} onChange={setTickets} />}
      <p className="ro-hint">
        Transparent rules, not AI. Scores combine availability, approximate town
        distance, trade, verified tickets and placement history. Check the full
        record before placing.
      </p>
      <div className="ro-section-heading">
        <h3>
          {matches.length} matches{" "}
          <span>{matches.filter((m) => m.suitable).length} suitable</span>
        </h3>
        <Button
          onClick={() =>
            setSelected(
              matches.filter((m) => m.suitable).map((m) => m.candidate.id),
            )
          }
        >
          Select all suitable
        </Button>
      </div>
      {selectedIds.length > 0 && (
        <div className="ro-inline-actions">
          <b>{selectedIds.length} selected</b>
          <Button
            variant="primary"
            onClick={() => a.broadcast({ ids: selectedIds, jobId: job.id })}
          >
            Message {selectedIds.length} matches
          </Button>
          <Button
            onClick={() =>
              run({ type: "shortlist", jobId: job.id, ids: selectedIds })
            }
          >
            Add to shortlist
          </Button>
          <Button variant="ghost" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}
      {!matches.length && (
        <Empty title="No matches in this radius">
          Try a wider radius or a different trade.
        </Empty>
      )}
      {matches.slice(0, limit).map((m) => (
        <article
          key={m.candidate.id}
          className={`ro-match-row ${selectedIds.includes(m.candidate.id) ? "selected" : ""}`}
        >
          <div className="ro-person-row">
            <input
              aria-label={`Select ${m.candidate.name}`}
              type="checkbox"
              checked={selectedIds.includes(m.candidate.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, m.candidate.id]
                    : selected.filter((x) => x !== m.candidate.id),
                )
              }
            />
            <Avatar small name={m.candidate.name} />
            <button
              className="ro-person-label"
              onClick={() => a.candidate(m.candidate.id)}
            >
              <strong>{m.candidate.name}</strong>
              <small>
                {m.candidate.town} · {m.candidate.experience} years
              </small>
            </button>
            <span className="ro-match-score">
              {m.score}
              <small>% MATCH</small>
            </span>
            <Button
              disabled={job.shortlist.includes(m.candidate.id)}
              onClick={() =>
                run({ type: "shortlist", jobId: job.id, ids: [m.candidate.id] })
              }
            >
              {job.shortlist.includes(m.candidate.id)
                ? "Shortlisted"
                : "Shortlist"}
            </Button>
          </div>
          <div className="ro-match-reasons">
            {m.reasons.map((r) => (
              <span className={r.points ? "" : "unmet"} key={r.label}>
                {r.label}
                <b>+{r.points}</b>
              </span>
            ))}
          </div>
        </article>
      ))}
      {matches.length > limit && (
        <Button onClick={() => setLimit(limit + 30)}>Show 30 more</Button>
      )}
    </div>
  );
}
