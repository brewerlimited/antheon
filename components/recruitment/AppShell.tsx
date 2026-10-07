"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DemoProvider, useDemo } from "@/lib/recruitment/store";
import { blankFilters, dateLabel } from "@/lib/recruitment/catalogue";
import type {
  AvailabilityStatus,
  CandidateFilters,
  View,
} from "@/lib/recruitment/types";
import { UIContext, type ComposerIntent, type UIActions } from "./actions";
import {
  Avatar,
  Button,
  Combo,
  copyText,
  exportCsv,
  Icon,
  IconButton,
  Modal,
} from "./ui";
import { Overview } from "./Overview";
import { Candidates } from "./Candidates";
import { CandidateDrawer } from "./CandidateDrawer";
import { CandidateForm, QualificationForm } from "./CandidateForm";
import { StatusForm } from "./StatusForm";
import { JobDrawer, JobForm, Jobs } from "./Jobs";
import { BroadcastResults, BulkMessageComposer, Messages } from "./Messages";
import { Clients, Compliance, EntityDrawer, Placements } from "./Operations";
import { CommandPalette } from "./CommandPalette";
const navigation: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "candidates", label: "Candidates", icon: "people" },
  { id: "jobs", label: "Jobs", icon: "briefcase" },
  { id: "placements", label: "Placements", icon: "placement" },
  { id: "clients", label: "Clients & Sites", icon: "building" },
  { id: "messages", label: "Messages", icon: "message" },
  { id: "compliance", label: "Compliance", icon: "shield" },
];
type Panel = { key: number } & (
  | {
      type: "candidate" | "job" | "client" | "site" | "call" | "result";
      id: string;
    }
  | { type: "edit"; id?: string }
  | { type: "new-job" }
  | {
      type: "status";
      ids: string[];
      status?: AvailabilityStatus;
      jobId?: string;
    }
  | { type: "broadcast"; intent: ComposerIntent }
  | { type: "shortlist"; ids: string[]; jobId?: string }
  | { type: "qualification"; candidateId: string; qualificationId?: string }
);
type PanelInput = Panel extends infer P
  ? P extends Panel
    ? Omit<P, "key">
    : never
  : never;
