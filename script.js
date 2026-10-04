const audio = document.getElementById("audioPlayer");

const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progressBar =
    document.getElementById("progressBar");

const volumeBar =
    document.getElementById("volumeBar");

const currentTimeElement =
    document.getElementById("currentTime");

const durationElement =
    document.getElementById("duration");

const songTitle =
    document.getElementById("songTitle");

const songArtist =
    document.getElementById("songArtist");

const playlistElement =
    document.getElementById("playlist");

const songCount =
    document.getElementById("songCount");


/*
    -------------------------
    Player State
    -------------------------
*/

let songs = [];

let currentSongIndex = -1;

let isShuffle = false;

let isRepeat = false;

let currentPlaylist = "all";


/*
    -------------------------
    Load songs.json
    -------------------------
*/

async function loadSongs() {

    try {

        const response =
            await fetch("songs.json");

        if (!response.ok) {

            throw new Error(
                "songs.json could not be loaded"
            );

        }

        songs = await response.json();

        if (!Array.isArray(songs)) {

            throw new Error(
                "songs.json must contain an array"
            );

        }

        updateSongCount();

        renderPlaylist();


        if (songs.length > 0) {

            currentSongIndex = 0;

            loadSong(currentSongIndex);

        }

    }

    catch (error) {

        console.error(error);

        showError(
            "Music library could not be loaded."
        );

    }

}

// async function loadSongs() {

//     try {

//         const response =
//             await fetch("songs.json");

//         if (!response.ok) {

//             throw new Error(
//                 "songs.json could not be loaded"
//             );

//         }

//         songs = await response.json();


//         if (!Array.isArray(songs)) {

//             throw new Error(
//                 "songs.json must contain an array"
//             );

//         }


//         songCount.textContent =
//             `${songs.length} ${
//                 songs.length === 1
//                     ? "song"
//                     : "songs"
//             }`;


//         if (songs.length === 0) {

//             showError(
//                 "No songs found in songs.json."
//             );

//             return;

//         }


//         renderPlaylist();


//         currentSongIndex = 0;

//         loadSong(currentSongIndex);

//     }

//     catch (error) {

//         console.error(error);

//         showError(
//             "Music library could not be loaded."
//         );

//     }

// }

async function loadPlaylist(playlistName) {

    try {

        if (playlistName === "all") {

            const response =
                await fetch("songs.json");

            if (!response.ok) {

                throw new Error(
                    "songs.json could not be loaded"
                );

            }

            songs = await response.json();

        } else {

            const response =
                await fetch(
                    `playlists/${playlistName}.json`
                );

            if (!response.ok) {

                throw new Error(
                    `${playlistName}.json could not be loaded`
                );

            }

            songs = await response.json();

        }


        currentPlaylist =
            playlistName;


        currentSongIndex = -1;


        updateSongCount();

        renderPlaylist();


        if (songs.length > 0) {

            currentSongIndex = 0;

            loadSong(currentSongIndex);

        } else {

            songTitle.textContent =
                "No songs";

            songArtist.textContent =
                "This playlist is empty";

        }

    }

    catch (error) {

        console.error(error);

        showError(
            "Playlist could not be loaded."
        );

    }

}

function updateSongCount() {

    songCount.textContent =
        `${songs.length} ${
            songs.length === 1
                ? "song"
                : "songs"
        }`;

}


/*
    -------------------------
    Load Current Song
    -------------------------
*/

function loadSong(index) {

    if (!songs[index]) {

        return;

    }


    currentSongIndex = index;

    const song = songs[index];


    audio.src = song.file;

    audio.load();


    songTitle.textContent =
        song.title || "Unknown Song";


    songArtist.textContent =
        song.artist || "Unknown Artist";


    renderPlaylist();

}


/*
    -------------------------
    Play / Pause
    -------------------------
*/

playBtn.addEventListener(
    "click",
    function () {

        if (!songs.length) {

            return;

        }


        if (audio.paused) {

            audio.play();

        } else {

            audio.pause();

        }

    }
);


/*
    -------------------------
    Play
    -------------------------
*/

audio.addEventListener(
    "play",
    function () {

        playBtn.textContent = "⏸️";

    }
);


/*
    -------------------------
    Pause
    -------------------------
*/

audio.addEventListener(
    "pause",
    function () {

        playBtn.textContent = "▶️";

    }
);


/*
    -------------------------
    Previous
    -------------------------
*/

previousBtn.addEventListener(
    "click",
    function () {

        if (!songs.length) {

            return;

        }


        let index;


        if (currentSongIndex <= 0) {

            index = songs.length - 1;

        } else {

            index =
                currentSongIndex - 1;

        }


        loadSong(index);

        audio.play();

    }
);


/*
    -------------------------
    Next
    -------------------------
*/

