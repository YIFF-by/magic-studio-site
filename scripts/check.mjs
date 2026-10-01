import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const data = JSON.parse(await readFile(new URL('data/releases.json', root), 'utf8'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `Missing anchor ${match[1]}`);
for (const match of html.matchAll(/(?:src|href)="((?:assets\/|style\.css|site\.js)[^"]*)"/g)) await access(new URL(match[1], root));
assert.deepEqual(data.products.map(product => product.id), ['magicboard', 'magicfile', 'magicresolve']);
for (const product of data.products) {
  assert(product.sizeBytes > 0 && /^\d+\.\d+\.\d+$/.test(product.version));
  for (const key of ['downloadUrl', 'checksumUrl', 'guideUrl', 'historyUrl']) assert.equal(new URL(product[key]).protocol, 'https:');
  assert.equal(product.checksumUrl, `${product.downloadUrl}.sha256`);
}
const shot = html.split('id="magicshot"')[1].split('</article>')[0];
assert(shot.includes('内测中待上线') && !shot.includes('href='), 'MagicShot must have no download/search entry');
assert(!html.includes('获取 MagicBoard') && !html.includes('获取 MagicFile'), 'Product cards must not repeat download jumps');
const script = await readFile(new URL('site.js', root), 'utf8');
assert(!script.includes('download-links'), 'No auxiliary download links');
assert(!JSON.stringify(data).includes('公证'), 'Download metadata only states supported environments');
console.log('Static assets, navigation, release manifest and MagicShot status verified.');
