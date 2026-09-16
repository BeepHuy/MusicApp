// ═══════════════════════════════════════════
// router.js — SPA-lite Router
// Chặn điều hướng nội bộ giữa các "mục" (Discover/
// MY LIBRARY/RADIO/Weekly/Recommended/Search), fetch
// trang đích và chỉ thay phần nội dung riêng của trang
// đó. Header, sidebar, <nav> (search/user-menu) và
// thanh player không bao giờ bị đụng tới trong DOM,
// nên nhạc đang phát không bao giờ bị ngắt khi chuyển mục.
// ═══════════════════════════════════════════

const Router = (() => {
  const SPA_PAGES = [
    'index.html', 'library.html', 'radio.html',
    'week.html', 'recommended.html', 'search.html',
  ];

  function _fileName(pathname) {
    const parts = pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  function _isSpaLink(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (a.origin !== window.location.origin) return false;
    return SPA_PAGES.includes(_fileName(a.pathname));
  }

  // Vùng nội dung riêng của mỗi trang = các phần tử anh em nằm SAU <nav>,
  // bên trong .song_side (hoặc .song_side2 ở week.html). <nav> giữ nguyên.
  function _getContainer(doc) {
    return doc.querySelector('.song_side, .song_side2');
  }

  function _swapContent(doc) {
    const liveContainer = _getContainer(document);
    const fetchedContainer = _getContainer(doc);
    if (!liveContainer || !fetchedContainer) return false;

    const liveNav = liveContainer.querySelector(':scope > nav');
    const fetchedNav = fetchedContainer.querySelector(':scope > nav');
    if (!liveNav || !fetchedNav) return false;

    while (liveNav.nextElementSibling) {
      liveContainer.removeChild(liveNav.nextElementSibling);
    }

    let sib = fetchedNav.nextElementSibling;
    while (sib) {
      liveContainer.appendChild(document.importNode(sib, true));
      sib = sib.nextElementSibling;
    }

    // week.html dùng class "song_side2" thay vì "song_side" (CSS scope theo
    // class này) — đồng bộ lại để style không bị lệch khi qua lại giữa 2 loại trang.
    liveContainer.className = fetchedContainer.className;

    return true;
  }

  // Trang đích có thể cần 1 CSS riêng (VD library.css) chưa từng được load
  // ở trang hiện tại — bổ sung, không gỡ CSS cũ (các selector đã scope theo
  // class cha nên không xung đột khi load chung).
  function _syncStylesheets(doc) {
    const liveHrefs = new Set(
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href),
    );
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (!liveHrefs.has(link.href)) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = link.href;
        document.head.appendChild(newLink);
      }
    });
  }

  async function navigate(url, { skipPush = false } = {}) {
    const resolved = document.createElement('a');
    resolved.href = url;

    if (!skipPush && resolved.pathname === window.location.pathname) return;

    let html;
    try {
      const res = await fetch(resolved.href, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Bad response: ' + res.status);
      html = await res.text();
    } catch (err) {
      // Mất mạng / lỗi fetch → fallback về điều hướng thật, không im lặng bỏ qua
      window.location.href = resolved.href;
      return;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    _syncStylesheets(doc);

    if (!_swapContent(doc)) {
      window.location.href = resolved.href;
      return;
    }

    document.title = doc.title;
    if (!skipPush) {
      history.pushState({}, '', resolved.href);
    }

    if (typeof UI !== 'undefined') UI.renderPage();
  }

  function _onClick(e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest('a');
    if (!_isSpaLink(a)) return;

    e.preventDefault();
    navigate(a.href);
  }

  function _onPopState() {
    navigate(window.location.href, { skipPush: true });
  }

  function init() {
    document.addEventListener('click', _onClick);
    window.addEventListener('popstate', _onPopState);
    history.replaceState({}, '', window.location.href);
  }

  return { init, navigate };
})();

Router.init();
