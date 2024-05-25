const music = new Audio("vande.mp3");

const songs = [
  {
    id: "1",
    songName: `On My Way <br>
    <div class="subtitle">Alan walker</div>`,
    poster: "img/1.png",
  },
  {
    id: "2",
    songName: `Saware <br>
    <div class="subtitle">T-Series</div>`,
    poster: "img/2.png",
  },
  {
    id: "3",
    songName: `Hãy Trao Cho Anh <br>
    <div class="subtitle">M-TP</div>`,
    poster: "img/3.png",
  },
  {
    id: "4",
    songName: `Fortnight <br>
    <div class="subtitle">Taylor Swift</div>`,
    poster: "img/4.png",
  },
  {
    id: "5",
    songName: `Hẹn Ước Từ Hư Vô <br>
    <div class="subtitle">MỸ TÂM</div>`,
    poster: "img/5.png",
  },
  {
    id: "6",
    songName: `Flower<br>
    <div class="subtitle">JISOO</div>`,
    poster: "img/6.png",
  },
  {
    id: "7",
    songName: `Wild Flower <br>
    <div class="subtitle">RM</div>`,
    poster: "img/7.png",
  },
  {
    id: "8",
    songName: `Love wins all <br>
    <div class="subtitle">IU</div>`,
    poster: "img/8.png",
  },
  {
    id: "9",
    songName: ` BBIBBI <br>
    <div class="subtitle">IU</div>`,
    poster: "img/9.png",
  },
  {
    id: "10",
    songName: ` Enchanted <br>
    <div class="subtitle">Taylor Sừit</div>`,
    poster: "img/10.png",
  },
  {
    id: "11",
    songName: `Come Back To Me<br>
    <div class="subtitle">RM</div>`,
    poster: "img/11.png",
  },
  {
    id: "12",
    songName: `Chạy Ngay Đi <br>
    <div class="subtitle">M-TP</div>`,
    poster: "img/12.png",
  },
  {
    id: "13",
    songName: `Standing Next To You <br>
    <div class="subtitle">JUNG KOOK</div>`,
    poster: "img/13.png",
  },
  {
    id: "14",
    songName: ` Ava Max - Whateve <br>
    <div class="subtitle">KYGO</div>`,
    poster: "img/14.png",
  },
  {
    id: "15",
    songName: ` Playboi Carti - Popular <br>
    <div class="subtitle">THE WEEKND</div>`,
    poster: "img/15.png",
  },
  {
    id: "16",
    songName: ` Beautiful Things  <br>
    <div class="subtitle">BENSON BOONE</div>`,
    poster: "img/16.png",
  },
];

Array.from(document.getElementsByClassName("songItem")).forEach(
  (element, i) => {
    element.getElementsByTagName("img")[0].src = songs[i].poster;
    element.getElementsByTagName("h5")[0].innerHTML = songs[i].songName;
  }
);

//

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
    music.src = `audio/${index}.mp3`;
    poster_master_play.src = `img/${index}.png`;
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
    Array.from(document.getElementsByClassName("songItem"))[`${index -1}`].style.background = "rgb(105, 105, 170, .2";
  });
});
