"use client";
import { useState } from "react";
import { day, DEMO_TODAY, statusLabels } from "@/lib/recruitment/catalogue";
import { useDemo } from "@/lib/recruitment/store";
import type { AvailabilityStatus } from "@/lib/recruitment/types";
import { Button, Combo, Field, Modal } from "./ui";
export function StatusForm({
  ids,
  initial,
  initialJob,
  onClose,
}: {
  ids: string[];
  initial?: AvailabilityStatus;
  initialJob?: string;
  onClose: () => void;
}) {
  const { state, run } = useDemo(),
    { data } = state,
    candidate = data.candidates.find((c) => c.id === ids[0]);
  const [status, setStatus] = useState<AvailabilityStatus>(
      initial ?? "available",
    ),
    [client, setClient] = useState(
      data.jobs.find((j) => j.id === initialJob)?.clientId ||
        data.clients[0].id,
    ),
    [site, setSite] = useState(
      data.jobs.find((j) => j.id === initialJob)?.siteId || data.sites[0].id,
    ),
    [jobId, setJobId] = useState(initialJob || ""),
    [review, setReview] = useState("30");
  const current = data.placements.filter(
    (p) => ids.includes(p.candidateId) && p.status === "current",
  );
  return (
    <Modal
      title={
        ids.length === 1
          ? `Update ${candidate?.name.split(" ")[0]}'s availability`
          : `Update ${ids.length} candidates`
      }
      eyebrow="WORKFORCE / CHANGE STATUS"
      onClose={onClose}
    >
      <form
        className="ro-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            run({
              type: "status",
              ids,
              status,
              availableFrom: String(f.get("availableFrom") || DEMO_TODAY),
              reviewDate:
                status === "not-looking"
                  ? review === "custom"
                    ? String(f.get("reviewDate"))
                    : day(+review)
                  : undefined,
              finish: String(f.get("actualFinish") || DEMO_TODAY),
              placement:
                status === "working"
                  ? {
                      clientId: client,
                      siteId: site,
                      jobId: jobId || undefined,
                      role: String(f.get("role")),
                      start: String(f.get("start")),
                      finish: String(f.get("finish")),
                      rate: Number(f.get("rate")),
                      notes: String(f.get("notes") || ""),
                    }
                  : undefined,
            })
          )
            onClose();
        }}
      >
        <Field label="New status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option
                key={key}
                value={key}
                disabled={key === "working" && ids.length > 1}
              >
                {label}
                {key === "working" && ids.length > 1
                  ? " (one placement at a time)"
                  : ""}
              </option>
            ))}
          </select>
        </Field>
        {status === "working" ? (
          <>
            <p className="ro-info">
              A placement links this worker to the client and site. Future
              starts become upcoming bookings.
            </p>
            <Field label="Link to a job (optional)">
              <select
                value={jobId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  const j = data.jobs.find((j) => j.id === e.target.value);
                  if (j) {
                    setClient(j.clientId);
                    setSite(j.siteId);
                  }
                }}
              >
                <option value="">Direct placement</option>
                {data.jobs
                  .filter((j) => j.status === "open")
                  .map((j) => (
                    <option value={j.id} key={j.id}>
                      {j.reference} · {j.trade}
                    </option>
                  ))}
              </select>
            </Field>
            <div className="ro-form-grid" key={jobId}>
              <Combo
                label="Client"
                value={client}
                options={data.clients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                onChange={(v) => {
                  setClient(v);
                  setSite(data.sites.find((s) => s.clientId === v)?.id ?? "");
                }}
              />
              <Combo
                label="Site"
                value={site}
                options={data.sites
                  .filter((s) => s.clientId === client)
                  .map((s) => ({ value: s.id, label: s.name }))}
                onChange={setSite}
              />
              <Field label="Role">
                <input
                  name="role"
                  required
                  defaultValue={
                    data.jobs.find((j) => j.id === jobId)?.trade ||
                    candidate?.trade
                  }
                />
              </Field>
              <Field label="Hourly rate (£)">
                <input
                  name="rate"
                  type="number"
                  min="0"
                  step=".5"
                  required
                  defaultValue={
                    data.jobs.find((j) => j.id === jobId)?.rate ||
                    candidate?.rate ||
                    19.5
                  }
                />
              </Field>
              <Field label="Start date">
                <input
                  type="date"
                  name="start"
                  required
                  defaultValue={
                    data.jobs.find((j) => j.id === jobId)?.start || DEMO_TODAY
                  }
                />
              </Field>
              <Field label="Expected finish">
                <input
                  type="date"
                  name="finish"
                  required
                  defaultValue={
                    data.jobs.find((j) => j.id === jobId)?.finish || day(30)
                  }
                />
              </Field>
            </div>
            <Field label="Placement notes">
              <textarea
                name="notes"
                placeholder="Induction, site contact, travel…"
              />
            </Field>
          </>
        ) : (
          <>
            {current.length > 0 && (
              <div className="ro-info">
                <strong>
                  {current.length} current placement
                  {current.length === 1 ? "" : "s"} will be completed.
                </strong>
                <Field label="Actual finish date">
                  <input
                    name="actualFinish"
                    type="date"
                    required
                    max={DEMO_TODAY}
                    min={current
                      .map((p) => p.start)
                      .sort()
                      .at(-1)}
                    defaultValue={DEMO_TODAY}
                  />
                </Field>
              </div>
            )}
            {["available", "open"].includes(status) && (
              <Field label="Available from">
                <input
                  type="date"
                  name="availableFrom"
                  defaultValue={DEMO_TODAY}
                  required
                />
              </Field>
            )}
            {status === "not-looking" && (
              <>
                <Field label="Review status in">
                  <select
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="custom">Choose a date</option>
                  </select>
                </Field>
                {review === "custom" && (
                  <Field label="Review date">
                    <input
                      type="date"
                      name="reviewDate"
                      min={DEMO_TODAY}
                      required
                    />
                  </Field>
                )}
              </>
            )}
          </>
        )}
        <div className="ro-form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" icon="check">
            {status === "working" ? "Confirm placement" : "Confirm status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
