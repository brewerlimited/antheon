/** Usage: node --import tsx scripts/check-public-site.mjs --base http://localhost:3095 [--production] */
import { load } from 'cheerio';
import { serviceDocuments } from '../data/public-content.ts';
import { siteLinks } from '../data/site.ts';

const args = process.argv.slice(2);
const value = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const base = new URL(value('--base') || 'http://localhost:3095');
const production = args.includes('--production');
const canonicalOrigin = siteLinks.domain;
const findings = [];
const pages = new Map();
const links = [];
const primary = ['/', ...serviceDocuments.filter(doc => doc.status === 'published').map(doc => doc.path), '/contact', '/privacy'];
const expectedPrivate = path => /^\/(seo(?:\/|$)|client-preview(?:\/|$)|concepts\/|previews\/)/.test(path);
const check = (ok, area, detail) => findings.push({ result: ok ? 'pass' : 'fail', area, detail });
const internal = href => {
  try { const url = new URL(href, base); return (url.origin === base.origin || url.origin === canonicalOrigin) ? url : undefined; }
  catch { return undefined; }
};

async function request(path) {
  let url = new URL(path, base);
  const redirects = [];
  for (let hop = 0; hop < 6; hop++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(45000) });
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const destination = new URL(response.headers.get('location'), url);
      redirects.push({ from: url.pathname, status: response.status, to: destination.pathname });
      if (destination.origin !== base.origin) return { status: response.status, redirects, external: destination.href, headers: response.headers, text: '' };
      url = destination;
      continue;
    }
    return { status: response.status, redirects, url, headers: response.headers, text: await response.text() };
  }
  throw new Error(`Redirect loop or excessive chain at ${path}`);
}

async function inspect(path) {
  if (pages.has(path)) return;
  const result = await request(path);
  const $ = load(result.text);
  const title = $('title').first().text().trim();
  const description = $('meta[name="description"]').attr('content');
  const canonical = $('link[rel="canonical"]').attr('href');
  const noindex = /noindex/i.test(`${$('meta[name="robots"]').map((_, node) => $(node).attr('content')).get().join(',')} ${result.headers.get('x-robots-tag')}`);
  const indexable = primary.includes(path);
  check(result.status === 200, 'route', `${path} returns ${result.status}`);
  check(result.redirects.length === 0, 'redirects', `${path} has ${result.redirects.length} redirects`);
  check(!!title && !!description, 'metadata', `${path} has title and description`);
  check(!!canonical && new URL(canonical, base).href === new URL(path, canonicalOrigin).href, 'canonical', `${path}: ${canonical || 'missing'}`);
  if (indexable) {
    check($('h1').length === 1, 'headings', `${path}: ${$('h1').length} primary headings in HTML`);
    check(production ? !noindex : noindex, 'indexability', `${path} ${production ? 'production indexable' : 'preview noindex'}: ${noindex ? 'noindex' : 'index permitted'}`);
    check(!!$('meta[property="og:title"]').attr('content') && !!$('meta[property="og:image"]').attr('content'), 'social', `${path} has share metadata`);
  } else if (expectedPrivate(path)) check(noindex, 'private indexability', `${path} noindex`);
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      const data = JSON.parse($(node).html() || '');
      check(data['@context'] === 'https://schema.org', 'schema', `${path} valid JSON-LD context`);
      const graph = data['@graph'] || [data];
      for (const entity of graph) {
        check(!!entity['@type'], 'schema', `${path} has entity type`);
        if (entity['@id']) check(entity['@id'].startsWith(`${canonicalOrigin}/`), 'schema', `${path} canonical entity ID`);
        if (entity['@type'] === 'Service') check(!!entity.name && !!entity.provider && !!entity.url && !!entity.description, 'schema', `${path} Service fields`);
        if (entity['@type'] === 'BreadcrumbList') check(entity.itemListElement?.every((item, index) => item.position === index + 1 && item.name && item.item), 'schema', `${path} sequential breadcrumbs`);
      }
    } catch { check(false, 'schema', `${path} invalid JSON-LD`); }
  });
  if (path === '/' || serviceDocuments.some(document => document.path === path) || path === '/contact') check($('script[type="application/ld+json"]').length > 0, 'schema', `${path} includes expected structured data`);
  $('a[href]').each((_, node) => {
    const href = $(node).attr('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    const url = internal(new URL(href, new URL(path, base)).href);
    if (!url) return;
    if (/\.(pdf|zip|png|jpg|jpeg|webp|svg)$/i.test(url.pathname)) return;
    if (/^\/(api|seo|client-preview|previews)(\/|$)/.test(url.pathname)) return;
    links.push({ from: path, path: url.pathname, hash: url.hash });
  });
  pages.set(path, { $, title, description, canonical, result });
}

