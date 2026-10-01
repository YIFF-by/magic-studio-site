'use strict';
const host = document.querySelector('#download-list');
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeURL = value => { const url = new URL(value); if (url.protocol !== 'https:') throw new Error('下载地址必须使用 HTTPS'); return escapeHTML(url.href); };
async function renderDownloads() {
  try {
    const response = await fetch('data/releases.json');
    if (!response.ok) throw new Error('无法读取版本清单');
    const data = await response.json();
    host.innerHTML = data.products.map(product => `<article class="download-row"><div class="download-name"><img src="assets/${escapeHTML(product.id)}-logo.png" alt=""><div><h3>${escapeHTML(product.name)}</h3><small>v${escapeHTML(product.version)} · ${escapeHTML(product.publishedAt)} 发布</small></div></div><div class="download-meta"><strong>macOS · Apple 芯片与 Intel</strong>${(product.sizeBytes / 1048576).toFixed(1)} MB · ${escapeHTML(product.format)}<p class="download-disclosure">${escapeHTML(product.installNote)}</p></div><div class="download-action"><a class="button primary" href="${safeURL(product.downloadUrl)}">下载 ${escapeHTML(product.format)} <span aria-hidden="true">↓</span></a><div class="download-links"><a href="${safeURL(product.guideUrl)}" target="_blank" rel="noopener noreferrer">安装与使用 ↗</a><a href="${safeURL(product.historyUrl)}" target="_blank" rel="noopener noreferrer">版本记录 ↗</a><a href="${safeURL(product.checksumUrl)}" aria-label="${escapeHTML(product.name)} SHA-256 校验文件">校验文件</a></div></div></article>`).join('');
  } catch (error) {
    host.innerHTML = '<p class="error-message">版本信息暂时无法读取。请前往 <a href="https://yiff-by.github.io/magicboard-site/">MagicBoard 官网</a> 或 <a href="https://yiff-by.github.io/magicfile-site/">MagicFile 官网</a> 下载。</p>';
    console.error(error);
  }
}
renderDownloads();
