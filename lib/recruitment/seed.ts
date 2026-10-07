import type {
  Activity,
  Broadcast,
  Candidate,
  Client,
  DemoData,
  Job,
  Placement,
  Site,
} from "./types";
import {
  blankFilters,
  day,
  DEMO_TODAY,
  payTypes,
  recruiters,
  sources,
  towns,
  trades,
} from "./catalogue";
import { constructionTickets } from "./constructionTickets";
const firstNames =
  "Jamie Connor Jack Daniel Ryan Ben Oliver Harry Charlie George Thomas James William Oscar Henry Leo Alfie Joshua Freddie Archie Ethan Isaac Mason Joseph Samuel Lucas Alex Max Adam Nathan Lewis Liam Jacob Aaron Dylan Owen Callum Luke Tyler Reece Sophie Hannah Ella Grace Zoe Ruby Mia Emma Charlotte Olivia Amelia Lucy Bethany Chloe Isla Erin Holly Megan Katie Leah".split(
    " ",
  );
const surnames =
  "Clarke Wilson Thompson Carter Foster Mitchell Wright Walker Cooper Turner Harris Edwards Collins Stewart Morris Rogers Reed Cook Morgan Bell Bailey Richardson Cox Howard Ward Hughes Price Bennett Wood Barnes Ross Russell Brooks Gray Watson Palmer Hunt Mills West Cole Knight Ellis Harrison Freeman Pearson Hayes Shaw Fletcher Gibson Webb Powell Marsh Saunders Dixon Spencer Porter Lawrence Chapman Reynolds Walsh Gibson Stone Woods James Watts Hart Grant Jenkins Curtis Murray Fisher Holmes Hunt Stevens Fox Mason Davidson Elliott Roberts Taylor".split(
    " ",
  );
