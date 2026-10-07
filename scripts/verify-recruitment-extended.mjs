const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:3095";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
await fs.mkdir("work/recruitment-qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1512, height: 982 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
page.setDefaultTimeout(7000);
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = (s) => {
    checks.push(s);
    console.log("PASS", s);
  },
  dlg = () => page.locator("dialog[open]").last(),
  close = async () =>
    dlg().getByRole("button", { name: "Close panel", exact: true }).click(),
  nav = async (name) =>
    page
      .getByRole("navigation", { name: "Recruitment workspace" })
      .getByRole("button", { name, exact: true })
      .click(),
  state = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("antheon:recruitment-os:v1")),
    );
try {
  await page.goto(baseUrl + "/recruitment-os/demo");
  await page.getByRole("heading", { name: "Good morning, Alex." }).waitFor();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  assert.ok(await page.locator(".ro-collapsed").count());
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open notifications", exact: true })
    .click();
  await dlg()
    .getByRole("button", { name: "Mark all read", exact: true })
    .click();
  assert.match(await dlg().innerText(), /0 unread updates/);
  await close();
  check("Sidebar collapse and actionable notification read state");
  await page.keyboard.press("Meta+k");
  await dlg()
    .getByRole("combobox", { name: "Search workspace" })
    .fill("Jamie Clarke");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  for (const tab of [
    "Overview",
    "Placements",
    "Compliance",
    "Messages",
    "Notes",
    "Activity",
  ]) {
    await dlg().getByRole("tab", { name: tab, exact: true }).click();
  }
  await dlg().getByRole("tab", { name: "Overview", exact: true }).click();
  await dlg()
    .getByRole("button", { name: "Copy summary", exact: true })
    .click();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /Jamie Clarke/,
  );
  await dlg().getByRole("button", { name: "Call", exact: true }).click();
  await dlg()
    .getByRole("button", { name: "Log demo call", exact: true })
    .click();
  assert.ok(
    (await state()).activity.some((a) => a.title === "Demo call logged"),
  );
  check(
    "Palette keyboard navigation, six profile tabs, clipboard and demo calls",
  );
  await close();
  await nav("Candidates");
  await page.getByLabel("Search candidates").fill("Jamie Clarke");
  await page
    .locator(".ro-candidate-table thead")
    .getByRole("button", { name: "Candidate", exact: true })
    .click();
  await page.locator(".ro-columns-menu summary").click();
  await page
    .locator(".ro-columns-menu")
    .getByLabel("contact", { exact: true })
    .uncheck();
  assert.equal(
    await page
      .locator(".ro-candidate-table th")
      .filter({ hasText: "Last contact" })
      .count(),
    0,
  );
  await page.locator(".ro-columns-menu summary").click();
  await page
    .getByRole("checkbox", { name: "Select visible candidates" })
    .check();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export selected candidates" })
    .click();
  const download = await downloadPromise;
  await download.saveAs("work/recruitment-qa/candidates.csv");
  assert.match(
    await fs.readFile("work/recruitment-qa/candidates.csv", "utf8"),
    /Jamie Clarke/,
  );
  await page
    .getByRole("button", { name: "Assign recruiter", exact: true })
    .click();
  await dlg()
    .getByRole("button", { name: /Sophie King/ })
    .click();
  assert.equal((await state()).candidates[0].recruiterId, "sk");
  await page
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.locator(".ro-natural-search summary").click();
  await page
    .getByLabel("Find me people", { exact: true })
    .fill(
      "Groundworkers within 30 miles of Northampton available now with CSCS",
    );
  await page
    .getByRole("button", { name: "Apply filters", exact: false })
    .click();
  assert.match(
    await page.locator(".ro-main").innerText(),
    /38 matching candidates/,
  );
  check(
    "Sorting, columns, selection, CSV export, recruiter assignment and plain-English filters",
  );
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/candidates.png",
  });
  await nav("Jobs");
  for (const tab of ["Starting soon", "Filled", "Completed", "Open"])
    await page.getByRole("tab", { name: tab, exact: true }).click();
  await page.getByRole("button", { name: "JOB-184", exact: true }).click();
  await dlg()
    .getByRole("button", { name: /Required tickets/ })
    .click();
  await dlg().getByLabel("Search qualifications").fill("cpcs dum");
  await dlg().locator(".ro-ticket-options input").first().check();
  await dlg().getByRole("tab", { name: "Shortlist", exact: true }).click();
  const oldShortlist = (await state()).jobs[0].shortlist.length;
  await dlg()
    .getByRole("button", { name: "Remove", exact: true })
    .first()
    .click();
  assert.equal((await state()).jobs[0].shortlist.length, oldShortlist - 1);
  await dlg().getByRole("tab", { name: "Activity", exact: true }).click();
  assert.match(await dlg().innerText(), /Removed from shortlist/);
  check(
    "Job views, adjustable ticket requirements, shortlist removal and activity",
  );
  await close();
  await nav("Placements");
  for (const tab of ["Starting soon", "Ending soon", "Completed", "Current"])
    await page.getByRole("tab", { name: tab, exact: true }).click();
  await page.getByRole("tab", { name: "Ending soon", exact: true }).click();
  await page.getByLabel("Ending within").selectOption("7");
  assert.equal(await page.locator(".ro-table tbody tr").count(), 8);
  await page.locator(".ro-table tbody .ro-person-label").first().click();
  assert.match(await dlg().innerText(), /Current workforce/);
  await dlg().getByLabel("Client note").fill("Demo induction starts at 07:00.");
  await dlg().getByRole("button", { name: "Add note", exact: true }).click();
  assert.match(await dlg().innerText(), /Demo induction starts at 07:00/);
  await close();
  check("Placement date views and linked site drawer with notes");
  await nav("Clients & Sites");
  await page.getByRole("button", { name: /Horizon Civils/ }).click();
  assert.match(await dlg().innerText(), /Open requirements/);
  await dlg()
    .getByRole("button", { name: /Westgate Logistics Park/ })
    .click();
  assert.match(await dlg().innerText(), /Site contact/);
  await close();
  await close();
  await page.getByRole("tab", { name: "Sites", exact: true }).click();
  await page.getByLabel("Search clients and sites").fill("Oxford");
  assert.equal(await page.locator(".ro-entity-card").count(), 2);
  check("Client and site drawers retain navigation context");
  await nav("Compliance");
  for (const tab of [
    "Expired",
    "Missing",
    "Awaiting verification",
    "Expiring soon",
  ])
    await page.getByRole("tab", { name: tab, exact: true }).click();
  await page.getByLabel("Candidate", { exact: true }).fill("Jamie Clarke");
  await page
    .getByRole("button", { name: "Review ticket", exact: true })
    .first()
    .click();
  await dlg().getByLabel("Expiry", { exact: true }).fill("2027-10-07");
  await dlg()
    .getByRole("button", { name: "Save qualification", exact: true })
    .click();
  assert.match(
    await page.locator(".ro-main").innerText(),
    /Nothing needs attention/,
  );
  check("Compliance views and expiry edits immediately remove resolved issues");
  await nav("Messages");
  await page
    .getByLabel("Reply message")
    .fill("Thanks — your demo details are updated.");
  await page
    .getByRole("button", { name: "Simulate reply", exact: true })
    .click();
  assert.ok(
    (await state()).messages.some(
      (m) => m.text === "Thanks — your demo details are updated.",
    ),
  );
  await page.getByRole("tab", { name: "Templates", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit template", exact: true })
    .first()
    .click();
  await dlg()
    .getByLabel("Message", { exact: true })
    .fill("Hi {{firstName}}, demo vacancy ready to discuss.");
  await dlg()
    .getByRole("button", { name: "Save template", exact: true })
    .click();
  assert.ok(
    (await state()).templates.some((t) =>
      t.text.includes("demo vacancy ready"),
    ),
  );
  await page.getByRole("tab", { name: "Broadcasts", exact: true }).click();
  await page
    .locator(".ro-table .ro-person-label")
    .filter({ hasText: "Groundworkers · Northampton" })
    .click();
  await dlg()
    .locator(".ro-response-filters")
    .getByRole("button", { name: /Interested/ })
    .click();
  assert.equal(await dlg().locator(".ro-person-row").count(), 8);
  check("Inbox reply, template editing and response filters");
  await close();
  await nav("Overview");
  await page
    .getByRole("button", { name: "Take the 60 second tour", exact: true })
    .click();
  for (let i = 0; i < 6; i++)
    await page
      .locator(".ro-tour")
      .getByRole("button", { name: "Next", exact: false })
      .click();
  await page
    .locator(".ro-tour")
    .getByRole("button", { name: "Continue exploring", exact: false })
    .click();
  assert.equal(await page.locator(".ro-tour").count(), 0);
  check("Optional six-step tour and clean exit");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await nav("Overview");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/mobile-overview.png",
  });
  await page
    .locator(".ro-metrics")
    .getByRole("button", { name: /Available now/ })
    .click();
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/mobile-candidates.png",
  });
  assert.ok(await page.locator(".ro-candidate-table").boundingBox());
  await page.locator(".ro-candidate-table .ro-person").first().click();
  assert.equal(Math.round((await dlg().boundingBox()).width), 390);
  await dlg().getByRole("tab", { name: "Compliance", exact: true }).click();
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/mobile-profile.png",
  });
  await close();
  await page
    .getByRole("button", { name: "Availability board", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Change status for Jamie Clarke",
      exact: true,
    })
    .click();
  await dlg().getByLabel("New status").selectOption("not-looking");
  await dlg().getByLabel("Review status in").selectOption("60");
  await dlg()
    .getByRole("button", { name: "Confirm status", exact: true })
    .click();
  assert.equal((await state()).candidates[0].status, "not-looking");
  check(
    "Mobile navigation, adapted candidate list, full-screen profile and status-menu alternative",
  );
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await nav("Jobs");
  await page.getByRole("button", { name: "JOB-184", exact: true }).click();
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/mobile-job.png",
  });
  assert.equal(
    await dlg().evaluate((el) => el.scrollWidth > el.clientWidth),
    false,
  );
  await close();
  check("Mobile job matching without page overflow");
  await page.setViewportSize({ width: 834, height: 1112 });
  await nav("Overview");
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/tablet-overview.png",
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  check("Tablet workspace layout");
  await page.goto(baseUrl + "/recruitment-os");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/mobile-landing.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page
    .locator(".rp-preview-filters")
    .getByRole("button", { name: /Groundworker/ })
    .click();
  await page
    .locator(".rp-preview-filters")
    .getByRole("button", { name: /Northampton/ })
    .click();
  await page
    .locator(".rp-preview-filters")
    .getByRole("button", { name: /CSCS/ })
    .click();
  assert.match(
    await page.locator(".rp-preview-workspace > header").innerText(),
    /38/,
  );
  await page
    .getByRole("button", { name: "Select five →", exact: true })
    .click();
  await page.getByRole("button", { name: "Message 5 →", exact: true }).click();
  assert.ok(
    await page
      .getByRole("button", { name: "✓ Demo audience ready", exact: true })
      .isVisible(),
  );
  await page.getByRole("link", { name: /LAUNCH INTERACTIVE DEMO/ }).click();
  await page.getByRole("heading", { name: "Good morning, Alex." }).waitFor();
  check(
    "Responsive product landing, real interactive fragment and launch link",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  check("No browser exceptions across extended and mobile interactions");
  await fs.writeFile(
    "work/recruitment-qa/extended-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
} catch (e) {
  console.error(e);
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/extended-failure.png",
  });
  await fs.writeFile(
    "work/recruitment-qa/extended-failure.txt",
    await page.locator("body").innerText(),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
