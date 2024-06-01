const music = new Audio("vande.mp3");

const songs = [
  {
    id: "1",
    songName: `On My Way <br>
    <div class="subtitle">Alan walker</div>`,
    poster: "./img/1.png",
  },
  {
    id: "2",
    songName: `Saware <br>
    <div class="subtitle">T-Series</div>`,
    poster: "./img/2.png",
  },
  {
    id: "3",
    songName: `Hãy Trao Cho Anh <br>
    <div class="subtitle">M-TP</div>`,
    poster: "./img/3.png",
  },
  {
    id: "4",
    songName: `Fortnight <br>
    <div class="subtitle">Taylor Swift</div>`,
    poster: "./img/4.png",
  },
  {
    id: "5",
    songName: `Hẹn Ước Từ Hư Vô <br>
    <div class="subtitle">MỸ TÂM</div>`,
    poster: "./img/5.png",
  },
  {
    id: "6",
    songName: `Flower<br>
    <div class="subtitle">JISOO</div>`,
    poster: "./img/6.png",
  },
  {
    id: "7",
    songName: `Wild Flower <br>
    <div class="subtitle">RM</div>`,
    poster: "./img/7.png",
  },
  {
    id: "8",
    songName: `Love wins all <br>
    <div class="subtitle">IU</div>`,
    poster: "./img/8.png",
  },
  {
    id: "9",
    songName: ` BBIBBI <br>
    <div class="subtitle">IU</div>`,
    poster: "./img/9.png",
  },
  {
    id: "10",
    songName: ` Enchanted <br>
    <div class="subtitle">Taylor Sừit</div>`,
    poster: "./img/10.png",
  },
  {
    id: "11",
    songName: `Come Back To Me<br>
    <div class="subtitle">RM</div>`,
    poster: "./img/11.png",
  },
  {
    id: "12",
    songName: `Chạy Ngay Đi <br>
    <div class="subtitle">M-TP</div>`,
    poster: "./img/12.png",
  },
  {
    id: "13",
    songName: `Standing Next To You <br>
    <div class="subtitle">JUNG KOOK</div>`,
    poster: "./img/13.png",
  },
  {
    id: "14",
    songName: ` Ava Max - Whateve <br>
    <div class="subtitle">KYGO</div>`,
    poster: "./img/14.png",
  },
  {
    id: "15",
    songName: ` Playboi Carti - Popular <br>
    <div class="subtitle">THE WEEKND</div>`,
    poster: "./img/15.png",
  },
  {
    id: "16",
    songName: ` Beautiful Things  <br>
    <div class="subtitle">BENSON BOONE</div>`,
    poster: "./img/16.png",
  },
  {
    id: "17",
    songName: ` LIKE THAT <br>
    <div class="subtitle"> BABYMONSTER </div>`,
    poster: "./img/17.png",
  },
  {
    id: "18",
    songName: ` Dynamite <br>
    <div class="subtitle">BTS</div>`,
    poster: "./img/18.png",
  },
  {
    id: "19",
    songName: ` BOOMBAYAH <br>
    <div class="subtitle">Blackpink</div>`,
    poster: "./img/19.png",
  },
  {
    id: "20",
    songName: ` LOSER <br>
    <div class="subtitle">Bigbang</div>`,
    poster: "./img/20.png",
  },
  {
    id: "21",
    songName: ` Comethru <br>
    <div class="subtitle">Jeremy Zucker</div>`,
    poster: "./img/21.png",
  },
  {
    id: "22",
    songName: ` The River <br>
    <div class="subtitle">Axel Johansson</div>`,
    poster: "./img/22.png",
  },
  {
    id: "23",
    songName: ` The Chainsmokers  <br>
    <div class="subtitle">Joseph Chun</div>`,
    poster: "./img/23.png",
  },
  {
    id: "24",
    songName: ` Waiting For Love<br>
    <div class="subtitle">Avicii</div>`,
    poster: "./img/24.png",
  },
  {
    id: "25",
    songName: ` Sprinter <br>
    <div class="subtitle">Central Cee</div>`,
    poster: "./img/25.png",
  },
  {
    id: "26",
    songName: ` Groin <br>
    <div class="subtitle">RM</div>`,
    poster: "./img/26.png",
  },
  {
    id: "27",
    songName: ` Type Shit <br>
    <div class="subtitle">Future</div>`,
    poster: "./img/27.png",
  },
  {
    id: "28",
    songName: ` Polo G - RAPSTAR <br>
    <div class="subtitle">Polo G</div>`,
    poster: "./img/28.png",
  },
];
const songs2 = [
  {
    id: "17",
    songName: ` LIKE THAT <br>
    <div class="subtitle"> BABYMONSTER </div>`,
    poster: "./img/17.png",
  },
  {
    id: "18",
    songName: ` Dynamite <br>
    <div class="subtitle">BTS</div>`,
    poster: "./img/18.png",
  },
  {
    id: "19",
    songName: ` BOOMBAYAH <br>
    <div class="subtitle">Blackpink</div>`,
    poster: "./img/19.png",
  },
  {
    id: "20",
    songName: ` LOSER <br>
    <div class="subtitle">Bigbang</div>`,
    poster: "./img/20.png",
  },
  {
    id: "21",
    songName: ` Comethru <br>
    <div class="subtitle">Jeremy Zucker</div>`,
    poster: "./img/21.png",
  },
  {
    id: "22",
    songName: ` The River <br>
    <div class="subtitle">Axel Johansson</div>`,
    poster: "./img/22.png",
  },
  {
    id: "23",
    songName: ` The Chainsmokers  <br>
    <div class="subtitle">Joseph Chun</div>`,
    poster: "./img/23.png",
  },
  {
    id: "24",
    songName: ` Waiting For Love<br>
    <div class="subtitle">Avicii</div>`,
    poster: "./img/24.png",
  },
  {
    id: "25",
    songName: ` Sprinter <br>
    <div class="subtitle">Central Cee</div>`,
    poster: "./img/25.png",
  },
  {
    id: "26",
    songName: ` Groin <br>
    <div class="subtitle">RM</div>`,
    poster: "./img/26.png",
  },
  {
    id: "27",
    songName: ` Type Shit <br>
    <div class="subtitle">Future</div>`,
    poster: "./img/27.png",
  },
  {
    id: "28",
    songName: ` Polo G - RAPSTAR <br>
    <div class="subtitle">Polo G</div>`,
    poster: "./img/28.png",
  },
];

