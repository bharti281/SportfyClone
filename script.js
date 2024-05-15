let currentSong = new Audio();
let songs;
let currFolder;

function secondToMinuteSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await  fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
          songs.push(element.href.split(`/${folder}/`)[1])
      }
  }

  //  show all the songs in the playlist
  let SongUL = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  SongUL.innerHTML = "";
  for (const song of songs) {
    SongUL.innerHTML =
      SongUL.innerHTML +
      `<li>

   <img class="invert" src="/SVG/music.svg" alt="">
   <div class="info">
     <div class="songName">${song.replaceAll("%20", " ")}</div>
     <div class="songArtits">Bharti kumari </div> 
   </div>
   <div class="playnow">
     <span>Play Now</span>
     <img class="invert" src="/SVG/play.svg" alt="">
   </div>
 
    </li>`;
  }

  //  attaach an event listent to each song

  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
     
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/"+track)

  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/SVG/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

function generateRandom1To7() {
  const min = 1; // Minimum value
  const max = 7; // Maximum value
  return Math.floor(Math.random() * (max - min + 1)) + min; // Generate and return random number
}

async function displayAlbums() {
  console.log("displaying albums")

  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.querySelectorAll("li a");
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
      const e = array[index]; 
      if (e.href.includes("/songs")) {
        console.log(e.href.split("/").slice(-1)[0]);
        folder = e.href.split("/").slice(-1)[0];
          // Get the metadata of the folder
          let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);


          let response = await a.json(); 
          cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
          <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>

          <img src="/covers/${generateRandom1To7()}.jfif" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
      </div>`
      }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => { 
      e.addEventListener("click", async item => {
          console.log("Fetching Songs")
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
          // playMusic(songs[0])
      })
  })
}


async function main() {
  // display all albums on the page

  //get the list of all songs
  await getSongs(`songs/cs`);

  playMusic(songs[0], true);

  displayAlbums();
  // console.log(songs)

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/SVG/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/SVG/play.svg";
    }
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${secondToMinuteSeconds(
      currentSong.currentTime
    )} / ${secondToMinuteSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
    // console.log("Open")
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    // console.log("close")
  });

  //add event listner to prev and next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[0]);
    }
  });

 // Add an event listener to next
 next.addEventListener("click", () => {
  currentSong.pause()
  console.log("Next clicked")

  console.log(songs.indexOf(currentSong.src.split("/").slice(-1)[0]))
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
  if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
  }
})
  //Add an event to volume

  //  console.log( document.querySelector(".range").getElementsByTagName("input")[0])

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Load the playlist whenever card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e)
    e.addEventListener("click", async (item) => {
      console.log(item, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}
main();
