# $DAB67 — site

Static site, no build step, no framework. Three files do all the work:

```
index.html
styles.css
script.js
assets/
  logo.png       ← the flaming "OG" wordmark (nav + footer)
  hero.jpg       ← the light-trail dab photo (lore section)
  favicon.png    ← browser tab icon
```

## Assets

The two images you shared are already dropped into `assets/` as `logo.png` and
`hero.jpg` so you can preview the site immediately. Since you're managing images
in your own git repo, just overwrite those two files (keep the same filenames,
or update the `src`/`href` paths in `index.html` if you rename them):

- `assets/logo.png` → the fire "OG" mark. Used at small size in the nav and footer, so a version with tight-cropped transparent background works best.
- `assets/hero.jpg` → the dab/light-trail photo. Used full-bleed in the "Origin" section.
- `assets/favicon.png` → currently a copy of the logo. For a crisp favicon, crop it tighter (square, ~512×512, minimal padding) since browsers shrink it a lot.

If a file is missing, the page won't break — the logo just hides gracefully and
the hero image slot shows a small placeholder label so you know what to drop in.

## Editing the content

- **Contract address**: it's set in three places in `index.html` (hero chip, tokenomics, footer) plus once in `script.js` as the `CA` constant used for the copy-to-clipboard buttons. Update all four if it ever changes.
- **Social links**: `#` placeholders in the footer (`Twitter / X`, `Telegram`) — swap in real URLs.
- **Buy / chart links**: point to `pump.fun` and `dexscreener.com` search/home pages by default — swap in the direct token URLs once listed.
- **Tokenomics claims** (0% tax, LP burned, renounced, fair launch): written as placeholders matching common memecoin setups. Edit `#tokenomics` in `index.html` to match what's actually true for this contract before publishing — don't ship claims that aren't accurate.

## Running locally

No build tools needed. Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes on the design

- Dark, ember/fire palette pulled straight from the logo art (gold → orange → deep red), with a live particle canvas drifting embers behind the whole page and reacting to the cursor.
- Display type is Anton (the bold poster face echoing the brush-stroke flame lettering); body is Manrope; contract addresses and tick-style labels use JetBrains Mono.
- Every section reveals on scroll; the hero wordmark has a slow flame-flicker; the CTA copies the CA with a small toast confirmation.
- Respects `prefers-reduced-motion` — animations drop to a single static frame for anyone with that setting on.
