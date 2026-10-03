import { readFile, writeFile } from 'node:fs/promises';
const file = new URL('../data/releases.json', import.meta.url);
const data = JSON.parse(await readFile(file, 'utf8'));
for (const product of data.products) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'Magic-Studio' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const endpoint = product.releaseTagPrefix ? 'releases?per_page=100' : 'releases/latest';
  const response = await fetch(`https://api.github.com/repos/${product.repository}/${endpoint}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${product.name}: GitHub 返回 ${response.status}，保留原清单`);
  const payload = await response.json();
  const release = product.releaseTagPrefix ? payload.find(item => !item.draft && !item.prerelease && item.tag_name.startsWith(product.releaseTagPrefix)) : payload;
  if (!release) throw new Error(`${product.name}: 未找到正式版本，保留原清单`);
  if (release.draft || release.prerelease) throw new Error(`${product.name}: 非正式版本`);
  const assets = release.assets.filter(asset => asset.state === 'uploaded');
  const asset = assets.find(asset => asset.name.startsWith(`${product.name}-`) && /-Mac-plugin\.pkg$/.test(asset.name))
    ?? assets.find(asset => asset.name.startsWith(`${product.name}-`) && /macOS-universal\.dmg$/.test(asset.name))
    ?? assets.find(asset => asset.name.startsWith(`${product.name}-`) && /macOS-universal\.zip$/.test(asset.name));
  const checksum = asset && assets.find(item => item.name === `${asset.name}.sha256`);
  if (!asset || !checksum || !asset.size) throw new Error(`${product.name}: 缺少通用安装包或校验文件，保留原清单`);
  Object.assign(product, { version: product.releaseTagPrefix ? release.tag_name.slice(product.releaseTagPrefix.length) : release.tag_name.match(/^v?(\d+\.\d+\.\d+)/)?.[1], publishedAt: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date(release.published_at)), format: asset.name.endsWith('.pkg') ? 'PKG' : asset.name.endsWith('.dmg') ? 'DMG' : 'ZIP', sizeBytes: asset.size, downloadUrl: asset.browser_download_url, checksumUrl: checksum.browser_download_url });
  console.log(`${product.name} ${product.version} (${product.format})`);
}
// Atomic at the product-set level: do not overwrite the file if either lookup fails.
await writeFile(file, JSON.stringify(data, null, 2) + '\n');
