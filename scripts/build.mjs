import { cp, mkdir, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('../_site/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'style.css', 'site.js', 'assets', 'data']) {
  await cp(new URL(path, root), new URL(path, output), { recursive: true });
}
console.log('Built _site (public assets only).');
