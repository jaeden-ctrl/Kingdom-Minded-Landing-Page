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

## ⚠️ Required setup: connect the inquiry form to GoHighLevel

The "Request an Alignment Call" form at the bottom of the page is **not yet wired to
your GHL account**. Right now, submitting it will show a message telling the visitor
it isn't configured. It posts straight into a GHL Workflow via an **Inbound Webhook**
trigger — no API key, no backend code, and it lands directly in your recruiting
pipeline with automation instead of sitting in an inbox.

### Set it up in GoHighLevel (~10 minutes)

1. In GHL, go to **Automation → Workflows → Create Workflow** (start from blank).
2. Add a trigger: **Inbound Webhook**. GHL generates a unique URL that looks like
   `https://services.leadconnectorhq.com/hooks/xxxxxxxx/webhook-trigger/xxxxxxxx`.
3. Copy that URL, open `assets/js/main.js`, find this line near the top of the form logic:

   ```js
   const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL';
   ```

   and replace `YOUR_GHL_WEBHOOK_URL` with the URL from step 2.
4. Deploy (see below), then submit one test inquiry on the live page. GHL's webhook
   trigger will capture that submission as a sample payload, which lets you map fields
   in the next step (GHL shows a "Copy Sample" / detected-fields option once it has
   received at least one real request).
5. Back in the workflow, add a **Create/Update Contact** action and map these fields
   from the webhook payload onto Contact fields:

   | Webhook field    | Maps to                          |
   |-------------------|-----------------------------------|
   | `firstName`       | First Name                        |
   | `lastName`        | Last Name                         |
   | `email`           | Email                              |
   | `phone`           | Phone                              |
   | `city`            | City (or a custom field)          |
   | `licenseStatus`   | Custom field (create one)         |
   | `howHeard`        | Custom field or Lead Source        |
   | `message`         | Custom field / Notes               |

6. Add whatever happens next — assign to a pipeline stage, notify your team by SMS or
   email, trigger a follow-up sequence. This is the actual payoff of using GHL over a
   plain inbox: the lead is instantly working inside your existing recruiting pipeline.

### Alternative to GHL

If you'd rather use a different provider (Formspree, Web3Forms, your own backend, etc.),
swap the `fetch()` call in `assets/js/main.js` — the code that builds the `payload`
object right above it already has every field named clearly, so redirecting it
elsewhere is a small edit.

## Deployment

This is a static site — deploy it anywhere that serves static files:

- **Vercel / Netlify**: drag-and-drop the folder, or connect this repo. Zero config needed.
- **GitHub Pages**: enable Pages on this repo, serve from the root of the main branch.
- Any traditional web host: upload the files via FTP/SFTP.

No environment variables or server-side code are required — the GHL webhook URL is the
only thing you configure.

## Content source

All copy, the logo, owner photography (Tyson Hilton, Jaeden Kolb), and brand colors
(`#050505` black / `#c9ab7c` gold) were extracted directly from the
"Revival Lending — Kingdom Minded LO Deck" PDF to keep the page on-brand.

## Editing content later

- **Copy/sections**: edit directly in `index.html` — it's organized top-to-bottom
  (Hero → Honest Question → Why Revival → Who We Are → Leadership → Platform →
  Covenant → Comparison → What We Won't Do → What We're Looking For → Where We Lend →
  Apply/CTA → Footer).
- **Colors/fonts**: all defined as CSS variables at the top of `assets/css/style.css`.
- **Photos/logo**: replace files in `assets/img/` (keep the same filenames, or update
  the `src` attributes in `index.html`).
