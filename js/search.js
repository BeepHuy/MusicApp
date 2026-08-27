// ═══════════════════════════════════════════
// search.js — Search Module
// Bấm vào ô search ở bất kỳ trang nào → chuyển
// sang trang search.html riêng, gõ để lọc trực tiếp
// ═══════════════════════════════════════════

const Search = (() => {
  let allSongs = [];

  function init(songList) {
    allSongs = songList;

    const searchBox = document.querySelector('.search');
    const searchInput = searchBox?.querySelector('input');
    if (!searchBox || !searchInput) return;

    const onSearchPage = window.location.pathname.includes('search');

    if (!onSearchPage) {
      // Các trang khác: bấm vào ô/icon search (kể cả trên mobile, khi ô nhập bị ẩn)
      // là chuyển sang trang Search riêng
      searchBox.addEventListener('click', () => {
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
