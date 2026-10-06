'use strict';

/** An illustrative single-shift model. Productive hours exclude downtime. */
function calculateCapacity({ demand, rate, people, hours }) {
  const values = [demand, rate, people, hours];
  if (!values.every(Number.isFinite) ||
      !Number.isInteger(demand) || demand < 1 || demand > 10000000 ||
      !Number.isInteger(rate) || rate < 1 || rate > 100000 ||
      !Number.isInteger(people) || people < 1 || people > 100 ||
      hours < 1 || hours > 10) {
    return null;
  }
  const capacity = people * hours * rate;
  return {
    capacity,
    requiredPeople: Math.ceil(demand / (hours * rate)),
    gap: demand - capacity,
    coverage: capacity / demand * 100
  };
}


const projects = {
  association: {
    category: 'CHROME EXTENSION / AUTOMATION',
    title: 'Image Auto Association',
    summary: 'Keep an operator’s active field and the relevant part of the document image aligned.',
    problem: 'Moving between data fields and manually repositioning the source image adds friction to repeated data-capture tasks.',
    approach: 'A Chrome extension maps field labels to document regions and scrolls the image into view as the operator works through the form. Matching needs to reflect the actual labels used in each workflow.',
    features: ['Field-to-image navigation for document entry.', 'Mappings developed around healthcare form types and field labels.', 'A browser extension designed for the existing operator workflow.'],
    note: 'Project illustration only. Source documents, client data, and extension code are not displayed on this site.'
  },
  batch: {
    category: 'REPORTING WORKFLOW / AUTOMATION',
    title: 'Batch Status Automation',
    summary: 'Bring recurring extraction, tracking, and status communication into a more consistent reporting workflow.',
    problem: 'Manual report downloads and status preparation make it harder to maintain timely visibility of batches and turnaround commitments.',
    approach: 'Use a browser extension to extract reports periodically and append timestamped information to Google Sheets. Separate hourly reporting keeps 24-hour and 72-hour batch views clear.',
    features: ['Periodic downloads with a visible countdown.', 'Timestamped updates appended to a Google Sheet.', 'Separate hourly status emails for 24-hour and 72-hour batch categories.'],
    note: 'Browser-based extraction depends on an active signed-in application session. This is a project overview, not a live reporting service.'
  },
  billentry: {
    category: 'PYTHON + SELENIUM / AUTOMATION',
    title: 'Bill Entry Automation',
    summary: 'Automate repetitive, rule-based steps in the bill entry process that require no human judgment.',
    problem: 'Monotonous bill entry tasks consume operator time even when the steps are fixed and require no interpretation or domain knowledge.',
    approach: 'Use Python and Selenium to perform predefined browser actions for repetitive bill entry tasks, read CSV inputs, and consolidate results into Excel. The automation handles mechanical steps that follow established rules and require no human judgment.',
    features: ['Predefined browser actions for repetitive bill entry steps.', 'CSV-driven input and automated batch closing and posting.', 'Time conversion and consolidated Excel output.'],
    note: 'Customer names and data are omitted. This project focuses on rule-based tasks within the bill entry workflow.'
  },
  seats: {
    category: 'GOOGLE APPS SCRIPT / DASHBOARDS',
    title: 'Seat Occupancy Dashboard',
    summary: 'Make on-site capacity easier to see, discuss, and plan.',
    problem: 'Seat deployment and utilization are difficult to coordinate when the operational view is spread across manual records.',
    approach: 'Connect a Google Sheets data source to an HTML dashboard through Google Apps Script, with seat filters and an analytics view for capacity planning.',
    features: ['Seat-level filters and occupancy views.', 'Utilization analytics for planning discussions.', 'An HTML interface backed by Google Apps Script and Google Sheets.'],
    note: 'The seat graphic is illustrative. Current seat allocations and internal infrastructure details are not included.'
  },
  count: {
    category: 'CHROME EXTENSION / PRODUCTION VISIBILITY',
    title: 'Production Count Tracker',
    summary: 'Help operators see their progress while there is still time to act within the shift.',
    problem: 'A daily target is less useful when production progress becomes visible only after the work is complete.',
    approach: 'Provide an in-shift production count through a Chrome extension so operators can monitor progress against the day’s target.',
    features: ['A running view of production count.', 'Visibility of progress toward daily targets.', 'A lightweight browser-based aid for operators.'],
    note: 'This tracker supports in-shift visibility. The official production system remains the source for final counts.'
  },
  typelab: {
    category: 'TYPING ASSESSMENT / PROJECT BLUEPRINT',
    title: 'TypeLab by Saleem',
    summary: 'A project design for structured typing practice and assessment, with clear roles and a useful record of improvement.',
    problem: 'Typing assessment is more useful when operators can see progress and leads can review consistent measures over time.',
    approach: 'The blueprint combines separate operator and lead flows with WPM and KPM measures, assessment history, and a Google Sheets backend.',
    features: ['Operator login and a lead flow with OTP verification.', 'WPM and KPM measures with configurable backspace behavior.', 'Assessment history supported by a Google Sheets data source.'],
    note: 'Presented as a project blueprint. A deployed assessment service or public tool is not claimed here.'
  }
};

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

