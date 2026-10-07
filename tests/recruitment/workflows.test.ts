import { test } from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../../lib/recruitment/seed";
import { applyCommand } from "../../lib/recruitment/engine";
import {
  audience,
  filterCandidates,
  filled,
  matchCandidates,
  metrics,
  parseSearch,
} from "../../lib/recruitment/selectors";
import { blankFilters, day, DEMO_TODAY } from "../../lib/recruitment/catalogue";
import { constructionTickets } from "../../lib/recruitment/constructionTickets";
const seed = createSeed();
test("deterministic relational snapshot backs every headline metric", () => {
  assert.deepEqual(createSeed(), seed);
  assert.deepEqual(metrics(seed), {
    total: 2486,
    working: 1137,
    available: 318,
    open: 276,
    finishing: 94,
    unknown: 417,
  });
  assert.equal(seed.placements.length, 120);
  assert.equal(seed.clients.length, 20);
  assert.equal(seed.sites.length, 32);
  assert.equal(seed.jobs.length, 24);
  assert.ok(seed.messages.length > 250);
  assert.equal(filled(seed, "job-0"), 4);
  for (const key of [
    "candidates",
    "placements",
    "clients",
    "sites",
    "jobs",
    "messages",
    "broadcasts",
    "activity",
  ] as const)
    assert.equal(
      new Set(seed[key].map((x) => x.id)).size,
      seed[key].length,
      `${key} unique IDs`,
    );
  for (const p of seed.placements) {
    assert.ok(seed.candidates.some((c) => c.id === p.candidateId));
    assert.equal(
      seed.sites.find((s) => s.id === p.siteId)?.clientId,
      p.clientId,
    );
    assert.ok(p.finish >= p.start);
  }
  for (const c of seed.candidates) {
    assert.ok(c.phone === "Not recorded" || /^07700 900\d{3}$/.test(c.phone));
    assert.match(c.email, /@example.com$/);
  }
  assert.equal(seed.jobs.find((j) => j.id === "job-20")?.siteId, "site-30");
});
test("the sales walkthrough returns 38 actual people, including combined tickets", () => {
  const f = {
    ...blankFilters,
    availability: "available",
    trade: "Groundworker",
    town: "Northampton",
    radius: "30",
    ticket: "cscs",
  };
  assert.equal(filterCandidates(seed, f).length, 38);
  assert.equal(
    filterCandidates(seed, { ...f, ticket: "cscs,cpcs-a09" }).length,
    38,
  );
  assert.ok(filterCandidates(seed, { ...f, radius: "10" }).length < 38);
  assert.equal(
    filterCandidates(seed, { ...f, postcode: "NN1", town: "" }).length,
    38,
  );
  assert.equal(filterCandidates(seed, { ...f, postcode: "INVALID" }).length, 0);
  assert.equal(
    filterCandidates(seed, { ...blankFilters, availability: "finish14" })
      .length,
    94,
  );
  assert.equal(
    parseSearch(
      "Groundworkers within 30 miles of Northampton available now with CSCS",
    )?.ticket,
    "cscs",
  );
  assert.equal(parseSearch("magic workforce"), null);
});
test("booking a worker, ending the placement and preserving the original snapshot", () => {
  const booking = {
    type: "status" as const,
    ids: ["candidate-0"],
    status: "working" as const,
    placement: {
      clientId: "client-0",
      siteId: "site-0",
      role: "Groundworker",
      start: DEMO_TODAY,
      finish: day(30),
      rate: 19.5,
      notes: "Demo induction",
    },
  };
  const working = applyCommand(seed, booking).data;
  assert.equal(metrics(working).available, 317);
  assert.equal(metrics(working).working, 1138);
  assert.equal(seed.candidates[0].status, "available");
  assert.throws(() => applyCommand(working, booking), /End the current/);
  assert.throws(
    () =>
      applyCommand(working, {
        type: "status",
        ids: ["candidate-0"],
        status: "available",
      }),
    /actual finish date/,
  );
  const ended = applyCommand(working, {
    type: "status",
    ids: ["candidate-0"],
    status: "available",
    finish: DEMO_TODAY,
  }).data;
  assert.equal(ended.placements[0].status, "completed");
  assert.equal(ended.placements[0].actualFinish, DEMO_TODAY);
  assert.equal(metrics(ended).available, 318);
  assert.ok(ended.activity.some((a) => a.title === "Placement completed"));
});
test("future bookings stay upcoming and prevent overlapping suitable matches", () => {
  const d = applyCommand(seed, {
    type: "status",
    ids: ["candidate-0"],
    status: "working",
    placement: {
      clientId: "client-0",
      siteId: "site-0",
      role: "Groundworker",
      start: day(4),
      finish: day(50),
      rate: 20,
      notes: "",
    },
  }).data;
  assert.equal(d.placements[0].status, "upcoming");
  assert.equal(d.candidates[0].status, "available");
  assert.equal(d.candidates[0].availableFrom, DEMO_TODAY);
  const match = matchCandidates(d, d.jobs[0], {
    radius: 30,
    window: 0,
    trade: "Groundworker",
    tickets: ["cscs"],
  }).find((m) => m.candidate.id === "candidate-0");
  assert.equal(match?.suitable, false);
});
test("broadcast exclusions, pending delivery, replies and idempotent shortlisting", () => {
  const ids = ["candidate-0", "candidate-47", "candidate-53", "candidate-318"];
  const aud = audience(seed, ids, "SMS", true);
  assert.deepEqual(
    aud.included.map((c) => c.id),
    ["candidate-0"],
  );
  assert.equal(aud.excluded.length, 3);
  let d = applyCommand(seed, {
    type: "broadcast",
    ids: seed.candidates.slice(0, 23).map((c) => c.id),
    jobId: "job-0",
    title: "Northampton",
    kind: "job",
    channel: "SMS",
    template: "Hi {{firstName}}, {{role}} at {{rate}} in {{location}}.",
  }).data;
  const bid = d.broadcasts[0].id;
  assert.equal(d.broadcasts[0].recipients.length, 23);
  assert.match(
    d.broadcasts[0].recipients[0].preview,
    /Hi Jamie, Groundworker at £19.50\/hr CIS in Northampton/,
  );
  d = applyCommand(d, { type: "simulate", broadcastId: bid }).data;
  const b = d.broadcasts[0];
  assert.equal(
    b.recipients.filter((r) => r.delivery === "delivered").length,
    21,
  );
  assert.equal(
    b.recipients.filter((r) => r.response === "Interested").length,
    8,
  );
  assert.equal(
    b.recipients.filter((r) => r.response === "Not interested").length,
    4,
  );
  assert.equal(b.recipients.filter((r) => r.response === "Call me").length, 2);
  assert.ok(
    b.recipients
      .filter((r) => r.delivery === "pending")
      .every((r) => r.response === "No response"),
  );
  assert.throws(
    () => applyCommand(d, { type: "simulate", broadcastId: bid }),
    /already/,
  );
  const interested = b.recipients
    .filter((r) => r.response === "Interested")
    .map((r) => r.candidateId);
  d = applyCommand(d, {
    type: "shortlist",
    jobId: "job-0",
    ids: interested,
  }).data;
  d = applyCommand(d, {
    type: "shortlist",
    jobId: "job-0",
    ids: interested,
  }).data;
  assert.equal(d.jobs.find((j) => j.id === "job-0")!.shortlist.length, 10);
  const guarded = applyCommand(seed, {
    type: "broadcast",
    ids,
    jobId: "job-0",
    title: "test",
    kind: "job",
    channel: "SMS",
    template: "hello",
  }).data;
  assert.deepEqual(
    guarded.broadcasts[0].recipients.map((r) => r.candidateId),
    ["candidate-0"],
  );
});
test("availability check changes 25 statuses with no provider or placement side effects", () => {
  const ids = seed.candidates
    .filter((c) => c.status === "unknown")
    .map((c) => c.id);
  let d = applyCommand(seed, {
    type: "broadcast",
    ids,
    title: "Availability",
    kind: "availability",
    channel: "SMS",
    template: "Hi {{firstName}}, available?",
  }).data;
  d = applyCommand(d, {
    type: "simulate",
    broadcastId: d.broadcasts[0].id,
  }).data;
  assert.equal(metrics(d).unknown, 392);
  assert.equal(metrics(d).available, 329);
  assert.equal(d.placements.length, 120);
  assert.ok(d.candidates.filter((c) => c.status === "working").length > 1137);
});
test("qualification edits affect matching; unlimited custom tickets and notes are retained", () => {
  const q = { ...seed.candidates[0].qualifications[0], expiry: day(-1) };
  let d = applyCommand(seed, {
    type: "qualification",
    candidateId: "candidate-0",
    qualification: q,
  }).data;
  assert.equal(
    filterCandidates(d, {
      ...blankFilters,
      availability: "available",
      trade: "Groundworker",
      town: "Northampton",
      ticket: "cscs",
    }).length,
    37,
  );
  d = applyCommand(d, {
    type: "qualification",
    candidateId: "candidate-0",
    qualification: {
      id: "custom-a",
      typeId: "custom",
      customName: "Site access induction",
      provider: "Demo provider",
      number: "DEMO-12",
      issued: DEMO_TODAY,
      expiry: day(365),
      verified: false,
      document: "Sample.pdf",
    },
  }).data;
  assert.equal(
    d.candidates[0].qualifications.at(-1)?.customName,
    "Site access induction",
  );
  d = applyCommand(d, {
    type: "note",
    candidateId: "candidate-0",
    text: " Confirm induction time. ",
  }).data;
  assert.equal(d.notes[0].text, "Confirm induction time.");
  const dumper = constructionTickets.filter((t) =>
    "cpcs dum"
      .split(" ")
      .every((s) => `${t.name} ${t.family}`.toLowerCase().includes(s)),
  );
  assert.ok(dumper.some((t) => t.id === "cpcs-a09"));
});
test("new records and saved views validate, persist through JSON, and reject false working bookings", () => {
  const c = { ...seed.candidates[0], id: "new-worker", name: "Demo Candidate" };
  let d = applyCommand(seed, { type: "candidate", candidate: c }).data;
  assert.equal(d.candidates.length, 2487);
  assert.throws(
    () =>
      applyCommand(d, {
        type: "candidate",
        candidate: { ...c, id: "bad-worker", email: "personal@real.co.uk" },
      }),
    /example/,
  );
  d = applyCommand(d, {
    type: "candidate",
    candidate: { ...c, name: "Edited worker" },
    edit: true,
  }).data;
  assert.equal(d.candidates[0].name, "Edited worker");
  d = applyCommand(d, {
    type: "save-view",
    name: "Northampton",
    filters: { ...blankFilters, town: "Northampton" },
  }).data;
  assert.equal(d.savedViews.at(-1)?.filters.town, "Northampton");
  assert.deepEqual(JSON.parse(JSON.stringify(d)), d);
  assert.throws(
    () =>
      applyCommand(seed, {
        type: "status",
        ids: ["candidate-0", "candidate-1"],
        status: "working",
      }),
    /one worker/,
  );
  assert.throws(
    () =>
      applyCommand(seed, {
        type: "status",
        ids: ["candidate-0"],
        status: "working",
        placement: {
          clientId: "client-1",
          siteId: "site-0",
          role: "Groundworker",
          start: DEMO_TODAY,
          finish: day(10),
          rate: 19,
          notes: "",
        },
      }),
    /Check the client/,
  );
});
