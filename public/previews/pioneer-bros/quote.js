import { siteData } from './data.js';
import { buildingSVG, buildingIcon } from './illustrations.js';

const BUILDINGS = [
  { id: 'house', name: 'House', note: 'A home, extension or renovation' },
  { id: 'commercial', name: 'Commercial', note: 'Offices, retail and public buildings' },
  { id: 'development', name: 'Development', note: 'New builds and multiple properties' },
  { id: 'industrial', name: 'Industrial', note: 'Facilities, plant and infrastructure' },
  { id: 'other', name: 'Something else', note: 'Tell us what you have in mind' },
];
const HOUSE_ACCESS = ['Front', 'Rear', 'Left', 'Right'];
const COMMERCIAL_ACCESS = ['Full elevation', 'Access tower', 'Temporary roof', 'Perimeter', 'Internal access', 'Stair tower', 'Bird cage scaffold', 'Loading bay', 'Hoist access', 'Staging', 'Technical scaffold', 'Other'];
const WORKS = ['Roofing', 'Chimney works', 'Brickwork', 'Rendering', 'Painting', 'Windows', 'Solar', 'Extension', 'Cladding', 'New build', 'Maintenance', 'Other'];
const RECOMMENDATIONS = {
  Roofing: ['Roof-level working platform', 'Access route', 'Edge protection'],
  'Chimney works': ['Chimney access platform', 'Roof-level access', 'Edge protection'],
  Brickwork: ['Working lifts at the façade', 'Material access', 'Edge protection'],
  Rendering: ['Clear façade access', 'Working platforms', 'Debris containment'],
  Painting: ['Façade working platforms', 'Access route', 'Surface protection'],
  Windows: ['Access to window openings', 'Working platforms', 'Edge protection'],
  Solar: ['Roof-level access', 'Edge protection', 'Material access'],
  Extension: ['Access around the extension', 'Working lifts', 'Edge protection'],
  Cladding: ['Façade access', 'Working platforms', 'Material access'],
  'New build': ['Phased working lifts', 'Perimeter access', 'Loading provision'],
  Maintenance: ['Access to the work area', 'Working platform', 'Safe access route'],
  Other: ['A discussion of your access needs', 'A site-specific proposal'],
};
const STEPS = ['Building', 'Access', 'Work', 'Files', 'Details'];
const MAX_FILES = 10;
const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif|pdf|docx)$/i;
const ACCEPTED_FILES = '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,.docx';
const ARROW = '';
const CLOSE = '<svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initialState = () => ({
  step: 0, mode: 'homeowner', building: '', access: [], accessUnsure: false, works: [], files: [],
  details: { name: '', company: '', postcode: '', phone: '', email: '', preferred: '', scope: '', projectType: '', requiredDate: '', tenderDeadline: '', programme: '', timing: '', notes: '' },
  errors: {}, fileErrors: [], sending: false, sent: false, downloaded: false, resetConfirm: false,
});

/** Replace siteData.submissionEndpoint with your own same-origin enquiry endpoint.
 * The endpoint receives JSON in `enquiry` and one `files` part per file.
 * Configure server-side validation, malware scanning, storage and delivery there.
 * No enquiry is sent and no success is fabricated when no endpoint is configured.
 */
