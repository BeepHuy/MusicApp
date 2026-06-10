// ═══════════════════════════════════════════
// ui.js — UI Rendering Module
// Renders HTML from data, handles scrolling,
// highlights active song
// ═══════════════════════════════════════════

const UI = (() => {
  let data = null;

  function init(songsData) {
    data = songsData;
    const page = _detectPage();

    // Render sidebar (shared between pages)
    _renderSidebar(page);

    // Render page-specific content
    if (page === 'index') {
      _renderFeatured();
      _renderPopularSongs();
      _renderArtists();
      _initScrollButtons();
    } else if (page === 'week') {
      _renderWeekly();
    }

    // Listen for song changes from Player
    document.addEventListener('songChanged', (e) => {
      _highlightSong(e.detail.id);
    });
  }

  // ── Detect which page we're on ──
  function _detectPage() {
    const path = window.location.pathname;
    if (path.includes('week')) return 'week';
    return 'index';
  }

  // ── Sidebar: Playlist song list ──
  function _renderSidebar(page) {
    const container = document.querySelector('.menu_song');
    if (!container) return;

    // Set active nav link
    const playlistLinks = document.querySelectorAll('.playlist h4');
    playlistLinks.forEach(h4 => h4.classList.remove('active'));
    if (page === 'index') {
      playlistLinks[0]?.classList.add('active');
    } else if (page === 'week') {
      playlistLinks[1]?.classList.add('active');
    }

    // Render song items
    container.innerHTML = data.sidebar.map((song, i) => `
      <li class="songItem" data-id="${song.id}">
        <span>${String(i + 1).padStart(2, '0')}</span>
        <img src="./img/${song.id}.png" alt="${song.artist}">
        <h5>
          ${song.title}
          <div class="subtitle">${song.artist}</div>
        </h5>
        <i class="bi playcircle bi-play-circle-fill" data-song-id="${song.id}"></i>
      </li>
    `).join('');

    // Bind click events
    _bindPlayButtons(container);
  }

  // ── Featured section (index page) ──
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

    // PLAY button plays the first sidebar song
    document.getElementById('btn-play')?.addEventListener('click', () => {
      if (data.sidebar.length > 0) {
        Player.playById(data.sidebar[0].id);
      }
    });
  }

  // ── Popular Songs carousel ──
  function _renderPopularSongs() {
    const container = document.querySelector('.pop_song');
    if (!container) return;

    container.innerHTML = data.popularSongs.map(song => `
      <li class="songItem" data-id="${song.id}">
        <div class="img_play">
          <img src="./img/${song.id}.png" alt="${song.artist}">
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

  // ── Popular Artists carousel ──
  function _renderArtists() {
    const container = document.querySelector('.popular_artists .item');
    if (!container) return;

    container.innerHTML = data.artists.map(artist => `
      <li>
        <img src="./img/${artist.img}.png" alt="${artist.name}" title="${artist.name}">
      </li>
    `).join('');
  }

  // ── Weekly Rankings (week page) ──
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
              <img src="./img/${song.id}.png" alt="${song.artist}" width="10%">
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

  // ── Bind play buttons in a container ──
  function _bindPlayButtons(container) {
    container.querySelectorAll('.playcircle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = parseInt(e.target.dataset.songId);
        if (songId) Player.playById(songId);
      });
    });

    // Also allow clicking the whole li
    container.querySelectorAll('.songItem, .songItem2').forEach(li => {
      li.addEventListener('click', () => {
        const songId = parseInt(li.dataset.id);
        if (songId) Player.playById(songId);
      });
    });
  }

  // ── Weekly: highlight active item ──
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

  // ── Highlight currently playing song ──
  function _highlightSong(songId) {
    // Reset all play icons
    document.querySelectorAll('.playcircle').forEach(el => {
      el.classList.add('bi-play-circle-fill');
      el.classList.remove('bi-pause-circle-fill');
    });

    // Reset all backgrounds
    document.querySelectorAll('.songItem').forEach(el => {
      el.style.background = '';
    });

    // Highlight the active one
    const activeBtn = document.querySelector(`.playcircle[data-song-id="${songId}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('bi-play-circle-fill');
      activeBtn.classList.add('bi-pause-circle-fill');
    }

    const activeLi = document.querySelector(`.menu_song .songItem[data-id="${songId}"]`);
    if (activeLi) {
      activeLi.style.background = 'rgb(105, 105, 170, .2)';
    }
  }

  // ── Scroll buttons for carousels ──
  function _initScrollButtons() {
    // Popular Songs scroll
    const popSong = document.querySelector('.pop_song');
    const leftScroll = document.getElementById('left_scroll');
    const rightScroll = document.getElementById('right_scroll');

    if (popSong && leftScroll && rightScroll) {
      leftScroll.addEventListener('click', () => { popSong.scrollLeft -= 330; });
      rightScroll.addEventListener('click', () => { popSong.scrollLeft += 330; });
    }

    // Popular Artists scroll
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
