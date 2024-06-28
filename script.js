let currentSong = new Audio()
let song;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    song = []
    for(let i=0;i<as.length;i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
           song.push(element.href.split(`/${folder}/`)[1])
        }
    }

     //show all the songs in the playlist
     let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
     songUL.innerHTML = ""
     for (const it of song){
         songUL.innerHTML = songUL.innerHTML + `<li>  <img class = "invert" src="music.svg" alt="">
                      <div class="info">
                         <div>${it.replaceAll("_"," ")}</div>
                         <div>Song Artist</div>
                      </div>
                      <div class="playnow">
                         <span>Play Now</span>
                         <img class="invert" src="play.svg" alt="">
                      </div> </li>`;
     }
     // Attach an event listener to each song
     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
         e.addEventListener("click", element=>{
             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim().replaceAll(" ", "_"))
             console.log(e.querySelector(".info").firstElementChild.innerHTML)
     
         })
     })

     return song

}

const playMusic = (track, pause=false)=>{
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track)

    if(!pause){
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("_", " ")
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}
async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        
        for(let index = 0;index<array.length;index++){
            const e = array[index];

        if(e.href.includes("/songs/")){
           let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                  <div class="play">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" fill="#000" />
                     </svg>
                  </div>
                  <img src="/songs/${folder}/cover.jpg" alt="">
                  <h2>${response.title}</h2>
                  <p>${response.description}</p>
               </div>`

        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            song = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(song[0])

        })
    })

}


async function main(){
    //get the list of all songs in an array
    await getSongs("songs/cs")
    // console.log(song)
    playMusic(song[0], true)
    
    // Display all the albums on the page
    displayAlbums()


    // Attach an event listener to play, next and previous

    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar   
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = (e.offsetX/e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (currentSong.duration)*percent/100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        currentSong.pause()
        let index = song.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index-1)>=0){
            playMusic(song[index-1])
        }
      
    
    })
    
    next.addEventListener("click", ()=>{
        currentSong.pause()
        let index = song.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index+1) < song.length){
            playMusic(song[index+1])
        }
    })
    
    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0.1;
        }
    })

}

main()