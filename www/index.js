// Gets all the videos uploaded to SkibidiHub
async function getAllVideos() {

  return await axios.get("/api/getAllVideos").then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getAllVideos() error: ${error}`);
  });
}

// Gets all the videos uploaded to SkibidiHub and sorts them randomly. (This is our algorithm)
async function getRandomVideos(limit) {
  let videos = await getAllVideos();
  let newVideos = [];

  for (let i = 0; i < limit; i++) {
    if (videos.length < 1) continue; // If there are no more videos then do not run the code below
    let index = getRandomInt(videos.length);
    let video = videos[index];

    newVideos.push(video);
    videos.splice(index, 1); // Remove video from the list of videos
  }

  return newVideos;
}

// Returns a random int up to a set limit.
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("account-button-anchor").href = `/user/${Cookies.get('user')}`
  if (Cookies.get("user") != null) {
    document.getElementById("login-button").classList.add("disabled");
    document.getElementById("logout-button").classList.remove("disabled");
    document.getElementById("upload-button").classList.remove("disabled");
    document.getElementById("account-button").classList.remove("disabled");
    document.getElementById("sign-in-msg").classList.add("disabled");
  }

  // john pork code
  if(johnPork()) {
    const container = document.getElementById("john-pork-container");
    container.classList.remove("disabled");
    container.addEventListener("click", handleJohnPorkClick);

    document.getElementById("john-pork-accept").addEventListener("click", () => {
      document.getElementById("john-pork").remove();
      document.getElementById("john-pork-ringtone").remove();
      document.getElementById("john-pork-call").classList.remove("disabled");
      document.getElementById("john-pork-accept").play();
      setTimeout(() => {
        container.remove();
      }, 3000);
    })

    document.getElementById("john-pork-decline").addEventListener("click", () => {
      container.remove();
      setTimeout(() => {
        alert("NEW MESSAGE (1) FROM John Pork:\nWe need to talk.")
        setTimeout(() => {
          alert("NEW MESSAGE (2) FROM John Pork:\nGet your ass downstairs now!")
        }, 3000)
      }, 3000)
    })
  }


  const videos = await getRandomVideos(30);
  videos.forEach(video => {
    makeVideo(video.id, video)
  })
});

function handleJohnPorkClick() {
  document.getElementById("john-pork").classList.remove("disabled");
  document.getElementById("john-pork-ringtone").play();
  document.getElementById("john-pork-container").removeEventListener("click", handleJohnPorkClick)
}

async function makeVideo(id, info) {
  const video = document.createElement("a");
  video.href = `/video/${id}`
  video.classList.add("video");

  const img = document.createElement("img");
  img.classList.add("thumbnail");
  img.setAttribute("src", `/api/thumbnail/${id}`);
  img.onclick = function (event) {
    window.location.pathname = `/video/${id}`;
  };
  video.appendChild(img);

  const videoInfoContainer = document.createElement("div");
  videoInfoContainer.classList.add("video-info-container");
  video.appendChild(videoInfoContainer);

  const videoTitle = document.createElement("h3");
  videoTitle.classList.add("video-title");
  const title = info.title
  if(info.title.length > 25) {
    videoTitle.innerText = title.slice(0, -(info.title.length - 22)) + "...";
  } else {
    videoTitle.innerText = title
  }

  videoTitle.onclick = function (event) {
    window.location.pathname = `/video/${id}`;
  };
  videoInfoContainer.appendChild(videoTitle);


  const videoUploader = document.createElement("a");
  videoUploader.href = `/user/${encodeURIComponent(info.uploader)}`
  videoUploader.classList.add("video-uploader");
  videoUploader.innerText = `published by: ${info.uploader}`;
  videoInfoContainer.appendChild(videoUploader);

  document.getElementById("videos").appendChild(video);
}

function isMobileOS() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator?.userAgentData?.platform || window.navigator.platform;
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (iosPlatforms.indexOf(platform) !== -1) {
    return true;
  } else if (/Android/.test(userAgent)) {
    return true;
  }

  return false;
}

function johnPork() {
  if(isMobileOS()) return getRandomInt(100) < 12;
  return getRandomInt(100) < 5;
}