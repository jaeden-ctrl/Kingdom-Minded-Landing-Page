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

/* ---------- Scroll reveal ----------
   Progressive enhancement: content is visible by default in CSS (so it
   never depends on JS or an observer firing). Only here, once we know
   JS is running and the visitor hasn't asked for reduced motion, do we
   arm the hide-then-reveal animation. */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');

if (!prefersReducedMotion && revealEls.length) {
  document.documentElement.classList.add('js-reveal-armed');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ---------- Stagger children delay index for grids ---------- */
document.querySelectorAll('.reveal-stagger').forEach(group => {
  Array.from(group.children).forEach((child, i) => {
    child.style.setProperty('--i', i);
  });
});

/* ============================================================
   INQUIRY FORM — posts straight into GoHighLevel so inquiries land
   in the recruiting pipeline with automation, instead of an inbox.

   This uses a GHL "Inbound Webhook" workflow trigger — no API key
   needed, and no backend code required.

   SETUP (do this once, in GoHighLevel):
   1. Go to Automation -> Workflows -> Create Workflow (blank).
   2. Add Trigger -> "Inbound Webhook". GHL gives you a unique URL
      like https://services.leadconnectorhq.com/hooks/xxxx/webhook-trigger/xxxx
   3. Submit one test inquiry on the live site first (with this file
      still pointing at the placeholder below is fine for the shape —
      or use GHL's "Copy Sample" / send a manual test POST) so GHL
      can read the field names and let you map them in later steps.
   4. Add a "Create/Update Contact" action, mapping:
        firstName, lastName, email, phone, city, licenseStatus,
        howHeard, message
      to the matching Contact fields (create custom fields for
      licenseStatus/howHeard if you want them saved).
   5. Add whatever automation you want after that — assign to a
      pipeline stage, notify your team by SMS/email, etc. This is
      the point where GHL replaces the old "just an inbox" version.
   6. Copy the webhook URL from step 2 and paste it below in place
      of "YOUR_GHL_WEBHOOK_URL".
   ============================================================ */

const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/rC76iRdLNiuOSwOFbBhG/webhook-trigger/f23a88d9-9ad6-4d73-b87c-9f16f1fca6d2';

const form = document.getElementById('inquiryForm');
const statusBox = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Honeypot check — if filled, silently drop (bot)
  const honeypot = form.querySelector('input[name="_gotcha"]');
  if (honeypot && honeypot.value) return;

  const notConfigured = GHL_WEBHOOK_URL.includes('YOUR_GHL_WEBHOOK_URL');
  if (notConfigured) {
    showStatus(
      'This form isn’t connected to GoHighLevel yet. Add your Inbound Webhook URL in assets/js/main.js (see README.md) to start receiving inquiries there.',
      true
    );
    return;
  }

  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  try {
    const fd = new FormData(form);
    const payload = {
      firstName: fd.get('First Name') || '',
      lastName: fd.get('Last Name') || '',
      email: fd.get('Email') || '',
      phone: fd.get('Phone') || '',
      city: fd.get('Location') || '',
      licenseStatus: fd.get('License Status') || '',
      howHeard: fd.get('How They Heard About Us') || '',
      message: fd.get('Message') || '',
      tcpaConsent: fd.get('TCPA Consent') ? true : false,
      source: 'revivallending.com Kingdom Minded landing page'
    };

    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      form.reset();
      showStatus('Thank you — your request is in. A member of our team will reach out shortly to schedule your alignment call.', false);
    } else {
      showStatus('Something went wrong sending your request. Please call us directly at (714) 442-3911.', true);
    }
  } catch (err) {
    showStatus('Something went wrong sending your request. Please call us directly at (714) 442-3911.', true);
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
