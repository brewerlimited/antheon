"use client";
import { useDemo } from "@/lib/recruitment/store";
import {
  dateLabel,
  daysUntil,
  DEMO_TODAY,
  statusLabels,
} from "@/lib/recruitment/catalogue";
import { filled, metrics } from "@/lib/recruitment/selectors";
import { ticketName } from "@/lib/recruitment/constructionTickets";
import type { AvailabilityStatus } from "@/lib/recruitment/types";
import { useActions } from "./actions";
import { Avatar, Button, Icon, RecruiterBadge } from "./ui";
export function Overview({ tour }: { tour: () => void }) {
  const {
      state: { data },
    } = useDemo(),
    a = useActions(),
    m = metrics(data),
    ending = data.placements
      .filter(
        (p) =>
          p.status === "current" &&
          daysUntil(p.finish) >= 0 &&
          daysUntil(p.finish) <= 14,
      )
      .sort((a, b) => a.finish.localeCompare(b.finish)),
    expiring = data.candidates.flatMap((c) =>
      c.qualifications
        .filter(
          (q) =>
            q.expiry && daysUntil(q.expiry) >= 0 && daysUntil(q.expiry) <= 30,
        )
        .map((q) => ({ c, q })),
    ),
    total = m.total;
  const distribution = (
    [
      "working",
      "available",
      "open",
      "not-looking",
      "unknown",
    ] as AvailabilityStatus[]
  ).map((status) => ({
    status,
    count: data.candidates.filter((c) => c.status === status).length,
  }));
  const priorities = [
    {
      icon: "people",
      count: data.candidates.filter(
        (c) => c.status === "available" && c.statusConfirmed === DEMO_TODAY,
      ).length,
      text: "workers available, confirmed today",
      click: () => a.navigate("candidates", { availability: "available" }),
    },
    {
      icon: "placement",
      count: ending.filter((p) => daysUntil(p.finish) <= 7).length,
      text: "placements finish in the next 7 days",
      click: () => a.navigate("candidates", { availability: "finish7" }),
    },
    {
      icon: "shield",
      count: expiring.length,
      text: "qualification records expire in 30 days",
      click: () => a.navigate("compliance"),
    },
    {
      icon: "clock",
      count: data.candidates.filter(
        (c) => c.status === "unknown" && -daysUntil(c.statusConfirmed) >= 90,
      ).length,
      text: "unknown statuses last confirmed 90+ days ago",
      click: () =>
        a.broadcast({
          ids: data.candidates
            .filter(
              (c) =>
                c.status === "unknown" && -daysUntil(c.statusConfirmed) >= 90,
            )
            .map((c) => c.id),
          kind: "availability",
        }),
    },
    {
      icon: "message",
      count: data.broadcasts.reduce(
        (n, b) =>
          n + b.recipients.filter((r) => r.response !== "No response").length,
        0,
      ),
      text: "responses across your broadcasts",
      click: () => a.navigate("messages"),
    },
  ];
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">WEDNESDAY, 7 OCTOBER / DEMO SNAPSHOT</p>
          <h1>
            Good morning, Alex<span className="ro-greeting-dot">.</span>
          </h1>
          <p>Your workforce, right now.</p>
        </div>
        <Button icon="play" onClick={tour}>
          Take the 60 second tour
        </Button>
      </div>
      <div className="ro-metrics">
        {[
          { label: "Total candidates", value: m.total, filter: "" },
          { label: "Working", value: m.working, filter: "working" },
          { label: "Available now", value: m.available, filter: "available" },
          { label: "Open to work", value: m.open, filter: "open" },
          {
            label: "Finishing ≤14 days",
            value: m.finishing,
            filter: "finish14",
          },
          { label: "Status unknown", value: m.unknown, filter: "unknown" },
        ].map((x, i) => (
          <button
            key={x.label}
            className={i === 2 ? "ro-metric-featured" : ""}
            onClick={() => a.navigate("candidates", { availability: x.filter })}
          >
            <span>
              {x.label}
              <Icon name="arrow" size={13} />
            </span>
            <strong>{x.value.toLocaleString("en-GB")}</strong>
            <small>
              {i === 0
                ? "Your complete network"
                : i === 2
                  ? "Ready for the next requirement"
                  : i === 4
                    ? "Part of your working workforce"
                    : i === 5
                      ? "An opportunity to reconnect"
                      : "View candidates"}
            </small>
          </button>
        ))}
      </div>
      <div className="ro-overview-grid">
        <section className="ro-panel ro-today">
          <div className="ro-section-heading">
            <h2>
              Today <span>Needs your attention</span>
            </h2>
            <span className="ro-live-dot">LIVE DEMO</span>
          </div>
          {priorities.map((p) => (
            <button className="ro-priority-row" key={p.text} onClick={p.click}>
              <span className="ro-priority-icon">
                <Icon name={p.icon} size={17} />
              </span>
              <strong>{p.count}</strong>
              <span>{p.text}</span>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </section>
        <section className="ro-panel ro-workforce">
          <div className="ro-section-heading">
            <h2>Workforce availability</h2>
            <Button
              variant="ghost"
              icon="arrow"
              aria-label="Open availability"
              onClick={() => a.navigate("candidates")}
            />
          </div>
          <div className="ro-distribution">
            <div>
              <strong>{total.toLocaleString("en-GB")}</strong>
              <span>people. one clear picture.</span>
            </div>
            <div className="ro-distribution-bar">
              {distribution.map((d) => (
                <button
                  key={d.status}
                  className={`ro-dist-${d.status}`}
                  style={{ width: `${(d.count / total) * 100}%` }}
                  title={`${statusLabels[d.status]}: ${d.count}`}
                  aria-label={`${statusLabels[d.status]}: ${d.count}`}
                  onClick={() =>
                    a.navigate("candidates", { availability: d.status })
                  }
                />
              ))}
            </div>
          </div>
          <div className="ro-distribution-legend">
            {distribution.map((d) => (
              <button
                key={d.status}
                onClick={() =>
                  a.navigate("candidates", { availability: d.status })
                }
              >
                <i className={`ro-dist-${d.status}`} />
                <span>{statusLabels[d.status]}</span>
                <strong>{d.count.toLocaleString("en-GB")}</strong>
                <small>{Math.round((d.count / total) * 100)}%</small>
              </button>
            ))}
          </div>
        </section>
        <section className="ro-panel ro-finishing">
          <div className="ro-section-heading">
            <h2>
              Finishing soon <span>Next 14 days</span>
            </h2>
            <Button variant="ghost" onClick={() => a.navigate("placements")}>
              View all <Icon name="arrow" size={14} />
            </Button>
          </div>
          <div className="ro-table-wrap">
            <table className="ro-table">
              <thead>
                <tr>
                  <th>Candidate / trade</th>
                  <th>Current site</th>
                  <th>Finish</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {ending.slice(0, 5).map((p) => {
                  const c = data.candidates.find(
                      (c) => c.id === p.candidateId,
                    )!,
                    site = data.sites.find((s) => s.id === p.siteId)!;
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
                            <small>{c.trade}</small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <button
                          className="ro-person-label"
                          onClick={() => a.site(site.id)}
                        >
                          <strong>{site.name}</strong>
                          <small>
                            {site.town} ·{" "}
                            {
                              data.clients.find((c) => c.id === p.clientId)
                                ?.name
                            }
                          </small>
                        </button>
                      </td>
                      <td>
                        <span className="ro-date-soon">
                          {dateLabel(p.finish)}
                        </span>
                        <small>
                          {daysUntil(p.finish) === 0
                            ? "Today"
                            : `In ${daysUntil(p.finish)} days`}
                        </small>
                      </td>
                      <td>
                        <RecruiterBadge id={c.recruiterId} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="ro-panel-foot">
            {data.placements.filter((p) => p.status === "current").length}{" "}
            agency-managed placements. Other working statuses are self-reported.
          </p>
        </section>
        <section className="ro-panel ro-active-jobs">
          <div className="ro-section-heading">
            <h2>
              Active jobs{" "}
              <span>
                {data.jobs.filter((j) => j.status === "open").length} open
              </span>
            </h2>
            <Button variant="ghost" onClick={() => a.navigate("jobs")}>
              All jobs <Icon name="arrow" size={14} />
            </Button>
          </div>
          {data.jobs
            .filter((j) => j.status === "open")
            .slice(0, 3)
            .map((j) => {
              const site = data.sites.find((s) => s.id === j.siteId),
                bs = data.broadcasts.filter((b) => b.jobId === j.id),
                responses = bs.reduce(
                  (n, b) =>
                    n +
                    b.recipients.filter((r) => r.response === "Interested")
                      .length,
                  0,
                );
              return (
                <div className="ro-active-job" key={j.id}>
                  <div>
                    <span className="ro-mono">{j.reference}</span>
                    <h3>
                      {j.trade}s <small>{site?.town}</small>
                    </h3>
                    <p>
                      Starts {dateLabel(j.start)} ·{" "}
                      {bs.reduce((n, b) => n + b.recipients.length, 0)}{" "}
                      contacted
                    </p>
                  </div>
                  <div className="ro-active-job-right">
                    <strong>
                      {filled(data, j.id)} / {j.required}
                      <small>FILLED</small>
                    </strong>
                    <span>{responses} interested</span>
                    <button
                      className="ro-text-button"
                      onClick={() => a.job(j.id)}
                    >
                      View matches ↗
                    </button>
                  </div>
                </div>
              );
            })}
        </section>
        <section className="ro-panel ro-compliance-watch">
          <div className="ro-section-heading">
            <h2>Compliance watch</h2>
            <Button variant="ghost" onClick={() => a.navigate("compliance")}>
              Review <Icon name="arrow" size={14} />
            </Button>
          </div>
          {expiring
            .sort((a, b) => a.q.expiry.localeCompare(b.q.expiry))
            .slice(0, 4)
            .map(({ c, q }) => (
              <button
                className="ro-watch-row"
                key={`${c.id}-${q.id}`}
                onClick={() => a.qualification(c.id, q.id)}
              >
                <Icon name="shield" size={16} />
                <span>
                  <strong>{ticketName(q)}</strong>
                  <small>{c.name}</small>
                </span>
                <b>{daysUntil(q.expiry)}d</b>
              </button>
            ))}
        </section>
        <section className="ro-panel ro-website-feed">
          <div className="ro-section-heading">
            <h2>Your website. Connected.</h2>
            <span className="ro-demo-label">EXAMPLE</span>
          </div>
          {data.activity
            .filter(
              (x) => x.id === "activity-web" || x.id === "activity-enquiry",
            )
            .map((x) => (
              <button
                key={x.id}
                onClick={() =>
                  x.candidateId
                    ? a.candidate(x.candidateId)
                    : x.jobId && a.job(x.jobId)
                }
              >
                <span className="ro-signal-mark">
                  <Icon name={x.candidateId ? "people" : "briefcase"} />
                </span>
                <span>
                  <small>{x.title.toUpperCase()}</small>
                  <strong>{x.detail.split(" · ")[0]}</strong>
                  <p>{x.detail.split(" · ").slice(1).join(" · ")}</p>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
        </section>
      </div>
    </>
  );
}
