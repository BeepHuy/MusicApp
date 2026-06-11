// ═══════════════════════════════════════════
// app.js — Main Entry Point (v2)
// ═══════════════════════════════════════════

(async function App() {
  try {
    const response = await fetch('./data/songs.json');
    if (!response.ok) throw new Error('Failed to load songs.json');
    const data = await response.json();

    // Build flat list — bao gồm cả newReleases
    const allSongs = [
      ...data.sidebar,
      ...data.popularSongs,
      ...(data.newReleases || []),
      ...(data.weekly?.kpop || []),
      ...(data.weekly?.usuk || []),
      ...(data.weekly?.rap  || []),
    ];

    // Loại trùng ID (newReleases có thể trùng với weekly)
    const uniqueSongs = [];
    const seenIds = new Set();
    for (const song of allSongs) {
      if (!seenIds.has(song.id)) {
        seenIds.add(song.id);
        uniqueSongs.push(song);
      }
    }

    Player.init(uniqueSongs);
    UI.init(data);
    Search.init(uniqueSongs);

    console.log('🎵 Music App initialized —', uniqueSongs.length, 'songs loaded');

  } catch (err) {
    console.error('❌ App init failed:', err);
  }
})();