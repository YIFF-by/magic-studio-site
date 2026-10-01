'use strict';
const host = document.querySelector('#download-list');
const siteVersion = document.currentScript ? new URL(document.currentScript.src).searchParams.get('v') || 'preview' : 'preview';
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeURL = value => { const url = new URL(value); if (url.protocol !== 'https:') throw new Error('下载地址必须使用 HTTPS'); return escapeHTML(url.href); };
async function renderDownloads() {
  try {
    const response = await fetch(`data/releases.json?v=${encodeURIComponent(siteVersion)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('无法读取版本清单');
    const data = await response.json();
    host.innerHTML = data.products.map(product => {
      const size = product.sizeBytes < 1048576 ? `${(product.sizeBytes / 1024).toFixed(1)} KB` : `${(product.sizeBytes / 1048576).toFixed(1)} MB`;
      const logo = product.id === 'magicresolve' ? 'magicresolve-logo-v2.png' : `${product.id}-logo.png`;
      return `<article class="download-row"><div class="download-name"><img src="assets/${escapeHTML(logo)}" alt=""><div><h3>${escapeHTML(product.name)}</h3><small>v${escapeHTML(product.version)} · ${escapeHTML(product.publishedAt)} 发布</small></div></div><div class="download-meta"><strong>${escapeHTML(product.platformLabel || 'macOS · Apple 芯片与 Intel')}</strong>${size} · ${escapeHTML(product.format)}<p class="download-disclosure">${escapeHTML(product.supportNote)}</p></div><div class="download-action"><a class="button primary" href="${safeURL(product.downloadUrl)}">下载 ${escapeHTML(product.format)} <span aria-hidden="true">↓</span></a></div></article>`;
    }).join('');
  } catch (error) {
    host.innerHTML = '<p class="error-message">版本信息暂时无法读取。请前往 <a href="https://yiff-by.github.io/magicboard-site/">MagicBoard 官网</a> 或 <a href="https://yiff-by.github.io/magicfile-site/">MagicFile 官网</a> 下载。</p>';
    console.error(error);
  }
}
renderDownloads();