try {
  for (const path of primary) await inspect(path);
  for (const link of [...links]) {
    if (!pages.has(link.path) && pages.size < 60) await inspect(link.path);
  }
  for (const link of links) {
    const target = pages.get(link.path);
    if (!target) { check(false, 'link', `${link.from} → unchecked ${link.path}`); continue; }
    check(target.result.status === 200, 'link', `${link.from} → ${link.path}`);
    if (link.hash) {
      const id = decodeURIComponent(link.hash.slice(1));
      check(target.$('[id]').toArray().some(element => target.$(element).attr('id') === id), 'anchor', `${link.from} → ${link.path}${link.hash}`);
    }
  }
  const uniqueTitles = new Set(primary.map(path => pages.get(path)?.title));
  check(uniqueTitles.size === primary.length, 'metadata', 'Primary page titles are unique');
  for (const path of primary.filter(path => path !== '/')) check(links.some(link => link.path === path && link.from !== path), 'discovery', `${path} has an internal inbound link`);
  const sitemap = await request('/sitemap.xml');
  const xml = load(sitemap.text, { xmlMode: true });
  const locations = xml('loc').map((_, node) => xml(node).text()).get();
  check(sitemap.status === 200 && locations.length > 0, 'sitemap', 'Sitemap returns XML URLs');
  check(new Set(locations).size === locations.length, 'sitemap', 'No duplicate sitemap URLs');
  check(locations.every(url => url.startsWith(`${canonicalOrigin}/`) && primary.includes(new URL(url).pathname) && !expectedPrivate(new URL(url).pathname)), 'sitemap', 'Only canonical public pages in sitemap');
  check(primary.every(path => locations.includes(new URL(path, canonicalOrigin).href)), 'sitemap', 'All intended public routes included');
  const robots = await request('/robots.txt');
  check(robots.status === 200, 'robots', 'robots.txt returns 200');
  check(production ? robots.text.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`) && !/^Disallow: \/\s*$/m.test(robots.text) : /^Disallow: \/\s*$/m.test(robots.text), 'robots', production ? 'Public production crawl and canonical sitemap' : 'Preview disallows crawling');
  for (const [from, to] of [['/concepts/hs-flooring', '/concepts/surefix-interiors'], ['/previews/hs-flooring/index.html', '/previews/surefix-interiors/index.html']]) {
    const result = await request(from);
    check(result.redirects.length === 1 && [301, 308].includes(result.redirects[0].status) && result.redirects[0].to === to && result.status === 200, 'legacy redirects', `${from} → ${to} is a single permanent redirect`);
  }
  const missing = await request('/antheon-missing-page-check-7e1c');
  check(missing.status === 404, 'status', `Unknown route returns ${missing.status}`);
  const failures = findings.filter(finding => finding.result === 'fail');
  console.log(JSON.stringify({ base: base.origin, mode: production ? 'production rules' : 'preview rules', inspectedPages: pages.size, checks: findings.length, passed: findings.length - failures.length, failed: failures.length, failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} catch (error) {
  console.error(`Public-site check failed: ${error.message}`);
  process.exitCode = 1;
}