const cards = Array.from(document.querySelectorAll('.project'));
const filters = Array.from(document.querySelectorAll('.filter'));
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let visible = 0;
  cards.forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) visible += 1;
  });
  document.querySelector('#filter-status').textContent = `Showing ${visible} ${visible === 1 ? 'project' : 'projects'}.`;
}));

const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  if (!project) return;
  dialogTrigger = button;
  document.querySelector('#dialog-category').textContent = project.category;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-summary').textContent = project.summary;
  document.querySelector('#dialog-problem').textContent = project.problem;
  document.querySelector('#dialog-approach').textContent = project.approach;
  document.querySelector('#dialog-note').textContent = project.note;
  const list = document.querySelector('#dialog-features');
  list.replaceChildren(...project.features.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  dialog.showModal();
  document.body.classList.add('dialog-open');
  document.querySelector('#close-dialog').focus();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (dialogTrigger) dialogTrigger.focus();
});
document.querySelector('#dialog-contact').addEventListener('click', event => {
  event.preventDefault();
  dialog.close();
  document.querySelector('#contact').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.querySelector('#contact a').focus({ preventScroll: true });
  history.replaceState(null, '', '#contact');
});

const form = document.querySelector('#capacity-form');
const demand = document.querySelector('#demand');
const rate = document.querySelector('#rate');
const people = document.querySelector('#people');
const hours = document.querySelector('#hours');
const format = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });
function updateCapacity() {
  document.querySelector('#people-value').textContent = people.value;
  document.querySelector('#hours-value').textContent = `${Number(hours.value).toFixed(1)} hrs`;
  const result = calculateCapacity({ demand: Number(demand.value), rate: Number(rate.value), people: Number(people.value), hours: Number(hours.value) });
  const error = document.querySelector('#capacity-error');
  const status = document.querySelector('#capacity-status');
  const meter = document.querySelector('.capacity-meter');
  const bar = document.querySelector('#coverage-bar');
  demand.setAttribute('aria-invalid', String(!demand.validity.valid));
  rate.setAttribute('aria-invalid', String(!rate.validity.valid));
  error.hidden = Boolean(result);
  if (!result) {
    document.querySelector('#capacity-total').textContent = '—';
    document.querySelector('#people-required').textContent = '—';
    status.textContent = 'Update the inputs to calculate capacity.';
    status.classList.remove('met');
    meter.classList.remove('met');
    meter.setAttribute('aria-valuenow', '0');
    meter.setAttribute('aria-valuetext', 'Awaiting valid inputs');
    bar.style.width = '0%';
    return;
  }
  document.querySelector('#capacity-total').textContent = format.format(result.capacity);
  document.querySelector('#people-required').textContent = format.format(result.requiredPeople);
  const coverage = Math.round(result.coverage);
  const met = result.gap <= 0;
  status.classList.toggle('met', met);
  meter.classList.toggle('met', met);
  status.textContent = result.gap > 0
    ? `${format.format(result.gap)} units below demand · ${format.format(coverage)}% coverage`
    : result.gap === 0
      ? 'Demand met exactly · 100% coverage'
      : `${format.format(-result.gap)} units above demand · ${format.format(coverage)}% coverage`;
  const cappedCoverage = Math.min(100, Math.max(0, result.coverage));
  meter.setAttribute('aria-valuenow', String(Math.round(cappedCoverage)));
  meter.setAttribute('aria-valuetext', `${coverage}% of demand`);
  bar.style.width = `${cappedCoverage}%`;
}
form.addEventListener('input', updateCapacity);
form.addEventListener('submit', event => event.preventDefault());
document.querySelector('#reset-capacity').addEventListener('click', () => {
  form.reset();
  updateCapacity();
});
updateCapacity();

document.querySelector('#copy-email').addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('ahamedsaleem@gmail.com');
    button.textContent = 'Copied ✓';
    document.querySelector('#copy-status').textContent = 'Email address copied to clipboard.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email-row > a'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = 'Email selected';
    document.querySelector('#copy-status').textContent = 'Email selected. Use your device’s copy command, or the Email Saleem link.';
  }
  window.setTimeout(() => { button.textContent = 'Copy email'; }, 2500);
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