const clientNames = [
  "Horizon Civils",
  "Redwood Construction",
  "Greenline Construction",
  "Northbank Projects",
  "Meridian Build",
  "Atlas Infrastructure",
  "Oakfield Developments",
  "Bridgewell Contractors",
  "Cedar Works",
  "Westmere Construction",
  "Eastline Rail",
  "Fieldstone Projects",
  "Summit Groundworks",
  "Larch Construction",
  "Foundry Developments",
  "Crownway Civils",
  "Pioneer Siteworks",
  "Ashford Frameworks",
  "Clearspan Projects",
  "Ridgeway Contractors",
];
const siteNames = [
  "Westgate Logistics Park",
  "Campbell Park Residences",
  "Bedford Distribution Centre",
  "Riverside Energy Hub",
  "Kettering Business Quarter",
  "Rugby Gateway",
  "Southbank Exchange",
  "Digbeth Foundry",
  "Manchester Civic Quarter",
  "Leeds Station Works",
  "Oxford Science Campus",
  "Cambridge Innovation Park",
  "Coventry Rail Depot",
  "Nottingham Riverside",
  "Leicester North Development",
  "Sheffield Medical Campus",
  "Bristol Harbour Works",
  "Reading Business Park",
  "Derby Infrastructure Hub",
  "Luton Freight Centre",
  "Westgate Phase Two",
  "Northampton Central Living",
  "Eastfield School",
  "Willowbrook Housing",
  "Silverstone Service Centre",
  "Towcester Community Hub",
  "London Rail Interchange",
  "Birmingham Logistics",
  "Manchester North Works",
  "Leeds Waterside",
  "Oxford West Campus",
  "Cambridge South Quarter",
];
export function createSeed(): DemoData {
  const clients: Client[] = clientNames.map((name, i) => ({
    id: `client-${i}`,
    name,
    contact: `${firstNames[(i + 30) % firstNames.length]} ${surnames[i + 12]}`,
    email: `projects.${i + 1}@example.com`,
    phone: `03069 990${String(i).padStart(3, "0")}`,
    notes:
      "Fictional construction partner. Site inductions are arranged with the named project contact. Demo records only.",
  }));
  const sites: Site[] = siteNames.map((name, i) => {
    const town = towns[i % towns.length];
    return {
      id: `site-${i}`,
      clientId: `client-${i % 20}`,
      name,
      town: town.name,
      postcode: town.postcode,
      contact: `${firstNames[(i + 19) % firstNames.length]} ${surnames[i + 3]}`,
      start: day(-120 - i * 3),
      finish: day(90 + i * 5),
      notes:
        "Site arrival 07:00. Demo induction: safety boots, high-vis and hard hat. Confirm the actual job requirements with the recruiter.",
    };
  });
  sites[30] = { ...sites[30], clientId: "client-2" };
  const candidates: Candidate[] = Array.from({ length: 2486 }, (_, i) => {
    const core = i < 38,
      town = towns[core ? i % 6 : i % towns.length];
    const status =
      i < 318
        ? "available"
        : i < 1455
          ? "working"
          : i < 1731
            ? "open"
            : i < 2148
              ? "unknown"
              : "not-looking";
    const trade = core ? "Groundworker" : trades[1 + (i % 31)].name;
    const name =
      i === 0
        ? "Jamie Clarke"
        : i === 2
          ? "Jack Thompson"
          : i === 50
            ? "Lewis Carter"
            : i === 318
              ? "Sam Wilson"
              : i === 430
                ? "Ryan Foster"
                : `${firstNames[i % firstNames.length]} ${surnames[(Math.floor(i / firstNames.length) + i * 7) % surnames.length]}`;
    const qualifications = [
      {
        id: `q-${i}-0`,
        typeId: "cscs",
        number: `DEMO-CS-${10000 + i}`,
        issued: day(-480),
        expiry: core
          ? day(120 + i * 3)
          : i % 23 === 0
            ? day(-1 - (i % 20))
            : day(10 + (i % 600)),
        verified: core || i % 13 !== 0,
        document: "Demo CSCS record.pdf",
      },
      ...(core || i % 3 === 0
        ? [
            {
              id: `q-${i}-1`,
              typeId: "cpcs-a09",
              number: `DEMO-CP-${20000 + i}`,
              issued: day(-700),
              expiry: day(i === 0 ? 14 : 180 + (i % 300)),
              verified: true,
              document: "Demo plant competency.pdf",
            },
          ]
        : []),
      ...(i % 2 === 0
        ? [
            {
              id: `q-${i}-2`,
              typeId:
                constructionTickets[
                  10 + (i % (constructionTickets.length - 10))
                ].id,
              number: `DEMO-TK-${30000 + i}`,
              issued: day(-300),
              expiry: day(i % 17 === 0 ? -7 : 45 + (i % 500)),
              verified: i % 11 !== 0,
            },
          ]
        : []),
    ];
    return {
      id: `candidate-${i}`,
      name,
      trade: i === 50 ? "360 Operator" : trade,
      secondary: core
        ? ["Dumper Driver"]
        : i % 3 === 0
          ? ["General Operative"]
          : [],
      town: town.name,
      postcode: town.postcode,
      phone:
        i > 40 && i % 53 === 0
          ? "Not recorded"
          : `07700 900${String(i % 1000).padStart(3, "0")}`,
      email: `worker.${i + 1}@example.com`,
      status,
      availableFrom:
        status === "available"
          ? DEMO_TODAY
          : status === "working"
            ? day(14 + (i % 70))
            : status === "open"
              ? day(i % 10)
              : "",
      radius: 30 + (i % 4) * 10,
      rate: core ? 19.5 : 15 + (i % 17),
      payType: payTypes[i % 3],
      experience: core ? 5 + (i % 12) : 1 + (i % 23),
      recruiterId: recruiters[i % 4].id,
      source: sources[i % sources.length],
      preference: i % 3 === 0 ? "SMS" : i % 3 === 1 ? "WhatsApp" : "Email",
      doNotContact: i > 40 && i % 47 === 0,
      lastContact: day(core ? -(1 + (i % 12)) : -(i % 150)),
      statusConfirmed:
        status === "unknown"
          ? day(-91 - (i % 90))
          : day(i < 17 ? 0 : -1 - (i % 45)),
      qualifications,
      created: day(-300 - (i % 500)),
    };
  });
  const jobs: Job[] = Array.from({ length: 24 }, (_, i) => ({
    id: `job-${i}`,
    reference: `JOB-${184 + i}`,
    trade: i === 0 ? "Groundworker" : trades[1 + (i % 31)].name,
    clientId: sites[i].clientId,
    siteId: sites[i].id,
    required: i === 0 ? 6 : 4 + (i % 5),
    start: day(i === 0 ? 5 : (i % 8) - 3),
    finish: day(45 + i * 3),
    rate: i === 0 ? 19.5 : 17 + (i % 14),
    payType: payTypes[i % 3],
    hours: 9,
    tickets: ["cscs"],
    desirable: i % 2 === 0 ? ["cpcs-a09"] : [],
    description:
      i === 0
        ? "Groundworkers for drainage, kerbing and external works at Westgate. Two operatives with dumper experience preferred. Ongoing project; confirm scope and induction before placement."
        : "Experienced operatives needed for a fictional commercial construction project. Reliable attendance, relevant experience and site induction required.",
    recruiterId: recruiters[i % 4].id,
    urgency: i === 0 ? "Urgent" : i % 5 === 0 ? "Priority" : "Normal",
    status: i === 23 ? "completed" : "open",
    shortlist: i === 0 ? ["candidate-39", "candidate-42"] : [],
  }));
  jobs[20] = {
    ...jobs[20],
    trade: "Groundworker",
    clientId: "client-2",
    siteId: "site-30",
    required: 2,
  };
  const placements: Placement[] = Array.from({ length: 100 }, (_, i) => {
    const job = jobs[1 + (i % 22)],
      finish = i < 94 ? day(i < 8 ? i % 7 : 8 + (i % 7)) : day(35 + i);
    const c = candidates[318 + i];
    c.trade = job.trade;
    c.availableFrom = finish;
    return {
      id: `PL-${192 + i}`,
      candidateId: c.id,
      jobId: job.id,
      clientId: job.clientId,
      siteId: job.siteId,
      role: job.trade,
      start: day(-20 - i),
      finish,
      rate: job.rate,
      notes: "Demo placement. Finish date awaiting final site confirmation.",
      status: "current",
    };
  });
  for (let i = 0; i < 16; i++) {
    const site = sites[(i + 1) % sites.length];
    placements.push({
      id: `PL-${100 + i}`,
      candidateId: `candidate-${i}`,
      clientId: site.clientId,
      siteId: site.id,
      role: candidates[i].trade,
      start: day(-130 - i * 4),
      finish: day(-20 - i),
      actualFinish: day(-20 - i),
      rate: 18.5,
      notes:
        "Completed demo assignment. Reliable attendance and positive site feedback (fictional).",
      status: "completed",
    });
  }
  for (let i = 0; i < 4; i++)
    placements.push({
      id: `PL-${300 + i}`,
      candidateId: `candidate-${100 + i}`,
      clientId: jobs[0].clientId,
      siteId: jobs[0].siteId,
      jobId: jobs[0].id,
      role: "Groundworker",
      start: jobs[0].start,
      finish: jobs[0].finish,
      rate: 19.5,
      notes:
        "Confirmed demo booking for Monday. Available for short assignments before then.",
      status: "upcoming",
    });
  const broadcasts: Broadcast[] = [
    {
      id: "broadcast-seed",
      title: "Groundworkers · Northampton",
      jobId: "job-0",
      channel: "SMS",
      template:
        "Hi {{firstName}}, a {{role}} role in {{location}} starts {{startDate}} at {{rate}}. Interested?",
      kind: "job",
      created: day(-1) + "T09:42:00Z",
      simulated: true,
      recipients: candidates.slice(0, 23).map((c, i) => ({
        candidateId: c.id,
        delivery: i < 21 ? "delivered" : "pending",
        response:
          i < 8
            ? "Interested"
            : i < 12
              ? "Not interested"
              : i < 14
                ? "Call me"
                : "No response",
        preview: `Hi ${c.name.split(" ")[0]}, Groundworker role in Northampton, 12 Oct, £19.50/hr. This is a simulated demo message.`,
      })),
    },
  ];
  for (let n = 1; n <= 5; n++) {
    const people = candidates
      .slice(70 + n * 40, 110 + n * 40)
      .filter((c) => !c.doNotContact && c.phone !== "Not recorded");
    broadcasts.push({
      id: `broadcast-history-${n}`,
      title: `Placement check-in · ${towns[n].name}`,
      channel: "SMS",
      template:
        "Hi {{firstName}}, please confirm your next start details with your recruiter.",
      kind: "general",
      created: day(-n - 2) + "T09:15:00Z",
      simulated: true,
      recipients: people.map((c, i) => ({
        candidateId: c.id,
        delivery: "delivered",
        response: i % 3 === 0 ? "Call me" : "No response",
        preview: `Hi ${c.name.split(" ")[0]}, please confirm your next start details with your recruiter. Demo message only.`,
      })),
    });
  }
  const activity: Activity[] = Array.from({ length: 260 }, (_, i) => ({
    id: `activity-seed-${i}`,
    candidateId: `candidate-${i % 318}`,
    title:
      i % 3 === 0
        ? "Availability confirmed"
        : i % 3 === 1
          ? "Candidate note added"
          : "Qualification reviewed",
    detail: `${candidates[i % 318].name} · ${i % 3 === 0 ? "Available for the next requirement" : i % 3 === 1 ? "Recruiter spoke about preferred travel radius" : "Demo record checked by Alex Morgan"}`,
    created:
      day(-Math.floor(i / 20)) +
      `T${String(16 - (i % 8)).padStart(2, "0")}:15:00Z`,
    read: i > 5,
  }));
  activity.unshift(
    {
      id: "activity-web",
      candidateId: "candidate-50",
      title: "New website registration",
      detail:
        "Lewis Carter · 360 Operator · Bedford. Review the candidate record.",
      created: DEMO_TODAY + "T09:42:00Z",
      read: false,
    },
    {
      id: "activity-enquiry",
      jobId: "job-20",
      title: "New job enquiry",
      detail:
        "Greenline Construction · 2 Groundworkers · Oxford. Demonstration enquiry ready to review.",
      created: DEMO_TODAY + "T09:36:00Z",
      read: false,
    },
  );
  candidates[50].town = "Bedford";
  candidates[50].postcode = "MK40 1AA";
  candidates[50].source = "Website registration";
  candidates[430].qualifications[0].expiry = day(-1);
  candidates[2450].qualifications = [];
  return {
    version: 1,
    sequence: 400,
    candidates,
    clients,
    sites,
    jobs,
    placements,
    broadcasts,
    messages: broadcasts.flatMap((b) =>
      b.recipients.flatMap((r, i) => [
        {
          id: `msg-out-${b.id}-${i}`,
          candidateId: r.candidateId,
          broadcastId: b.id,
          direction: "out" as const,
          text: r.preview,
          created: b.created,
          channel: b.channel,
        },
        ...(r.response !== "No response"
          ? [
              {
                id: `msg-in-${b.id}-${i}`,
                candidateId: r.candidateId,
                broadcastId: b.id,
                direction: "in" as const,
                text: r.response,
                created: DEMO_TODAY + "T09:20:00Z",
                channel: b.channel,
              },
            ]
          : []),
      ]),
    ),
    notes: candidates.slice(0, 110).map((c, i) => ({
      id: `note-${i}`,
      candidateId: c.id,
      text:
        i === 0
          ? "Prefers civils and drainage. Comfortable with dumper work. Happy to travel around Northampton and Milton Keynes."
          : "Demo recruiter note: confirm start time, site contact and availability before making a placement.",
      created: day(-i % 25) + "T10:00:00Z",
      author: "Alex Morgan",
    })),
    activity,
    savedViews: [
      {
        id: "available",
        name: "Available now",
        filters: { ...blankFilters, availability: "available" },
      },
      {
        id: "finishing",
        name: "Finishing soon",
        filters: { ...blankFilters, availability: "finish14" },
      },
      {
        id: "unknown",
        name: "Status unknown",
        filters: { ...blankFilters, availability: "unknown" },
      },
      {
        id: "midlands",
        name: "Groundworkers / Midlands",
        filters: {
          ...blankFilters,
          trade: "Groundworker",
          town: "Northampton",
          radius: "60",
        },
      },
      {
        id: "expiry",
        name: "Expiring tickets",
        filters: { ...blankFilters, expiry: "30" },
      },
      {
        id: "stale",
        name: "Not contacted 90+ days",
        filters: { ...blankFilters, lastContact: "90" },
      },
    ],
    templates: [
      {
        id: "new-job",
        name: "New Job",
        text: "Hi {{firstName}}, we've got a {{role}} position available in {{location}} starting {{startDate}} at {{rate}}. Interested? Reply YES, NO THANKS or CALL ME.",
      },
      {
        id: "availability",
        name: "Availability Check",
        text: "Hi {{firstName}}, we're updating our records. What's your current work situation? Reply WORKING, AVAILABLE NOW, OPEN TO WORK or NOT LOOKING.",
      },
      {
        id: "ending",
        name: "Placement Ending",
        text: "Hi {{firstName}}, your placement is finishing soon. Are you available for a new role? Reply YES or CALL ME.",
      },
      {
        id: "renewal",
        name: "Ticket Expiry",
        text: "Hi {{firstName}}, one of your qualifications needs a review. Please confirm your renewal details with your recruiter.",
      },
      {
        id: "interview",
        name: "Interview Reminder",
        text: "Hi {{firstName}}, a quick reminder to confirm the details of your upcoming conversation with your recruiter.",
      },
      { id: "custom", name: "Custom", text: "Hi {{firstName}}, " },
    ],
  };
}