Array.from(document.getElementsByClassName("songItem")).forEach(
  (element, i) => {
    element.getElementsByTagName("img")[0].src = songs[i].poster;
    element.getElementsByTagName("h5")[0].innerHTML = songs[i].songName;
  }
);
Array.from(document.getElementsByClassName("songItem2")).forEach(
  (element, i) => {
    element.getElementsByTagName("img")[0].src = songs2[i].poster;
    element.getElementsByTagName("h5")[0].innerHTML = songs2[i].songName;
  }
);

let masterPlay = document.getElementById("masterPlay");
let wave = document.getElementsByClassName("wave")[0];

masterPlay.addEventListener("click", () => {
  if (music.paused || music.currentTime <= 0) {
    music.play();
    masterPlay.classList.remove("bi-play-fill");
    masterPlay.classList.add("bi-pause-fill");
    wave.classList.add("active2");
  } else {
    music.pause();
    masterPlay.classList.add("bi-play-fill");
    masterPlay.classList.remove("bi-pause-fill");
    wave.classList.remove("active2");
  }
});

//
const makeAllPlays = () => {
  Array.from(document.getElementsByClassName("playcircle")).forEach(
    (element) => {
      element.classList.add("bi-play-circle-fill");
      element.classList.remove("bi-pause-circle-fill");
    }
  );
};

// week *******************
document.querySelectorAll(".weekbi").forEach((item) => {
  item.addEventListener("click", function () {
    document.querySelectorAll(".songItem2").forEach((li) => {
      li.classList.remove("active6");
      li.style.background = "#111727"; 
    });
    this.closest("li").classList.add("active6");
    Array.from(document.getElementsByClassName("active6")).forEach(
      (element) => {
        element.style.background = "rgb(105, 105, 170, 0.3)";
      }
    );
  });
});

const makeAllBackgrounds = () => {
  Array.from(document.getElementsByClassName("songItem")).forEach((element) => {
    element.style.background = "rgb(105, 105, 170, 0";
  });
};

let index = 0;
let poster_master_play = document.getElementById("poster_master_play");
let title = document.getElementById("title");

Array.from(document.getElementsByClassName("playcircle")).forEach((element) => {
  element.addEventListener("click", (e) => {
    index = e.target.id;
    makeAllPlays();
    e.target.classList.remove("bi-play-circle-fill");
    e.target.classList.add("bi-pause-circle-fill");
    music.src = `./audio/${index}.mp3`;
    poster_master_play.src = `./img/${index}.png`;
    music.play();
    let song_title = songs.filter((ele) => {
      return ele.id == index;
    });
    song_title.forEach((ele) => {
      let { songName } = ele;
      title.innerHTML = songName;
    });
    masterPlay.classList.remove("bi-play-fill");
    masterPlay.classList.add("bi-pause-fill");
    wave.classList.add("active2");
    music.addEventListener("ended", () => {
      masterPlay.classList.add("bi-play-fill");
      masterPlay.classList.remove("bi-pause-fill");
      wave.classList.remove("active2");
    });
    makeAllBackgrounds();
    Array.from(document.getElementsByClassName("songItem"))[
      `${index - 1}`
    ].style.background = "rgb(105, 105, 170, .2";
  });
});

