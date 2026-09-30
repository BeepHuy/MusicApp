// ═══════════════════════════════════════════
// history.js — Recently Played (Supabase)
// Ghi lại mỗi lần đổi bài thật (không tính lúc khôi
// phục hiển thị từ localStorage lúc load trang),
// hiện lại trên trang Discover
// ═══════════════════════════════════════════

const History = (() => {
  function init() {
    document.addEventListener('songChanged', (e) => {
      if (e.detail.restored) return;
      _record(e.detail.id);
    });
  }

  async function _record(songId) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    const { error } = await db
      .from('play_history')
      .insert({ user_id: user.id, song_id: songId });

    if (error) {
      console.error('Record play history failed:', error);
    }
  }

  // ══════════════════════════
  // RENDER — khu vực "Recently Played" trên Discover
  // ══════════════════════════
  async function renderRecentlyPlayed() {
    const songSide = document.querySelector('.song_side');
    if (!songSide) return;

    // Xóa bản cũ (nếu có) để render lại từ đầu mỗi lần vào trang
    songSide.querySelector('.recently_played')?.remove();

    const user = Auth.getUser();
    if (!user) return;

    const { data, error } = await db
      .from('play_history')
      .select('song_id, played_at, songs(id, title, file_url, cover_url, artists(name))')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Load play history failed:', error);
      return;
    }

    // Dedupe theo song_id, giữ lần nghe mới nhất (data đã sắp mới nhất trước)
    const seen = new Set();
    const recent = [];
    for (const row of data || []) {
      if (!row.songs || seen.has(row.song_id)) continue;
      seen.add(row.song_id);
      recent.push(row.songs);
      if (recent.length >= 10) break;
    }

    if (recent.length === 0) return;

    const section = document.createElement('div');
    section.className = 'recently_played';
    section.innerHTML = `
      <div class="h4">
        <h4>Recently Played</h4>
      </div>
      <div class="recent_song">
        ${recent.map((song) => `
          <li class="songItem" data-id="${song.id}">
            <div class="img_play">
              <img src="${song.cover_url}" alt="${song.artists?.name || ''}">
              <i class="bi playcircle bi-play-circle-fill" data-song-id="${song.id}"></i>
              ${UI.favIcon(song.id, 'position:absolute; top:4px; right:4px; font-size:14px;')}
            </div>
            <h5>
              ${song.title}
              <div class="subtitle">${song.artists?.name || 'Unknown'}</div>
            </h5>
          </li>
        `).join('')}
      </div>
    `;

    // Chèn ngay sau khu vực Popular Song
    const popularSong = songSide.querySelector('.popular_song');
    if (popularSong) {
      popularSong.insertAdjacentElement('afterend', section);
    } else {
      songSide.appendChild(section);
    }

    UI.bindSongActions(section);
  }

  return { init, renderRecentlyPlayed };
})();
