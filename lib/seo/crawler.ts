import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';
import { load } from 'cheerio';
export function publicAddress(address: string) {
  try { let ip = ipaddr.parse(address); if (ip.kind() === 'ipv6' && (ip as ipaddr.IPv6).isIPv4MappedAddress()) ip = (ip as ipaddr.IPv6).toIPv4Address(); return ip.range() === 'unicast'; } catch { return false; }
}
export function auditUrl(value: string) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port)) || /(^localhost$|\.localhost$|\.local$|\.internal$)/i.test(url.hostname)) throw new Error('unsafe_url');
  url.hash = ''; return url;
}
export type SafeResponse = { url: string; status: number; headers: http.IncomingHttpHeaders; body: string; redirects: string[]; redirectStatuses?: number[]; elapsed: number };
export async function safeFetch(input: string, options: { maxBytes?: number; maxRedirects?: number; allowedOrigins?: string[] } = {}): Promise<SafeResponse> {
  let url = auditUrl(input); const redirects: string[] = [], redirectStatuses: number[] = [], started = Date.now();
  for (let hop = 0; hop <= (options.maxRedirects ?? 5); hop++) {
    if (options.allowedOrigins && !options.allowedOrigins.includes(url.origin)) throw new Error('external_redirect');
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = await Promise.race([lookup(hostname, { all: true, verbatim: true }), new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error('dns_timeout')), 5000); timer.unref(); })]);
    if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error('unsafe_address');
    const address = addresses[0];
    // Pin the verified address to this socket; do not re-resolve between validation and connection.
    const result = await new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
      const request = (url.protocol === 'https:' ? https : http).request(url, {
        method: 'GET', headers: { 'User-Agent': 'AntheonSEO/1.0 (+https://www.antheon.co.uk)', Accept: 'text/html,application/xml,text/plain', 'Accept-Encoding': 'identity' },
        lookup: (_host, options, callback) => options.all ? callback(null, [address]) : callback(null, address.address, address.family),
      }, response => {
        const chunks: Buffer[] = []; let bytes = 0;
        response.on('data', (chunk: Buffer) => { bytes += chunk.length; if (bytes > (options.maxBytes ?? 2 * 1024 * 1024)) { response.destroy(); reject(new Error('response_too_large')); } else chunks.push(chunk); });
        response.on('error', reject); response.on('end', () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') }));
      });
      const deadline = setTimeout(() => request.destroy(new Error('request_timeout')), 10000);
      request.on('close', () => clearTimeout(deadline)); request.on('error', reject); request.end();
    });
    if ([301, 302, 303, 307, 308].includes(result.status) && result.headers.location) { redirects.push(url.href); redirectStatuses.push(result.status); url = auditUrl(new URL(result.headers.location, url).href); continue; }
    return { ...result, url: url.href, redirects, redirectStatuses, elapsed: Date.now() - started };
  }
  throw new Error('redirect_limit');
}
export function robotsRules(body: string) {
  const groups: { agents: string[]; rules: { path: string; allow: boolean }[]; delay: number }[] = []; let group = { agents: [] as string[], rules: [] as { path: string; allow: boolean }[], delay: 0 }, started = false;
  for (const raw of body.split('\n')) {
    const line = raw.replace(/#.*/, '').trim(); const split = line.indexOf(':'); if (split < 0) continue;
    const key = line.slice(0, split).toLowerCase().trim(), value = line.slice(split + 1).trim();
    if (key === 'user-agent') { if (started) { groups.push(group); group = { agents: [], rules: [], delay: 0 }; started = false; } group.agents.push(value.toLowerCase()); }
    else if (key === 'allow' || key === 'disallow') { started = true; if (value) group.rules.push({ path: value, allow: key === 'allow' }); }
    else if (key === 'crawl-delay') { started = true; group.delay = Number(value) || 0; }
  }
  groups.push(group);
  const specific = groups.filter(g => g.agents.some(a => a !== '*' && 'antheonseo'.includes(a))), selected = specific.length ? specific : groups.filter(g => g.agents.includes('*'));
  const rules = selected.flatMap(g => g.rules);
  return { delay: Math.max(1, ...selected.map(g => g.delay)), allows(path: string) {
    const matches = rules.filter(r => { const pattern = r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replace(/\\\$$/, '$'); return new RegExp('^' + pattern).test(path); }).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
    return matches[0]?.allow ?? true;
  } };
}
export type AuditPage = { url: string; title: string; description: string; canonical: string; status_code: number; indexable: boolean; data: { h1: number; links: string[]; missingAlt: number; schema: boolean; responseMs: number; redirects: string[]; source: string } };
export type Finding = { fingerprint: string; title: string; severity: 'critical' | 'warning' | 'opportunity' | 'passed'; explanation: string; recommendation: string; urls: string[] };
export function inspectHtml(response: SafeResponse, source = 'link'): { page: AuditPage; issues: Finding[] } {
  const $ = load(response.body), url = new URL(response.url), title = $('title').first().text().trim(), description = $('meta[name="description" i]').attr('content') ?? '', canonicalRaw = $('link[rel="canonical" i]').attr('href');
  let canonical = ''; try { if (canonicalRaw) canonical = new URL(canonicalRaw, url).href; } catch { /* Invalid canonical is reported below. */ }
  const robots = ($('meta[name="robots" i]').attr('content') ?? '') + ',' + String(response.headers['x-robots-tag'] ?? '');
  const noindex = /\b(noindex|none)\b/i.test(robots), links = [...new Set($('a[href]').map((_, a) => { try { const target = new URL($(a).attr('href')!, url); target.hash = ''; return target.origin === url.origin && !/\.(pdf|png|jpg|jpeg|svg|webp|zip|mp4)$/i.test(target.pathname) ? target.href : ''; } catch { return ''; } }).get().filter(Boolean))].slice(0, 300);
  const missingAlt = $('img:not([alt])').length, issues: Finding[] = [];
  const issue = (key: string, title: string, severity: Finding['severity'], explanation: string, recommendation: string) => issues.push({ fingerprint: key + ':' + url.href, title, severity, explanation, recommendation, urls: [url.href] });
  if (response.status >= 400) issue('http', `Page returns HTTP ${response.status}`, response.status >= 500 ? 'critical' : 'warning', 'This URL does not serve a successful response.', 'Restore the page, correct internal links or redirect to a relevant replacement.');
  if (!title) issue('title', 'Page title is missing', 'warning', 'A useful title helps users and search engines understand the page.', 'Add a descriptive, distinct title reflecting the page’s purpose.');
  if (title.length > 65 || (title.length > 0 && title.length < 15)) issue('title-length', 'Review the page title length', 'opportunity', 'This title is unusually short or long. Character counts are editorial hints, not Google limits.', 'Check clarity and likely truncation; prioritise meaning over a fixed character target.');
  if (!description) issue('description', 'Meta description is missing', 'opportunity', 'Google may choose its own snippet; a useful description can communicate the page’s value.', 'Write an accurate, distinctive summary.');
  if ($('h1').length !== 1) issue('h1', $('h1').length ? 'Review multiple main headings' : 'Main heading is missing', 'warning', 'A clear heading structure helps readers understand the page.', 'Ensure there is a clear main heading and logical document structure.');
  const levels = $('h1,h2,h3,h4,h5,h6').map((_, h) => Number(h.tagName.slice(1))).get();
  if (levels.some((level, i) => i > 0 && level > levels[i - 1] + 1)) issue('headings', 'Heading levels skip a step', 'opportunity', 'The document outline may be harder to follow with assistive technology.', 'Review the heading hierarchy in context.');
  if (noindex) issue('noindex', 'Page requests no indexing', 'warning', 'A robots directive asks search engines not to index this page. This may be intentional.', 'Confirm intent; remove only if this page should be searchable.');
  if (!canonical) issue('canonical', 'Canonical URL is missing or invalid', 'opportunity', 'A canonical can clarify the preferred URL where duplicates exist.', 'Add an appropriate self-referencing or preferred canonical.');
  else if (canonical !== url.href) issue('canonical-other', 'Canonical points to a different URL', 'warning', 'This can be intentional, but the preferred URL should match the indexing strategy.', 'Confirm the destination serves the same intended content.');
  if (response.redirects.length > 1) issue('redirect-chain', 'Redirect chain detected', 'warning', `This request followed ${response.redirects.length} redirects.`, 'Point the source directly to the final intended destination.');
  if (missingAlt) issue('alt', `${missingAlt} images have no alt attribute`, 'opportunity', 'Meaningful images need an equivalent description; decorative images can use an empty alt attribute.', 'Review the images in context and add appropriate alt attributes.');
  if (!$('meta[name="viewport" i]').length) issue('viewport', 'Mobile viewport is missing', 'warning', 'Mobile browsers may render a desktop-width layout.', 'Add a responsive viewport declaration and test the page.');
  if (url.protocol !== 'https:') issue('https', 'Page is not using HTTPS', 'critical', 'The connection is not encrypted.', 'Enable HTTPS and redirect HTTP traffic appropriately.');
  if (!$('script[type="application/ld+json"], [itemscope]').length) issue('schema', 'No structured data detected in HTML', 'opportunity', 'Structured data may help describe eligible content. This check does not validate rich-result eligibility.', 'Consider relevant, accurate structured data where it adds value.');
  if (response.elapsed > 2000) issue('response-time', 'Server response took more than two seconds', 'opportunity', 'A single server-side request is slow; this is not a Core Web Vitals measurement.', 'Confirm with repeated field and lab testing before diagnosing the cause.');
  return { page: { url: url.href, title, description, canonical, status_code: response.status, indexable: response.status === 200 && !noindex, data: { h1: $('h1').length, links, missingAlt, schema: !!$('script[type="application/ld+json"], [itemscope]').length, responseMs: response.elapsed, redirects: response.redirects, source } }, issues };
}
export async function crawlSite(input: string, limit = 20) {
  const origin = auditUrl(input).origin, started = Date.now(), pages: AuditPage[] = [], issues: Finding[] = [], seen = new Set<string>(), queue = [{ url: input, source: 'homepage' }], sitemapUrls = new Set<string>();
  const origins = [origin]; let robotsText = '', sitemapFound = false;
  try { const robots = await safeFetch(origin + '/robots.txt', { maxBytes: 256000, allowedOrigins: origins }); if (robots.status >= 500 || robots.status === 429 || robots.status === 401 || robots.status === 403) return { pages, issues, partial: true, reason: 'Robots rules could not be safely retrieved. Crawl stopped.', sitemapFound }; if (robots.status === 200) robotsText = robots.body; else issues.push({ fingerprint: 'robots', title: 'robots.txt was not found', severity: 'opportunity', explanation: 'No robots file was available. Its absence alone does not block indexing.', recommendation: 'Consider publishing a clear robots file with the sitemap location.', urls: [origin + '/robots.txt'] }); } catch { return { pages, issues, partial: true, reason: 'Robots request failed. Crawl stopped.', sitemapFound }; }
  const robots = robotsRules(robotsText);
  if (robots.delay > 5) return { pages, issues, partial: true, reason: 'The site requests a crawl delay above this short audit’s budget. Use a longer scheduled crawler.', sitemapFound };
  const sitemap = robotsText.match(/^sitemap:\s*(\S+)/im)?.[1] ?? origin + '/sitemap.xml';
  try { const site = auditUrl(sitemap); if (site.origin === origin && robots.allows(site.pathname)) { await new Promise(r => setTimeout(r, robots.delay * 1000)); const result = await safeFetch(site.href, { allowedOrigins: origins }); if (result.status === 200) { const $ = load(result.body, { xmlMode: true }); sitemapFound = true; $('url > loc').slice(0, 100).each((_, el) => { try { const u = auditUrl($(el).text()); if (u.origin === origin) { sitemapUrls.add(u.href); queue.push({ url: u.href, source: 'sitemap' }); } } catch { /* Non-HTTP sitemap entry ignored. */ } }); } } } catch { /* Report missing sitemap below. */ }
  if (!sitemapFound) issues.push({ fingerprint: 'sitemap', title: 'Sitemap was not found at the checked location', severity: 'warning', explanation: 'The declared or default sitemap could not be loaded.', recommendation: 'Check the sitemap URL and include it in robots.txt.', urls: [sitemap] });
  let blocked = 0;
  while (queue.length && pages.length < Math.min(limit, 25) && Date.now() - started < 65000) {
    const entry = queue.shift()!; if (seen.has(entry.url)) continue; seen.add(entry.url);
    const url = auditUrl(entry.url); if (!robots.allows(url.pathname + url.search)) { blocked++; continue; }
    await new Promise(r => setTimeout(r, robots.delay * 1000));
    try {
      const result = await safeFetch(url.href, { allowedOrigins: origins });
      if (result.status === 429 || result.status === 503) { queue.unshift(entry); break; }
      if (result.headers['content-encoding'] && result.headers['content-encoding'] !== 'identity') { blocked++; continue; }
      const parsed = inspectHtml(result, entry.source); pages.push(parsed.page); issues.push(...parsed.issues);
      for (const link of parsed.page.data.links) if (!seen.has(link) && queue.length < 100) queue.push({ url: link, source: 'link' });
    } catch { issues.push({ fingerprint: 'request:' + entry.url, title: 'Page could not be checked', severity: 'warning', explanation: 'The request failed, exceeded the limit or redirected outside the audit origin.', recommendation: 'Review this URL manually. A failed audit request is not proof that the public page is broken.', urls: [entry.url] }); }
  }
  for (const field of ['title', 'description'] as const) { const groups = new Map<string, string[]>(); for (const p of pages) if (p[field]) groups.set(p[field], [...groups.get(p[field]) ?? [], p.url]); for (const [value, urls] of groups) if (urls.length > 1) issues.push({ fingerprint: `duplicate-${field}:${value.slice(0, 100)}`, title: `Duplicate ${field} on ${urls.length} checked pages`, severity: 'opportunity', explanation: 'Some checked pages share the same metadata.', recommendation: 'Confirm page intent and make metadata distinctive where appropriate.', urls }); }
  const linked = new Set(pages.flatMap(p => p.data.links));
  const possibleOrphans = pages.filter(p => sitemapUrls.has(p.url) && !linked.has(p.url) && p.url !== input).map(p => p.url);
  if (possibleOrphans.length) issues.push({ fingerprint: 'possible-orphans', title: 'Sitemap pages not linked in this crawl sample', severity: 'opportunity', explanation: 'This bounded sample did not find incoming links. It does not prove these pages are orphaned across the whole site.', recommendation: 'Review internal linking with a complete crawl before making changes.', urls: possibleOrphans });
  return { pages, issues, partial: queue.length > 0 || blocked > 0, reason: 'HTML-only, same-origin sample. JavaScript-rendered content, sitemap indexes and image file sizes require a deeper audit. Indexability is not proof of Google indexing.', sitemapFound };
}
