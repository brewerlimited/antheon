"use client";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "@/lib/recruitment/store";
import {
  audience,
  interested,
  renderMessage,
} from "@/lib/recruitment/selectors";
import { dateLabel, channels } from "@/lib/recruitment/catalogue";
import type { Channel, MessageTemplate } from "@/lib/recruitment/types";
import { useActions, type ComposerIntent } from "./actions";
import { Avatar, Button, Combo, Empty, Field, Icon, Modal, Tabs } from "./ui";
export function BulkMessageComposer({
  intent,
  onClose,
}: {
  intent: ComposerIntent;
  onClose: () => void;
}) {
  const {
      state: { data },
      run,
    } = useDemo(),
    a = useActions(),
    [step, setStep] = useState(0),
    [channel, setChannel] = useState<Channel>("SMS"),
    [jobId, setJobId] = useState(intent.jobId || ""),
    [excludeWorking, setExcludeWorking] = useState(
      intent.kind !== "availability",
    ),
    [template, setTemplate] = useState(
      data.templates.find(
        (t) =>
          t.id ===
          (intent.templateId ||
            (intent.kind === "availability"
              ? "availability"
              : intent.kind === "renewal"
                ? "renewal"
                : "new-job")),
      )?.text || "",
    ),
    [previewIndex, setPreviewIndex] = useState(0);
  const recipients = audience(data, intent.ids, channel, excludeWorking),
    job = data.jobs.find((j) => j.id === jobId),
    kind = intent.kind || (job ? "job" : "general"),
    sample =
      recipients.included[
        Math.min(previewIndex, recipients.included.length - 1)
      ];
  const send = () => {
    const bid = `broadcast-${data.sequence + 1}-0`;
    if (
      run({
        type: "broadcast",
        ids: recipients.included.map((c) => c.id),
        title:
          kind === "availability"
            ? "Workforce availability check"
            : kind === "renewal"
              ? "Qualification renewal reminder"
              : job
                ? `${job.trade}s · ${data.sites.find((s) => s.id === job.siteId)?.town}`
                : "Candidate message",
        channel,
        template,
        kind,
        jobId: job?.id,
      })
    ) {
      onClose();
      a.broadcastResult(bid);
    }
  };
  return (
    <Modal
      title={
        kind === "availability"
          ? "Check workforce availability"
          : kind === "renewal"
            ? "Send a ticket reminder"
            : "Message your candidates"
      }
      eyebrow="LOCAL DEMO BROADCAST"
      wide
      onClose={onClose}
      footer={
        <>
          <span className="ro-muted">
            {step + 1} of 4 · {recipients.included.length} recipients
          </span>
          <Button onClick={() => (step ? setStep(step - 1) : onClose())}>
            {step ? "Back" : "Cancel"}
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              disabled={
                !recipients.included.length || (step === 2 && !template.trim())
              }
              onClick={() => setStep(step + 1)}
            >
              Continue <Icon name="arrow" size={15} />
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!recipients.included.length || !template.trim()}
              onClick={send}
            >
              Simulate send to {recipients.included.length}
            </Button>
          )}
        </>
      }
    >
      <div className="ro-stepper">
        {["Audience", "Channel", "Message", "Preview"].map((s, i) => (
          <span
            className={step === i ? "active" : step > i ? "done" : ""}
            key={s}
          >
            {i < step ? <Icon name="check" size={13} /> : i + 1} {s}
          </span>
        ))}
      </div>
      <p className="ro-demo-notice">
        <Icon name="shield" size={15} /> DEMO MODE — No message will actually be
        sent.
      </p>
      {step === 0 && (
        <>
          <h3>{intent.ids.length} candidates selected</h3>
          <div className="ro-composer-counts">
            <div>
              <strong>{recipients.included.length}</strong>
              <span>Recipients</span>
            </div>
            <div>
              <strong>
                {
                  recipients.excluded.filter(
                    (x) => x.reason === "Do not contact",
                  ).length
                }
              </strong>
              <span>Opted out</span>
            </div>
            <div>
              <strong>
                {
                  recipients.excluded.filter(
                    (x) => x.reason === "Currently working",
                  ).length
                }
              </strong>
              <span>Working</span>
            </div>
            <div>
              <strong>
                {
                  recipients.excluded.filter((x) =>
                    x.reason.startsWith("Invalid"),
                  ).length
                }
              </strong>
              <span>Invalid contact</span>
            </div>
          </div>
          <label className="ro-checkbox">
            <input
              type="checkbox"
              checked={excludeWorking}
              onChange={(e) => setExcludeWorking(e.target.checked)}
            />{" "}
            Exclude candidates currently working
          </label>
          {recipients.excluded.length > 0 && (
            <details className="ro-exclusions">
              <summary>Inspect {recipients.excluded.length} exclusions</summary>
              <div>
                {recipients.excluded.map((x) => (
                  <p key={x.candidate.id}>
                    <b>{x.candidate.name}</b>
                    <span>{x.reason}</span>
                  </p>
                ))}
              </div>
            </details>
          )}
          {kind !== "availability" && kind !== "renewal" && (
            <Combo
              label="Attach an existing job (optional)"
              value={jobId}
              onChange={setJobId}
              options={data.jobs
                .filter((j) => j.status === "open")
                .map((j) => ({
                  value: j.id,
                  label: `${j.reference} · ${j.trade} · ${data.sites.find((s) => s.id === j.siteId)?.town}`,
                }))}
              placeholder="Search a job, e.g. Northampton…"
            />
          )}
          <div className="ro-audience-preview">
            {recipients.included.slice(0, 5).map((c) => (
              <span key={c.id}>
                <Avatar small name={c.name} />
                {c.name}
              </span>
            ))}
            {recipients.included.length > 5 && (
              <small>+ {recipients.included.length - 5} more</small>
            )}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <h3>Choose a channel</h3>
          <p className="ro-muted">
            All three use the same local simulator. No account or messaging
            provider is connected.
          </p>
          <div className="ro-channel-options">
            {channels.map((ch) => (
              <button
                className={channel === ch ? "active" : ""}
                aria-pressed={channel === ch}
                key={ch}
                onClick={() => setChannel(ch)}
              >
                <Icon name={ch === "Email" ? "message" : "phone"} />
                <strong>{ch}</strong>
                <span>
                  {ch === "SMS"
                    ? "Direct and immediate"
                    : ch === "WhatsApp"
                      ? "A familiar conversation"
                      : "Room for more detail"}
                </span>
                <i>{channel === ch ? "✓" : ""}</i>
              </button>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <Field label="Start from a template">
            <select
              defaultValue=""
              onChange={(e) => {
                const t = data.templates.find((t) => t.id === e.target.value);
                if (t) setTemplate(t.text);
              }}
            >
              <option value="" disabled>
                Select a template…
              </option>
              {data.templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Your message">
            <textarea
              className="ro-message-editor"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              maxLength={3000}
            />
          </Field>
          <div className="ro-section-heading">
            <div className="ro-chips">
              {["firstName", "role", "location", "startDate", "rate"].map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setTemplate(template + " {{" + v + "}}")}
                  >{`{{${v}}}`}</button>
                ),
              )}
            </div>
            <small>{template.length} characters</small>
          </div>
          {!job && /\{\{(role|location|startDate|rate)\}\}/.test(template) && (
            <p className="ro-info">
              No job attached. Generic role details will be used; check the next
              preview.
            </p>
          )}
        </>
      )}
      {step === 3 && sample && (
        <div className="ro-message-preview">
          <div>
            <p className="ro-eyebrow">
              {channel.toUpperCase()} / CANDIDATE VIEW
            </p>
            <h3>{sample.name}</h3>
            <p className="ro-muted">
              {channel === "Email" ? sample.email : sample.phone}
            </p>
            <div className="ro-phone-message">
              {renderMessage(template, sample, job, data)}
            </div>
            <p className="ro-hint">
              {kind === "availability"
                ? "Responses can update each worker’s availability."
                : kind === "job"
                  ? "Replies will attach to this job and its shortlist."
                  : "Replies will appear in the local conversation."}
            </p>
          </div>
          <Button
            onClick={() =>
              setPreviewIndex((previewIndex + 1) % recipients.included.length)
            }
          >
            Preview next recipient
          </Button>
        </div>
      )}
    </Modal>
  );
}
export function BroadcastResults({
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
    [filter, setFilter] = useState("All"),
    [simulating, setSimulating] = useState(false),
    [limit, setLimit] = useState(30),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const b = data.broadcasts.find((b) => b.id === id);
  if (!b) return null;
  const delivered = b.recipients.filter(
      (r) => r.delivery === "delivered",
    ).length,
    interestedIds = interested(b),
    responses = ["All", ...new Set(b.recipients.map((r) => r.response))],
    list = b.recipients.filter(
      (r) => filter === "All" || r.response === filter,
    );
  const simulate = () => {
    setSimulating(true);
    timer.current = setTimeout(() => {
      run({ type: "simulate", broadcastId: id });
      setSimulating(false);
    }, 900);
  };
  return (
    <Modal
      title={b.title}
      eyebrow={`${b.channel.toUpperCase()} / DEMO BROADCAST`}
      wide
      drawer
      onClose={onClose}
    >
      <p className="ro-demo-notice">
        Simulated delivery and replies. No real messages have been sent.
      </p>
      <div className="ro-composer-counts">
        <div>
          <strong>{b.recipients.length}</strong>
          <span>Queued</span>
        </div>
        <div>
          <strong>{delivered}</strong>
          <span>Delivered</span>
        </div>
        <div>
          <strong>{b.recipients.length - delivered}</strong>
          <span>Awaiting delivery</span>
        </div>
        <div>
          <strong>
            {b.recipients.filter((r) => r.response !== "No response").length}
          </strong>
          <span>Responses</span>
        </div>
      </div>
      {!b.simulated && (
        <div className="ro-simulation">
          <div>
            <Icon name="spark" />
            <h3>Bring the conversation to life.</h3>
            <p>
              Run a repeatable delivery and reply simulation
              {b.kind === "availability"
                ? " to update availability across your workspace"
                : ""}
              .
            </p>
          </div>
          <Button variant="primary" disabled={simulating} onClick={simulate}>
            {simulating
              ? "Receiving replies…"
              : "Simulate delivery & responses"}
          </Button>
          {simulating && (
            <div className="ro-progress">
              <i />
            </div>
          )}
        </div>
      )}
      {b.simulated && b.kind === "availability" && (
        <p className="ro-info">
          Self-reported availability has been updated. Agency-managed placements
          are never silently ended by a reply.
        </p>
      )}
      {interestedIds.length > 0 && (
        <div className="ro-inline-actions">
          <strong>{interestedIds.length} interested workers</strong>
          <Button
            variant="primary"
            onClick={() =>
              b.jobId
                ? run({ type: "shortlist", jobId: b.jobId, ids: interestedIds })
                : a.shortlist(interestedIds)
            }
          >
            Add interested to shortlist
          </Button>
          {b.jobId && <Button onClick={() => a.job(b.jobId!)}>Open job</Button>}
        </div>
      )}
      <div className="ro-response-filters">
        {responses.map((r) => (
          <button
            className={filter === r ? "active" : ""}
            key={r}
            onClick={() => {
              setFilter(r);
              setLimit(30);
            }}
          >
            {r}{" "}
            <b>
              {r === "All"
                ? b.recipients.length
                : b.recipients.filter((x) => x.response === r).length}
            </b>
          </button>
        ))}
      </div>
      <div>
        {list.slice(0, limit).map((r) => {
          const c = data.candidates.find((c) => c.id === r.candidateId);
          return (
            c && (
              <div key={c.id} className="ro-person-row">
                <Avatar small name={c.name} />
                <button
                  className="ro-person-label"
                  onClick={() => a.candidate(c.id)}
                >
                  <strong>{c.name}</strong>
                  <small>
                    {c.trade} · {c.town}
                  </small>
                </button>
                <span
                  className={`ro-reply ${r.response === "Interested" || r.response === "Available now" ? "positive" : ""}`}
                >
                  {r.response}
                </span>
                <small>
                  {r.delivery === "delivered" ? "Delivered" : "Pending"}
                </small>
              </div>
            )
          );
        })}
      </div>
      {list.length > limit && (
        <Button onClick={() => setLimit(limit + 30)}>Show 30 more</Button>
      )}
    </Modal>
  );
}
export function Messages() {
  const {
      state: { data },
      run,
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Inbox"),
    [search, setSearch] = useState(""),
    [active, setActive] = useState(data.messages[0]?.candidateId || ""),
    [reply, setReply] = useState(""),
    [edit, setEdit] = useState<MessageTemplate | null>(null);
  const ids = [...new Set(data.messages.map((m) => m.candidateId))],
    people = ids
      .map((id) => data.candidates.find((c) => c.id === id)!)
      .filter((c) => c && c.name.toLowerCase().includes(search.toLowerCase())),
    c = data.candidates.find((c) => c.id === active),
    conversation = data.messages
      .filter((m) => m.candidateId === active)
      .sort((a, b) => a.created.localeCompare(b.created));
  return (
    <>
      <div className="ro-page-title">
        <div>
          <p className="ro-eyebrow">CONVERSATIONS / CONNECTED TO THE WORK</p>
          <h1>Messages</h1>
          <p>One conversation. A clear next step.</p>
        </div>
        <Button
          icon="message"
          variant="primary"
          onClick={() =>
            a.broadcast({
              ids: data.candidates
                .filter((c) => c.status === "unknown")
                .map((c) => c.id),
              kind: "availability",
            })
          }
        >
          Check availability
        </Button>
      </div>
      <Tabs
        items={["Inbox", "Broadcasts", "Templates"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Inbox" && (
        <div className="ro-inbox">
          <aside>
            <input
              aria-label="Search conversations"
              placeholder="Find a conversation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {people.slice(0, 80).map((person) => (
              <button
                className={active === person.id ? "active" : ""}
                key={person.id}
                onClick={() => setActive(person.id)}
              >
                <Avatar small name={person.name} />
                <span>
                  <strong>{person.name}</strong>
                  <small>
                    {data.messages.find(
                      (m) =>
                        m.candidateId === person.id && m.direction === "in",
                    )?.text || "Message queued"}
                  </small>
                </span>
              </button>
            ))}
            {!people.length && <Empty title="No conversations found" />}
          </aside>
          <section>
            {c ? (
              <>
                <header className="ro-conversation-head">
                  <button
                    className="ro-person-label"
                    onClick={() => a.candidate(c.id)}
                  >
                    <strong>{c.name}</strong>
                    <small>
                      {c.trade} · {c.town}
                    </small>
                  </button>
                  <span className="ro-demo-label">SIMULATED</span>
                </header>
                <div className="ro-conversation-scroll">
                  {conversation.map((m) => (
                    <div
                      className={`ro-chat-bubble ro-chat-${m.direction}`}
                      key={m.id}
                    >
                      <small>
                        {m.channel} · {dateLabel(m.created.slice(0, 10))} ·{" "}
                        {m.created.slice(11, 16)}
                      </small>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>
                <form
                  className="ro-reply-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      run({
                        type: "broadcast",
                        ids: [c.id],
                        title: `Reply to ${c.name}`,
                        channel: c.preference,
                        template: reply,
                        kind: "general",
                      })
                    )
                      setReply("");
                  }}
                >
                  <input
                    aria-label="Reply message"
                    placeholder={
                      c.doNotContact
                        ? "This candidate has opted out"
                        : "Write a simulated reply…"
                    }
                    disabled={c.doNotContact}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!reply.trim() || c.doNotContact}
                  >
                    Simulate reply
                  </Button>
                </form>
              </>
            ) : (
              <Empty title="Select a conversation" />
            )}
          </section>
        </div>
      )}
      {tab === "Broadcasts" && (
        <div className="ro-table-wrap">
          <table className="ro-table">
            <thead>
              <tr>
                <th>Broadcast</th>
                <th>Recipients</th>
                <th>Responses</th>
                <th>Interested</th>
                <th>Created by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.broadcasts.map((b) => (
                <tr key={b.id}>
                  <td>
                    <button
                      className="ro-person-label"
                      onClick={() => a.broadcastResult(b.id)}
                    >
                      <strong>{b.title}</strong>
                      <small>
                        {b.channel} ·{" "}
                        {b.simulated
                          ? "Responses simulated"
                          : "Awaiting simulation"}
                      </small>
                    </button>
                  </td>
                  <td>{b.recipients.length}</td>
                  <td>
                    {
                      b.recipients.filter((r) => r.response !== "No response")
                        .length
                    }
                  </td>
                  <td>{interested(b).length}</td>
                  <td>Alex Morgan</td>
                  <td>{dateLabel(b.created.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "Templates" && (
        <div className="ro-template-grid">
          {data.templates.map((t) => (
            <article key={t.id}>
              <span className="ro-eyebrow">MESSAGE TEMPLATE</span>
              <h3>{t.name}</h3>
              <p>{t.text}</p>
              <Button onClick={() => setEdit({ ...t })}>Edit template</Button>
              <Button
                onClick={() =>
                  a.broadcast({
                    ids: data.candidates
                      .filter((c) => c.status === "available")
                      .map((c) => c.id),
                    templateId: t.id,
                    kind:
                      t.id === "availability"
                        ? "availability"
                        : t.id === "renewal"
                          ? "renewal"
                          : "general",
                  })
                }
              >
                Use template
              </Button>
            </article>
          ))}
        </div>
      )}
      {edit && (
        <Modal title="Edit message template" onClose={() => setEdit(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (run({ type: "template", template: edit })) setEdit(null);
            }}
          >
            <Field label="Template name">
              <input
                required
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <Field label="Message">
              <textarea
                required
                className="ro-message-editor"
                value={edit.text}
                onChange={(e) => setEdit({ ...edit, text: e.target.value })}
              />
            </Field>
            <Button type="submit" variant="primary">
              Save template
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