let currentStart = document.getElementById("currentStart");
let currentEnd = document.getElementById("currentEnd");
let seek = document.getElementById("seek");
let bar2 = document.getElementById("bar2");
let dot = document.getElementsByClassName("dot")[0];

music.addEventListener("timeupdate", () => {
  let music_curr = music.currentTime;
  let music_dur = music.duration;

  let min = Math.floor(music_dur / 60);
  let sec = Math.floor(music_dur % 60);

  if (sec < 10) {
    sec = `0${sec}`;
  }
  currentEnd.innerText = `${min}:${sec}`;

  let min1 = Math.floor(music_curr / 60);
  let sec1 = Math.floor(music_curr % 60);

  if (sec1 < 10) {
    sec1 = `0${sec1}`;
  }
  currentStart.innerText = `${min1}:${sec1}`;

  let progressbar = parseInt((music.currentTime / music.duration) * 100);
  seek.value = progressbar;
  let seekbar = seek.value;
  bar2.style.width = `${seekbar}%`;
  dot.style.left = `${seekbar}%`;
});

seek.addEventListener("change", () => {
  music.currentTime = (seek.value * music.duration) / 100;
});

music.addEventListener("ended", () => {
  masterPlay.classList.add("bi-play-fill");
  masterPlay.classList.remove("bi-pause-fill");
  wave.classList.remove("active2");
});

let vol_icon = document.getElementById("vol_icon");
let vol = document.getElementById("vol");
let vol_dot = document.getElementById("vol_dot");
let vol_bar = document.getElementsByClassName("vol_bar")[0];

vol.addEventListener("change", () => {
  if (vol.value == 0) {
    vol_icon.classList.remove("bi-volume-down-fill");
    vol_icon.classList.add("bi-volume-mute-fill");
    vol_icon.classList.remove("bi-volume-up-fill");
  }
  if (vol.value > 0) {
    vol_icon.classList.add("bi-volume-down-fill");
    vol_icon.classList.remove("bi-volume-mute-fill");
    vol_icon.classList.remove("bi-volume-up-fill");
  }
  if (vol.value > 50) {
    vol_icon.classList.remove("bi-volume-down-fill");
    vol_icon.classList.remove("bi-volume-mute-fill");
    vol_icon.classList.add("bi-volume-up-fill");
  }

  let vol_a = vol.value;
  vol_bar.style.width = `${vol_a}%`;
  vol_dot.style.left = `${vol_a}%`;
  music.volume = vol_a / 100;
});

let back = document.getElementById("back");
let next = document.getElementById("next");

back.addEventListener("click", () => {
  index -= 1;
  if (index < 1) {
    index = Array.from(document.getElementsByClassName("songItem")).length;
  }
  music.src = `./audio/${index}.mp3`;
  poster_master_play.src = `./img/${index}.png`;
  music.play();
  let song_title = songs.filter((ele) => {
    return ele.id == index;
  });
  song_title.forEach((ele) => {
    let { songName } = ele;
    title.innerHTML = songName;
  });
  makeAllPlays();

  document.getElementById(`${index}`).classList.remove("bi-play-fill");
  document.getElementById(`${index}`).classList.add("bi-pause-fill");

  makeAllBackgrounds();
  Array.from(document.getElementsByClassName("songItem"))[
    `${index - 1}`
  ].style.background = "rgb(105, 105, 170, .2";
});

next.addEventListener("click", () => {
  index -= 0;
  index += 1;
  if (index > Array.from(document.getElementsByClassName("songItem")).length) {
    index = 1;
  }
  music.src = `audio/${index}.mp3`;
  poster_master_play.src = `./img/${index}.png`;
  music.play();
  let song_title = songs.filter((ele) => {
    return ele.id == index;
  });
  song_title.forEach((ele) => {
    let { songName } = ele;
    title.innerHTML = songName;
  });
  makeAllPlays();

  document.getElementById(`${index}`).classList.remove("bi-play-fill");
  document.getElementById(`${index}`).classList.add("bi-pause-fill");

  makeAllBackgrounds();
  Array.from(document.getElementsByClassName("songItem"))[
    `${index - 1}`
  ].style.background = "rgb(105, 105, 170, .2";
});

// slide Popular Song

let left_scroll = document.getElementById("left_scroll");
let right_scroll = document.getElementById("right_scroll");
let pop_song = document.getElementsByClassName("pop_song")[0];

left_scroll.addEventListener("click", () => {
  pop_song.scrollLeft -= 330;
});
right_scroll.addEventListener("click", () => {
  pop_song.scrollLeft += 330;
});

// slide Popular Artists
let left_scrolls = document.getElementById("left_scrolls");
let right_scrolls = document.getElementById("right_scrolls");
let item = document.getElementsByClassName("item")[0];

left_scrolls.addEventListener("click", () => {
  item.scrollLeft -= 330;
});
right_scrolls.addEventListener("click", () => {
  item.scrollLeft += 330;
});
