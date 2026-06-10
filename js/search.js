// ═══════════════════════════════════════════
// search.js — Search Module
// Real-time filtering of songs by title/artist
// ═══════════════════════════════════════════

const Search = (() => {
  let allSongs = [];

  function init(songList) {
    allSongs = songList;

    const searchInput = document.querySelector('.search input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      _filterSidebar(query);
    });
  }

  function _filterSidebar(query) {
    const items = document.querySelectorAll('.menu_song .songItem');

    if (!query) {
      // Show all
      items.forEach(item => { item.style.display = ''; });
      return;
    }

    items.forEach(item => {
      const title = item.querySelector('h5')?.textContent.toLowerCase() || '';
      const matches = title.includes(query);
      item.style.display = matches ? '' : 'none';
    });
  }

  return { init };
})();
