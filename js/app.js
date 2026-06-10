// ═══════════════════════════════════════════
// app.js — Main Entry Point
// Loads data from JSON, initializes all modules
// ═══════════════════════════════════════════

(async function App() {
  try {
    // 1. Fetch song data
    const response = await fetch('./data/songs.json');
    if (!response.ok) throw new Error('Failed to load songs.json');
    const data = await response.json();

    // 2. Build flat list of ALL songs for the Player
    //    (sidebar + popular + weekly categories)
    const allSongs = [
      ...data.sidebar,
      ...data.popularSongs,
      ...(data.weekly?.kpop || []),
      ...(data.weekly?.usuk || []),
      ...(data.weekly?.rap  || []),
    ];

    // 3. Initialize modules
    Player.init(allSongs);
    UI.init(data);
    Search.init(allSongs);

    console.log('🎵 Music App initialized —', allSongs.length, 'songs loaded');

  } catch (err) {
    console.error('❌ App init failed:', err);
  }
})();
