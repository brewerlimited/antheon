"use client";
import {
  channels,
  payTypes,
  recruiters,
  sources,
  towns,
  trades,
} from "@/lib/recruitment/catalogue";
import { TicketPicker } from "./TicketPicker";
import type {
  CandidateFilters as Filters,
  DemoData,
} from "@/lib/recruitment/types";
import { Button, Combo, Field, Modal } from "./ui";
export const availabilityOptions = [
  ["", "Any availability"],
  ["available", "Available now"],
  ["working", "Working"],
  ["finish7", "Finishing within 7 days"],
  ["finish14", "Finishing within 14 days"],
  ["finish30", "Finishing within 30 days"],
  ["open", "Open to work"],
  ["not-looking", "Not looking"],
  ["unknown", "Status unknown"],
];
export function FilterFields({
  filters,
  onChange,
  data,
}: {
  filters: Filters;
  onChange: (v: Filters) => void;
  data: DemoData;
}) {
  const update = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });
  return (
    <div className="ro-form-grid">
      <Field label="Availability">
        <select
          value={filters.availability}
          onChange={(e) => update("availability", e.target.value)}
        >
          {availabilityOptions.map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Available by date">
        <input
          type="date"
          value={filters.availableBy}
          onChange={(e) => update("availableBy", e.target.value)}
        />
      </Field>
      <Combo
        label="Trade"
        options={trades.map((t) => ({ value: t.name, label: t.name }))}
        value={filters.trade}
        onChange={(v) => update("trade", v)}
        placeholder="Any trade"
      />
      <Combo
        label="Location"
        options={towns.map((t) => ({ value: t.name, label: t.name }))}
        value={filters.town}
        onChange={(v) => onChange({ ...filters, town: v, postcode: "" })}
        placeholder="Any town"
      />
      <Field label="Within (miles)">
        <select
          value={filters.radius}
          onChange={(e) => update("radius", e.target.value)}
        >
          {["10", "15", "25", "30", "50", "60", "100", "200"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </Field>
      <Field
        label="Or demo postcode"
        hint="Uses the listed towns’ outward postcode centroids; straight-line distance, not driving distance."
      >
        <input
          placeholder="NN1, MK9, MK40…"
          value={filters.postcode}
          onChange={(e) =>
            onChange({
              ...filters,
              postcode: e.target.value.toUpperCase(),
              town: "",
            })
          }
        />
      </Field>
      <div className="ro-form-full">
        <h3>Valid, verified tickets</h3>
        <p className="ro-hint">Match every selected qualification.</p>
        <TicketPicker
          value={filters.ticket ? filters.ticket.split(",") : []}
          onChange={(v) => update("ticket", v.join(","))}
        />
      </div>
      <Field label="Ticket expiry">
        <select
          value={filters.expiry}
          onChange={(e) => update("expiry", e.target.value)}
        >
          <option value="">Any date</option>
          <option value="expired">Already expired</option>
          <option value="30">Within 30 days</option>
          <option value="60">Within 60 days</option>
          <option value="90">Within 90 days</option>
        </select>
      </Field>
      <Field label="Minimum experience">
        <select
          value={filters.experience}
          onChange={(e) => update("experience", e.target.value)}
        >
          <option value="">Any experience</option>
          {["1", "3", "5", "10", "15"].map((v) => (
            <option key={v} value={v}>
              {v} years
            </option>
          ))}
        </select>
      </Field>
      <Field label="Not contacted for">
        <select
          value={filters.lastContact}
          onChange={(e) => update("lastContact", e.target.value)}
        >
          <option value="">Any time</option>
          {["7", "30", "60", "90"].map((v) => (
            <option key={v} value={v}>
              {v}+ days
            </option>
          ))}
        </select>
      </Field>
      <Combo
        label="Current client"
        options={data.clients.map((c) => ({ value: c.id, label: c.name }))}
        value={filters.clientId}
        onChange={(v) => update("clientId", v)}
        placeholder="Any client"
      />
      <Combo
        label="Current site"
        options={data.sites.map((s) => ({ value: s.id, label: s.name }))}
        value={filters.siteId}
        onChange={(v) => update("siteId", v)}
        placeholder="Any site"
      />
      <Field label="Recruiter">
        <select
          value={filters.recruiterId}
          onChange={(e) => update("recruiterId", e.target.value)}
        >
          <option value="">All recruiters</option>
          {recruiters.map((r) => (
            <option value={r.id} key={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>
      {(
        [
          ["payType", "Pay type", payTypes],
          ["source", "Candidate source", sources],
          ["preference", "Communication preference", channels],
        ] as const
      ).map(([key, label, options]) => (
        <Field label={label} key={key}>
          <select
            value={filters[key]}
            onChange={(e) => update(key, e.target.value)}
          >
            <option value="">Any</option>
            {options.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      ))}
      <Field label="Contact permissions">
        <select
          value={filters.contactable}
          onChange={(e) => update("contactable", e.target.value)}
        >
          <option value="">Everyone</option>
          <option value="yes">Contactable only</option>
          <option value="no">Do not contact only</option>
        </select>
      </Field>
    </div>
  );
}
export function CandidateFiltersPanel({
  filters,
  onChange,
  data,
  onClose,
  count,
  onClear,
}: {
  filters: Filters;
  onChange: (v: Filters) => void;
  data: DemoData;
  onClose: () => void;
  count: number;
  onClear: () => void;
}) {
  return (
    <Modal
      title="Find the right people"
      eyebrow="CANDIDATES / COMBINE FILTERS"
      onClose={onClose}
      drawer
      footer={
        <>
          <Button onClick={onClear}>Clear filters</Button>
          <Button variant="primary" onClick={onClose}>
            Show {count.toLocaleString()} candidates
          </Button>
        </>
      }
    >
      <FilterFields filters={filters} onChange={onChange} data={data} />
    </Modal>
  );
}
