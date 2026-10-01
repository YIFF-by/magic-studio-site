import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const output = new URL('../_site/', import.meta.url);
const assets = ['style.css', 'site.js', 'assets/product-demos.css', 'data/releases.json'];
const hash = createHash('sha256');
for (const file of assets) hash.update(await readFile(new URL(file, root)));
const version = hash.digest('hex').slice(0, 12);
let html = await readFile(new URL('index.html', root), 'utf8');
html = html.replace(/href="style\.css(?:\?[^\"]*)?"/, `href="style.css?v=${version}"`)
  .replace(/href="assets\/product-demos\.css(?:\?[^\"]*)?"/, `href="assets/product-demos.css?v=${version}"`)
  .replace(/src="site\.js(?:\?[^\"]*)?"/, `src="site.js?v=${version}"`);
await writeFile(new URL('index.html', root), html);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'style.css', 'site.js', 'assets', 'data']) {
  await cp(new URL(path, root), new URL(path, output), { recursive: true });
}
console.log('Built _site (public assets only).');
