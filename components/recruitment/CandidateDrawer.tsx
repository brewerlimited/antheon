"use client";
import { useState } from "react";
import { useDemo } from "@/lib/recruitment/store";
import {
  dateLabel,
  daysUntil,
  money,
  recruiters,
  relativeDate,
} from "@/lib/recruitment/catalogue";
import { ticketName } from "@/lib/recruitment/constructionTickets";
import { currentPlacement } from "@/lib/recruitment/selectors";
import { useActions } from "./actions";
import { Avatar, Button, copyText, Empty, Modal, Status, Tabs } from "./ui";
export function CandidateDrawer({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const {
      state: { data },
      run,
      notify,
    } = useDemo(),
    a = useActions(),
    [tab, setTab] = useState("Overview"),
    [note, setNote] = useState("");
  const c = data.candidates.find((c) => c.id === id);
  if (!c) return null;
  const placement = currentPlacement(data, id),
    history = data.placements.filter((p) => p.candidateId === id),
    messages = data.messages.filter((m) => m.candidateId === id),
    activity = data.activity.filter((x) => x.candidateId === id),
    notes = data.notes.filter((n) => n.candidateId === id);
  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (run({ type: "note", candidateId: id, text: note })) setNote("");
  };
  const tickets = (
    <>
      <div className="ro-section-heading">
        <h3>
          Tickets & qualifications <span>{c.qualifications.length}</span>
        </h3>
        <Button icon="plus" onClick={() => a.qualification(id)}>
          Add qualification
        </Button>
      </div>
      {!c.qualifications.length && (
        <Empty title="No qualifications recorded">
          Add a ticket or a custom qualification.
        </Empty>
      )}
      {c.qualifications.map((q) => (
        <button
          className="ro-ticket-row"
          key={q.id}
          onClick={() => a.qualification(id, q.id)}
        >
          <span className="ro-ticket-symbol">
            {ticketName(q).split(" ")[0]}
          </span>
          <span>
            <strong>{ticketName(q)}</strong>
            <small>
              {q.number || "No card number"} ·{" "}
              {q.document ? "Sample document attached" : "No document"}
            </small>
          </span>
          <span className="ro-ticket-end">
            <Status
              status={
                !q.expiry || daysUntil(q.expiry) >= 0
                  ? q.verified
                    ? "verified"
                    : "unknown"
                  : "expired"
              }
              label={
                !q.expiry
                  ? q.verified
                    ? "Verified"
                    : "Unverified"
                  : daysUntil(q.expiry) < 0
                    ? "Expired"
                    : `${q.verified ? "Valid" : "Unverified"} · ${dateLabel(q.expiry)}`
              }
            />
            <small>Edit record →</small>
          </span>
        </button>
      ))}
    </>
  );
  return (
    <Modal
      title={c.name}
      eyebrow={`CANDIDATE / ${c.id.replace("candidate-", "C-")}`}
      drawer
      wide
      onClose={onClose}
    >
      <div className="ro-profile-identity">
        <Avatar name={c.name} />
        <div>
          <strong>
            {c.trade}
            {c.secondary.length ? " / " + c.secondary.join(", ") : ""}
          </strong>
          <p>
            {c.town} · {c.postcode} · {c.experience} years’ experience
          </p>
        </div>
        <Button variant="ghost" onClick={() => a.editCandidate(id)}>
          Edit profile
        </Button>
      </div>
      <div className="ro-profile-actions">
        <button className="ro-bare" onClick={() => a.status([id])}>
          <Status status={c.status} /> <small>Change ↗</small>
        </button>
        <Button
          icon="message"
          variant="primary"
          disabled={c.doNotContact}
          onClick={() => a.broadcast({ ids: [id] })}
        >
          Message
        </Button>
        <Button icon="phone" onClick={() => a.call(id)}>
          Call
        </Button>
        <Button icon="plus" onClick={() => a.shortlist([id])}>
          Add to job
        </Button>
        <Button
          icon="copy"
          onClick={() =>
            copyText(
              `${c.name} · ${c.trade}\n${c.town} · ${c.experience} years\n${c.phone} · ${c.email}\n${c.qualifications.map(ticketName).join(", ")}`,
              notify,
            )
          }
        >
          Copy summary
        </Button>
      </div>
      {c.doNotContact && (
        <p className="ro-warning">
          Do not contact — excluded from all broadcasts.
        </p>
      )}
      <Tabs
        items={[
          "Overview",
          "Placements",
          "Compliance",
          "Messages",
          "Notes",
          "Activity",
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="ro-tab-body">
        {tab === "Overview" && (
          <>
            <dl
              className="ro-details"
              onDoubleClick={() => a.editCandidate(id)}
            >
              <div>
                <dt>Mobile</dt>
                <dd>
                  <button className="ro-text-button" onClick={() => a.call(id)}>
                    {c.phone}
                  </button>
                  <Button
                    variant="ghost"
                    icon="copy"
                    aria-label="Copy phone"
                    onClick={() => copyText(c.phone, notify)}
                  />
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <button
                    className="ro-text-button"
                    onClick={() => copyText(c.email, notify)}
                  >
                    {c.email}
                  </button>
                </dd>
              </div>
              <div>
                <dt>Available from</dt>
                <dd>
                  {c.availableFrom
                    ? dateLabel(c.availableFrom)
                    : "To be confirmed"}
                </dd>
              </div>
              <div>
                <dt>Preferred travel</dt>
                <dd>
                  {c.radius} miles from {c.town}
                </dd>
              </div>
              <div>
                <dt>Pay expectation</dt>
                <dd>
                  {money(c.rate)}/hr · {c.payType}
                </dd>
              </div>
              <div>
                <dt>Recruiter</dt>
                <dd>{recruiters.find((r) => r.id === c.recruiterId)?.name}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{c.source}</dd>
              </div>
              <div>
                <dt>Contact preference</dt>
                <dd>
                  {c.preference} · contacted {relativeDate(c.lastContact)}
                </dd>
              </div>
            </dl>
            {placement ? (
              <div className="ro-inset">
                <span className="ro-eyebrow">CURRENT PLACEMENT</span>
                <h3>
                  {data.sites.find((s) => s.id === placement.siteId)?.name}
                </h3>
                <p>
                  Finishes {dateLabel(placement.finish)} ·{" "}
                  {money(placement.rate)}/hr
                </p>
                <Button onClick={() => a.site(placement.siteId)}>
                  Open site
                </Button>
                <Button onClick={() => a.status([id], "available")}>
                  End placement
                </Button>
              </div>
            ) : (
              c.status === "working" && (
                <p className="ro-info">
                  Working status is self-reported. No agency-managed placement
                  is recorded.
                </p>
              )
            )}
            {tickets}
            <h3 className="ro-subheading">Quick note</h3>
            <form className="ro-note-form" onSubmit={addNote}>
              <textarea
                aria-label="Quick note"
                placeholder="What should the next recruiter know?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
              <Button type="submit" disabled={!note.trim()}>
                Add note
              </Button>
            </form>
          </>
        )}
        {tab === "Placements" && (
          <>
            {!history.length && (
              <Empty
                title="No agency placements yet"
                action={
                  <Button onClick={() => a.status([id], "working")}>
                    Create a placement
                  </Button>
                }
              >
                Self-reported employment is recorded separately.
              </Empty>
            )}
            {history.map((p) => (
              <div className="ro-history-card" key={p.id}>
                <span className="ro-eyebrow">
                  {p.id} / {p.status}
                </span>
                <h3>
                  <button
                    className="ro-text-button"
                    onClick={() => a.site(p.siteId)}
                  >
                    {data.sites.find((s) => s.id === p.siteId)?.name}
                  </button>
                </h3>
                <p>
                  {data.clients.find((x) => x.id === p.clientId)?.name} ·{" "}
                  {p.role}
                </p>
                <p>
                  {dateLabel(p.start)} – {dateLabel(p.actualFinish || p.finish)}{" "}
                  · {money(p.rate)}/hr
                </p>
                <small>{p.notes}</small>
                {p.status === "current" && (
                  <Button onClick={() => a.status([id], "available")}>
                    End placement & update availability
                  </Button>
                )}
              </div>
            ))}
          </>
        )}
        {tab === "Compliance" && tickets}
        {tab === "Messages" && (
          <>
            {!messages.length && (
              <Empty
                title="No conversations yet"
                action={
                  <Button onClick={() => a.broadcast({ ids: [id] })}>
                    Start a demo conversation
                  </Button>
                }
              />
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ro-chat-bubble ro-chat-${m.direction}`}
              >
                <small>
                  {m.direction === "out" ? "Alex Morgan → " + c.name : c.name} ·{" "}
                  {m.channel} · simulated
                </small>
                <p>{m.text}</p>
                <time>{dateLabel(m.created.slice(0, 10))}</time>
              </div>
            ))}
          </>
        )}
        {tab === "Notes" && (
          <>
            <form className="ro-note-form" onSubmit={addNote}>
              <textarea
                aria-label="New candidate note"
                placeholder="Add a recruiter note…"
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={!note.trim()}>
                Save note
              </Button>
            </form>
            {notes.map((n) => (
              <div className="ro-history-card" key={n.id}>
                <p>{n.text}</p>
                <small>
                  {n.author} · {dateLabel(n.created.slice(0, 10))}
                </small>
              </div>
            ))}
          </>
        )}
        {tab === "Activity" && (
          <div className="ro-timeline">
            {!activity.length && <Empty title="No activity yet" />}
            {activity.map((x) => (
              <div key={x.id}>
                <i />
                <section>
                  <strong>{x.title}</strong>
                  <p>{x.detail}</p>
                  <small>
                    {dateLabel(x.created.slice(0, 10))} ·{" "}
                    {x.created.slice(11, 16)}
                  </small>
                </section>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
