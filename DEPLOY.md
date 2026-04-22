# Giving the prototypes a public URL

The suite is fully static — three HTML files plus three JSON data blobs (~21 MB total). No server-side code, no auth, no build step. That means almost any static-host or tunnel option works. Below are the practical paths from "fastest" to "most production-shaped", with the trade-offs.

---

## Option 1 · Cloudflare Pages — recommended default

**Best for:** a stable, free, fast public URL you can share with FDIC stakeholders.

- Free tier covers everything you'll need (unlimited bandwidth, custom domain, HTTPS).
- 25 MB asset size limit per file — your largest file (`liquidity_panel.json`) is ~10 MB so you're fine.
- Deploys directly from a GitHub repo on every push.
- ~30 seconds from "git push" to live.

Setup:
1. Push the repo to GitHub (you already have `pnunna2020/FDIC-Prototypes`).
2. At dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
3. Pick the repo. **Build command:** *(leave blank)*. **Build output directory:** `prototypes`.
4. Hit Save and Deploy. You'll get a URL like `fdic-prototypes.pages.dev`.

The current `.gitignore` excludes the JSON data files — you'll need to either commit them (they're public-derived FDIC data so this is fine) or push them as a separate "data" branch.

---

## Option 2 · Netlify Drop — fastest possible

**Best for:** sharing today, in the next 60 seconds, no GitHub round-trip.

1. Go to app.netlify.com/drop.
2. Drag the `prototypes/` folder onto the page.
3. You get a URL instantly. Free.

The drop URL is randomly assigned but stable. Drag again to update. No account required for the first deploy. Hit the same limits as Cloudflare (25 MB single file).

---

## Option 3 · GitHub Pages

**Best for:** keeping everything inside the repo workflow you already have.

The repo already exists. Push includes a `prototypes/` folder, then:

1. Repo → Settings → Pages → Source = main branch, folder = `/prototypes`.
2. Wait ~60 seconds. URL will be `pnunna2020.github.io/FDIC-Prototypes/`.

**Catch:** GitHub Pages enforces a 100 MB file limit and a 1 GB repo cap, but the silent gotcha is large files are slow to serve. Your JSON blobs (~10 MB each) will load but are noticeably sluggish on first paint vs Cloudflare/Netlify which have global edge caching.

You will need to remove the `*.json` lines from `.gitignore` and commit the data files for GitHub Pages to serve them.

---

## Option 4 · Vercel

**Best for:** if you anticipate adding Next.js / API routes later — Vercel makes that swap trivial.

Same pattern as Cloudflare Pages. Free tier, GitHub integration, custom domain. Slight edge over Cloudflare on developer-experience polish; slight loss on free-tier bandwidth caps. For pure static, Cloudflare wins.

---

## Option 5 · ngrok (or Cloudflare Tunnel) — temporary share

**Best for:** "let me show you this in the next ten minutes from my laptop" before any real deploy.

While the local server is running (the `Launch FDIC Prototypes.command` script), in another terminal:

```bash
ngrok http 8765
```

You'll get a temporary `https://<random>.ngrok-free.app` URL that proxies to your laptop. Free tier is fine for one-off demos but the URL changes every restart and your machine must stay awake. **Do not use this for anything supervisor-facing** — it's a personal-laptop tunnel, not a real deploy.

Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:8765`) is the same idea with no account required.

---

## What I'd actually do

1. **Today, for the demo to whoever:** Netlify Drop (60-second turnaround).
2. **For the persistent FDIC-shareable link:** Cloudflare Pages connected to the GitHub repo, with the data files committed alongside the HTML.
3. **The serious answer if this becomes a real federal pilot:** none of the above. FedRAMP-aligned hosting (AWS GovCloud, Azure Government), SSO via PIV/CAC, audit logging, and a real backend serving the data behind auth. See the readiness checklist at the bottom of `ROADMAP.md`.

---

## A note on the data files

The `prototypes/*.json` files (`institutions.json`, `liquidity_panel.json`, `variables.json`, `quarters.json`) are derived from public FDIC bulk data. There is no licensing barrier to publishing them. The current `.gitignore` excludes them only to keep the repo small — when you deploy, you need to ship them with the HTML or the apps will load empty.

Quick fix: edit `.gitignore` to remove the `*.json` line under `prototypes/`, then `git add prototypes/*.json && git commit && git push`.
