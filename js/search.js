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

    // <nav> (chứa ô search) không bị Router thay thế khi chuyển trang, nên
    // không thể quyết định hành vi 1 lần lúc load — phải kiểm tra trang hiện
    // tại mỗi lần tương tác.
    searchBox.addEventListener('click', () => {
      if (_onSearchPage()) return;
      // Trang khác: bấm vào ô/icon search (kể cả trên mobile, khi ô nhập bị ẩn)
      // là chuyển sang trang Search riêng
      if (typeof Router !== 'undefined') {
        Router.navigate('./search.html');
      } else {
        window.location.href = './search.html';
      }
    });

    // Trang Search: gõ để lọc kết quả trực tiếp
    searchInput.addEventListener('input', (e) => {
      if (!_onSearchPage()) return;
      _filter(e.target.value.trim().toLowerCase());
    });
  }

  function _onSearchPage() {
    return window.location.pathname.includes('search');
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
