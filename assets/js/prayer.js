// ============================================================
// Kingdom Minded Prayer Call (prayer/index.html), hosted by Revival Lending
// ============================================================

/* ============================================================
   EDIT HERE — everything you need to update lives in this block.

   zoomUrl    Your recurring Zoom meeting link (the "Join" URL).
   meetingId  Shown on the page for people dialing in manually.
   passcode   Leave '' if the meeting has no passcode.
   videoUrl   The invitation video. Paste any of these and it will
              embed automatically:
                https://www.youtube.com/watch?v=XXXX  (or youtu.be/XXXX)
                https://vimeo.com/123456789
                https://www.loom.com/share/XXXX
                a direct link to an .mp4 file
              Leave '' to keep the "Video coming soon" placeholder.

   The call time (Mondays 9:30–10:00 AM Pacific) is set below in
   SCHEDULE. Visitors in other time zones automatically see the
   time converted to their own.
   ============================================================ */
const PRAYER_CONFIG = {
  zoomUrl: 'https://us02web.zoom.us/j/85109728119?pwd=tylfVJQszbCKIA0H7IIbz378LQSD8e.1',
  meetingId: '851 0972 8119',
  passcode: '177576',
  // Dial-in by phone (one tap joins the meeting with ID + passcode)
  dialIn: '+1 669 900 9128',
  dialInTap: 'tel:+16699009128,,85109728119#,,,,*177576#',
  videoUrl: ''
};

const SCHEDULE = {
  timeZone: 'America/Los_Angeles',
  weekday: 1,          // 0 = Sunday, 1 = Monday
  hour: 9,
  minute: 30,
  durationMin: 30,
  firstCall: { y: 2026, m: 12, d: 7 },   // first meeting in the Zoom series (Dec 7, 2026)
  title: 'Kingdom Minded Prayer Call'
};

/* ---------- Shared page behavior (mirrors main.js) ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const navToggle = document.getElementById('navToggle');
const mobilePanel = document.getElementById('mobilePanel');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  mobilePanel.classList.toggle('open');
  document.body.style.overflow = mobilePanel.classList.contains('open') ? 'hidden' : '';
});
mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('open');
  mobilePanel.classList.remove('open');
  document.body.style.overflow = '';
}));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (!prefersReducedMotion && revealEls.length && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal-armed');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
}
document.querySelectorAll('.reveal-stagger').forEach(group => {
  Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
});

/* ---------- Zoom details ---------- */
document.querySelectorAll('[data-zoom-link]').forEach(a => { a.href = PRAYER_CONFIG.zoomUrl; });
document.querySelectorAll('[data-zoom-id]').forEach(el => { el.textContent = PRAYER_CONFIG.meetingId || 'In the link'; });
document.querySelectorAll('[data-zoom-pass]').forEach(el => { el.textContent = PRAYER_CONFIG.passcode || 'None needed'; });
document.querySelectorAll('[data-dial-in]').forEach(a => {
  if (!PRAYER_CONFIG.dialIn) { a.closest('.dial-in').remove(); return; }
  a.textContent = PRAYER_CONFIG.dialIn;
  a.href = PRAYER_CONFIG.dialInTap || 'tel:' + PRAYER_CONFIG.dialIn.replace(/[^\d+]/g, '');
});

/* ---------- Invitation video ---------- */
function toEmbed(url) {
  if (!url) return null;
  let m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1` };
  }
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${m[1]}?title=0&byline=0&portrait=0` };
  }
  if ((m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/))) {
    return { type: 'iframe', src: `https://www.loom.com/embed/${m[1]}` };
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: 'video', src: url };
  return { type: 'iframe', src: url };
}
(function mountVideo() {
  const embed = toEmbed(PRAYER_CONFIG.videoUrl);
  const frame = document.getElementById('videoFrame');
  if (!embed || !frame) return;
  if (embed.type === 'video') {
    frame.innerHTML = `<video src="${embed.src}" controls playsinline preload="metadata"></video>`;
  } else {
    frame.innerHTML = `<iframe src="${embed.src}" title="The Kingdom Minded Prayer Call invitation" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen loading="lazy"></iframe>`;
  }
})();

/* ---------- Next call (time-zone aware) ---------- */
function tzOffsetMs(ts, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(new Date(ts)).reduce((o, p) => (o[p.type] = p.value, o), {});
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUTC - Math.floor(ts / 1000) * 1000;
}
function zonedToUtc(y, mo, d, h, mi, timeZone) {
  const guess = Date.UTC(y, mo, d, h, mi);
  const first = guess - tzOffsetMs(guess, timeZone);
  return guess - tzOffsetMs(first, timeZone);
}
function datePartsIn(ts, timeZone) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(ts)).reduce((o, x) => (o[x.type] = x.value, o), {});
  return { y: +p.year, m: +p.month - 1, d: +p.day };
}

function nextCall(now = Date.now()) {
  let { y, m, d } = datePartsIn(now, SCHEDULE.timeZone);
  const f = SCHEDULE.firstCall;
  const isFirst = f && Date.UTC(y, m, d) <= Date.UTC(f.y, f.m - 1, f.d);
  if (isFirst) { y = f.y; m = f.m - 1; d = f.d; }
  for (let i = 0; i <= 7; i++) {
    const day = new Date(Date.UTC(y, m, d + i));
    if (day.getUTCDay() !== SCHEDULE.weekday) continue;
    const start = zonedToUtc(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), SCHEDULE.hour, SCHEDULE.minute, SCHEDULE.timeZone);
    const end = start + SCHEDULE.durationMin * 60000;
    if (now < end) return { start, end, live: now >= start, first: isFirst && i === 0 };
  }
  return null;
}

