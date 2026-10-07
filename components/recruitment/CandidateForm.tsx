"use client";
import { useState } from "react";
import {
  channels,
  day,
  DEMO_TODAY,
  payTypes,
  recruiters,
  sources,
  statusLabels,
  towns,
  trades,
} from "@/lib/recruitment/catalogue";
import {
  constructionTickets,
  ticketName,
} from "@/lib/recruitment/constructionTickets";
import { useDemo } from "@/lib/recruitment/store";
import type { Candidate, Qualification } from "@/lib/recruitment/types";
import { Button, Combo, Field, Modal } from "./ui";
import { TicketPicker } from "./TicketPicker";
export function QualificationFields({
  value,
  onChange,
}: {
  value: Qualification;
  onChange: (q: Qualification) => void;
}) {
  const change = (key: keyof Qualification, v: string | boolean) =>
    onChange({ ...value, [key]: v });
  return (
    <div className="ro-form-grid">
      <Field label="Card / ticket number">
        <input
          value={value.number}
          onChange={(e) => change("number", e.target.value)}
          placeholder="DEMO-12345"
        />
      </Field>
      <Field label="Issued">
        <input
          type="date"
          value={value.issued}
          onChange={(e) => change("issued", e.target.value)}
        />
      </Field>
      <Field label="Expiry">
        <input
          type="date"
          value={value.expiry}
          min={value.issued}
          onChange={(e) => change("expiry", e.target.value)}
        />
      </Field>
      <label className="ro-check-field">
        <input
          type="checkbox"
          checked={value.verified}
          onChange={(e) => change("verified", e.target.checked)}
        />
        Verified in demo
      </label>
      <div className="ro-form-full ro-attachment">
        <span>{value.document || "No document attached"}</span>
        <Button
          icon="upload"
          onClick={() =>
            change("document", value.document ? "" : "Demo qualification.pdf")
          }
        >
          {value.document ? "Remove sample" : "Attach sample document"}
        </Button>
      </div>
    </div>
  );
}
export function CandidateForm({
  id,
  onClose,
}: {
  id?: string;
  onClose: () => void;
}) {
  const { state, run } = useDemo(),
    existing = state.data.candidates.find((c) => c.id === id);
  const [candidate, setCandidate] = useState<Candidate>(() =>
    existing
      ? { ...existing, qualifications: [...existing.qualifications] }
      : {
          id: `candidate-new-${state.data.sequence + 1}`,
          name: "",
          trade: "",
          secondary: [],
          town: "",
          postcode: "",
          phone: "07700 900999",
          email: "new.worker@example.com",
          status: "available",
          availableFrom: DEMO_TODAY,
          radius: 30,
          rate: 19.5,
          payType: "CIS",
          experience: 5,
          recruiterId: "am",
          source: "Recruiter network",
          preference: "SMS",
          doNotContact: false,
          lastContact: DEMO_TODAY,
          statusConfirmed: DEMO_TODAY,
          created: DEMO_TODAY,
          qualifications: [],
        },
  );
  const change = <K extends keyof Candidate>(key: K, value: Candidate[K]) =>
    setCandidate((c) => ({ ...c, [key]: value }));
  function tickets(ids: string[]) {
    const retained = candidate.qualifications.filter(
      (q) => q.typeId === "custom" || ids.includes(q.typeId),
    );
    const added = ids
      .filter(
        (typeId) => !candidate.qualifications.some((q) => q.typeId === typeId),
      )
      .map((typeId) => ({
        id: `q-new-${state.data.sequence}-${typeId}`,
        typeId,
        number: "",
        issued: "",
        expiry: "",
        verified: false,
      }));
    change("qualifications", [...retained, ...added]);
  }

  return (
    <Modal
      title={existing ? "Edit candidate" : "Add a candidate"}
      eyebrow="Your next placement starts here"
      drawer
      onClose={onClose}
    >
      <form
        className="ro-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (run({ type: "candidate", candidate, edit: !!existing }))
            onClose();
        }}
      >
        <p className="ro-demo-note">
          Fictional details only. Saved in this browser, never sent to a server.
        </p>
        <div className="ro-section-label">
          <span>01</span> THE ESSENTIALS
        </div>
        <div className="ro-form-grid">
          <Field label="Full name">
            <input
              data-initial-focus
              required
              value={candidate.name}
              onChange={(e) => change("name", e.target.value)}
              placeholder="e.g. Jordan Ellis"
              maxLength={100}
            />
          </Field>
          <Field label="Demo mobile">
            <input
              required
              value={candidate.phone}
              onChange={(e) => change("phone", e.target.value)}
              pattern="07700\s?900[0-9]{3}"
            />
          </Field>
          <Field label="Demo email">
            <input
              type="email"
              value={candidate.email}
              required
              onChange={(e) => change("email", e.target.value)}
            />
          </Field>
          <Combo
            label="Town"
            value={candidate.town}
            options={towns.map((t) => ({ value: t.name, label: t.name }))}
            required
            onChange={(v) =>
              setCandidate((c) => ({
                ...c,
                town: v,
                postcode:
                  towns.find((t) => t.name === v)?.postcode ?? c.postcode,
              }))
            }
          />
          <Field label="Postcode">
            <input
              value={candidate.postcode}
              onChange={(e) => change("postcode", e.target.value.toUpperCase())}
              maxLength={9}
            />
          </Field>
          <Field label="Recruiter">
            <select
              value={candidate.recruiterId}
              onChange={(e) => change("recruiterId", e.target.value)}
            >
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="ro-section-label">
          <span>02</span> WORK & AVAILABILITY
        </div>
        <div className="ro-form-grid">
          <Combo
            label="Primary trade"
            value={candidate.trade}
            options={trades.map((t) => ({ value: t.name, label: t.name }))}
            onChange={(v) => change("trade", v)}
            required
          />
          <Field label="Secondary trades (comma separated)">
            <input
              value={candidate.secondary.join(", ")}
              onChange={(e) =>
                change(
                  "secondary",
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
            />
          </Field>
          <Field label="Availability">
            <select
              value={candidate.status}
              disabled={!!existing}
              onChange={(e) =>
                change("status", e.target.value as Candidate["status"])
              }
            >
              {Object.entries(statusLabels).map(([v, l]) => (
                <option value={v} key={v}>
                  {l}
                </option>
              ))}
            </select>
            {existing && (
              <small>Use Change status to manage associated placements.</small>
            )}
          </Field>
          <Field label="Available from">
            <input
              type="date"
              value={candidate.availableFrom}
              onChange={(e) => change("availableFrom", e.target.value)}
            />
          </Field>
          <Field label="Experience (years)">
            <input
              type="number"
              min="0"
              max="60"
              value={candidate.experience}
              onChange={(e) => change("experience", +e.target.value)}
            />
          </Field>
          <Field label="Travel radius (miles)">
            <input
              type="number"
              min="0"
              max="300"
              value={candidate.radius}
              onChange={(e) => change("radius", +e.target.value)}
            />
          </Field>
          <Field label="Expected hourly pay (£)">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={candidate.rate}
              onChange={(e) => change("rate", +e.target.value)}
            />
          </Field>
          <Field label="Pay type">
            <select
              value={candidate.payType}
              onChange={(e) =>
                change("payType", e.target.value as Candidate["payType"])
              }
            >
              {payTypes.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select
              value={candidate.source}
              onChange={(e) => change("source", e.target.value)}
            >
              {sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Communication preference">
            <select
              value={candidate.preference}
              onChange={(e) =>
                change("preference", e.target.value as Candidate["preference"])
              }
            >
              {channels.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <label className="ro-check-field">
          <input
            type="checkbox"
            checked={candidate.doNotContact}
            onChange={(e) => change("doNotContact", e.target.checked)}
          />
          Do not contact — exclude from every broadcast
        </label>
        <div className="ro-section-label">
          <span>03</span> TICKETS & QUALIFICATIONS
        </div>
        <TicketPicker
          value={[
            ...new Set(
              candidate.qualifications
                .filter((q) => q.typeId !== "custom")
                .map((q) => q.typeId),
            ),
          ]}
          onChange={tickets}
        />
        <Button
          onClick={() =>
            change("qualifications", [
              ...candidate.qualifications,
              {
                id: `custom-${state.data.sequence}-${candidate.qualifications.length}`,
                typeId: "custom",
                customName: "",
                provider: "",
                category: "",
                number: "",
                issued: "",
                expiry: "",
                verified: false,
              },
            ])
          }
        >
          + Add other qualification
        </Button>
        {candidate.qualifications.map((q) => (
          <details
            className="ro-details"
            key={q.id}
            open={q.typeId === "custom" ? true : undefined}
          >
            <summary>
              {q.typeId === "custom"
                ? q.customName || "Other qualification"
                : ticketName(q)}{" "}
              <span>Add card details</span>
            </summary>
            {q.typeId === "custom" && (
              <div className="ro-form-grid">
                {(
                  [
                    ["customName", "Qualification"],
                    ["provider", "Provider"],
                    ["category", "Category"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      required={key === "customName"}
                      value={q[key] || ""}
                      onChange={(e) =>
                        change(
                          "qualifications",
                          candidate.qualifications.map((item) =>
                            item.id === q.id
                              ? { ...item, [key]: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                ))}
                <Button
                  variant="ghost"
                  onClick={() =>
                    change(
                      "qualifications",
                      candidate.qualifications.filter(
                        (item) => item.id !== q.id,
                      ),
                    )
                  }
                >
                  Remove custom qualification
                </Button>
              </div>
            )}
            <QualificationFields
              value={q}
              onChange={(value) =>
                change(
                  "qualifications",
                  candidate.qualifications.map((item) =>
                    item.id === q.id ? value : item,
                  ),
                )
              }
            />
          </details>
        ))}
        <div className="ro-form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" icon="check">
            {existing ? "Save candidate" : "Create candidate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function QualificationForm({
  candidateId,
  qualificationId,
  onClose,
}: {
  candidateId: string;
  qualificationId?: string;
  onClose: () => void;
}) {
  const { state, run } = useDemo(),
    existing = state.data.candidates
      .find((c) => c.id === candidateId)
      ?.qualifications.find((q) => q.id === qualificationId);
  const [value, setValue] = useState<Qualification>(
      existing ?? {
        id: `q-${state.data.sequence + 1}`,
        typeId: "",
        number: "",
        issued: day(-30),
        expiry: day(365),
        verified: false,
      },
    ),
    [custom, setCustom] = useState(existing?.typeId === "custom");
  return (
    <Modal
      title={existing ? "Edit qualification" : "Add a qualification"}
      onClose={onClose}
    >
      <form
        className="ro-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (run({ type: "qualification", candidateId, qualification: value }))
            onClose();
        }}
      >
        <div className="ro-segment">
          <Button
            variant={!custom ? "primary" : "ghost"}
            onClick={() => {
              setCustom(false);
              setValue({ ...value, typeId: "" });
            }}
          >
            Ticket library
          </Button>
          <Button
            variant={custom ? "primary" : "ghost"}
            onClick={() => {
              setCustom(true);
              setValue({ ...value, typeId: "custom" });
            }}
          >
            + Add other qualification
          </Button>
        </div>
        {custom ? (
          <div className="ro-form-grid">
            <Field label="Qualification">
              <input
                required
                value={value.customName ?? ""}
                onChange={(e) =>
                  setValue({ ...value, customName: e.target.value })
                }
              />
            </Field>
            <Field label="Provider">
              <input
                value={value.provider ?? ""}
                onChange={(e) =>
                  setValue({ ...value, provider: e.target.value })
                }
              />
            </Field>
            <Field label="Category">
              <input
                value={value.category ?? ""}
                onChange={(e) =>
                  setValue({ ...value, category: e.target.value })
                }
              />
            </Field>
          </div>
        ) : (
          <TicketPicker
            multiple={false}
            value={value.typeId ? [value.typeId] : []}
            onChange={(ids) =>
              setValue({
                ...value,
                typeId: ids[0] ?? "",
                customName: undefined,
              })
            }
          />
        )}
        <p className="ro-muted">
          {constructionTickets.find((t) => t.id === value.typeId)?.name ||
            "A flexible catalogue, with room for every additional qualification."}
        </p>
        <QualificationFields value={value} onChange={setValue} />
        <p className="ro-demo-note">
          Document attachment and verification are simulated. No file is
          uploaded and no issuer is contacted.
        </p>
        <div className="ro-form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            Save qualification
          </Button>
        </div>
      </form>
    </Modal>
  );
}
