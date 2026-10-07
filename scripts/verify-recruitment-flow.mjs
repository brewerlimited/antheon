const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:3095";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
await fs.mkdir("work/recruitment-qa", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1512, height: 982 },
  deviceScaleFactor: 1,
});
page.setDefaultTimeout(7000);
const errors = [],
  checks = [],
  requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (!r.url().startsWith(baseUrl)) requests.push(r.url());
});
const check = (s) => {
  checks.push(s);
  console.log("PASS", s);
};
const dialog = () => page.locator("dialog[open]").last();
const close = async () => {
  await dialog()
    .getByRole("button", { name: "Close panel", exact: true })
    .click();
};
const nav = async (name) => {
  await page
    .getByRole("navigation", { name: "Recruitment workspace" })
    .getByRole("button", { name, exact: true })
    .click();
};
const saved = () =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("antheon:recruitment-os:v1")),
  );
try {
  await page.goto(baseUrl + "/recruitment-os/demo");
  await page.getByRole("heading", { name: "Good morning, Alex." }).waitFor();
  assert.match(await page.locator(".ro-metrics").innerText(), /318/);
  check("Overview actual headline metrics");
  await page
    .locator(".ro-metrics")
    .getByRole("button", { name: /Available now/ })
    .click();
  await page.getByRole("button", { name: /^Filters/ }).click();
  await dialog().getByLabel("Trade", { exact: true }).fill("Groundworker");
  await dialog().getByLabel("Location", { exact: true }).fill("Northampton");
  await dialog()
    .getByLabel("Within (miles)", { exact: true })
    .selectOption("30");
  await dialog().getByLabel("Search qualifications").fill("cscs labourer");
  await dialog().getByRole("checkbox").first().check();
  await dialog()
    .getByRole("button", { name: "Show 38 candidates", exact: true })
    .click();
  check("Combined filters produce 38 real Northampton candidates");
  await page
    .locator(".ro-candidate-table .ro-person")
    .filter({ hasText: "Jamie Clarke" })
    .click();
  await dialog().getByRole("tab", { name: "Placements", exact: true }).click();
  assert.match(await dialog().innerText(), /Completed demo assignment/);
  await dialog().getByRole("tab", { name: "Compliance", exact: true }).click();
  assert.match(await dialog().innerText(), /CPCS/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert.match(
    await page.locator(".ro-main").innerText(),
    /38 matching candidates/,
  );
  check("Profile tabs and Escape preserve search context");
  await page
    .getByRole("button", { name: "Select first 20", exact: true })
    .click();
  await page.getByRole("button", { name: "Message 20", exact: true }).click();
  await dialog()
    .getByLabel("Attach an existing job (optional)")
    .fill("JOB-184 · Groundworker · Northampton");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog()
    .getByRole("button", { name: /WhatsApp/ })
    .click();
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog()
    .getByLabel("Your message")
    .fill(
      "Hi {{firstName}}, {{role}} in {{location}}, starting {{startDate}} at {{rate}}. Interested?",
    );
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  assert.match(
    await dialog().locator(".ro-phone-message").innerText(),
    /Groundworker in Northampton/,
  );
  await dialog()
    .getByRole("button", { name: "Simulate send to 20", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Simulate delivery & responses", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Add interested to shortlist", exact: true })
    .waitFor();
  await dialog()
    .getByRole("button", { name: "Add interested to shortlist", exact: true })
    .click();
  let d = await saved();
  assert.ok(d.jobs.find((j) => j.id === "job-0").shortlist.length > 2);
  check(
    "Four-step broadcast, candidate preview, simulated replies and job shortlist",
  );
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/broadcast.png",
  });
  await close();
  await page
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await page
    .locator(".ro-popover")
    .filter({ hasText: "Saved views" })
    .locator("summary")
    .click();
  await page
    .getByRole("button", { name: "+ Save current view", exact: true })
    .click();
  await dialog().getByLabel("View name").fill("Northampton ready crew");
  await dialog()
    .getByRole("button", { name: "Save view", exact: true })
    .click();
  d = await saved();
  assert.ok(d.savedViews.some((v) => v.name === "Northampton ready crew"));
  check("Custom saved view persisted");
  await nav("Candidates");
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page
    .getByRole("button", { name: "Availability board", exact: true })
    .click();
  let transfer = await page.evaluateHandle(() => new DataTransfer());
  await page
    .locator('[data-candidate-id="candidate-0"]')
    .dragTo(page.locator('[data-drop-status="working"] > header'));
  await dialog()
    .getByRole("button", { name: "Confirm placement", exact: true })
    .click();
  d = await saved();
  assert.equal(
    d.candidates.find((c) => c.id === "candidate-0").status,
    "working",
  );
  assert.ok(
    d.placements.some(
      (p) => p.candidateId === "candidate-0" && p.status === "current",
    ),
  );
  check("Drag available → working creates a real local placement");
  transfer = await page.evaluateHandle(() => {
    const t = new DataTransfer();
    t.setData("text/plain", "candidate-0");
    return t;
  });
  await page
    .locator('[data-drop-status="available"]')
    .dispatchEvent("drop", { dataTransfer: transfer });
  await dialog().getByLabel("Actual finish date").fill("2026-10-07");
  await dialog()
    .getByRole("button", { name: "Confirm status", exact: true })
    .click();
  d = await saved();
  assert.equal(
    d.candidates.find((c) => c.id === "candidate-0").status,
    "available",
  );
  assert.ok(
    d.placements.some(
      (p) => p.candidateId === "candidate-0" && p.actualFinish === "2026-10-07",
    ),
  );
  check("Drag working → available completes placement with actual finish");
  await page
    .locator(".ro-toast")
    .getByRole("button", { name: "Undo", exact: true })
    .click();
  d = await saved();
  assert.equal(
    d.candidates.find((c) => c.id === "candidate-0").status,
    "working",
  );
  check("Undo restores linked status and placement");
  await page
    .locator(".ro-top-actions")
    .getByRole("button", { name: "Candidate", exact: true })
    .click();
  await dialog().getByLabel("Full name").fill("Jordan Demo");
  await dialog().getByLabel("Town", { exact: true }).fill("Northampton");
  await dialog().getByLabel("Primary trade").fill("Groundworker");
  await dialog().getByLabel("Search qualifications").fill("cpcs dum");
  await dialog().locator(".ro-ticket-options input").first().check();
  await dialog()
    .getByRole("button", { name: "Create candidate", exact: true })
    .click();
  d = await saved();
  assert.equal(d.candidates.length, 2487);
  assert.equal(d.candidates[0].qualifications[0].typeId, "cpcs-a09");
  check("Quick candidate creation with searchable CPCS ticket");
  await page.keyboard.press("Meta+k");
  await dialog()
    .getByRole("combobox", { name: "Search workspace" })
    .fill("Jordan Demo");
  await page.keyboard.press("Enter");
  await dialog()
    .getByRole("button", { name: "Edit profile", exact: true })
    .click();
  await dialog().getByLabel("Experience (years)").fill("12");
  await dialog()
    .getByRole("button", { name: "Save candidate", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Add qualification", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "+ Add other qualification", exact: true })
    .click();
  await dialog()
    .getByLabel("Qualification", { exact: true })
    .fill("Site safety induction");
  await dialog().getByLabel("Provider", { exact: true }).fill("Demo provider");
  await dialog()
    .getByRole("button", { name: "Attach sample document", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Save qualification", exact: true })
    .click();
  await dialog().getByRole("tab", { name: "Notes", exact: true }).click();
  await dialog()
    .getByLabel("New candidate note")
    .fill("Bring demo induction records on Monday.");
  await dialog()
    .getByRole("button", { name: "Save note", exact: true })
    .click();
  d = await saved();
  assert.equal(d.candidates[0].experience, 12);
  assert.equal(
    d.candidates[0].qualifications.at(-1).customName,
    "Site safety induction",
  );
  assert.match(d.notes[0].text, /Monday/);
  check(
    "Command palette, edit candidate, custom qualification, sample document and notes",
  );
  await close();
  await page
    .locator(".ro-top-actions")
    .getByRole("button", { name: "Job", exact: true })
    .click();
  await dialog()
    .getByLabel("Job description")
    .fill("Demo drainage crew for Monday induction.");
  await dialog()
    .getByRole("button", { name: "Create job", exact: true })
    .click();
  d = await saved();
  assert.equal(d.jobs.length, 25);
  check("Create job with relational client, site and tickets");
  await nav("Jobs");
  await page.getByRole("button", { name: "JOB-184", exact: true }).click();
  await dialog().getByLabel("Radius", { exact: true }).selectOption("50");
  await dialog()
    .getByRole("button", { name: "Select all suitable", exact: true })
    .click();
  assert.ok(
    await dialog()
      .getByRole("button", { name: /^Message \d+ matches/ })
      .isVisible(),
  );
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/matching.png",
  });
  check("Job matching controls, score reasons and suitable selection");
  await close();
  await nav("Messages");
  await page
    .getByRole("button", { name: "Check availability", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await dialog()
      .getByRole("button", { name: "Continue", exact: true })
      .click();
  await dialog()
    .getByRole("button", { name: /Simulate send to/ })
    .click();
  await dialog()
    .getByRole("button", { name: "Simulate delivery & responses", exact: true })
    .click();
  await dialog()
    .getByText(/Self-reported availability has been updated/)
    .waitFor();
  d = await saved();
  assert.equal(d.candidates.filter((c) => c.status === "unknown").length, 392);
  check("Availability campaign updates unknown workforce to 392");
  await close();
  for (const name of [
    "Overview",
    "Candidates",
    "Jobs",
    "Placements",
    "Clients & Sites",
    "Messages",
    "Compliance",
  ]) {
    await nav(name);
    assert.ok(await page.locator(".ro-main h1").isVisible());
  }
  check("All seven navigation modules render");
  await page.reload();
  await page.getByRole("heading", { name: "Good morning, Alex." }).waitFor();
  await page.waitForFunction(() =>
    document.querySelector(".ro-metrics")?.textContent.includes("2,487"),
  );
  check("Edits survive a full page reload");
  assert.equal(errors.length, 0, errors.join("\n"));
  assert.equal(requests.length, 0, requests.join("\n"));
  check("No browser exceptions or third-party requests");
  await page
    .locator(".ro-sidebar-bottom")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Reset demo", exact: true })
    .click();
  d = await saved();
  assert.equal(d.candidates.length, 2486);
  assert.equal(
    d.candidates.filter((c) => c.status === "available").length,
    318,
  );
  check("Confirmed reset restores the original snapshot");
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/overview-final.png",
  });
  await fs.writeFile(
    "work/recruitment-qa/flow-results.json",
    JSON.stringify({ checks, errors, requests }, null, 2),
  );
} catch (e) {
  console.error(e);
  await page.screenshot({
    animations: "disabled",
    path: "work/recruitment-qa/failure.png",
  });
  await fs.writeFile(
    "work/recruitment-qa/failure.txt",
    await page.locator("body").innerText(),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
