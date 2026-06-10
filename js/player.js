// ═══════════════════════════════════════════
// player.js — Music Player Module
// Handles: play/pause, next/prev, progress,
//          volume, shuffle, repeat
// ═══════════════════════════════════════════

const Player = (() => {
  // ── State ──
  const audio = new Audio();
  let allSongs = [];       // flat list of all songs (from all sections)
  let currentIndex = -1;   // index in allSongs
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = 'none'; // 'none' | 'one' | 'all'

  // ── DOM refs (cached on init) ──
  let els = {};

  // ── Public: init ──
  function init(songList) {
    allSongs = songList;
    audio.volume = 0.3;

    els = {
      masterPlay:   document.getElementById('masterPlay'),
      wave:         document.querySelector('.wave'),
      poster:       document.getElementById('poster_master_play'),
      title:        document.getElementById('title'),
      currentStart: document.getElementById('currentStart'),
      currentEnd:   document.getElementById('currentEnd'),
      seek:         document.getElementById('seek'),
      bar2:         document.getElementById('bar2'),
      dot:          document.querySelector('.bar .dot'),
      vol:          document.getElementById('vol'),
      volIcon:      document.getElementById('vol_icon'),
      volBar:       document.querySelector('.vol_bar'),
      volDot:       document.getElementById('vol_dot'),
      back:         document.getElementById('back'),
      next:         document.getElementById('next'),
    };

    _bindEvents();
  }

  // ── Public: play a song by its ID ──
  function playById(id) {
    const idx = allSongs.findIndex(s => s.id === id);
    if (idx === -1) return;
    _playSongAt(idx);
  }

  // ── Public: get current song id ──
  function getCurrentId() {
    if (currentIndex < 0) return null;
    return allSongs[currentIndex]?.id ?? null;
  }

  function getIsPlaying() {
    return isPlaying;
  }

  // ── Internal: play song at index ──
  function _playSongAt(idx) {
    if (idx < 0 || idx >= allSongs.length) return;
    currentIndex = idx;
    const song = allSongs[idx];

    audio.src = `./audio/${song.id}.mp3`;
    els.poster.src = `./img/${song.id}.png`;
    els.title.innerHTML = `${song.title}<br><div class="subtitle">${song.artist}</div>`;

    audio.play();
    _setPlayingState(true);

    // Notify UI to update icons
    document.dispatchEvent(new CustomEvent('songChanged', {
      detail: { id: song.id }
    }));
  }

  // ── Play / Pause toggle ──
  function _togglePlay() {
    if (currentIndex < 0) {
      // Nothing selected yet — play the first song
      if (allSongs.length > 0) _playSongAt(0);
      return;
    }
    if (audio.paused) {
      audio.play();
      _setPlayingState(true);
    } else {
      audio.pause();
      _setPlayingState(false);
    }
  }

  function _setPlayingState(playing) {
    isPlaying = playing;
    if (playing) {
      els.masterPlay.classList.remove('bi-play-fill');
      els.masterPlay.classList.add('bi-pause-fill');
      els.wave.classList.add('active2');
    } else {
      els.masterPlay.classList.add('bi-play-fill');
      els.masterPlay.classList.remove('bi-pause-fill');
      els.wave.classList.remove('active2');
    }
  }

  // ── Next / Previous ──
  function _playNext() {
    if (allSongs.length === 0) return;

    if (isShuffle) {
      let newIdx;
      do {
        newIdx = Math.floor(Math.random() * allSongs.length);
      } while (newIdx === currentIndex && allSongs.length > 1);
      _playSongAt(newIdx);
      return;
    }

    let nextIdx = currentIndex + 1;
    if (nextIdx >= allSongs.length) {
      nextIdx = 0; // loop back to start
    }
    _playSongAt(nextIdx);
  }

  function _playPrev() {
    if (allSongs.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = allSongs.length - 1;
    }
    _playSongAt(prevIdx);
  }

  // ── Progress bar ──
  function _updateProgress() {
    if (!audio.duration) return;

    const curr = audio.currentTime;
    const dur = audio.duration;

    // Update time labels
    els.currentStart.textContent = _formatTime(curr);
    els.currentEnd.textContent = _formatTime(dur);

    // Update bar
    const pct = (curr / dur) * 100;
    els.seek.value = pct;
    els.bar2.style.width = `${pct}%`;
    els.dot.style.left = `${pct}%`;
  }

  function _onSeek() {
    if (!audio.duration) return;
    audio.currentTime = (els.seek.value * audio.duration) / 100;
  }

  // ── Volume ──
  function _onVolumeChange() {
    const val = parseInt(els.vol.value);
    audio.volume = val / 100;
    els.volBar.style.width = `${val}%`;
    els.volDot.style.left = `${val}%`;

    // Update icon
    els.volIcon.classList.remove('bi-volume-down-fill', 'bi-volume-mute-fill', 'bi-volume-up-fill');
    if (val === 0) {
      els.volIcon.classList.add('bi-volume-mute-fill');
    } else if (val <= 50) {
      els.volIcon.classList.add('bi-volume-down-fill');
    } else {
      els.volIcon.classList.add('bi-volume-up-fill');
    }
  }

  // ── Song ended ──
  function _onSongEnd() {
    if (repeatMode === 'one') {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    if (repeatMode === 'all' || currentIndex < allSongs.length - 1) {
      _playNext();
    } else {
      _setPlayingState(false);
    }
  }

  // ── Helper: format seconds to m:ss ──
  function _formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  }

  // ── Bind all events ──
  function _bindEvents() {
    els.masterPlay.addEventListener('click', _togglePlay);
    els.next.addEventListener('click', _playNext);
    els.back.addEventListener('click', _playPrev);
    els.seek.addEventListener('change', _onSeek);
    els.vol.addEventListener('change', _onVolumeChange);
    els.vol.addEventListener('input', _onVolumeChange);
    audio.addEventListener('timeupdate', _updateProgress);
    audio.addEventListener('ended', _onSongEnd);
  }

  // ── Expose public API ──
  return { init, playById, getCurrentId, getIsPlaying };
})();
