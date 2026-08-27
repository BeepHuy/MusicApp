// ═══════════════════════════════════════════
// admin.js — Manage Songs (Admin CRUD)
// Chỉ ADMIN_UID (js/supabase.js) mới dùng được
// ═══════════════════════════════════════════

const Admin = (() => {
  let songs = [];
  let artists = [];
  let editingId = null;

  // ══════════════════════════
  // INIT — kiểm tra quyền admin trước khi làm gì khác
  // ══════════════════════════
  async function init() {
    const gate = document.querySelector('.admin-gate');
    const body = document.querySelector('.admin-body');
    if (!gate || !body) return;

    const { data: { session } } = await db.auth.getSession();
    if (!session?.user || session.user.id !== ADMIN_UID) {
      gate.style.display = 'block';
      body.style.display = 'none';
      return;
    }

    gate.style.display = 'none';
    body.style.display = 'grid';

    await _loadData();
    _renderForm();
    _renderList();
  }

  // ══════════════════════════
  // LOAD songs + artists
  // ══════════════════════════
  async function _loadData() {
    const [songsRes, artistsRes] = await Promise.all([
      db.from('songs')
        .select('id, title, file_url, cover_url, section, genre, display_order, artist_id, artists(name)')
        .order('display_order'),
      db.from('artists').select('id, name, avatar_url').order('name'),
    ]);

    songs = songsRes.data || [];
    artists = artistsRes.data || [];
  }

  // ══════════════════════════
  // FILE UPLOAD helper
  // ══════════════════════════
  function _extOf(filename) {
    const m = filename.match(/\.[^.]+$/);
    return m ? m[0] : '';
  }

  async function _uploadFile(bucket, file) {
    const path = crypto.randomUUID() + _extOf(file.name);
    const { error } = await db.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return (bucket === 'audio' ? AUDIO_URL : IMAGES_URL) + path;
  }

  function _pathFromUrl(url, base) {
    return url && url.startsWith(base) ? url.slice(base.length) : null;
  }

  // ══════════════════════════
  // FORM — add / edit
  // ══════════════════════════
  function _renderForm(song) {
    const container = document.querySelector('.admin-form-card');
    if (!container) return;

    const artistOptions = artists.map(a =>
      `<option value="${a.id}" ${song?.artist_id === a.id ? 'selected' : ''}>${a.name}</option>`
    ).join('');

    container.innerHTML = `
      <h4>${song ? 'Edit Song' : 'Add New Song'}</h4>
      <form id="songForm">
        <label>Title</label>
        <input type="text" name="title" value="${song?.title || ''}" required>

        <label>Artist</label>
        <select name="artist" id="artistSelect">
          ${artistOptions}
          <option value="__new__">+ Add new artist</option>
        </select>
        <input type="text" name="newArtistName" id="newArtistName" placeholder="New artist name" style="display:none;">

        <label>Section</label>
        <select name="section">
          <option value="sidebar" ${song?.section === 'sidebar' ? 'selected' : ''}>Sidebar</option>
          <option value="popular" ${song?.section === 'popular' ? 'selected' : ''}>Popular Song</option>
          <option value="new_release" ${song?.section === 'new_release' ? 'selected' : ''}>New Release</option>
        </select>

        <label>Genre <span class="admin-optional">(optional)</span></label>
        <input type="text" name="genre" value="${song?.genre || ''}" placeholder="lofi, hip-hop, pop...">

        <label>Cover Image ${song ? '<span class="admin-optional">(leave empty to keep current image)</span>' : ''}</label>
        <input type="file" name="coverFile" accept="image/*">
        ${song?.cover_url ? `<img src="${song.cover_url}" class="admin-preview" alt="cover">` : ''}

        <label>Audio File ${song ? '<span class="admin-optional">(leave empty to keep current file)</span>' : ''}</label>
        <input type="file" name="audioFile" accept="audio/*">

        <div class="admin-form-actions">
          <button type="submit">${song ? 'Update Song' : 'Add Song'}</button>
          ${song ? '<button type="button" class="admin-cancel-edit">Cancel</button>' : ''}
        </div>
      </form>
    `;

    container.querySelector('#songForm').addEventListener('submit', _handleSubmit);

    const artistSelect = container.querySelector('#artistSelect');
    const newArtistInput = container.querySelector('#newArtistName');
    artistSelect.addEventListener('change', () => {
      newArtistInput.style.display = artistSelect.value === '__new__' ? 'block' : 'none';
    });

    container.querySelector('.admin-cancel-edit')?.addEventListener('click', () => {
      editingId = null;
      _renderForm();
    });
  }

  async function _handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const title = form.title.value.trim();

    if (!title) { _toast('Title is required', true); return; }

    submitBtn.disabled = true;
    try {
      // Resolve artist_id (chọn có sẵn hoặc tạo nghệ sĩ mới)
      let artistId = form.artist.value;
      if (artistId === '__new__') {
        const newName = form.newArtistName.value.trim();
        if (!newName) { _toast('Artist name is required', true); return; }
        const { data: newArtist, error: artistErr } = await db
          .from('artists').insert({ name: newName }).select().single();
        if (artistErr) throw artistErr;
        artistId = newArtist.id;
      }

      const audioFile = form.audioFile.files[0];
      const coverFile = form.coverFile.files[0];

      if (!editingId && !audioFile) { _toast('Audio file is required', true); return; }
      if (!editingId && !coverFile) { _toast('Cover image is required', true); return; }

      const payload = {
        title,
        section: form.section.value,
        genre: form.genre.value.trim() || null,
        artist_id: artistId,
      };

      if (audioFile) payload.file_url = await _uploadFile('audio', audioFile);
      if (coverFile) payload.cover_url = await _uploadFile('images', coverFile);

      if (editingId) {
        const { error } = await db.from('songs').update(payload).eq('id', editingId);
        if (error) throw error;
        _toast('Song updated');
      } else {
        const maxOrder = songs
          .filter(s => s.section === payload.section)
          .reduce((m, s) => Math.max(m, s.display_order || 0), 0);
        payload.display_order = maxOrder + 1;

        const { error } = await db.from('songs').insert(payload);
        if (error) throw error;
        _toast('Song added');
      }

      editingId = null;
      await _loadData();
      _renderForm();
      _renderList();
    } catch (err) {
      console.error('Save song failed:', err);
      _toast('Save failed: ' + (err.message || 'unknown error'), true);
    } finally {
      submitBtn.disabled = false;
    }
  }

  // ══════════════════════════
  // LIST — tất cả bài hát, Edit / Delete
  // ══════════════════════════
  function _renderList() {
    const listEl = document.querySelector('.admin-list');
    if (!listEl) return;

    listEl.innerHTML = `
      <h4>All Songs (${songs.length})</h4>
      <div class="admin-song-rows">
        ${songs.map(s => `
          <div class="admin-song-row" data-id="${s.id}">
            <img src="${s.cover_url}" alt="${s.title}">
            <div class="admin-song-info">
              <h5>${s.title}</h5>
              <span class="subtitle">${s.artists?.name || 'Unknown'} · ${s.section}${s.genre ? ' · ' + s.genre : ''}</span>
            </div>
            <button class="admin-edit-btn" title="Edit"><i class="bi bi-pencil"></i></button>
            <button class="admin-delete-btn" title="Delete"><i class="bi bi-trash3"></i></button>
          </div>
        `).join('')}
      </div>
    `;

    listEl.querySelectorAll('.admin-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.admin-song-row').dataset.id;
        editingId = id;
        _renderForm(songs.find(s => s.id === id));
        document.querySelector('.admin-form-card')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    listEl.querySelectorAll('.admin-delete-btn').forEach(btn => {
      btn.addEventListener('click', function onDeleteClick() {
        const id = btn.closest('.admin-song-row').dataset.id;
        const song = songs.find(s => s.id === id);

        btn.removeEventListener('click', onDeleteClick);
        btn.classList.add('admin-confirming');
        btn.innerHTML = `
          <i class="bi bi-check-lg admin-confirm-yes" title="Confirm delete"></i>
          <i class="bi bi-x-lg admin-confirm-no" title="Cancel"></i>
        `;

        const revert = () => {
          btn.classList.remove('admin-confirming');
          btn.innerHTML = '<i class="bi bi-trash3"></i>';
          btn.addEventListener('click', onDeleteClick);
        };
        const revertTimer = setTimeout(revert, 4000);

        btn.querySelector('.admin-confirm-yes').addEventListener('click', async (e) => {
          e.stopPropagation();
          clearTimeout(revertTimer);
          await _deleteSong(song);
        });
        btn.querySelector('.admin-confirm-no').addEventListener('click', (e) => {
          e.stopPropagation();
          clearTimeout(revertTimer);
          revert();
        });
      });
    });
  }

  async function _deleteSong(song) {
    const { error } = await db.from('songs').delete().eq('id', song.id);
    if (error) {
      console.error('Delete song failed:', error);
      _toast('Delete failed', true);
      return;
    }

    const audioPath = _pathFromUrl(song.file_url, AUDIO_URL);
    const coverPath = _pathFromUrl(song.cover_url, IMAGES_URL);
    if (audioPath) await db.storage.from('audio').remove([audioPath]);
    if (coverPath) await db.storage.from('images').remove([coverPath]);

    _toast('Song deleted');
    await _loadData();
    _renderList();
  }

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

  return { init };
})();