export function RecruitmentDemo() {
  return (
    <DemoProvider>
      <AppShell />
    </DemoProvider>
  );
}
function AppShell() {
  const { state, notify, undo, run, reset } = useDemo(),
    { data } = state;
  const [view, setView] = useState<View>("overview"),
    [filters, setFilters] = useState<CandidateFilters>({ ...blankFilters }),
    [board, setBoard] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [mobileOpen, setMobileOpen] = useState(false),
    [palette, setPalette] = useState(false),
    [notifications, setNotifications] = useState(false),
    [panels, setPanels] = useState<Panel[]>([]),
    [confirmReset, setConfirmReset] = useState(false),
    [tour, setTour] = useState<number | null>(null);
  const sequence = useRef(0),
    main = useRef<HTMLElement>(null);
  const push = (p: PanelInput) => {
    notify("");
    setPanels((items) => [
      ...items,
      { ...p, key: sequence.current++ } as Panel,
    ]);
  };
  const close = (key: number) =>
    setPanels((items) => items.filter((p) => p.key !== key));
  const navigate: UIActions["navigate"] = (v, f) => {
    notify("");
    setView(v);
    if (f) setFilters({ ...blankFilters, ...f });
    setMobileOpen(false);
    setPanels([]);
    main.current?.scrollTo({ top: 0 });
  };
  const actions: UIActions = {
    navigate,
    candidate: (id) => push({ type: "candidate", id }),
    editCandidate: (id) => push({ type: "edit", id }),
    job: (id) => push({ type: "job", id }),
    newJob: () => push({ type: "new-job" }),
    client: (id) => push({ type: "client", id }),
    site: (id) => push({ type: "site", id }),
    status: (ids, status, jobId) =>
      push({ type: "status", ids, status, jobId }),
    broadcast: (intent) => push({ type: "broadcast", intent }),
    broadcastResult: (id) => push({ type: "result", id }),
    shortlist: (ids, jobId) => push({ type: "shortlist", ids, jobId }),
    call: (id) => push({ type: "call", id }),
    qualification: (candidateId, qualificationId) =>
      push({ type: "qualification", candidateId, qualificationId }),
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!document.querySelector("dialog[open]")) setPalette((v) => !v);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const startTour = () => {
    setTour(0);
    navigate("overview");
  };
  const tours = [
    [
      "Your entire workforce, at a glance.",
      "Every number comes from the demo records. Click Available now to find the 318 workers ready for the next requirement.",
    ],
    [
      "Find your next 20 people.",
      "Use Filters: Groundworker, Northampton, 30 miles and CSCS. Your 38 matches remain behind every profile drawer.",
    ],
    [
      "Availability that stays connected.",
      "Drag a worker between columns or use their status menu. Starting work creates a placement; finishing records the actual end date.",
    ],
    [
      "A clear reason for every match.",
      "Open JOB-184. Adjust the radius, start window and tickets, then inspect how each worker’s score is calculated.",
    ],
    [
      "From audience to conversation.",
      "Select workers and choose Message. Attach the job, choose a channel and preview the personalised text. Everything is simulated.",
    ],
    [
      "Close the loop.",
      "Open a broadcast, simulate replies and add interested workers to the shortlist. Availability campaigns update the dashboard too.",
    ],
    [
      "That’s Recruitment OS.",
      "A single view of people, placements and the next opportunity. Make it yours — this demo remembers changes in this browser.",
    ],
  ];
  const tourNext = () => {
    const n = (tour ?? 0) + 1;
    if (n > 6) {
      setTour(null);
      return;
    }
    setTour(n);
    if (n === 1) {
      navigate("candidates", { availability: "available" });
      setBoard(false);
    }
    if (n === 2) {
      navigate("candidates", {});
      setBoard(true);
    }
    if (n === 3) navigate("jobs");
    if (n === 4) {
      navigate("candidates", {
        availability: "available",
        trade: "Groundworker",
        town: "Northampton",
        ticket: "cscs",
      });
      setBoard(false);
    }
    if (n === 5) navigate("messages");
  };
  return (
    <UIContext.Provider value={actions}>
      <div
        className={`ro-app ${collapsed ? "ro-collapsed" : ""} ${mobileOpen ? "ro-mobile-open" : ""}`}
      >
        <a className="ro-skip-link" href="#ro-main">
          Skip to workspace
        </a>
        {mobileOpen && (
          <button
            className="ro-sidebar-scrim"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside className="ro-sidebar">
          <div className="ro-sidebar-brand">
            <Link
              href="/recruitment-os"
              aria-label="Anthēon Recruitment OS product page"
            >
              <span className="ro-brand-symbol">✳</span>
              <span>
                ANTHĒON<small>RECRUITMENT OS</small>
              </span>
            </Link>
            <IconButton
              name="panel"
              label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => {
                setCollapsed(!collapsed);
                setMobileOpen(false);
              }}
            />
          </div>
          <button
            className="ro-workspace-switch"
            onClick={() => navigate("settings")}
          >
            <span className="ro-workspace-logo">R</span>
            <span>
              Construction workspace<small>Demo organisation</small>
            </span>
            <Icon name="down" size={13} />
          </button>
          <nav aria-label="Recruitment workspace">
            {navigation.map((n) => (
              <button
                key={n.id}
                title={n.label}
                aria-label={n.label}
                className={view === n.id ? "active" : ""}
                onClick={() => navigate(n.id)}
              >
                <Icon name={n.icon} size={17} />
                <span>{n.label}</span>
                {n.id === "jobs" && (
                  <b>{data.jobs.filter((j) => j.status === "open").length}</b>
                )}
              </button>
            ))}
          </nav>
          <div className="ro-saved-nav">
            <p>
              SAVED VIEWS <Icon name="filter" size={12} />
            </p>
            {data.savedViews.slice(0, 8).map((v, i) => (
              <button
                key={v.id}
                onClick={() => {
                  navigate("candidates", v.filters);
                  setBoard(false);
                }}
              >
                <i className={`ro-saved-dot ro-saved-${i % 4}`} />
                {v.name}
              </button>
            ))}
          </div>
          <div className="ro-sidebar-bottom">
            <div className="ro-workspace-note">
              <span className="ro-live-dot">DEMO WORKSPACE</span>
              <p>
                Explore freely.
                <br />
                Every action stays here.
              </p>
            </div>
            <button onClick={() => navigate("settings")} title="Settings">
              <Icon name="settings" size={17} />
              <span>Settings</span>
            </button>
            <Link href="/recruitment-os" title="Exit demo">
              <Icon name="exit" size={17} />
              <span>Exit demo</span>
              <Icon name="arrow" size={14} />
            </Link>
          </div>
        </aside>
        <div className="ro-workspace">
          <header className="ro-topbar">
            <span className="ro-mobile-menu">
              <IconButton
                name="panel"
                label="Open navigation"
                onClick={() => setMobileOpen(!mobileOpen)}
              />
            </span>
            <button
              className="ro-global-search"
              onClick={() => setPalette(true)}
            >
              <Icon name="search" size={17} />
              <span>Search candidates, jobs, clients or sites…</span>
              <kbd>⌘ K</kbd>
            </button>
            <div className="ro-top-actions">
              <Button icon="plus" onClick={() => actions.editCandidate()}>
                Candidate
              </Button>
              <Button icon="plus" onClick={actions.newJob}>
                Job
              </Button>
              <span className="ro-top-divider" />
              <span className="ro-demo-label">DEMO</span>
              <button
                className="ro-notification-button"
                aria-label="Open notifications"
                onClick={() => setNotifications(true)}
              >
                <Icon name="bell" />
                {data.activity.some((x) => !x.read) && <i />}
              </button>
              <button
                className="ro-user-button"
                aria-label="Alex Morgan · workspace settings"
                onClick={() => navigate("settings")}
              >
                <Avatar small name="Alex Morgan" />
              </button>
            </div>
          </header>
          <div className="ro-breadcrumb">
            <span>Demo workspace</span>
            <Icon name="chevron" size={12} />
            <strong>
              {navigation.find((n) => n.id === view)?.label || "Settings"}
            </strong>
            <span className="ro-snapshot">
              7 OCT 2026 SNAPSHOT <i /> LOCAL STATE
            </span>
          </div>
          <main id="ro-main" ref={main} className="ro-main" tabIndex={-1}>
            {state.storageError && (
              <p className="ro-warning">
                Browser storage is unavailable or full. Changes remain for this
                session, but may not survive a refresh.
              </p>
            )}
            {view === "overview" && <Overview tour={startTour} />}{" "}
            {view === "candidates" && (
              <Candidates
                filters={filters}
                setFilters={setFilters}
                board={board}
                setBoard={setBoard}
              />
            )}{" "}
            {view === "jobs" && <Jobs />}
            {view === "placements" && <Placements />}
            {view === "clients" && <Clients />}
            {view === "messages" && <Messages />}
            {view === "compliance" && <Compliance />}
            {view === "settings" && (
              <>
                <div className="ro-page-title">
                  <div>
                    <p className="ro-eyebrow">YOUR DEMO WORKSPACE</p>
                    <h1>Settings</h1>
                    <p>
                      A working product demonstration. All records are
                      fictional.
                    </p>
                  </div>
                </div>
                <div className="ro-settings-grid">
                  <section className="ro-panel">
                    <h2>Alex Morgan</h2>
                    <p>Recruiter · Demo organisation</p>
                    <dl className="ro-details">
                      <div>
                        <dt>Data storage</dt>
                        <dd>This browser’s localStorage</dd>
                      </div>
                      <div>
                        <dt>Snapshot date</dt>
                        <dd>7 October 2026</dd>
                      </div>
                      <div>
                        <dt>Messaging</dt>
                        <dd>Local simulation only</dd>
                      </div>
                      <div>
                        <dt>Access</dt>
                        <dd>Public demo — no authentication</dd>
                      </div>
                    </dl>
                    <p className="ro-info">
                      Do not enter real personal or confidential information.
                      Browser storage is not secure storage; this demo has no
                      server, permissions or real document verification.
                    </p>
                    <Button onClick={startTour}>Take the tour</Button>
                    <Button
                      onClick={() =>
                        exportCsv("recruitment-os-demo.csv", [
                          ["Name", "Trade", "Town", "Status"],
                          ...data.candidates.map((c) => [
                            c.name,
                            c.trade,
                            c.town,
                            c.status,
                          ]),
                        ])
                      }
                    >
                      Export demo candidates
                    </Button>
                  </section>
                  <section className="ro-panel">
                    <h2>Saved views</h2>
                    {data.savedViews.map((v) => (
                      <div className="ro-setting-row" key={v.id}>
                        <button
                          className="ro-text-button"
                          onClick={() => navigate("candidates", v.filters)}
                        >
                          {v.name}
                        </button>
                        <Button
                          variant="ghost"
                          onClick={() => run({ type: "delete-view", id: v.id })}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <h3 className="ro-subheading">Start a fresh exploration</h3>
                    <p>
                      Reset all candidates, jobs, notes, broadcasts and saved
                      views to the original deterministic snapshot.
                    </p>
                    <Button
                      variant="danger"
                      onClick={() => setConfirmReset(true)}
                    >
                      Reset demo data
                    </Button>
                  </section>
                </div>
              </>
            )}
          </main>
          <footer className="ro-workspace-footer">
            <span>
              <i /> All systems local. No real messages.
            </span>
            <Link href="/recruitment-os">
              A product exploration by Anthēon ↗
            </Link>
          </footer>
        </div>
        {state.notice && (
          <div
            className={`ro-toast ${state.error ? "ro-toast-error" : ""}`}
            role={state.error ? "alert" : "status"}
          >
            <Icon name={state.error ? "shield" : "check"} size={16} />
            <span>{state.notice}</span>
            {!!state.history.length && !state.error && (
              <Button variant="ghost" icon="undo" onClick={undo}>
                Undo
              </Button>
            )}
            <IconButton
              name="close"
              label="Dismiss notification"
              onClick={() => notify("")}
            />
          </div>
        )}
        {palette && <CommandPalette onClose={() => setPalette(false)} />}{" "}
        {notifications && (
          <Modal
            title="Notifications"
            eyebrow="OPERATIONAL UPDATES"
            drawer
            onClose={() => setNotifications(false)}
          >
            <div className="ro-section-heading">
              <p>
                {data.activity.filter((x) => !x.read).length} unread updates
              </p>
              <Button onClick={() => run({ type: "read-notifications" })}>
                Mark all read
              </Button>
            </div>
            <div className="ro-notification-list">
              {data.activity.slice(0, 40).map((x) => (
                <button
                  className={!x.read ? "unread" : ""}
                  key={x.id}
                  onClick={() => {
                    setNotifications(false);
                    if (x.candidateId) actions.candidate(x.candidateId);
                    else if (x.jobId) actions.job(x.jobId);
                    else if (x.broadcastId)
                      actions.broadcastResult(x.broadcastId);
                    else navigate("overview");
                  }}
                >
                  <i />
                  <span>
                    <strong>{x.title}</strong>
                    <p>{x.detail}</p>
                    <small>
                      {dateLabel(x.created.slice(0, 10))} ·{" "}
                      {x.created.slice(11, 16)}
                    </small>
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            </div>
          </Modal>
        )}
        {confirmReset && (
          <Modal
            title="Reset Recruitment OS?"
            onClose={() => setConfirmReset(false)}
          >
            <p>
              Restore the original demo data? Your local edits, notes, messages
              and custom saved views will be removed.
            </p>
            <div className="ro-form-footer">
              <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                  setFilters({ ...blankFilters });
                  setBoard(false);
                  navigate("overview");
                }}
              >
                Reset demo
              </Button>
            </div>
          </Modal>
        )}
        {panels.map((p) => {
          const end = () => close(p.key);
          if (p.type === "candidate")
            return <CandidateDrawer key={p.key} id={p.id} onClose={end} />;
          if (p.type === "edit")
            return <CandidateForm key={p.key} id={p.id} onClose={end} />;
          if (p.type === "job")
            return <JobDrawer key={p.key} id={p.id} onClose={end} />;
          if (p.type === "new-job")
            return <JobForm key={p.key} onClose={end} />;
          if (p.type === "status")
            return (
              <StatusForm
                key={p.key}
                ids={p.ids}
                initial={p.status}
                initialJob={p.jobId}
                onClose={end}
              />
            );
          if (p.type === "qualification")
            return (
              <QualificationForm
                key={p.key}
                candidateId={p.candidateId}
                qualificationId={p.qualificationId}
                onClose={end}
              />
            );
          if (p.type === "client" || p.type === "site")
            return (
              <EntityDrawer key={p.key} id={p.id} kind={p.type} onClose={end} />
            );
          if (p.type === "broadcast")
            return (
              <BulkMessageComposer
                key={p.key}
                intent={p.intent}
                onClose={end}
              />
            );
          if (p.type === "result")
            return <BroadcastResults key={p.key} id={p.id} onClose={end} />;
          if (p.type === "shortlist")
            return (
              <ShortlistDialog
                key={p.key}
                ids={p.ids}
                jobId={p.jobId}
                onClose={end}
              />
            );
          if (p.type === "call") {
            const c = data.candidates.find((c) => c.id === p.id);
            return (
              c && (
                <Modal
                  key={p.key}
                  title={`Call ${c.name}`}
                  eyebrow="DEMO PHONE / NO CALL WILL BE PLACED"
                  onClose={end}
                >
                  <div className="ro-call-display">
                    <Avatar name={c.name} />
                    <h3>{c.phone}</h3>
                    <p>
                      {c.trade} · {c.town}
                    </p>
                  </div>
                  <p className="ro-info">
                    This is a fictional demonstration number. Log a simulated
                    call to add it to the candidate’s activity.
                  </p>
                  <div className="ro-form-footer">
                    <Button
                      icon="copy"
                      onClick={() => copyText(c.phone, notify)}
                    >
                      Copy number
                    </Button>
                    <Button
                      variant="primary"
                      disabled={c.doNotContact}
                      onClick={() => {
                        if (run({ type: "call", candidateId: c.id })) end();
                      }}
                    >
                      {c.doNotContact ? "Do not contact" : "Log demo call"}
                    </Button>
                  </div>
                </Modal>
              )
            );
          }
          return null;
        })}
        {tour !== null && (
          <div className="ro-tour" role="region" aria-label="Product tour">
            <div>
              <span className="ro-eyebrow">
                RECRUITMENT OS / {Math.min(tour + 1, 6)} OF 6
              </span>
              <IconButton
                name="close"
                label="Close tour"
                onClick={() => setTour(null)}
              />
            </div>
            <h3>{tours[tour][0]}</h3>
            <p>{tours[tour][1]}</p>
            <footer>
              <span>
                {"●".repeat(Math.min(tour + 1, 6))}
                <span>{"○".repeat(Math.max(0, 5 - tour))}</span>
              </span>
              <Button variant="primary" onClick={tourNext}>
                {tour === 6 ? "Continue exploring" : "Next"}{" "}
                <Icon name="arrow" size={14} />
              </Button>
            </footer>
          </div>
        )}
      </div>
    </UIContext.Provider>
  );
}
function ShortlistDialog({
  ids,
  jobId,
  onClose,
}: {
  ids: string[];
  jobId?: string;
  onClose: () => void;
}) {
  const {
      state: { data },
      run,
    } = useDemo(),
    [job, setJob] = useState(jobId || "job-0");
  return (
    <Modal
      title={`Add ${ids.length} ${ids.length === 1 ? "candidate" : "candidates"} to a job`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (run({ type: "shortlist", jobId: job, ids })) onClose();
        }}
      >
        <Combo
          label="Choose a job"
          value={job}
          onChange={setJob}
          required
          options={data.jobs
            .filter((j) => j.status === "open")
            .map((j) => ({
              value: j.id,
              label: `${j.reference} · ${j.trade} · ${data.sites.find((s) => s.id === j.siteId)?.town}`,
            }))}
        />
        <p className="ro-info">
          Shortlisting records interest. It does not book a placement or change
          availability.
        </p>
        <div className="ro-form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Add to shortlist
          </Button>
        </div>
      </form>
    </Modal>
  );
}
