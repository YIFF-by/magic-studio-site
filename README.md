# Magic Studio

Static product and download website. No framework or npm dependencies.

## Preview

Run `npm start`, then open http://127.0.0.1:4321. Use HTTP rather than double-clicking the HTML because download metadata is loaded from JSON.

## Build

`npm run sync:releases` reads the latest stable public GitHub releases for MagicBoard and MagicFile. It requires matching uploaded macOS universal assets and SHA-256 files; if either product lookup fails, the current manifest remains unchanged. `npm run check` verifies local links, product status and metadata. `npm run build` copies only public site files into `_site`.

## Publish to GitHub Pages

Create a public website repository (suggested name: `magic-studio-site`), push to its `main` branch, and select GitHub Actions under Settings → Pages → Source. The included workflow syncs public release metadata, checks and deploys the site on website pushes, manual runs, or `repository_dispatch` events of type `product-released`.

Product releases in other repositories do not automatically trigger this website. After a product's release assets finish uploading and verification, its publishing script/workflow must send a `product-released` repository dispatch to this website repository. The sender needs a narrowly scoped credential that can dispatch to the target repository; never put that credential in browser code. Until this is wired up, run this website's workflow manually after product releases.

MagicShot is WeChat only and displays 即将上线 without a search or download entry. MagicResolve content and delivery format await confirmation; no download is fabricated. The website does not use the local MagicBoard 1.0.30 preview package as a public release.

## Content

Update `index.html` for product copy and `data/releases.json` for product repositories and installation notes. Product screenshots are copied from existing MagicBoard/MagicFile materials. The on-site camera record and timeline graphics are labeled feature illustration / preview pending, not screenshots.

This checkout is a local preview. Public website repository: https://github.com/YIFF-by/magic-studio-site. GitHub Pages deployment is managed by the included workflow.
