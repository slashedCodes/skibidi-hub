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

  const videos = await getRandomVideos(30);
  videos.forEach(video => {
    makeVideo(video.id, video)
  })
});

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
  videoUploader.href = `/user/${info.uploader}`
  videoUploader.classList.add("video-uploader");
  videoUploader.innerText = `published by: ${info.uploader}`;
  videoInfoContainer.appendChild(videoUploader);

  document.getElementById("videos").appendChild(video);
}