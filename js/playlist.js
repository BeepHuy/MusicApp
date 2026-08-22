// ═══════════════════════════════════════════
// playlist.js — Playlist CRUD (Supabase)
// Tạo, xóa playlist, thêm/xóa bài hát
// ═══════════════════════════════════════════

const Playlist = (() => {
  let userPlaylists = [];

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
  // INIT — load playlists nếu đã login
  // ══════════════════════════
  async function init() {
    db.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadPlaylists();
      } else {
        userPlaylists = [];
      }
      renderLibraryPage();
    });

    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      await loadPlaylists();
    }
    renderLibraryPage();
  }

  // ══════════════════════════
  // LOAD all playlists of current user
  // ══════════════════════════
  async function loadPlaylists() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { data, error } = await db
      .from('playlists')
      .select('id, name, is_public, created_at, playlist_songs(song_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load playlists failed:', error);
      return;
    }

    userPlaylists = data || [];
  }

  // ══════════════════════════
  // CREATE playlist
  // ══════════════════════════
  async function createPlaylist(name) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) { _toast('Please sign in first!', true); return; }
    if (!name || !name.trim()) return;

    const { data, error } = await db
      .from('playlists')
      .insert({ name: name.trim(), user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Create playlist failed:', error);
      _toast('Failed to create playlist', true);
      return;
    }

    await loadPlaylists();
    return data;
  }

  // ══════════════════════════
  // DELETE playlist
  // ══════════════════════════
  async function deletePlaylist(playlistId) {
    const { error } = await db
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      console.error('Delete playlist failed:', error);
      return;
    }

    await loadPlaylists();
  }

  // ══════════════════════════
  // ADD song to playlist
  // ══════════════════════════
  async function addSong(playlistId, songId) {
    // Check nếu đã có trong playlist
    const { data: existing } = await db
      .from('playlist_songs')
      .select('song_id')
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .single();

    if (existing) {
      _toast('Song already in playlist!');
      return;
    }

    // Tìm position tiếp theo
    const { data: songs } = await db
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPos = (songs && songs.length > 0) ? songs[0].position + 1 : 0;

    const { error } = await db
      .from('playlist_songs')
      .insert({ playlist_id: playlistId, song_id: songId, position: nextPos });

    if (error) {
      console.error('Add song failed:', error);
      return;
    }

    await loadPlaylists();
  }

  // ══════════════════════════
  // REMOVE song from playlist
  // ══════════════════════════
  async function removeSong(playlistId, songId) {
    const { error } = await db
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);

    if (error) {
      console.error('Remove song failed:', error);
      return;
    }

    await loadPlaylists();
  }

  // ══════════════════════════
  // LIBRARY PAGE (library.html) — grid + detail view
  // ══════════════════════════
  async function _fetchPlaylistSongs(playlistId) {
    const { data, error } = await db
      .from('playlist_songs')
      .select('position, songs(id, title, file_url, cover_url, artists(name))')
      .eq('playlist_id', playlistId)
      .order('position');

    if (error) {
      console.error('Load playlist songs failed:', error);
      return [];
    }
    return data || [];
  }

  function renderLibraryPage() {
    const body = document.querySelector('.library-body');
    if (!body) return;

    if (!Auth.getUser()) {
      body.innerHTML = `
        <div class="lib-empty">
          <i class="bi bi-person-circle"></i>
          <p>Sign in to see your playlists</p>
          <button class="lib-signin-btn">Sign In</button>
        </div>
      `;
      body.querySelector('.lib-signin-btn')?.addEventListener('click', () => {
        document.querySelector('.user-login-btn')?.click();
      });
      return;
    }

    _renderLibraryGrid(body);
  }

  function _renderLibraryGrid(body) {
    body.innerHTML = `
      <div class="lib-grid">
        <div class="lib-card lib-create">
          <i class="bi bi-plus-circle"></i>
          <span>New Playlist</span>
        </div>
        ${userPlaylists.length === 0 ? '<p class="lib-empty-text">No playlists yet. Create one to get started!</p>' : ''}
        ${userPlaylists.map(pl => `
          <div class="lib-card" data-pl-id="${pl.id}">
            <div class="lib-card-cover"><i class="bi bi-music-note-list"></i></div>
            <h5>${pl.name}</h5>
            <span class="lib-card-count">${pl.playlist_songs?.length || 0} songs</span>
          </div>
        `).join('')}
      </div>
    `;

    body.querySelector('.lib-create')?.addEventListener('click', function onCreateClick() {
      const createCard = this;
      createCard.removeEventListener('click', onCreateClick);
      createCard.innerHTML = `<input type="text" class="lib-create-input" placeholder="Playlist name" maxlength="60">`;

      const input = createCard.querySelector('.lib-create-input');
      input.focus();

      let done = false;
      const submit = async () => {
        if (done) return;
        done = true;
        const name = input.value.trim();
        if (name) await createPlaylist(name);
        _renderLibraryGrid(body);
      };

      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') { done = true; _renderLibraryGrid(body); }
      });
      input.addEventListener('blur', submit);
      input.addEventListener('click', (e) => e.stopPropagation());
    });

    body.querySelectorAll('.lib-card[data-pl-id]').forEach(card => {
      card.addEventListener('click', () => _renderLibraryDetail(body, card.dataset.plId));
    });
  }

  async function _renderLibraryDetail(body, playlistId) {
    const songs = await _fetchPlaylistSongs(playlistId);
    const playlist = userPlaylists.find(p => p.id === playlistId);
    const name = playlist?.name || 'Playlist';

    body.innerHTML = `
      <div class="lib-detail">
        <div class="lib-detail-header">
          <button class="lib-back" title="Back"><i class="bi bi-arrow-left"></i></button>
          <h2>${name}</h2>
          <span class="lib-detail-count">${songs.length} songs</span>
          <button class="lib-delete-playlist" title="Delete playlist"><i class="bi bi-trash3"></i></button>
        </div>
        ${songs.length === 0 ? '<p class="lib-empty-text">No songs yet. Click the + icon on any song to add it here.</p>' : ''}
        ${songs.map((item, i) => {
          const s = item.songs;
          if (!s) return '';
          return `
            <div class="lib-song-row" data-id="${s.id}">
              <span>${String(i + 1).padStart(2, '0')}</span>
              <img src="${s.cover_url}" alt="${s.artists?.name}">
              <h5>${s.title}<div class="subtitle">${s.artists?.name || 'Unknown'}</div></h5>
              <i class="bi bi-play-circle-fill lib-song-play" data-song-id="${s.id}"></i>
              <i class="bi bi-x-circle lib-song-remove" data-song-id="${s.id}" title="Remove"></i>
            </div>
          `;
        }).join('')}
      </div>
    `;

    body.querySelector('.lib-back')?.addEventListener('click', () => _renderLibraryGrid(body));

    body.querySelector('.lib-delete-playlist')?.addEventListener('click', function onDeleteClick() {
      const btn = this;
      btn.removeEventListener('click', onDeleteClick);
      btn.classList.add('lib-confirming');
      btn.innerHTML = `
        <i class="bi bi-check-lg lib-confirm-yes" title="Confirm delete"></i>
        <i class="bi bi-x-lg lib-confirm-no" title="Cancel"></i>
      `;

      const revert = () => {
        btn.classList.remove('lib-confirming');
        btn.innerHTML = '<i class="bi bi-trash3"></i>';
        btn.addEventListener('click', onDeleteClick);
      };
      const revertTimer = setTimeout(revert, 4000);

      btn.querySelector('.lib-confirm-yes').addEventListener('click', async (e) => {
        e.stopPropagation();
        clearTimeout(revertTimer);
        await deletePlaylist(playlistId);
        _renderLibraryGrid(body);
      });
      btn.querySelector('.lib-confirm-no').addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(revertTimer);
        revert();
      });
    });

    body.querySelectorAll('.lib-song-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await removeSong(playlistId, btn.dataset.songId);
        _renderLibraryDetail(body, playlistId);
      });
    });

    body.querySelectorAll('.lib-song-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.lib-song-remove')) return;
        const songId = row.dataset.id;
        if (songId) Player.playById(songId);
      });
    });
  }

  // ══════════════════════════
  // SHOW "Add to playlist" menu
  // ══════════════════════════
  function showAddMenu(songId, x, y) {
    // Remove existing menu
    document.querySelector('.add-to-playlist-menu')?.remove();

    const { data: { session } } = { data: { session: null } };

    if (userPlaylists.length === 0) {
      _toast('Create a playlist first!');
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'add-to-playlist-menu';
    menu.style.cssText = `
      position: fixed; top: ${y}px; left: ${x}px; z-index: 3000;
      background: rgba(15, 20, 40, 0.95); border: 1px solid rgba(54, 226, 236, 0.15);
      border-radius: 10px; padding: 8px 0; min-width: 160px;
    `;

    menu.innerHTML = `
      <div style="padding: 6px 14px; font-size: 11px; color: #7a7f94;">Add to playlist</div>
      ${userPlaylists.map(p => `
        <a class="add-to-pl-item" data-pl-id="${p.id}" style="
          display: block; padding: 8px 14px; font-size: 12px;
          color: #e0e4f0; cursor: pointer; transition: 0.2s;
        ">${p.name} (${p.playlist_songs?.length || 0})</a>
      `).join('')}
    `;

    document.body.appendChild(menu);

    // Click handler
    menu.querySelectorAll('.add-to-pl-item').forEach(item => {
      item.addEventListener('click', async () => {
        await addSong(item.dataset.plId, songId);
        menu.remove();
      });
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(54, 226, 236, 0.08)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = '';
      });
    });

    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', function close(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 10);
  }

  function getPlaylists() { return userPlaylists; }

  return { init, loadPlaylists, createPlaylist, deletePlaylist, addSong, removeSong, showAddMenu, getPlaylists, renderLibraryPage };
})();