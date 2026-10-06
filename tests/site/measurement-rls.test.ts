import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("enquiry persistence is idempotent and restricted to authorised admin inbox reads/status writes", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create function public.seo_is_admin() returns boolean language sql stable as $$select current_setting('test.admin',true)='yes'$$;");
    await db.exec(await readFile("supabase/migrations/202610060006_site_enquiries.sql", "utf8"));
    const insert = "insert into site_enquiries(name,email,service,message,request_hash,idempotency_key) values('Test','test@example.org','other','A test enquiry message.',repeat('a',64),'10000000-0000-4000-8000-000000000001')";
    await db.exec("set role service_role"); await db.exec(insert); await assert.rejects(() => db.exec(insert));
    assert.equal((await db.query("select * from site_enquiries")).rows.length, 1);
    await db.exec("reset role;set role anon"); await assert.rejects(() => db.exec("select * from site_enquiries")); await assert.rejects(() => db.exec(insert));
    await db.exec("reset role;set role authenticated");
    assert.equal((await db.query("select * from site_enquiries")).rows.length, 0);
    await assert.rejects(() => db.exec(insert));
    await db.exec("select set_config('test.admin','yes',false)");
    assert.equal((await db.query("select * from site_enquiries")).rows.length, 1);
    await db.exec("update site_enquiries set status='reviewed'");
    await assert.rejects(() => db.exec("update site_enquiries set email='changed@example.com'"));
    await assert.rejects(() => db.exec("delete from site_enquiries"));
  } finally { await db.close(); }
});
