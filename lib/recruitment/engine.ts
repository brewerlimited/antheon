import type { Activity, Command, DemoData } from "./types";
import { day, DEMO_TODAY, statusLabels } from "./catalogue";
import { audience, renderMessage } from "./selectors";
export interface Mutation {
  data: DemoData;
  message: string;
}
export function applyCommand(previous: DemoData, command: Command): Mutation {
  const data: DemoData = { ...previous, sequence: previous.sequence + 1 };
  const stamp = new Date(
    Date.parse(DEMO_TODAY + "T10:00:00Z") + data.sequence * 1000,
  ).toISOString();
  let count = 0;
  const id = (prefix: string) => `${prefix}-${data.sequence}-${count++}`;
  const log = (title: string, detail: string, refs: Partial<Activity> = {}) => {
    data.activity = [
      {
        id: id("activity"),
        created: stamp,
        read: false,
        title,
        detail,
        ...refs,
      },
      ...data.activity,
    ].slice(0, 3000);
  };
  const result = (message: string) => ({ data, message });
  if (command.type === "candidate") {
    const c = command.candidate;
    if (
      !c.name.trim() ||
      !c.trade ||
      !c.town ||
      c.experience < 0 ||
      c.radius < 0 ||
      c.rate < 0
    )
      throw new Error(
        "Add a name, trade and town; use valid experience, travel and rate values.",
      );
    if (c.phone && !/^07700\s?900\d{3}$/.test(c.phone))
      throw new Error("Use a fictional demo mobile: 07700 900000–900999.");
    if (c.email && !/^[^@\s]+@example\.(com|org|net)$/.test(c.email))
      throw new Error(
        "Use an example.com, example.org or example.net email in this public demo.",
      );
    if (command.edit && !previous.candidates.some((p) => p.id === c.id))
      throw new Error("This candidate is no longer available.");
    if (!command.edit && previous.candidates.some((p) => p.id === c.id))
      throw new Error("Candidate already exists.");
    if (
      c.qualifications.some(
        (q) =>
          (q.typeId === "custom" && !q.customName?.trim()) ||
          (q.expiry && q.issued && q.expiry < q.issued),
      )
    )
      throw new Error(
        "Add each custom qualification’s name and check the ticket dates.",
      );
    const saved = {
      ...c,
      status:
        c.status === "available" && c.availableFrom > DEMO_TODAY
          ? ("open" as const)
          : c.status,
    };
    data.candidates = command.edit
      ? data.candidates.map((p) =>
          p.id === c.id
            ? {
                ...saved,
                status:
                  p.status === "available" && saved.availableFrom > DEMO_TODAY
                    ? "open"
                    : p.status,
              }
            : p,
        )
      : [saved, ...data.candidates];
    log(
      command.edit ? "Candidate updated" : "Candidate created",
      `${c.name} · ${c.trade} · ${c.town}`,
      { candidateId: c.id },
    );
    return result(
      command.edit ? "Candidate updated" : "Candidate added to your workforce",
    );
  }
  if (command.type === "status") {
    const targets = new Set(command.ids),
      changed = data.candidates.filter((c) => targets.has(c.id));
    if (!changed.length) throw new Error("Choose a candidate first.");
    const input = command.placement;
    if (command.status === "working") {
      if (changed.length !== 1 || !input)
        throw new Error("Create a placement for one worker at a time.");
      const site = data.sites.find((s) => s.id === input.siteId);
      if (
        !site ||
        site.clientId !== input.clientId ||
        !input.role ||
        !input.start ||
        !input.finish ||
        input.finish < input.start ||
        input.rate < 0
      )
        throw new Error("Check the client, site, role, dates and rate.");
      if (
        data.placements.some(
          (p) => targets.has(p.candidateId) && p.status !== "completed",
        )
      )
        throw new Error(
          "End the current booking before creating another placement.",
        );
      const linked = input.jobId
        ? data.jobs.find((j) => j.id === input.jobId)
        : undefined;
      if (
        input.jobId &&
        (!linked ||
          linked.clientId !== input.clientId ||
          linked.siteId !== input.siteId ||
          linked.status !== "open")
      )
        throw new Error(
          "The placement must use the linked open job’s client and site.",
        );
      if (
        linked &&
        data.placements.filter(
          (p) => p.jobId === linked.id && p.status !== "completed",
        ).length >= linked.required
      )
        throw new Error(
          "This job is already filled. Choose another requirement.",
        );
      const upcoming = input.start > DEMO_TODAY;
      data.placements = [
        {
          ...input,
          id: id("PL"),
          candidateId: changed[0].id,
          status: upcoming ? "upcoming" : "current",
        },
        ...data.placements,
      ];
      data.candidates = data.candidates.map((c) =>
        targets.has(c.id)
          ? {
              ...c,
              status: upcoming ? c.status : "working",
              availableFrom: upcoming ? c.availableFrom : input.finish,
              statusConfirmed: DEMO_TODAY,
            }
          : c,
      );
      log(
        upcoming ? "Placement booked" : "Placement started",
        `${changed[0].name} · ${site.name}`,
        { candidateId: changed[0].id, jobId: input.jobId },
      );
      return result(
        upcoming
          ? "Future placement booked"
          : "Placement created · worker marked working",
      );
    }
    const live = data.placements.filter(
      (p) => targets.has(p.candidateId) && p.status === "current",
    );
    if (live.length) {
      if (
        !command.finish ||
        command.finish > DEMO_TODAY ||
        live.some((p) => command.finish! < p.start)
      )
        throw new Error(
          "Choose an actual finish date between placement start and the demo date.",
        );
      data.placements = data.placements.map((p) =>
        targets.has(p.candidateId) && p.status === "current"
          ? { ...p, status: "completed", actualFinish: command.finish }
          : p,
      );
      for (const p of live)
        log(
          "Placement completed",
          `${p.id} · actual finish ${command.finish}`,
          { candidateId: p.candidateId, jobId: p.jobId },
        );
    }
    data.candidates = data.candidates.map((c) =>
      targets.has(c.id)
        ? {
            ...c,
            status:
              command.status === "available" &&
              command.availableFrom &&
              command.availableFrom > DEMO_TODAY
                ? "open"
                : command.status,
            availableFrom:
              command.availableFrom ??
              (command.status === "available" ? DEMO_TODAY : c.availableFrom),
            reviewDate: command.reviewDate,
            statusConfirmed: DEMO_TODAY,
          }
        : c,
    );
    for (const c of changed)
      log(
        "Availability updated",
        `${c.name}: ${statusLabels[c.status]} → ${statusLabels[command.status]}`,
        { candidateId: c.id },
      );
    return result(
      `${changed.length === 1 ? changed[0].name : changed.length + " workers"} · ${statusLabels[command.status]}`,
    );
  }
  if (command.type === "recruiter") {
    const ids = new Set(command.ids);
    data.candidates = data.candidates.map((c) =>
      ids.has(c.id) ? { ...c, recruiterId: command.recruiterId } : c,
    );
    log(
      "Recruiter assigned",
      `${ids.size} candidates assigned to ${command.recruiterId.toUpperCase()}`,
    );
    return result("Recruiter assignment updated");
  }
  if (command.type === "qualification") {
    const q = command.qualification;
    if (
      !q.typeId ||
      (q.typeId === "custom" && !q.customName?.trim()) ||
      (q.issued && q.expiry && q.expiry < q.issued)
    )
      throw new Error(
        "Choose a qualification and check its issue/expiry dates.",
      );
    data.candidates = data.candidates.map((c) =>
      c.id === command.candidateId
        ? {
            ...c,
            qualifications: [
              ...c.qualifications.filter((t) => t.id !== q.id),
              q,
            ],
          }
        : c,
    );
    log("Qualification updated", "Ticket details saved in this browser only.", {
      candidateId: command.candidateId,
    });
    return result("Qualification saved");
  }
  if (command.type === "note") {
    if (!command.text.trim()) throw new Error("Write a note first.");
    data.notes = [
      {
        id: id("note"),
        candidateId: command.candidateId,
        clientId: command.clientId,
        text: command.text.trim().slice(0, 3000),
        author: "Alex Morgan",
        created: stamp,
      },
      ...data.notes,
    ];
    log("Note added", command.text.trim().slice(0, 120), {
      candidateId: command.candidateId,
    });
    return result("Note added");
  }
  if (command.type === "job") {
    const j = command.job,
      site = data.sites.find((s) => s.id === j.siteId);
    if (
      !site ||
      site.clientId !== j.clientId ||
      !j.trade ||
      j.required < 1 ||
      j.required > 100 ||
      j.finish < j.start ||
      j.rate <= 0 ||
      !j.start
    )
      throw new Error(
        "Check the job details, linked site, headcount and dates.",
      );
    data.jobs = [j, ...data.jobs.filter((p) => p.id !== j.id)];
    log("Job saved", `${j.reference} · ${j.required} ${j.trade}`, {
      jobId: j.id,
    });
    return result("Job ready · find your candidates");
  }
  if (command.type === "shortlist") {
    const job = data.jobs.find((j) => j.id === command.jobId);
    if (!job) throw new Error("Choose an existing job.");
    const ids = command.ids.filter((id) =>
      data.candidates.some((c) => c.id === id),
    );
    data.jobs = data.jobs.map((j) =>
      j.id === job.id
        ? {
            ...j,
            shortlist: command.remove
              ? j.shortlist.filter((i) => !ids.includes(i))
              : [...new Set([...j.shortlist, ...ids])],
          }
        : j,
    );
    for (const cid of ids)
      log(
        command.remove ? "Removed from shortlist" : "Added to shortlist",
        job.reference,
        { candidateId: cid, jobId: job.id },
      );
    return result(
      command.remove
        ? "Shortlist updated"
        : `${ids.length} candidates added to shortlist`,
    );
  }
  if (command.type === "broadcast") {
    const candidates = audience(
      data,
      command.ids,
      command.channel,
      false,
    ).included;
    if (!candidates.length || !command.template.trim())
      throw new Error(
        "Choose at least one contactable recipient and write a message.",
      );
    const job = data.jobs.find((j) => j.id === command.jobId),
      bid = id("broadcast");
    const recipients = candidates.map((c) => ({
      candidateId: c.id,
      delivery: "pending" as const,
      response: "No response" as const,
      preview: renderMessage(command.template, c, job, data),
    }));
    data.broadcasts = [
      {
        id: bid,
        title: command.title || "Workforce update",
        kind: command.kind,
        jobId: job?.id,
        channel: command.channel,
        template: command.template,
        created: stamp,
        recipients,
        simulated: false,
      },
      ...data.broadcasts,
    ];
    data.messages = [
      ...recipients.map((r) => ({
        id: id("message"),
        candidateId: r.candidateId,
        broadcastId: bid,
        direction: "out" as const,
        text: r.preview,
        created: stamp,
        channel: command.channel,
      })),
      ...data.messages,
    ];
    const includedIds = new Set(candidates.map((c) => c.id));
    data.candidates = data.candidates.map((c) =>
      includedIds.has(c.id) ? { ...c, lastContact: DEMO_TODAY } : c,
    );
    for (const c of candidates)
      log("Demo message queued", `${command.channel} · ${command.title}`, {
        candidateId: c.id,
        jobId: job?.id,
        broadcastId: bid,
      });
    return result(`${recipients.length} demo messages queued`);
  }
  if (command.type === "simulate") {
    const b = data.broadcasts.find((b) => b.id === command.broadcastId);
    if (!b || b.simulated)
      throw new Error("Responses have already been simulated.");
    const delivered = Math.max(1, Math.round(b.recipients.length * 0.91));
    const recipients = b.recipients.map((r, i) => {
      const availability = b.kind === "availability";
      const response =
        i >= delivered
          ? "No response"
          : availability
            ? i < 11
              ? "Available now"
              : i < 19
                ? "Working"
                : i < 23
                  ? "Open to work"
                  : i < 25
                    ? "Not looking"
                    : "No response"
            : i < Math.round(delivered * 0.38)
              ? "Interested"
              : i < Math.round(delivered * 0.57)
                ? "Not interested"
                : i < Math.round(delivered * 0.67)
                  ? "Call me"
                  : "No response";
      return {
        ...r,
        delivery: i < delivered ? ("delivered" as const) : ("pending" as const),
        response,
      };
    });
    data.broadcasts = data.broadcasts.map((item) =>
      item.id === b.id
        ? {
            ...item,
            simulated: true,
            recipients: recipients as typeof item.recipients,
          }
        : item,
    );
    const responseMap = new Map(
      recipients
        .filter((r) => r.response !== "No response")
        .map((r) => [r.candidateId, r.response]),
    );
    if (b.kind === "availability")
      data.candidates = data.candidates.map((c) => {
        const response = responseMap.get(c.id);
        if (!response) return c;
        const status =
          response === "Available now"
            ? "available"
            : response === "Working"
              ? "working"
              : response === "Open to work"
                ? "open"
                : "not-looking"; // Never silently finish a managed placement from a simulated self-report.
        if (
          data.placements.some(
            (p) => p.candidateId === c.id && p.status === "current",
          )
        )
          return c;
        return {
          ...c,
          status,
          statusConfirmed: DEMO_TODAY,
          availableFrom:
            status === "available"
              ? DEMO_TODAY
              : status === "open"
                ? day(7)
                : c.availableFrom,
        };
      });
    for (const [cid, response] of responseMap) {
      log("Simulated reply received", response, {
        candidateId: cid,
        jobId: b.jobId,
        broadcastId: b.id,
      });
      data.messages = [
        {
          id: id("message"),
          candidateId: cid,
          broadcastId: b.id,
          direction: "in",
          text: response,
          created: stamp,
          channel: b.channel,
        },
        ...data.messages,
      ];
    }
    return result(
      `${responseMap.size} simulated replies received${b.kind === "availability" ? " · availability updated" : ""}`,
    );
  }
  if (command.type === "save-view") {
    if (!command.name.trim()) throw new Error("Give your view a name.");
    data.savedViews = [
      ...data.savedViews,
      {
        id: id("view"),
        name: command.name.trim().slice(0, 50),
        filters: { ...command.filters },
      },
    ];
    return result("View saved");
  }
  if (command.type === "delete-view") {
    data.savedViews = data.savedViews.filter((v) => v.id !== command.id);
    return result("View removed");
  }
  if (command.type === "template") {
    if (!command.template.name.trim() || !command.template.text.trim())
      throw new Error("Add a template name and message.");
    data.templates = [
      ...data.templates.filter((t) => t.id !== command.template.id),
      command.template,
    ];
    return result("Template saved");
  }
  if (command.type === "read-notifications") {
    data.activity = data.activity.map((a) => ({ ...a, read: true }));
    return result("Notifications marked as read");
  }
  if (command.type === "call") {
    log("Demo call logged", "Call simulation only. No phone call was placed.", {
      candidateId: command.candidateId,
    });
    return result("Demo call logged · no real call placed");
  }
  return result("Updated");
}