nextBtn.addEventListener(
    "click",
    function () {

        playNextSong();

    }
);


/*
    -------------------------
    Next Song
    -------------------------
*/

function playNextSong() {

    if (!songs.length) {

        return;

    }


    let nextIndex;


    if (
        isShuffle &&
        songs.length > 1
    ) {

        do {

            nextIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        }
        while (
            nextIndex === currentSongIndex
        );

    } else {

        nextIndex =
            (currentSongIndex + 1)
            % songs.length;

    }


    loadSong(nextIndex);

    audio.play();

}


/*
    -------------------------
    Song Finished
    -------------------------
*/

audio.addEventListener(
    "ended",
    function () {

        if (isRepeat) {

            audio.currentTime = 0;

            audio.play();

        } else {

            playNextSong();

        }

    }
);


/*
    -------------------------
    Progress
    -------------------------
*/

audio.addEventListener(
    "timeupdate",
    function () {

        if (!audio.duration) {

            return;

        }


        const progress =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        progressBar.value =
            progress;


        currentTimeElement.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


/*
    -------------------------
    Duration
    -------------------------
*/

audio.addEventListener(
    "loadedmetadata",
    function () {

        durationElement.textContent =
            formatTime(
                audio.duration
            );

    }
);


/*
    -------------------------
    Seek
    -------------------------
*/

progressBar.addEventListener(
    "input",
    function () {

        if (!audio.duration) {

            return;

        }


        audio.currentTime =
            (
                this.value / 100
            ) * audio.duration;

    }
);


/*
    -------------------------
    Volume
    -------------------------
*/

const volumeIcon =
    document.getElementById("volumeIcon");

let lastVolume = 0.3;


// Starting volume = 30%
audio.volume = 0.3;

volumeBar.value = 0.3;


// Volume slider
volumeBar.addEventListener(
    "input",
    function () {

        audio.volume = this.value;

        // अगर volume बढ़ाया तो unmute
        if (audio.volume > 0) {

            volumeIcon.textContent = "🔊";

            lastVolume = audio.volume;

        } else {

            volumeIcon.textContent = "🔇";

        }

    }
);


// Click speaker icon = Mute / Unmute
volumeIcon.addEventListener(
    "click",
    function () {

        // Currently playing volume है
        if (audio.volume > 0) {

            lastVolume = audio.volume;

            audio.volume = 0;

            volumeBar.value = 0;

            volumeIcon.textContent = "🔇";

        }

        // Currently muted है
        else {

            audio.volume =
                lastVolume || 0.3;

            volumeBar.value =
                audio.volume;

            volumeIcon.textContent = "🔊";

        }

    }
);

// volumeBar.addEventListener(
//     "input",
//     function () {

//         audio.volume =
//             this.value;

//     }
// );


/*
    -------------------------
    Shuffle
    -------------------------
*/

shuffleBtn.addEventListener(
    "click",
    function () {

        isShuffle =
            !isShuffle;


        this.classList.toggle(
            "active",
            isShuffle
        );

    }
);


/*
    -------------------------
    Repeat
    -------------------------
*/

repeatBtn.addEventListener(
    "click",
    function () {

        isRepeat =
            !isRepeat;


        this.classList.toggle(
            "active",
            isRepeat
        );

    }
);


/*
    -------------------------
    Playlist
    -------------------------
*/

function renderPlaylist() {

    playlistElement.innerHTML = "";


    songs.forEach(
        function (song, index) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "song-item";


            if (
                index ===
                currentSongIndex
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.innerHTML = `

                <div class="song-number">
                    ${index + 1}
                </div>

                <div class="song-icon">
                    ♪
                </div>

                <div class="song-details">

                    <strong>
                        ${escapeHTML(
                            song.title ||
                            "Unknown Song"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            song.artist ||
                            "Unknown Artist"
                        )}
                    </span>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    loadSong(index);

                    audio.play();

                }
            );


            playlistElement.appendChild(
                item
            );

        }
    );

}


/*
    -------------------------
    Format Time
    -------------------------
*/

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;

}


/*
    -------------------------
    Error
    -------------------------
*/

function showError(message) {

    playlistElement.innerHTML = `

        <div class="error">

            ${message}

            <br><br>

            Make sure songs.json
            exists and contains valid JSON.

        </div>

    `;

}


/*
    -------------------------
    Security
    -------------------------
*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;

}



const playlistTabs =
    document.querySelectorAll(
        ".playlist-tab"
    );


playlistTabs.forEach(
    function (tab) {

        tab.addEventListener(
            "click",
            function () {

                playlistTabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                const playlistName =
                    this.dataset.playlist;


                loadPlaylist(
                    playlistName
                );

            }
        );

    }
);


/*
    -------------------------
    Start
    -------------------------
*/

loadSongs();