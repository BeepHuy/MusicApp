// ═══════════════════════════════════════════
// player.js — Music Player Module (v2)
// Tuần 2: + shuffle, repeat, smooth seek,
//         + localStorage state, input event
// ═══════════════════════════════════════════

const Player = (() => {
  // ── State ──
  const audio = new Audio();
  let allSongs = [];
  let currentIndex = -1;
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = "none"; // 'none' | 'one' | 'all'
  let isSeeking = false; // tránh xung đột khi kéo thanh progress

  // ── DOM refs ──
  let els = {};

  // ══════════════════════════
  // PUBLIC: init
  // ══════════════════════════
  function init(songList) {
    allSongs = songList;

    els = {
      masterPlay: document.getElementById("masterPlay"),
      wave: document.querySelector(".wave"),
      poster: document.getElementById("poster_master_play"),
      title: document.getElementById("title"),
      currentStart: document.getElementById("currentStart"),
      currentEnd: document.getElementById("currentEnd"),
      seek: document.getElementById("seek"),
      bar2: document.getElementById("bar2"),
      dot: document.querySelector(".bar .dot"),
      vol: document.getElementById("vol"),
      volIcon: document.getElementById("vol_icon"),
      volBar: document.querySelector(".vol_bar"),
      volDot: document.getElementById("vol_dot"),
      back: document.getElementById("back"),
      next: document.getElementById("next"),
      shuffleBtn: document.getElementById("shuffleBtn"),
      repeatBtn: document.getElementById("repeatBtn"),
    };

    _bindEvents();
    _restoreState(); // khôi phục từ localStorage
  }

  // ══════════════════════════
  // PUBLIC API
  // ══════════════════════════
  function playById(id) {
    const idx = allSongs.findIndex((s) => s.id === id);
    if (idx === -1) return;
    _playSongAt(idx);
  }

  function getCurrentId() {
    if (currentIndex < 0) return null;
    return allSongs[currentIndex]?.id ?? null;
  }

  function getIsPlaying() {
    return isPlaying;
  }

  // ══════════════════════════
  // PLAY SONG
  // ══════════════════════════
  function _playSongAt(idx) {
    if (idx < 0 || idx >= allSongs.length) return;
    currentIndex = idx;
    const song = allSongs[idx];

    // Hỗ trợ cả format cũ (id) và mới (file/cover từ Supabase)
    audio.src = song.file || `./audio/${song.id}.mp3`;
    els.poster.src = song.cover || `./img/${song.id}.png`;
    els.title.innerHTML = `${song.title}<br><div class="subtitle">${song.artist}</div>`;

    audio.play();
    _setPlayingState(true);
    _saveState();

    document.dispatchEvent(new CustomEvent('songChanged', {
      detail: { id: song.id }
    }));
  }

  // ══════════════════════════
  // PLAY / PAUSE
  // ══════════════════════════
  function _togglePlay() {
    if (currentIndex < 0) {
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
    els.masterPlay.classList.toggle("bi-play-fill", !playing);
    els.masterPlay.classList.toggle("bi-pause-fill", playing);
    els.wave.classList.toggle("active2", playing);
  }

  // ══════════════════════════
  // NEXT / PREVIOUS
  // ══════════════════════════
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
    if (nextIdx >= allSongs.length) nextIdx = 0;
    _playSongAt(nextIdx);
  }

  function _playPrev() {
    if (allSongs.length === 0) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = allSongs.length - 1;
    _playSongAt(prevIdx);
  }

  // ══════════════════════════
  // SHUFFLE
  // ══════════════════════════
  function _toggleShuffle() {
    isShuffle = !isShuffle;
    els.shuffleBtn?.classList.toggle("active-control", isShuffle);
    _saveState();
  }

  // ══════════════════════════
  // REPEAT: none → all → one → none
  // ══════════════════════════
  function _toggleRepeat() {
    const modes = ["none", "all", "one"];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    repeatMode = modes[nextIdx];

    if (!els.repeatBtn) return;

    // Reset classes
    els.repeatBtn.classList.remove(
      "active-control",
      "bi-repeat",
      "bi-repeat-1",
    );

    if (repeatMode === "none") {
      els.repeatBtn.classList.add("bi-repeat");
    } else if (repeatMode === "all") {
      els.repeatBtn.classList.add("bi-repeat", "active-control");
    } else {
      els.repeatBtn.classList.add("bi-repeat-1", "active-control");
    }

    _saveState();
  }

  // ══════════════════════════
  // PROGRESS BAR (smooth seek)
  // ══════════════════════════
  function _updateProgress() {
    if (!audio.duration || isSeeking) return;

    const curr = audio.currentTime;
    const dur = audio.duration;

    els.currentStart.textContent = _formatTime(curr);
    els.currentEnd.textContent = _formatTime(dur);

    const pct = (curr / dur) * 100;
    els.seek.value = pct;
    els.bar2.style.width = `${pct}%`;
    els.dot.style.left = `${pct}%`;
  }

  function _onSeekStart() {
    isSeeking = true;
  }

  function _onSeekInput() {
    // Preview vị trí khi đang kéo (chưa nhảy audio)
    const pct = els.seek.value;
    els.bar2.style.width = `${pct}%`;
    els.dot.style.left = `${pct}%`;

    if (audio.duration) {
      els.currentStart.textContent = _formatTime((pct / 100) * audio.duration);
    }
  }

  function _onSeekEnd() {
    if (audio.duration) {
      audio.currentTime = (els.seek.value * audio.duration) / 100;
    }
    isSeeking = false;
  }

  // ══════════════════════════
  // VOLUME
  // ══════════════════════════
  function _onVolumeChange() {
    const val = parseInt(els.vol.value);
    audio.volume = val / 100;
    els.volBar.style.width = `${val}%`;
    els.volDot.style.left = `${val}%`;

    els.volIcon.classList.remove(
      "bi-volume-down-fill",
      "bi-volume-mute-fill",
      "bi-volume-up-fill",
    );
    if (val === 0) {
      els.volIcon.classList.add("bi-volume-mute-fill");
    } else if (val <= 50) {
      els.volIcon.classList.add("bi-volume-down-fill");
    } else {
      els.volIcon.classList.add("bi-volume-up-fill");
    }

    _saveState();
  }

  // ══════════════════════════
  // SONG ENDED
  // ══════════════════════════
  function _onSongEnd() {
    if (repeatMode === "one") {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    if (repeatMode === "all") {
      _playNext();
    } else if (currentIndex < allSongs.length - 1) {
      _playNext();
    } else {
      _setPlayingState(false);
    }
  }

  // ══════════════════════════
  // LOCALSTORAGE
  // ══════════════════════════
  function _saveState() {
    const state = {
      songId: getCurrentId(),
      volume: parseInt(els.vol?.value || 30),
      isShuffle,
      repeatMode,
    };
    try {
      localStorage.setItem("musicAppState", JSON.stringify(state));
    } catch (e) {
      /* quota exceeded or private mode */
    }
  }

  function _restoreState() {
    try {
      const raw = localStorage.getItem("musicAppState");
      if (!raw) return;
      const state = JSON.parse(raw);

      // Volume
      if (state.volume !== undefined && els.vol) {
        els.vol.value = state.volume;
        audio.volume = state.volume / 100;
        _onVolumeChange();
      }

      // Shuffle
      if (state.isShuffle) {
        isShuffle = true;
        els.shuffleBtn?.classList.add("active-control");
      }

      // Repeat
      if (state.repeatMode && state.repeatMode !== "none") {
        repeatMode = state.repeatMode;
        _toggleRepeat(); // cycle đến mode đã lưu
        // toggleRepeat sẽ nhảy sang mode tiếp theo, nên cần set lại
        // Cách đơn giản: set trực tiếp UI
        repeatMode = state.repeatMode;
        if (els.repeatBtn) {
          els.repeatBtn.classList.remove(
            "bi-repeat",
            "bi-repeat-1",
            "active-control",
          );
          if (repeatMode === "all") {
            els.repeatBtn.classList.add("bi-repeat", "active-control");
          } else if (repeatMode === "one") {
            els.repeatBtn.classList.add("bi-repeat-1", "active-control");
          } else {
            els.repeatBtn.classList.add("bi-repeat");
          }
        }
      }

      // Bài hát cuối cùng (chỉ hiện info, không tự play)
      if (state.songId) {
        const idx = allSongs.findIndex((s) => s.id === state.songId);
        if (idx !== -1) {
          currentIndex = idx;
          const song = allSongs[idx];
          els.poster.src = song.cover || `./img/${song.id}.png`;
          els.title.innerHTML = `${song.title}<br><div class="subtitle">${song.artist}</div>`;
          document.dispatchEvent(
            new CustomEvent("songChanged", {
              detail: { id: song.id },
            }),
          );
        }
      }
    } catch (e) {
      /* corrupted data */
    }
  }

  // ══════════════════════════
  // HELPERS
  // ══════════════════════════
  function _formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  }

  // ══════════════════════════
  // EVENTS
  // ══════════════════════════
  function _bindEvents() {
    els.masterPlay.addEventListener("click", _togglePlay);
    els.next.addEventListener("click", _playNext);
    els.back.addEventListener("click", _playPrev);

    // Smooth seek: mousedown → input (preview) → mouseup/change (commit)
    els.seek.addEventListener("mousedown", _onSeekStart);
    els.seek.addEventListener("touchstart", _onSeekStart);
    els.seek.addEventListener("input", _onSeekInput);
    els.seek.addEventListener("mouseup", _onSeekEnd);
    els.seek.addEventListener("touchend", _onSeekEnd);
    els.seek.addEventListener("change", _onSeekEnd);

    els.vol.addEventListener("input", _onVolumeChange);

    audio.addEventListener("timeupdate", _updateProgress);
    audio.addEventListener("ended", _onSongEnd);

    // Shuffle & Repeat buttons
    els.shuffleBtn?.addEventListener("click", _toggleShuffle);
    els.repeatBtn?.addEventListener("click", _toggleRepeat);
  }

  // Toggle pause bài hiện tại (không restart)
  function togglePause() {
    if (currentIndex < 0) return;
    if (audio.paused) {
      audio.play();
      _setPlayingState(true);
    } else {
      audio.pause();
      _setPlayingState(false);
    }
  }

  return { init, playById, getCurrentId, getIsPlaying, togglePause };
})();
