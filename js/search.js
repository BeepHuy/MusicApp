// ═══════════════════════════════════════════
// search.js — Search Module
// Bấm vào ô search ở bất kỳ trang nào → chuyển
// sang trang search.html riêng, gõ để lọc trực tiếp
// ═══════════════════════════════════════════

const Search = (() => {
  let allSongs = [];

  function init(songList) {
    allSongs = songList;

    const searchInput = document.querySelector('.search input');
    if (!searchInput) return;

    const onSearchPage = window.location.pathname.includes('search');

    if (!onSearchPage) {
      // Các trang khác: bấm vào ô search là chuyển sang trang Search riêng
      searchInput.addEventListener('focus', () => {
        window.location.href = './search.html';
      });
      return;
    }

    // Trang Search: gõ để lọc kết quả trực tiếp
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      _filter(query);
    });
    searchInput.focus();
  }

  function _filter(query) {
    if (!query) {
      UI.renderSearchResults(null);
      return;
    }

    const results = allSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
    UI.renderSearchResults(results);
  }

  return { init };
})();
