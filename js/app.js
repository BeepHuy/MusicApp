// app.js — Main Entry Point (v3 - Supabase)

(async function App() {
  try {
    // 1. Fetch songs + artist name từ Supabase
    const { data: songs, error: songsErr } = await db
      .from('songs')
      .select('id, title, file_url, cover_url, section, genre, display_order, artists(name)')
      .order('display_order');

    if (songsErr) throw songsErr;

    // 2. Fetch artists
    const { data: artists, error: artistsErr } = await db
      .from('artists')
      .select('id, name, avatar_url');

    if (artistsErr) throw artistsErr;

    // 3. Fetch weekly rankings
    const { data: rankings, error: rankErr } = await db
      .from('weekly_rankings')
      .select('category, rank, songs(id, title, file_url, cover_url, artists(name))')
      .order('rank');

    if (rankErr) throw rankErr;

    // 4. Transform thành format mà UI.init() cần
    function mapSong(s) {
      return {
        id: s.id,
        title: s.title,
        artist: s.artists?.name || 'Unknown',
        file: s.file_url,
        cover: s.cover_url,
        genre: s.genre || null,
      };
    }

    const sidebar = songs.filter(s => s.section === 'sidebar').map(mapSong);
    const popularSongs = songs.filter(s => s.section === 'popular').map(mapSong);
    const newReleases = songs.filter(s => s.section === 'new_release').map(mapSong);

    // Weekly: nhóm theo category
    const weekly = { kpop: [], usuk: [], rap: [] };
    rankings.forEach(r => {
      if (r.songs && weekly[r.category]) {
        weekly[r.category].push({
          id: r.songs.id,
          title: r.songs.title,
          artist: r.songs.artists?.name || 'Unknown',
          file: r.songs.file_url,
          cover: r.songs.cover_url,
        });
      }
    });

    const data = {
      featured: {
        title: 'Alen Walker-Fade',
        description: 'You were the shadow to light Did you feel us Another start You fade\nAway afraid our aim is out of sight Wanna see us Alive',
      },
      sidebar,
      popularSongs,
      newReleases,
      artists: artists.map(a => ({
        name: a.name,
        avatar: a.avatar_url,
      })),
      weekly,
    };

    // 5. Build flat song list cho Player
    const allSongs = [...sidebar, ...popularSongs, ...newReleases];
    Object.values(weekly).forEach(arr => {
      arr.forEach(s => {
        if (!allSongs.find(x => x.id === s.id)) allSongs.push(s);
      });
    });

    // 6. Init modules
    data.allSongs = allSongs;
    Player.init(allSongs);
    UI.init(data);
    Search.init(allSongs);

    console.log('🎵 Music App loaded from Supabase —', allSongs.length, 'songs');
    Auth.init();
    Playlist.init();
    PWA.init();
    window._appData = data;  // lưu để playlist back button dùng
  } catch (err) {
    console.error('❌ Supabase load failed:', err);
    console.log('⚠️ Falling back to local JSON...');

    // Fallback: load từ songs.json nếu Supabase lỗi
    try {
      const res = await fetch('./data/songs.json');
      const data = await res.json();
      const allSongs = [
        ...data.sidebar, ...data.popularSongs, ...(data.newReleases || []),
        ...(data.weekly?.kpop || []), ...(data.weekly?.usuk || []), ...(data.weekly?.rap || []),
      ];
      const unique = [...new Map(allSongs.map(s => [s.id, s])).values()];
      data.allSongs = unique;
      Player.init(unique);
      UI.init(data);
      Search.init(unique);
      Auth.init();
      Playlist.init();
      PWA.init();
    } catch (e) {
      console.error('❌ Fallback cũng lỗi:', e);
    }
  }
})();