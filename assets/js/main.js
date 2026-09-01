// ============================================================
// Revival Lending — main.js
// Nav behavior, scroll reveals, and inquiry form submission.
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Sticky nav background on scroll ---------- */
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
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

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => io.observe(el));

/* ---------- Stagger children delay index for grids ---------- */
document.querySelectorAll('.reveal-stagger').forEach(group => {
  Array.from(group.children).forEach((child, i) => {
    child.style.setProperty('--i', i);
  });
});

/* ============================================================
   INQUIRY FORM — sends an email (and, once configured, a text)
   notification the moment someone requests an alignment call.

   This uses Formspree (https://formspree.io) — a free service
   that emails form submissions with zero backend code required.

   SETUP (do this once):
   1. Go to https://formspree.io and create a free account.
   2. Create a new form and set the notification email to
      wherever you want inquiries delivered.
   3. Copy the Form ID Formspree gives you (looks like "mzzenwfg")
      and paste it below in place of "YOUR_FORM_ID".
   4. For TEXT message notifications, either:
        a) Turn on email forwarding to your phone's SMS gateway, or
        b) Connect Formspree -> Zapier -> Twilio (a "New Submission"
           trigger that sends an SMS) — no code needed, just clicks.
      See README.md for the full walkthrough.
   ============================================================ */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const form = document.getElementById('inquiryForm');
const statusBox = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Honeypot check — if filled, silently drop (bot)
  const honeypot = form.querySelector('input[name="_gotcha"]');
  if (honeypot && honeypot.value) return;

  const notConfigured = FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID');
  if (notConfigured) {
    showStatus(
      'This form isn’t connected to an inbox yet. Add your Formspree form ID in assets/js/main.js (see README.md) to start receiving inquiries by email/text.',
      true
    );
    return;
  }

  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(form);
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      form.reset();
      showStatus('Thank you — your request is in. A member of our team will reach out shortly to schedule your alignment call.', false);
    } else {
      const data = await res.json().catch(() => null);
      const msg = data && data.errors ? data.errors.map(e => e.message).join(', ') : 'Something went wrong sending your request.';
      showStatus(msg + ' Please call us directly at 714-257-5284.', true);
    }
  } catch (err) {
    showStatus('Something went wrong sending your request. Please call us directly at 714-257-5284.', true);
  } finally {
    submitBtn.textContent = originalLabel;
    submitBtn.disabled = false;
  }
});

function showStatus(message, isError) {
  statusBox.textContent = message;
  statusBox.classList.add('show');
  statusBox.classList.toggle('error', !!isError);
  statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
