document.addEventListener("DOMContentLoaded", async () => {
  const id = decodeURI(window.location.pathname.split("/")[2]);
  document.getElementById("account-button-anchor").href = `/user/${Cookies.get('user')}`

  document.getElementById(
    "no-videos"
  ).innerText = `There seems to be no videos published by user of the site "skibidihub" by the name of "${id}".`;

  if (Cookies.get("user") != null) {
    document.getElementById("user-info-name").innerText = id;
    document.getElementById("login-button").classList.add("disabled");
    document.getElementById("logout-button").classList.remove("disabled");
    document.getElementById("account-button").classList.remove("disabled");
    document.getElementById("upload-button").classList.remove("disabled");
  } else {
    document.getElementById("user-info-name").innerText =
      "⚠️⚠️⚠️⚠️SIGN IN to see this EPIC content❌❌💋🩻";
  }

  const videos = await getAllUserVideos(id)
  document.getElementById("loading").classList.add("disabled");
  if (videos.data.length > 0) {
    videos.data.forEach((video) => {
      makeVideo(video.id, video);
    });
  } else {
    document.getElementById("no-videos").classList.remove("disabled");
  }
});

async function makeVideo(id, info) {
  const video = document.createElement("a");
  video.href = `/video/${id}`
  video.classList.add("video");

  const img = document.createElement("img");
  img.classList.add("thumbnail");
  img.setAttribute("src", `/api/thumbnail/${id}`);
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