export async function submitEnquiry(payload, files = []) {
  if (!siteData.submissionEndpoint) return { submitted: false, reason: 'not-configured' };
  const form = new FormData();
  form.append('enquiry', JSON.stringify(payload));
  files.forEach(file => form.append('files', file, file.name));
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(siteData.submissionEndpoint, { method: 'POST', body: form, signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('We could not send your enquiry. Your details are still here. Please try again or download your brief.');
    const result = await response.json().catch(() => ({}));
    return { submitted: true, reference: typeof result.reference === 'string' ? result.reference : null };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The connection took too long. Your details are still here. Try again or download your brief.');
    if (error instanceof TypeError) throw new Error('We could not connect. Your details are still here. Check your connection or download your brief.');
    throw error;
  } finally { window.clearTimeout(timeout); }
}

/** A mailto only opens a draft in the visitor's email app. It does not send mail
 * or transfer files. Keep the URI short for email-client compatibility; the
 * downloadable enquiry remains the complete record, including file names.
 */
export function createEmailDraft(enquiry, email = siteData.email) {
  const short = (value, length = 120) => Array.from(String(value || '').trim()).slice(0, length).join('');
  const contact = enquiry.contact || {};
  const project = enquiry.project || {};
  const subject = `Scaffolding enquiry — ${short(contact.postcode, 12)}`;
  const base = `mailto:${encodeURIComponent(email || '')}?subject=${encodeURIComponent(subject)}&body=`;
  const lines = [
    'Hello Pioneer Bros,', '',
    'Please review my scaffolding enquiry.',
    'Photos and drawings must be attached manually before sending. The downloaded brief contains my full details.', '',
    `Name: ${short(contact.name)}`,
    `Postcode: ${short(contact.postcode, 12)}`,
    ...(contact.phone ? [`Phone: ${short(contact.phone, 40)}`] : []),
    ...(contact.email ? [`Email: ${short(contact.email, 120)}`] : []),
    `Building: ${short(enquiry.buildingLabel, 40)}`,
    `Access: ${short((enquiry.access || []).join(', '), 150)}`,
    `Works: ${short((enquiry.works || []).join(', '), 150)}`,
    `Files selected: ${(enquiry.files || []).length} (attach the originals)`,
  ];
  const optional = [
    project.company && `Company: ${short(project.company, 100)}`,
    project.scope && `Scope: ${short(project.scope, 100)}`,
    project.timing && `Timing: ${short(project.timing, 40)}`,
    project.requiredDate && `Required date: ${short(project.requiredDate, 20)}`,
    project.tenderDeadline && `Tender deadline: ${short(project.tenderDeadline, 20)}`,
    project.programme && `Programme: ${short(project.programme, 120)}`,
    contact.preferred && `Preferred contact: ${short(contact.preferred, 30)}`,
    project.notes && `Notes: ${short(project.notes, 200)}`,
  ].filter(Boolean);
  for (const line of optional) {
    if ((base + encodeURIComponent([...lines, line].join('\n'))).length <= 1900) lines.push(line);
  }
  return base + encodeURIComponent(lines.join('\n'));
}

export function initQuoteBuilder() {
  if (document.getElementById('quote-dialog')) return;
  let state = initialState();
  let lastFocus = null;
  let previousBodyOverflow = '';
  let advanceTimer;
  let fileAnnouncement = '';
  const dialog = document.createElement('dialog');
  dialog.id = 'quote-dialog';
  dialog.className = 'q-dialog';
  dialog.setAttribute('aria-labelledby', 'q-dialog-title');
  document.body.append(dialog);

  const buildingName = () => BUILDINGS.find(item => item.id === state.building)?.name || 'Your project';
  const isHouse = () => state.building === 'house';
  const recommendations = () => [...new Set(state.works.flatMap(work => RECOMMENDATIONS[work] || RECOMMENDATIONS.Other))].slice(0, 5);
  const selectedAccess = () => state.accessUnsure ? ['Please advise on access'] : state.access;
  const totalSize = () => state.files.reduce((sum, file) => sum + file.size, 0);
  const readableSize = size => size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
  const titleFor = () => ['Tell us about\nyour project.', 'Where do you\nneed access?', 'What have you\ngot planned?', state.mode === 'contractor' ? 'A little more\nproject detail.' : 'Help us picture\nyour project.', 'Let’s put a\nname to the project.', 'Your brief\nis ready.'][state.step];

  function payload() {
    return {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      company: siteData.name,
      customerType: state.mode,
      building: state.building,
      buildingLabel: buildingName(),
      access: selectedAccess(),
      works: [...state.works],
      indicativeAccess: recommendations(),
      disclaimer: 'These are enquiry preferences, not an engineered scaffold design, price or confirmed booking. All access is subject to assessment.',
      contact: { name: state.details.name.trim(), postcode: state.details.postcode.trim().toUpperCase(), phone: state.details.phone.trim(), email: state.details.email.trim(), preferred: state.details.preferred || 'No preference' },
      project: { timing: state.details.timing, notes: state.details.notes.trim(), ...(state.mode === 'contractor' ? { company: state.details.company.trim(), projectType: state.details.projectType, scope: state.details.scope, requiredDate: state.details.requiredDate, tenderDeadline: state.details.tenderDeadline, programme: state.details.programme.trim() } : {}) },
      files: state.files.map(file => ({ name: file.name, type: file.type, size: file.size, lastModified: file.lastModified })),
    };
  }

  function saveBrief(format = 'txt') {
    const data = payload();
    const d = data.contact;
    const p = data.project;
    const lines = [
      `${siteData.name.toUpperCase()} — PROJECT ENQUIRY`,
      `Created: ${new Date(data.createdAt).toLocaleString('en-GB')}`, '',
      state.sent ? 'Copy of your submitted project enquiry.' : 'Prepared project enquiry. This brief has not been sent automatically. Email it to the Pioneer Bros team with your supporting files.',
      '', `CUSTOMER: ${state.mode === 'contractor' ? 'Contractor / commercial' : 'Homeowner'}`, `BUILDING: ${data.buildingLabel}`,
      `ACCESS: ${data.access.join(', ')}`, `WORKS: ${data.works.join(', ')}`, '', 'CONTACT',
      `Name: ${d.name}`, `Postcode: ${d.postcode}`, `Phone: ${d.phone || 'Not provided'}`, `Email: ${d.email || 'Not provided'}`, `Preferred contact: ${d.preferred}`, '', 'PROJECT',
      ...Object.entries(p).filter(([, v]) => v).map(([key, value]) => `${({ timing: 'Timing', notes: 'Notes', company: 'Company', projectType: 'Project type', scope: 'Scope', requiredDate: 'Required date', tenderDeadline: 'Tender deadline', programme: 'Programme / requirement' })[key]}: ${value}`),
      '', 'SUPPORTING FILES', ...data.files.map(file => `${file.name} (${readableSize(file.size)})`),
      data.files.length ? 'The files themselves are not included in this text/JSON export. Send them alongside this brief.' : 'No files added.',
      '', 'TYPICAL ACCESS FOR DISCUSSION', ...data.indicativeAccess.map(value => `- ${value}`), '', data.disclaimer,
    ];
    const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : lines.join('\n')], { type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scaffold-enquiry-${(d.postcode || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${format}`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.downloaded = true;
    announce('Your download has started. The brief has not been sent automatically. Attach your supporting files when you email the team.');
    const downloadNote = dialog.querySelector('[data-download-note]');
    if (downloadNote) downloadNote.textContent = 'Download started. Files are listed by name; attach the originals to your email.';
  }

  function announce(text) {
    const node = dialog.querySelector('#q-announcement');
    if (!node) return;
    node.textContent = '';
    requestAnimationFrame(() => { node.textContent = text; });
  }

  function visual() {
    const selected = isHouse() ? state.access : state.access.length ? ['Front', 'Right'] : [];
    const draw = buildingSVG({ kind: state.building || 'house', selected, id: 'quote-building', className: 'q-building-svg', phase: state.step >= 2 ? 'access' : 'building' });
    return `<aside class="q-visual" aria-label="Project illustration">
      <div class="q-visual-top"><span>Your project, taking shape.</span><span class="q-status"><i></i> ${state.step === 5 ? 'Ready to share' : 'Built around you'}</span></div>
      <div class="q-drawing" aria-hidden="true">${draw}</div>
      <div class="q-visual-bottom"><div><span class="q-micro">${state.building ? 'A clearer picture' : 'Let’s make it happen'}</span><strong>${esc(buildingName())}</strong></div></div>
      <div class="q-visual-tags">${state.building ? `<span>${esc(buildingName())}</span>` : '<span>Built around your project</span>'}${selectedAccess().map(side => `<span class="q-tag-selected">${esc(side)}</span>`).join('')}${state.works.slice(0, 3).map(work => `<span>${esc(work)}</span>`).join('')}</div>
      <p class="q-drawing-note">An illustration of your access. Our team will assess the site and confirm the right scaffold for the work.</p>
    </aside>`;
  }

  function choice(label, category, selected, note = '', icon = '') {
    return `<button type="button" class="q-choice${selected ? ' is-selected' : ''}" data-${category}="${esc(label)}" aria-pressed="${selected}">${icon ? `<span class="q-choice-icon" aria-hidden="true">${icon}</span>` : ''}<span class="q-choice-copy"><strong>${esc(label)}</strong>${note ? `<span>${esc(note)}</span>` : ''}</span><span class="q-choice-tick" aria-hidden="true">${selected ? CHECK : '+'}</span></button>`;
  }

  function field(name, label, { type = 'text', required = false, placeholder = '', autocomplete = '', wide = false, hint = '', options = null, multiline = false } = {}) {
    const error = state.errors[name];
    const id = `q-${name}`;
    const described = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
    const attrs = `id="${id}" name="${name}" data-field="${name}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${error ? 'aria-invalid="true"' : ''} ${described ? `aria-describedby="${described}"` : ''}`;
    let input;
    if (options) input = `<select ${attrs}><option value="">Select ${label.toLowerCase()}</option>${options.map(option => `<option value="${esc(option)}"${state.details[name] === option ? ' selected' : ''}>${esc(option)}</option>`).join('')}</select>`;
    else if (multiline) input = `<textarea ${attrs} rows="3" maxlength="3000" placeholder="${esc(placeholder)}">${esc(state.details[name])}</textarea>`;
    else input = `<input ${attrs} type="${type}" ${type === 'tel' ? 'inputmode="tel"' : ''} ${name === 'postcode' ? 'autocapitalize="characters" spellcheck="false"' : ''} ${type !== 'date' ? 'maxlength="200"' : ''} value="${esc(state.details[name])}" placeholder="${esc(placeholder)}">`;
    return `<div class="q-field${wide ? ' q-field-wide' : ''}"><label for="${id}">${label}${required ? '<span aria-hidden="true"> *</span>' : ' <span class="q-optional">(optional)</span>'}</label>${input}${hint ? `<p class="q-field-hint" id="${id}-hint">${hint}</p>` : ''}${error ? `<p class="q-field-error" id="${id}-error">${esc(error)}</p>` : ''}</div>`;
  }

  function buildingStep() {
    return `<div class="q-mode" role="group" aria-label="Your project relationship"><button type="button" data-mode="homeowner" aria-pressed="${state.mode === 'homeowner'}">Homeowner</button><button type="button" data-mode="contractor" aria-pressed="${state.mode === 'contractor'}">Contractor / commercial</button></div>
      <p class="q-step-intro">Start with the building. We’ll shape the questions around your job.</p>
      <div class="q-building-choices">${BUILDINGS.map(item => `<button type="button" class="q-choice q-building-choice${state.building === item.id ? ' is-selected' : ''}" data-building="${item.id}" aria-pressed="${state.building === item.id}"><span class="q-choice-icon" aria-hidden="true">${buildingIcon(item.id)}</span><span class="q-choice-copy"><strong>${item.name}</strong><span>${item.note}</span></span><span class="q-choice-tick" aria-hidden="true">${state.building === item.id ? CHECK : ARROW}</span></button>`).join('')}</div>`;
  }

  function accessStep() {
    const choices = isHouse() ? HOUSE_ACCESS : COMMERCIAL_ACCESS;
    return `<p class="q-step-intro">${isHouse() ? 'Choose the sides that need access. You can select more than one.' : 'Pick the access you have in mind. Choose everything that applies.'}</p>
      ${isHouse() ? '<p class="q-side-note">Left and right are viewed facing the front of the property.</p>' : ''}
      <div class="q-options q-access-options">${choices.map(side => choice(side, 'access', state.access.includes(side))).join('')}</div>
      <button type="button" class="q-unsure${state.accessUnsure ? ' is-selected' : ''}" data-unsure aria-pressed="${state.accessUnsure}"><span class="q-small-check" aria-hidden="true">${state.accessUnsure ? CHECK : ''}</span>Not sure yet. Help me work it out.</button>
      <p class="q-selection-count" aria-live="polite">${state.accessUnsure ? 'We’ll help you work out the access.' : `${state.access.length} ${isHouse() ? 'elevation' : 'access type'}${state.access.length === 1 ? '' : 's'} selected`}</p>
      ${state.errors.access ? `<p class="q-field-error" role="alert">${esc(state.errors.access)}</p>` : ''}`;
  }

  function workStep() {
    return `<p class="q-step-intro">Tell us what needs doing. Select all the works you need access for.</p>
      <div class="q-options q-work-options">${WORKS.map(work => choice(work, 'work', state.works.includes(work))).join('')}</div>
      ${state.errors.works ? `<p class="q-field-error" role="alert">${esc(state.errors.works)}</p>` : ''}
      <div class="q-recommendation" aria-live="polite"><span class="q-micro">${state.works.length ? 'Access we may discuss with you' : 'The right access for the work'}</span>${state.works.length ? `<ul>${recommendations().map(item => `<li>${CHECK}<span>${esc(item)}</span></li>`).join('')}</ul><p>Indicative only. The final access, design and safety measures follow a site assessment.</p>` : '<p>Choose a work type to see the access provisions we may discuss with you.</p>'}</div>`;
  }

  function filesStep() {
    return `<p class="q-step-intro">${state.mode === 'contractor' ? 'Plans, elevations, a tender package or programme. Give us the context to price the job properly.' : 'A few photos help us see the access, the building and the space around it.'}</p>
      <div class="q-dropzone" data-dropzone><svg viewBox="0 0 48 48" width="50" height="50" aria-hidden="true"><path d="M10 27v13h28V27M24 31V8m-8 8 8-8 8 8M6 23h8M34 23h8" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><strong>Drop the job here.</strong><span>or choose files from your device</span><label class="q-upload-button" for="q-files">Choose files ${ARROW}</label><input class="q-file-input" id="q-files" type="file" accept="${ACCEPTED_FILES}" multiple aria-describedby="q-upload-help"><p id="q-upload-help">JPG, PNG, WebP, HEIC, PDF or DOCX<br>Up to 10 files · 15 MB per file</p></div>
      <div class="q-file-errors" role="alert">${state.fileErrors.map(error => `<p>${esc(error)}</p>`).join('')}</div>
      ${state.files.length ? `<div class="q-files-heading"><span class="q-micro">${state.files.length} file${state.files.length === 1 ? '' : 's'} selected</span><span>${readableSize(totalSize())}</span></div><ul class="q-file-list">${state.files.map((file, index) => `<li><span class="q-file-type" aria-hidden="true">${esc(file.name.split('.').pop().slice(0, 4).toUpperCase())}</span><div><strong>${esc(file.name)}</strong><span>${readableSize(file.size)}</span></div><button type="button" data-remove-file="${index}" aria-label="Remove ${esc(file.name)}">${CLOSE}</button></li>`).join('')}</ul>` : ''}
      <p class="q-upload-reassurance">Not sure what scaffold you need? Send us the job. We’ll help define the access.</p>
      <p class="q-privacy-note">${siteData.submissionEndpoint ? 'Optional. Files stay in this browser session until you send your enquiry.' : 'Optional. Selected file names are added to your brief. Photos and drawings stay in this browser; you’ll need to attach the originals to your email.'} Nothing is analysed automatically.</p>`;
  }

  function detailsStep() {
    return `<p class="q-step-intro">Where’s the job, and how can we reach you? Give us a phone number or email address.</p>
      <div class="q-fields">
        ${field('name', state.mode === 'contractor' ? 'Contact name' : 'Your name', { required: true, autocomplete: 'name', placeholder: 'Alex Taylor' })}
        ${field('postcode', 'Project postcode', { required: true, autocomplete: 'postal-code', placeholder: 'e.g. MK18 1AA' })}
        ${field('phone', 'Phone number', { type: 'tel', autocomplete: 'tel', placeholder: 'Your phone number' })}
        ${field('email', 'Email address', { type: 'email', autocomplete: 'email', placeholder: 'you@example.com' })}
      </div>
      ${state.errors.contact ? `<p class="q-field-error" role="alert">${esc(state.errors.contact)}</p>` : ''}
      <fieldset class="q-contact-preference"><legend>How would you prefer to hear from us? <span>(optional)</span></legend><div>${['Phone', ...(siteData.whatsapp ? ['WhatsApp'] : []), 'Email'].map(method => `<button type="button" data-preferred="${method}" aria-pressed="${state.details.preferred === method}">${method}${state.details.preferred === method ? CHECK : ''}</button>`).join('')}</div></fieldset>
      ${state.mode === 'contractor' ? `<div class="q-form-divider"><span class="q-micro">A little more about the job</span></div><div class="q-fields">${field('company', 'Company', { required: true, autocomplete: 'organization', placeholder: 'Company name' })}${field('projectType', 'Project type', { options: ['New build', 'Refurbishment', 'RC frame', 'Roofing', 'Façade', 'Infrastructure', 'Industrial', 'Other'] })}${field('scope', 'Scope', { required: true, wide: true, options: ['Design + supply + erect', 'Supply + erect', 'Labour only', 'Temporary roof', 'Access scaffold', 'Bird cage scaffold', 'Loading bay', 'Other / please advise'] })}${field('requiredDate', 'Required on site', { type: 'date' })}${field('tenderDeadline', 'Tender deadline', { type: 'date' })}${field('programme', 'Programme / approximate requirement', { wide: true, placeholder: 'e.g. 12 weeks, phased elevations' })}</div>` : ''}
      <div class="q-fields q-extra-details">${field('timing', 'When do you need it?', { wide: true, options: ['ASAP', 'This week', '1–2 weeks', 'Planning ahead', 'Not sure yet'] })}${field('notes', 'Anything else we should know?', { multiline: true, wide: true, placeholder: 'Access restrictions, approximate height, working hours…' })}</div>
      <p class="q-privacy-note">${siteData.submissionEndpoint ? 'Your details will only be used to respond to this project enquiry.' : 'Your details stay in this browser session. Next, you can open an email draft or download your brief. Nothing is sent automatically.'} Closing this window keeps your draft. Reloading the page clears it.</p>`;
  }

  function reviewRow(label, value, step, editLabel) {
    return `<div class="q-review-row"><span>${esc(label.charAt(0) + label.slice(1).toLowerCase())}</span><strong>${esc(value || 'Not provided')}</strong><button type="button" data-edit="${step}" aria-label="Edit ${editLabel || label.toLowerCase()}">Edit</button></div>`;
  }

  function reviewStep() {
    const d = state.details;
    return `<div class="q-ready-label">${CHECK}<span>The details are together.</span></div>
      <p class="q-step-intro">The essentials are together. Review your brief below.</p>
      <div class="q-review">
        ${reviewRow('PROJECT', `${buildingName()} · ${state.mode === 'contractor' ? 'Contractor / commercial' : 'Homeowner'}`, 0)}
        ${reviewRow('ACCESS', selectedAccess().join(' + '), 1)}
        ${reviewRow('WORKS', state.works.join(', '), 2)}
        ${reviewRow('FILES', `${state.files.length} supporting file${state.files.length === 1 ? '' : 's'}`, 3)}
        ${reviewRow('LOCATION', d.postcode.toUpperCase(), 4)}
        ${reviewRow('CONTACT', `${d.name} · ${[d.phone, d.email].filter(Boolean).join(' / ')}`, 4)}
        ${d.preferred ? reviewRow('PREFERENCE', d.preferred, 4) : ''}
        ${state.mode === 'contractor' ? reviewRow('COMPANY / SCOPE', `${d.company} · ${d.scope}`, 4) : ''}
        ${state.mode === 'contractor' && d.projectType ? reviewRow('PROJECT TYPE', d.projectType, 4) : ''}
        ${d.timing ? reviewRow('TIMING', d.timing, 4) : ''}
        ${state.mode === 'contractor' && d.requiredDate ? reviewRow('REQUIRED DATE', d.requiredDate, 4) : ''}
        ${state.mode === 'contractor' && d.tenderDeadline ? reviewRow('TENDER DEADLINE', d.tenderDeadline, 4) : ''}
        ${state.mode === 'contractor' && d.programme ? reviewRow('PROGRAMME', d.programme, 4) : ''}
        ${d.notes ? reviewRow('NOTES', d.notes, 4) : ''}
      </div>
      ${state.files.length ? `<details class="q-file-review"><summary>View supporting files <span>${state.files.length}</span></summary><ul>${state.files.map(file => `<li>${esc(file.name)} <span>${readableSize(file.size)}</span></li>`).join('')}</ul></details>` : ''}
      <div class="q-demo-note"><span class="q-micro">${state.sent ? 'Enquiry received' : siteData.submissionEndpoint ? 'Over to our team' : 'Your brief is ready.'}</span><p>${state.sent ? 'Your enquiry has been received. Keep a copy of your brief for your records.' : siteData.submissionEndpoint ? 'Send these details and supporting files to the team for review. This is an enquiry, not a confirmed price or booking.' : 'Email it to our team or download a copy. Photos and drawings need to be attached to your email.'}</p>${!siteData.submissionEndpoint ? `<p class="q-email-explainer">The button opens a draft in your email app. Review it, add your files, then send it to <strong>${esc(siteData.email)}</strong>. Nothing is sent automatically.</p>` : ''}</div>
      ${state.errors.submission ? `<p class="q-field-error" role="alert">${esc(state.errors.submission)}</p>` : ''}
      <div class="q-export-actions"><button type="button" class="q-text-button" data-export="json">Download as JSON</button><button type="button" class="q-text-button" data-reset>${state.resetConfirm ? 'Yes, clear this brief' : 'Start a new brief'}</button></div>
      ${state.resetConfirm ? '<p class="q-privacy-note">This will clear your details and selected files. <button type="button" class="q-inline-button" data-cancel-reset>Keep this brief</button></p>' : ''}
      <p class="q-download-note" data-download-note aria-live="polite">${state.downloaded ? 'Download started. Files are listed by name; attach the originals to your email.' : 'Downloads include all your details and file names. Supporting files are not bundled.'}</p>
      <div class="q-talk"><span class="q-micro">Prefer to talk it through?</span><div><button type="button" data-contact="phone">Call ${esc(siteData.phoneDisplay)}</button>${siteData.whatsapp ? '<button type="button" data-contact="whatsapp">WhatsApp the team</button>' : ''}</div></div>`;
  }

  function render({ focusTitle = false, keepScroll = false } = {}) {
    const previousScroll = dialog.querySelector('.q-pane')?.scrollTop || 0;
    const previousMobileScroll = dialog.querySelector('.q-layout')?.scrollTop || 0;
    const stepContents = [buildingStep, accessStep, workStep, filesStep, detailsStep, reviewStep];
    dialog.dataset.step = String(state.step);
    dialog.innerHTML = `<header class="q-header">${siteData.logo ? `<div class="q-brand"><span class="q-logo-surface"><img src="${esc(siteData.logo)}" alt="${esc(siteData.legalName || siteData.name)}"></span><span class="q-brand-note">A clearer start to your project.</span></div>` : `<div class="q-wordmark">${esc(siteData.name || 'Pioneer Bros')}<span>Scaffolding, shaped around you.</span></div>`}<div class="q-header-actions"><span class="q-draft">${state.step === 5 ? 'Ready to share' : 'Your project brief'}</span><button type="button" class="q-close" data-close aria-label="Close quote builder">${CLOSE}</button></div></header>
      <nav class="q-progress" aria-label="Quote progress">${STEPS.map((step, index) => `<button type="button" data-step="${index}" ${index > state.step ? 'disabled' : ''} ${state.step === index ? 'aria-current="step"' : ''} class="${index < state.step ? 'is-complete' : ''}"><span class="q-progress-number">${index < state.step ? CHECK : index + 1}</span><span>${step}</span><span class="q-progress-rule"></span></button>`).join('')}<span class="q-progress-review${state.step === 5 ? ' is-active' : ''}">${state.step === 5 ? CHECK : '<span class="q-review-dot"></span>'}<span>Review</span></span></nav>
      <div class="q-layout">${visual()}<section class="q-pane"><div class="q-pane-content"><h2 id="q-dialog-title" tabindex="-1">${titleFor().split('\n').map(esc).join('<br>')}</h2>${stepContents[state.step]()}</div></section></div>
      <footer class="q-footer"><div class="q-footer-note"><span>A family-run team.<br>Over 35 years of experience.</span></div><div class="q-footer-controls">${state.step > 0 ? '<button type="button" class="q-back" data-back>Back</button>' : '<span class="q-footer-time">Takes about 2 minutes</span>'}${state.step === 5 ? `<button type="button" class="q-download" data-export="txt">Download brief</button>${siteData.submissionEndpoint && !state.sent ? `<button type="button" class="q-send" data-send ${state.sending ? 'disabled' : ''}>${state.sending ? 'Sending…' : 'Send enquiry'}</button>` : !state.sent && siteData.email ? `<a class="q-email" href="${esc(createEmailDraft(payload()))}" data-email-draft>Open email draft</a>` : ''}` : `<button type="button" class="q-next" data-next ${state.step === 0 && !state.building ? 'disabled' : ''}>${state.step === 4 ? 'Review my brief' : state.step === 3 && !state.files.length ? 'Skip for now' : 'Continue'}</button>`}</div></footer><div id="q-announcement" class="q-sr-only" role="status" aria-live="polite" aria-atomic="true"></div>`;
    if (keepScroll) {
      dialog.querySelector('.q-pane').scrollTop = previousScroll;
      dialog.querySelector('.q-layout').scrollTop = previousMobileScroll;
    }
    if (state.sending) dialog.querySelectorAll('button:not([data-close]):not([data-export])').forEach(button => { button.disabled = true; });
    if (focusTitle) {
      const pane = dialog.querySelector('.q-pane');
      pane.scrollTop = 0;
      dialog.querySelector('.q-layout').scrollTop = 0;
      requestAnimationFrame(() => dialog.querySelector('#q-dialog-title')?.focus({ preventScroll: true }));
    }
    if (fileAnnouncement) { announce(fileAnnouncement); fileAnnouncement = ''; }
  }

  function preserveActiveRender(options = {}) {
    const focused = document.activeElement;
    const token = focused?.getAttributeNames?.().find(name => /^data-(access|work|unsure|mode|preferred|reset|remove-file)$/.test(name));
    const value = token ? focused.getAttribute(token) : '';
    render({ keepScroll: true, ...options });
    if (token) {
      const replacement = [...dialog.querySelectorAll(`[${token}]`)].find(node => node.getAttribute(token) === value);
      replacement?.focus({ preventScroll: true });
    }
  }

  function validateDetails() {
    const d = state.details;
    const errors = {};
    if (d.name.trim().length < 2) errors.name = 'Enter your name so we know who to contact.';
    if (!/^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i.test(d.postcode.trim())) errors.postcode = 'Enter a full UK postcode, for example MK18 1AA.';
    if (!d.phone.trim() && !d.email.trim()) errors.contact = 'Add a phone number or email address so we can get back to you.';
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = 'Enter a valid email address, for example alex@example.com.';
    if (d.phone.trim() && (!/^[+\d\s().-]+$/.test(d.phone.trim()) || d.phone.replace(/\D/g, '').length < 7 || d.phone.replace(/\D/g, '').length > 15)) errors.phone = 'Enter a valid phone number, including area or country code.';
    if (['Phone', 'WhatsApp'].includes(d.preferred) && !d.phone.trim()) errors.phone = `Add a phone number for your preferred ${d.preferred} contact.`;
    if (d.preferred === 'Email' && !d.email.trim()) errors.email = 'Add an email address for your preferred contact method.';
    if (state.mode === 'contractor') {
      if (d.company.trim().length < 2) errors.company = 'Enter your company name.';
      if (!d.scope) errors.scope = 'Choose a scope, or select “Other / please advise”.';
    }
    return errors;
  }

  function next() {
    window.clearTimeout(advanceTimer);
    state.errors = {};
    if (state.step === 0 && !state.building) return;
    if (state.step === 1 && !state.access.length && !state.accessUnsure) state.errors.access = 'Select at least one access area, or choose “Not sure yet”.';
    if (state.step === 2 && !state.works.length) state.errors.works = 'Select at least one type of work. You can choose “Other”.';
    if (state.step === 4) state.errors = validateDetails();
    if (Object.keys(state.errors).length) {
      render({ keepScroll: true });
      const errorField = dialog.querySelector('[aria-invalid="true"]');
      if (errorField) { errorField.focus(); errorField.scrollIntoView({ block: 'center' }); }
      else if (state.errors.contact) { dialog.querySelector('#q-phone')?.focus(); }
      else { dialog.querySelector('[data-next]')?.focus(); }
      announce(`Please check ${Object.keys(state.errors).length === 1 ? 'the highlighted detail' : 'the highlighted details'} before continuing.`);
      return;
    }
    state.step = Math.min(5, state.step + 1);
    if (state.step === 5) {
      const postcode = state.details.postcode.replace(/\s/g, '').toUpperCase();
      state.details.postcode = `${postcode.slice(0, -3)} ${postcode.slice(-3)}`;
    }
    render({ focusTitle: true });
  }

  function addFiles(files) {
    const errors = [];
    let added = 0;
    for (const file of [...files]) {
      if (!ALLOWED_EXTENSIONS.test(file.name)) { errors.push(`${file.name}: choose an image, PDF or DOCX file.`); continue; }
      if (file.size > MAX_SIZE) { errors.push(`${file.name}: exceeds the 15 MB limit.`); continue; }
      if (file.size === 0) { errors.push(`${file.name}: this file is empty. Choose a different copy.`); continue; }
      if (state.files.some(existing => existing.name === file.name && existing.size === file.size)) { errors.push(`${file.name}: already added. Remove the existing file first if this is a revised copy.`); continue; }
      if (state.files.length >= MAX_FILES) { errors.push('You can add up to 10 files. Remove one before adding another.'); break; }
      state.files.push(file); added += 1;
    }
    state.fileErrors = errors;
    fileAnnouncement = `${added} file${added === 1 ? '' : 's'} added. ${state.files.length} total.${errors.length ? ` ${errors.join(' ')}` : ''}`;
    render({ keepScroll: true });
    dialog.querySelector('#q-files')?.focus({ preventScroll: true });
  }

  function applyPrefill(detail = {}) {
    const building = String(detail.building || '').toLowerCase();
    const aliases = { residential: 'house', home: 'house', 'new build': 'development', factory: 'industrial', industrial: 'industrial' };
    const matched = BUILDINGS.find(item => item.id === (aliases[building] || building));
    if (matched) {
      if (state.building !== matched.id) { state.access = []; state.accessUnsure = false; }
      state.building = matched.id;
    }
    let seededAccess = false;
    const hasAccessPrefill = Array.isArray(detail.access);
    if (hasAccessPrefill) {
      const choices = isHouse() ? HOUSE_ACCESS : COMMERCIAL_ACCESS;
      const selected = [...new Set(detail.access.map(value => choices.find(choice => choice.toLowerCase() === String(value).toLowerCase())).filter(Boolean))];
      // An explicit empty selection also replaces the existing draft state.
      state.access = selected;
      state.accessUnsure = false;
      seededAccess = selected.length > 0 && Boolean(state.building);
    }
    const workAliases = { roof: 'Roofing', roofing: 'Roofing', chimney: 'Chimney works', facade: 'Cladding', façade: 'Cladding', internal: 'Maintenance', industrial: 'Maintenance', 'full building': 'New build', 'new-build': 'New build', 'temporary roof': 'Roofing' };
    const incomingWorks = Array.isArray(detail.work) ? detail.work : detail.work ? [detail.work] : [];
    incomingWorks.forEach(value => {
      const normalized = workAliases[String(value).toLowerCase()] || WORKS.find(work => work.toLowerCase() === String(value).toLowerCase());
      if (normalized && !state.works.includes(normalized)) state.works.push(normalized);
    });
    if (detail.mode) state.mode = /contractor|commercial/i.test(detail.mode) ? 'contractor' : 'homeowner';
    if (detail.postcode) state.details.postcode = String(detail.postcode).slice(0, 20);
    if (detail.timing) {
      const options = ['ASAP', 'This week', '1–2 weeks', 'Planning ahead', 'Not sure yet'];
      state.details.timing = options.find(value => value.toLowerCase().replace('–', '-') === String(detail.timing).toLowerCase().replace('–', '-')) || 'Planning ahead';
    }
    if (matched || incomingWorks.length || detail.mode || detail.postcode || detail.timing || hasAccessPrefill) state.step = seededAccess ? 2 : (matched || (hasAccessPrefill && state.building)) ? 1 : 0;
  }

  function open(detail, trigger) {
    if (dialog.open) return;
    lastFocus = trigger || document.activeElement;
    applyPrefill(detail);
    render();
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('q-is-open');
    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('#q-dialog-title')?.focus({ preventScroll: true }));
  }

  dialog.addEventListener('close', () => {
    window.clearTimeout(advanceTimer);
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.classList.remove('q-is-open');
    lastFocus?.focus?.({ preventScroll: true });
  });

  dialog.addEventListener('input', event => {
    if (event.target.dataset.field) {
      state.details[event.target.dataset.field] = event.target.value;
      state.sent = false;
    }
  });
  dialog.addEventListener('change', event => {
    if (event.target.matches('#q-files')) addFiles(event.target.files);
    if (event.target.dataset.field) state.details[event.target.dataset.field] = event.target.value;
  });
  let dragDepth = 0;
  dialog.addEventListener('dragenter', event => {
    if (!event.target.closest('[data-dropzone]')) return;
    event.preventDefault(); dragDepth += 1;
    dialog.querySelector('[data-dropzone]')?.classList.add('is-dragging');
  });
  dialog.addEventListener('dragover', event => {
    if (!event.target.closest('[data-dropzone]')) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'copy';
  });
  dialog.addEventListener('dragleave', event => {
    if (!event.target.closest('[data-dropzone]')) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dialog.querySelector('[data-dropzone]')?.classList.remove('is-dragging');
  });
  dialog.addEventListener('drop', event => {
    if (!event.target.closest('[data-dropzone]')) return;
    event.preventDefault(); dragDepth = 0;
    addFiles(event.dataTransfer.files);
  });

  dialog.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    event.stopPropagation();
    if (button.hasAttribute('data-close')) { dialog.close(); return; }
    if (button.hasAttribute('data-next')) { next(); return; }
    if (button.hasAttribute('data-back')) { window.clearTimeout(advanceTimer); state.step = Math.max(0, state.step - 1); state.errors = {}; render({ focusTitle: true }); return; }
    if (button.hasAttribute('data-building')) {
      const building = button.dataset.building;
      if (state.building !== building) { state.access = []; state.accessUnsure = false; }
      state.building = building; state.sent = false;
      preserveActiveRender();
      advanceTimer = window.setTimeout(() => { if (dialog.open && state.step === 0) next(); }, 180);
      return;
    }
    if (button.hasAttribute('data-mode')) { state.mode = button.dataset.mode; state.errors = {}; preserveActiveRender(); return; }
    if (button.hasAttribute('data-access')) {
      const side = button.dataset.access;
      state.access = state.access.includes(side) ? state.access.filter(value => value !== side) : [...state.access, side];
      state.accessUnsure = false; delete state.errors.access; state.sent = false;
      preserveActiveRender(); return;
    }
    if (button.hasAttribute('data-unsure')) { state.accessUnsure = !state.accessUnsure; state.access = []; delete state.errors.access; state.sent = false; preserveActiveRender(); return; }
    if (button.hasAttribute('data-work')) {
      const work = button.dataset.work;
      state.works = state.works.includes(work) ? state.works.filter(value => value !== work) : [...state.works, work];
      delete state.errors.works; state.sent = false; preserveActiveRender(); return;
    }
    if (button.hasAttribute('data-remove-file')) {
      const index = Number(button.dataset.removeFile);
      const removed = state.files.splice(index, 1)[0]; state.fileErrors = []; state.sent = false;
      fileAnnouncement = `${removed.name} removed.`; render({ keepScroll: true });
      (dialog.querySelector(`[data-remove-file="${Math.min(index, state.files.length - 1)}"]`) || dialog.querySelector('#q-files'))?.focus({ preventScroll: true }); return;
    }
    if (button.hasAttribute('data-preferred')) { state.details.preferred = state.details.preferred === button.dataset.preferred ? '' : button.dataset.preferred; state.sent = false; preserveActiveRender(); return; }
    if (button.hasAttribute('data-step') || button.hasAttribute('data-edit')) {
      window.clearTimeout(advanceTimer);
      const step = Number(button.dataset.step ?? button.dataset.edit);
      if (step <= state.step) { state.step = step; state.errors = {}; state.resetConfirm = false; render({ focusTitle: true }); } return;
    }
    if (button.hasAttribute('data-export')) { saveBrief(button.dataset.export); return; }
    if (button.hasAttribute('data-reset')) {
      if (state.resetConfirm) { state = initialState(); render({ focusTitle: true }); }
      else { state.resetConfirm = true; preserveActiveRender(); }
      return;
    }
    if (button.hasAttribute('data-cancel-reset')) { state.resetConfirm = false; render({ keepScroll: true }); dialog.querySelector('[data-reset]')?.focus(); return; }
    if (button.hasAttribute('data-contact')) {
      const method = button.dataset.contact;
      dialog.close();
      document.dispatchEvent(new CustomEvent('open-contact', { detail: { method } }));
      return;
    }
    if (button.hasAttribute('data-send') && !state.sending) {
      state.sending = true; delete state.errors.submission; render({ keepScroll: true });
      announce('Sending your enquiry and supporting files.');
      try {
        const result = await submitEnquiry(payload(), state.files);
        state.sent = result.submitted;
        if (!result.submitted) state.errors.submission = 'An enquiries inbox has not been connected. Download a copy of your brief to keep it.';
      } catch (error) { state.errors.submission = error.message; }
      finally {
        state.sending = false; render({ keepScroll: true });
        announce(state.sent ? 'Your enquiry has been received.' : state.errors.submission);
        if (dialog.open) (dialog.querySelector('[data-send]') || dialog.querySelector('[data-export="txt"]'))?.focus({ preventScroll: true });
      }
    }
  });

  document.addEventListener('open-quote', event => open(event.detail || {}, document.activeElement));
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-quote]');
    if (!trigger) return;
    event.preventDefault();
    const data = trigger.dataset;
    open({ building: data.building || (BUILDINGS.some(item => item.id === data.quote) ? data.quote : undefined), work: data.work, timing: data.timing, postcode: data.postcode, mode: data.mode }, trigger);
  });
  return { open: detail => open(detail || {}), close: () => dialog.close() };
}
