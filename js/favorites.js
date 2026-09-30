// ═══════════════════════════════════════════
// favorites.js — Favorites (Supabase)
// Tim yêu thích riêng, khác với playlist
// ═══════════════════════════════════════════

const Favorites = (() => {
  let favoriteIds = new Set();

  // ══════════════════════════
  // TOAST — thông báo nhỏ, thay cho alert()
  // ══════════════════════════
  function _toast(message, isError = false) {
    document.querySelector('.app-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'app-toast' + (isError ? ' app-toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ══════════════════════════
  // INIT — load favorites nếu đã login
  // ══════════════════════════
  async function init() {
    db.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await _loadFavorites();
      } else {
        favoriteIds = new Set();
      }
      if (typeof UI !== 'undefined') UI.renderPage();
    });

    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      await _loadFavorites();
      if (typeof UI !== 'undefined') UI.renderPage();
    }
  }

  async function _loadFavorites() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { data, error } = await db
      .from('favorites')
      .select('song_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Load favorites failed:', error);
      return;
    }

    favoriteIds = new Set((data || []).map((r) => r.song_id));
  }

  function isFavorite(songId) {
    return favoriteIds.has(songId);
  }

  // ══════════════════════════
  // TOGGLE
  // ══════════════════════════
  async function toggle(songId) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      _toast('Please sign in first!', true);
      return;
    }

    const wasFavorite = favoriteIds.has(songId);

    if (wasFavorite) {
      const { error } = await db
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', songId);
      if (error) {
        console.error('Remove favorite failed:', error);
        return;
      }
      favoriteIds.delete(songId);
    } else {
      const { error } = await db
        .from('favorites')
        .insert({ user_id: user.id, song_id: songId });
      if (error) {
        console.error('Add favorite failed:', error);
        return;
      }
      favoriteIds.add(songId);
    }

    _refreshIcons(songId);
  }

  function _refreshIcons(songId) {
    const favorited = favoriteIds.has(songId);
    document.querySelectorAll(`.favorite-btn[data-song-id="${songId}"]`).forEach((el) => {
      el.classList.toggle('bi-heart-fill', favorited);
      el.classList.toggle('bi-heart', !favorited);
      el.classList.toggle('favorite-btn-active', favorited);
    });
  }

  // ══════════════════════════
  // FAVORITES PAGE (favorites.html)
  // ══════════════════════════
  async function renderFavoritesPage() {
    const body = document.querySelector('.favorites-body');
    if (!body) return;

    if (!Auth.getUser()) {
      body.innerHTML = `
        <div class="fav-empty">
          <i class="bi bi-person-circle"></i>
          <p>Sign in to see your favorites</p>
          <button class="fav-signin-btn">Sign In</button>
        </div>
      `;
      body.querySelector('.fav-signin-btn')?.addEventListener('click', () => {
        document.querySelector('.user-login-btn')?.click();
      });
      return;
    }

    const { data: { user } } = await db.auth.getUser();
    const { data, error } = await db
      .from('favorites')
      .select('song_id, created_at, songs(id, title, file_url, cover_url, artists(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load favorites page failed:', error);
      body.innerHTML = '<p class="fav-empty-text">Failed to load favorites.</p>';
      return;
    }

    const rows = (data || []).filter((r) => r.songs);

    if (rows.length === 0) {
      body.innerHTML = '<p class="fav-empty-text">No favorites yet. Tap the heart icon on any song to add it here.</p>';
      return;
    }

    body.innerHTML = rows.map((row) => {
      const s = row.songs;
      return `
        <div class="fav-song-row" data-id="${s.id}">
          <img src="${s.cover_url}" alt="${s.artists?.name || ''}">
          <h5>${s.title}<div class="subtitle">${s.artists?.name || 'Unknown'}</div></h5>
          <i class="bi bi-heart-fill favorite-btn favorite-btn-active" data-song-id="${s.id}"></i>
          <i class="bi playcircle bi-play-circle-fill" data-song-id="${s.id}"></i>
        </div>
      `;
    }).join('');

    body.querySelectorAll('.favorite-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggle(btn.dataset.songId);
        renderFavoritesPage();
      });
    });

    body.querySelectorAll('.playcircle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.target.dataset.songId;
        if (songId === Player.getCurrentId()) {
          Player.togglePause();
        } else {
          Player.playById(songId);
        }
      });
    });

    body.querySelectorAll('.fav-song-row').forEach((rowEl) => {
      rowEl.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn') || e.target.closest('.playcircle')) return;
        const songId = rowEl.dataset.id;
        if (songId) Player.playById(songId);
      });
    });
  }

  return { init, isFavorite, toggle, renderFavoritesPage };
})();
