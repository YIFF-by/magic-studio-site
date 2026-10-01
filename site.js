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
    bindSurfaceMotion(host);
    observeArrivals(host);
  } catch (error) {
    host.innerHTML = '<p class="error-message">版本信息暂时无法读取。请前往 <a href="https://yiff-by.github.io/magicboard-site/">MagicBoard 官网</a> 或 <a href="https://yiff-by.github.io/magicfile-site/">MagicFile 官网</a> 下载。</p>';
    console.error(error);
  }
}
renderDownloads();

// Motion follows the MagicBoard website: short arrivals and bounded pointer response.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const pointerPreference = matchMedia('(hover: hover) and (pointer: fine)');
const runningMotion = new Set();
function playMotion(element, frames, options) {
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(frames, { easing: 'cubic-bezier(.16,1,.3,1)', ...options });
  runningMotion.add(animation);
  animation.finished.catch(() => {}).finally(() => runningMotion.delete(animation));
}
function bindSurfaceMotion(root = document) {
  root.querySelectorAll('.product,.orb-product,.workflow-steps>div,.nav a,.hero-actions a,.download-action a').forEach(surface => {
    if (surface.dataset.motionBound) return;
    surface.dataset.motionBound = 'true';
    surface.classList.add('motion-surface');
    const isCard = surface.matches('.product,.orb-product');
    let bounds, frame = 0, pointer;
    function reset() {
      cancelAnimationFrame(frame); frame = 0; bounds = null;
      surface.classList.remove('pointer-engaged');
      for (const property of ['--motion-x','--motion-y','--motion-rx','--motion-ry']) surface.style.removeProperty(property);
    }
    surface.addEventListener('pointerenter', event => {
      if (motionPreference.matches || !pointerPreference.matches || event.pointerType === 'touch') return;
      bounds = surface.getBoundingClientRect();
      surface.classList.add('pointer-engaged');
    });
    surface.addEventListener('pointermove', event => {
      if (!bounds || motionPreference.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = Math.max(-.5, Math.min(.5, (pointer.x-bounds.left)/bounds.width-.5));
        const y = Math.max(-.5, Math.min(.5, (pointer.y-bounds.top)/bounds.height-.5));
        surface.style.setProperty('--motion-x', `${x*(isCard ? 5 : 3)}px`);
        surface.style.setProperty('--motion-y', `${y*(isCard ? 5 : 3)}px`);
        surface.style.setProperty('--motion-rx', `${-y*(isCard ? 3 : 1)}deg`);
        surface.style.setProperty('--motion-ry', `${x*(isCard ? 3 : 1)}deg`);
        surface.style.setProperty('--light-x', `${(x+.5)*100}%`);
        surface.style.setProperty('--light-y', `${(y+.5)*100}%`);
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    motionPreference.addEventListener('change', reset);
    window.addEventListener('blur', reset);
  });
}
function observeArrivals(root = document) {
  const targets = root.querySelectorAll('.section-heading,.product,.workflow-steps,.download-row,.help-heading');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const target = entry.target;
      playMotion(target, [{ opacity: .55, translate: '0 18px' }, { opacity: 1, translate: '0 0' }], { duration: 520 });
      // Present the sample workflow in order without creating interactive fake controls.
      const steps = target.querySelectorAll('.board-shot,.file-record,.resolve-result,.workflow-steps>div');
      steps.forEach((step, i) => playMotion(step, [{ opacity: .45, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], { duration: 420, delay: Math.min(i*75,225) }));
      target.querySelectorAll('.resolve-rail i').forEach((clip,i) => playMotion(clip, [{ scale: '.15 1', transformOrigin: 'left' }, { scale: '1 1', transformOrigin: 'left' }], { duration: 550, delay: i*90 }));
    });
  }, { threshold: .12 });
  targets.forEach(target => observer.observe(target));
}
bindSurfaceMotion();
observeArrivals();
playMotion(document.querySelector('.hero-copy'), [{ opacity: .6, translate: '0 16px' }, { opacity: 1, translate: '0 0' }], { duration: 620 });
document.querySelectorAll('.orb-product').forEach((card,i) => playMotion(card, [{ opacity: .3, scale: '.96', translate: '0 14px' }, { opacity: 1, scale: '1', translate: '0 0' }], { duration: 650, delay: 100+i*85 }));
document.querySelectorAll('.help details').forEach(details => details.addEventListener('toggle', () => {
  if (details.open) playMotion(details.querySelector('.faq-answer'), [{ opacity: .5, translate: '0 -5px' }, { opacity: 1, translate: '0 0' }], { duration: 240 });
}));
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) runningMotion.forEach(animation => animation.cancel());
});