function fmt(ts, opts, timeZone) {
  return new Intl.DateTimeFormat('en-US', { timeZone, ...opts }).format(new Date(ts));
}

function countdownText(ms) {
  const mins = Math.max(1, Math.round(ms / 60000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  if (days >= 1) return `Starts in ${plural(days, 'day')}${hours ? ', ' + plural(hours, 'hour') : ''}`;
  if (hours >= 1) return `Starts in ${plural(hours, 'hour')}${m ? ', ' + plural(m, 'minute') : ''}`;
  return `Starts in ${plural(m, 'minute')}`;
}

function renderNextCall() {
  const call = nextCall();
  if (!call) return;
  const tz = SCHEDULE.timeZone;
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateLabel = `${fmt(call.start, { weekday: 'long', month: 'short', day: 'numeric' }, tz)} · ${fmt(call.start, { hour: 'numeric', minute: '2-digit' }, tz)} PT`.replace(/[ \u202f](AM|PM) PT$/, '\u00a0$1\u00a0PT');

  document.querySelectorAll('[data-next-date]').forEach(el => { el.textContent = dateLabel; });
  document.querySelectorAll('[data-next-status]').forEach(el => { el.textContent = call.live ? 'Live Now' : (call.first ? 'First Call' : 'Next Call'); });
  document.body.classList.toggle('is-live', call.live);

  const cd = document.querySelector('[data-next-countdown]');
  if (cd) cd.textContent = call.live ? "We're praying right now. Come on in." : countdownText(call.start - Date.now());

  const sameZone = tzOffsetMs(call.start, localTz) === tzOffsetMs(call.start, tz);
  const localTime = fmt(call.start, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }, localTz);
  const localEl = document.querySelector('[data-next-local]');
  if (localEl) localEl.textContent = sameZone ? '' : `That's ${localTime} where you are.`;
  const longEl = document.querySelector('[data-next-local-long]');
  if (longEl) {
    longEl.textContent = sameZone
      ? 'Every Monday, 9:30–10:00 AM Pacific.'
      : `Every Monday, 9:30–10:00 AM Pacific (${localTime} for you).`;
  }
  return call;
}
const firstCall = renderNextCall();
setInterval(renderNextCall, 30000);

/* ---------- Calendar: Google link (Apple/Outlook use the hosted .ics file) ---------- */
function stamp(ts, timeZone) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(new Date(ts)).reduce((o, x) => (o[x.type] = x.value, o), {});
  return `${p.year}${p.month}${p.day}T${p.hour}${p.minute}00`;
}
const pageUrl = window.location.href.split('#')[0];
const calDetails =
  `Thirty minutes of prayer, Scripture, and declarations for people in real estate and mortgage. Hosted by Revival Lending.\n\n` +
  `Join on Zoom: ${PRAYER_CONFIG.zoomUrl}\n` +
  (PRAYER_CONFIG.meetingId ? `Meeting ID: ${PRAYER_CONFIG.meetingId}\n` : '') +
  (PRAYER_CONFIG.passcode ? `Passcode: ${PRAYER_CONFIG.passcode}\n` : '') +
  (PRAYER_CONFIG.dialIn ? `Dial in: ${PRAYER_CONFIG.dialIn}\n` : '') +
  `\n${pageUrl}`;

if (firstCall) {
  const start = stamp(firstCall.start, SCHEDULE.timeZone);
  const end = stamp(firstCall.end, SCHEDULE.timeZone);

  const g = new URL('https://calendar.google.com/calendar/render');
  g.searchParams.set('action', 'TEMPLATE');
  g.searchParams.set('text', SCHEDULE.title);
  g.searchParams.set('dates', `${start}/${end}`);
  g.searchParams.set('ctz', SCHEDULE.timeZone);
  g.searchParams.set('recur', 'RRULE:FREQ=WEEKLY;BYDAY=MO');
  g.searchParams.set('details', calDetails);
  g.searchParams.set('location', PRAYER_CONFIG.zoomUrl);
  document.querySelectorAll('[data-cal-google]').forEach(a => { a.href = g.toString(); });

}

/* Apple / Outlook use the real calendar file on the site
   (assets/kingdom-minded-prayer-call.ics, built by scripts/make-calendar-file.py).
   A hosted file opens straight into Calendar on iPhone and Mac, where a
   file generated in the browser often fails. */

// Hero "Add it to my calendar" opens a small menu of calendar choices
document.querySelectorAll('[data-cal-toggle]').forEach(btn => {
  const menu = document.getElementById(btn.getAttribute('aria-controls'));
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setTimeout(close, 150); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !btn.parentElement.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
});

// Instagram / Facebook / LinkedIn in-app browsers block calendar adds: show a tip
if (/Instagram|FBAN|FBAV|FB_IAB|LinkedInApp|Line\//i.test(navigator.userAgent || '')) {
  document.querySelectorAll('[data-inapp-tip]').forEach(el => { el.hidden = false; });
}

/* ---------- Share ---------- */
document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
  const label = btn.querySelector('[data-share-label]');
  const original = label.textContent;
  const shareData = {
    title: 'Kingdom Minded Prayer Call',
    text: 'Thirty minutes of prayer for people in real estate and mortgage. Mondays, 9:30 AM Pacific, on Zoom.',
    url: pageUrl
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(pageUrl);
    label.textContent = 'Link copied. Send it to them.';
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    label.textContent = pageUrl;
  }
  setTimeout(() => { label.textContent = original; }, 3500);
}));
