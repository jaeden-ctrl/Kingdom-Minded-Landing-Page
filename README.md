# Revival Lending — Kingdom Minded Platform Landing Page

A single-page recruiting site for prospective loan officers, built directly from the
Revival Lending pitch deck (branding, copy, photography, and logo pulled from the deck itself).

Static site — plain HTML/CSS/JS. No build step, no framework, no server required to run it.

## Structure

```
index.html              All page content/sections
assets/css/style.css     Styling (black/gold brand system)
assets/js/main.js        Nav, scroll animations, inquiry form submission
assets/img/              Logo, owner photos, background photography, favicon
```

## Running it locally

Just open `index.html` in a browser, or serve it:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## ⚠️ Required setup: connect the inquiry form to email/text notifications

The "Request an Alignment Call" form at the bottom of the page is **not yet wired to
an inbox**. Right now, submitting it will show a message telling the visitor it isn't
configured. Do this once, and every submission will land in your email (and optionally
as a text) automatically:

### 1. Email notifications (5 minutes, free)

1. Go to **https://formspree.io** and create a free account.
2. Create a new form. Set the notification email to whichever inbox should receive
   inquiries (e.g. motivate4ward@yahoo.com, or a shared team inbox).
3. Formspree gives you a **Form ID** (e.g. `mzzenwfg`).
4. Open `assets/js/main.js`, find this line near the top of the form logic:

   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   ```

   and replace `YOUR_FORM_ID` with your real ID.
5. Deploy (see below). Submit a test inquiry on the live page — you should get an
   email within seconds.

Formspree's free tier includes 50 submissions/month, spam filtering, and email
notifications out of the box — plenty to start.

### 2. Text (SMS) notifications (optional, ~10 minutes)

Formspree doesn't send texts natively, so bridge it with **Zapier** (free tier works):

1. In Zapier, create a new Zap.
2. **Trigger:** Formspree → "New Submission" (connect your Formspree account, pick your form).
3. **Action:** Twilio → "Send SMS" (you'll need a free Twilio trial account + phone number),
   or use Zapier's built-in SMS-by-Zapier action to text your own phone directly —
   no Twilio account needed for that option.
4. Map the form fields (Name, Phone, How They Heard About Us, Message) into your text template, e.g.:
   > New LO inquiry: {{First Name}} {{Last Name}}, {{Phone}}, heard about us via {{How They Heard About Us}}.
5. Turn the Zap on.

Once both are set up, every submission on the site sends **both** an email and a text
the moment someone fills out the form.

### Alternative to Formspree

If you'd rather use a different provider (Web3Forms, Basin, your own backend, etc.),
just swap the `fetch()` call in `assets/js/main.js` — the form already POSTs standard
field names (`First Name`, `Last Name`, `Email`, `Phone`, `Location`, `License Status`,
`How They Heard About Us`, `Message`).

## Deployment

This is a static site — deploy it anywhere that serves static files:

- **Vercel / Netlify**: drag-and-drop the folder, or connect this repo. Zero config needed.
- **GitHub Pages**: enable Pages on this repo, serve from the root of the main branch.
- Any traditional web host: upload the files via FTP/SFTP.

No environment variables or server-side code are required — the Formspree ID is the
only thing you configure.

## Content source

All copy, the logo, owner photography (Tyson Hilton, Jaeden Kolb), and brand colors
(`#050505` black / `#c9ab7c` gold) were extracted directly from the
"Revival Lending — Kingdom Minded LO Deck" PDF to keep the page on-brand.

## Editing content later

- **Copy/sections**: edit directly in `index.html` — it's organized top-to-bottom in the
  same order as the pitch deck (Hero → Honest Question → Why Revival → Who We Are →
  Leadership → Platform → Covenant → Comparison → What We Won't Do → Where We Lend →
  First 30 Days → Apply/CTA → Footer).
- **Colors/fonts**: all defined as CSS variables at the top of `assets/css/style.css`.
- **Photos/logo**: replace files in `assets/img/` (keep the same filenames, or update
  the `src` attributes in `index.html`).
