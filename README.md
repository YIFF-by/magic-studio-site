# Magic Studio

Public product and download website: https://yiff-by.github.io/magic-studio-site/

## Preview and update

Run `npm start` and open http://127.0.0.1:4321. The site uses static HTML/CSS/JavaScript without npm dependencies.

Before publishing product updates, run `npm run sync:releases`, `npm run check`, and `npm run build`. The sync script reads the latest stable public releases of MagicBoard, MagicFile and MagicResolve, selects macOS universal DMG files or the MagicResolve PKG plugin and requires matching SHA-256 files. Failed lookups preserve the previous manifest.

GitHub Pages publishes from the `main` branch root with `.nojekyll`. Website commits automatically redeploy the website. A release in another product repository does not by itself update this repository: sync and commit the new `data/releases.json` after publishing a product.

`examples/pages-workflow.yml` is an optional GitHub Actions deployment template for future use. It is not an active workflow. Enabling it requires the appropriate workflow permission and setting Pages to GitHub Actions; the current deployment uses branch publishing.

## Product boundaries

MagicShot is WeChat only, marked 内测中待上线 without a desktop download or search entry. The download section provides the supplied WeChat trial QR, valid before October 9. MagicResolve is a macOS DaVinci Resolve Studio plugin distributed as PKG, verified on Apple Silicon with Studio 21.1. Only public release files are linked; project and camera media stay with the local products. All four product demonstrations are styled interface illustrations based on their workflows, with generic sample data. Resolve uses the current v2 logo; no private project evidence is published. Product cards have no repeated download jumps. The download rows show support details and a single direct download button.

Repository: https://github.com/YIFF-by/magic-studio-site
