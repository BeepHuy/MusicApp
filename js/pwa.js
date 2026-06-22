// ═══════════════════════════════════════════
// pwa.js — PWA Install + Service Worker
// ═══════════════════════════════════════════

const PWA = (() => {
  let deferredPrompt = null;

  function init() {
    _registerSW();
    _handleInstall();
    _addMediaSession();
  }

  // ── Register Service Worker ──
  function _registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('✅ SW registered:', reg.scope))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }

  // ── Install prompt ──
  function _handleInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      _showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      document.querySelector('.pwa-install-btn')?.remove();
      console.log('🎉 App installed!');
    });
  }

  function _showInstallButton() {
    // Thêm nút install vào sidebar
    const playlist = document.querySelector('.playlist');
    if (!playlist || document.querySelector('.pwa-install-btn')) return;

    const btn = document.createElement('div');
    btn.className = 'pwa-install-btn';
    btn.innerHTML = `
      <h4 style="cursor:pointer; color:#36e2ec; font-size:13px; padding:10px 0; display:flex; align-items:center; gap:8px;">
        <i class="bi bi-download"></i> Install App
      </h4>
    `;
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install:', outcome);
      deferredPrompt = null;
      btn.remove();
    });

    playlist.parentElement.insertBefore(btn, playlist.nextSibling);
  }

  // ── Media Session API (lock screen controls) ──
  function _addMediaSession() {
    if (!('mediaSession' in navigator)) return;

    // Listen for song changes
    document.addEventListener('songChanged', (e) => {
      _updateMediaSession();
    });
  }

  function _updateMediaSession() {
    const titleEl = document.getElementById('title');
    if (!titleEl) return;

    const posterEl = document.getElementById('poster_master_play');
    const title = titleEl.textContent.split('\n')[0]?.trim() || 'Music App';
    const subtitle = titleEl.querySelector('.subtitle')?.textContent?.trim() || '';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: subtitle,
      album: 'Music App',
      artwork: [
        { src: posterEl?.src || 'img/logo_web.png', sizes: '512x512', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      document.getElementById('masterPlay')?.click();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      document.getElementById('masterPlay')?.click();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      document.getElementById('back')?.click();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      document.getElementById('next')?.click();
    });
  }

  return { init };
})();