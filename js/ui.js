// ═══════════════════════════════════════════
// ui.js — UI Rendering Module (v2)
// Renders HTML from data, handles scrolling,
// highlights active song, New Releases grid
// ═══════════════════════════════════════════

const UI = (() => {
  let data = null;

  function init(songsData) {
    data = songsData;
    const page = _detectPage();

    _renderSidebar(page);

    if (page === 'index') {
      _renderFeatured();
      _renderPopularSongs();
      _renderArtists();
      _renderNewReleases();
      _initScrollButtons();
    } else if (page === 'week') {
      _renderWeekly();
    }
    // 'library' page: nội dung do Playlist.renderLibraryPage() tự xử lý

    document.addEventListener('songChanged', (e) => {
      _highlightSong(e.detail.id);
    });
  }

  function _detectPage() {
    const path = window.location.pathname;
    if (path.includes('week')) return 'week';
    if (path.includes('library')) return 'library';
    return 'index';
  }

  // ── Sidebar ──
  function _renderSidebar(page) {
    const container = document.querySelector('.menu_song');
    if (!container) return;

    const playlistLinks = document.querySelectorAll('.playlist h4');
    playlistLinks.forEach(h4 => h4.classList.remove('active'));
    if (page === 'index') {
      playlistLinks[0]?.classList.add('active');
    } else if (page === 'week') {
      playlistLinks[1]?.classList.add('active');
    }

    container.innerHTML = data.sidebar.map((song, i) => `
      <li class="songItem" data-id="${song.id}">
        <span>${String(i + 1).padStart(2, '0')}</span>
         <img src="${song.cover}" alt="${song.artist}">
        <h5>
          ${song.title}
          <div class="subtitle">${song.artist}</div>
        </h5>
        <i class="bi bi-plus-circle playlist-add-btn" data-song-id="${song.id}" title="Add to playlist" style="position:absolute; right:40px; top:8px; font-size:14px; color:#7a7f94; cursor:pointer; transition:0.2s; display:none;"></i>
        <i class="bi playcircle bi-play-circle-fill" data-song-id="${song.id}"></i>
      </li>
    `).join('');

    _bindPlayButtons(container);
  }

  // ── Featured ──
  function _renderFeatured() {
    const content = document.querySelector('.song_side .content');
    if (!content || !data.featured) return;

    const lines = data.featured.description.split('\n');
    content.innerHTML = `
      <h1>${data.featured.title}</h1>
      <p>${lines.join('<br>')}</p>
      <div class="buttons">
        <button id="btn-play">PLAY</button>
        <button id="btn-flow">FLOW</button>
      </div>
    `;

    document.getElementById('btn-play')?.addEventListener('click', () => {
      if (data.sidebar.length > 0) {
        Player.playById(data.sidebar[0].id);
      }
    });
  }

  // ── Popular Songs ──
  function _renderPopularSongs() {
    const container = document.querySelector('.pop_song');
    if (!container) return;

    container.innerHTML = data.popularSongs.map(song => `
      <li class="songItem" data-id="${song.id}">
        <div class="img_play">
          <img src="${song.cover}" alt="${song.artist}">
          <i class="bi playcircle bi-play-circle-fill" data-song-id="${song.id}"></i>
        </div>
        <h5>
          ${song.title}
          <div class="subtitle">${song.artist}</div>
        </h5>
      </li>
    `).join('');

    _bindPlayButtons(container);
  }

  // ── Popular Artists ──
  function _renderArtists() {
    const container = document.querySelector('.popular_artists .item');
    if (!container) return;

    container.innerHTML = data.artists.map(artist => `
      <li>
        <img src="${artist.avatar}" alt="${artist.name}" title="${artist.name}">
      </li>
    `).join('');
  }

  // ── New Releases (grid cards) ──
  function _renderNewReleases() {
    if (!data.newReleases || data.newReleases.length === 0) return;

    const songSide = document.querySelector('.song_side');
    if (!songSide) return;

    // Kiểm tra đã render chưa
    if (songSide.querySelector('.new_releases')) return;

    const section = document.createElement('div');
    section.className = 'new_releases';
    section.innerHTML = `
      <div class="h4">
        <h4>New Releases</h4>
      </div>
      <div class="release_grid">
        ${data.newReleases.map(song => `
          <li class="release_card songItem" data-id="${song.id}">
            <img src="${song.cover}" alt="${song.artist}">
            <h5>
              ${song.title}
              <div class="subtitle">${song.artist}</div>
            </h5>
          </li>
        `).join('')}
      </div>
    `;

    songSide.appendChild(section);
    _bindPlayButtons(section);
  }

  // ── Weekly Rankings ──
  function _renderWeekly() {
    const contentList = document.querySelector('.contentList');
    if (!contentList || !data.weekly) return;

    const categories = [
      { key: 'kpop', label: 'K-Pop' },
      { key: 'usuk', label: 'US-UK' },
      { key: 'rap',  label: 'Rap' },
    ];

    contentList.innerHTML = categories.map(cat => {
      const songs = data.weekly[cat.key] || [];
      return `
        <div class="contentItem">
          <h4>${cat.label}</h4>
          ${songs.map((song, i) => `
            <li class="songItem2${i === 0 && cat.key === 'kpop' ? ' active6' : ''}" data-id="${song.id}">
              <span>${String(i + 1).padStart(2, '0')}</span>
              <img src="${song.cover}" alt="${song.artist}" width="10%">
              <h5>
                ${song.title}
                <div class="subtitle">${song.artist}</div>
              </h5>
              <i class="bi weekbi playcircle bi-play-circle-fill" data-song-id="${song.id}"></i>
            </li>
          `).join('')}
        </div>
      `;
    }).join('');

    _bindPlayButtons(contentList);
    _bindWeeklyHighlight();
  }

  // ── Bind play buttons ──
  function _bindPlayButtons(container) {
    container.querySelectorAll('.playcircle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.target.dataset.songId;
        if (!songId) return;

        // Nếu đang phát bài này → pause/resume, không restart
        if (songId === Player.getCurrentId()) {
          Player.togglePause();
          // Cập nhật icon
          const playing = Player.getIsPlaying();
          document.querySelectorAll(`.playcircle[data-song-id="${songId}"]`).forEach(el => {
            el.classList.toggle('bi-play-circle-fill', !playing);
            el.classList.toggle('bi-pause-circle-fill', playing);
          });
        } else {
          Player.playById(songId);
        }
      });
    });

    container.querySelectorAll('.songItem, .songItem2, .release_card').forEach(li => {
      li.addEventListener('click', (e) => {
        // Tránh double trigger khi click vào nút play
        if (e.target.closest('.playcircle')) return;

        const songId = li.dataset.id;
        if (!songId) return;

        if (songId === Player.getCurrentId()) {
          Player.togglePause();
          const playing = Player.getIsPlaying();
          document.querySelectorAll(`.playcircle[data-song-id="${songId}"]`).forEach(el => {
            el.classList.toggle('bi-play-circle-fill', !playing);
            el.classList.toggle('bi-pause-circle-fill', playing);
          });
        } else {
          Player.playById(songId);
        }
      });
    });

    // Add to playlist buttons
    container.querySelectorAll('.playlist-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = e.target.dataset.songId;
        const rect = e.target.getBoundingClientRect();
        Playlist.showAddMenu(songId, rect.right + 5, rect.top);
      });
    });
  }

  // ── Weekly highlight ──
  function _bindWeeklyHighlight() {
    document.querySelectorAll('.weekbi').forEach(item => {
      item.addEventListener('click', function () {
        document.querySelectorAll('.songItem2').forEach(li => {
          li.classList.remove('active6');
          li.style.background = '#111727';
        });
        this.closest('li')?.classList.add('active6');
        document.querySelectorAll('.active6').forEach(el => {
          el.style.background = 'rgb(105, 105, 170, 0.3)';
        });
      });
    });
  }

  // ── Highlight playing song ──
  function _highlightSong(songId) {
    document.querySelectorAll('.playcircle').forEach(el => {
      el.classList.add('bi-play-circle-fill');
      el.classList.remove('bi-pause-circle-fill');
    });

    document.querySelectorAll('.songItem').forEach(el => {
      el.style.background = '';
    });

    const activeBtn = document.querySelector(`.playcircle[data-song-id="${songId}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bi-play-circle-fill');
      activeBtn.classList.add('bi-pause-circle-fill');
    }

    const activeLi = document.querySelector(`.menu_song .songItem[data-id="${songId}"]`);
    if (activeLi) {
      activeLi.style.background = 'rgba(54, 226, 236, 0.1)';
    }
  }

  // ── Scroll buttons ──
  function _initScrollButtons() {
    const popSong = document.querySelector('.pop_song');
    const leftScroll = document.getElementById('left_scroll');
    const rightScroll = document.getElementById('right_scroll');

    if (popSong && leftScroll && rightScroll) {
      leftScroll.addEventListener('click', () => { popSong.scrollLeft -= 330; });
      rightScroll.addEventListener('click', () => { popSong.scrollLeft += 330; });
    }

    const artistList = document.querySelector('.popular_artists .item');
    const leftScrolls = document.getElementById('left_scrolls');
    const rightScrolls = document.getElementById('right_scrolls');

    if (artistList && leftScrolls && rightScrolls) {
      leftScrolls.addEventListener('click', () => { artistList.scrollLeft -= 330; });
      rightScrolls.addEventListener('click', () => { artistList.scrollLeft += 330; });
    }
  }

  return { init };
})();