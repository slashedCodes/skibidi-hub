document.addEventListener("DOMContentLoaded", async () => {
  const id = decodeURIComponent(window.location.pathname.split("/")[2]);
  document.getElementById("account-button-anchor").href = `/user/${Cookies.get('user')}`

  document.getElementById(
    "no-videos"
  ).innerText = `There seems to be no videos published by user of the site "skibidihub" by the name of "${id}".`;

  const user = await getUserInfo(id)
  if(user.verified) document.getElementById("verified").classList.remove('disabled');
  if(Cookies.get("user") === id) document.getElementById("edit-profile").classList.remove("disabled")

  if(user.website) {
    document.getElementById("website-anchor").href = user.website;
  } else {
    document.getElementById("website-anchor").remove();
  }
  document.getElementById("subscribers").innerText = `${user.subscribers} subscribers`;
  document.getElementById("social-score").innerText = `${user.social_score} social credit score`
  if(user.description) {
    if(user.description.length > 18) {
      document.getElementById("description").innerText = (user.description.slice(0, -(user.description.length - 15)) + "...").replace(/(\r\n|\n|\r)/gm, " ");
      document.getElementById("description").classList.add("description-click");
      document.getElementById("description").addEventListener("click", () => {
        document.getElementById("description-dialog-text").innerText = user.description;
        document.getElementById("description-dialog").showModal()
      })
    } else {
      document.getElementById("description").innerText = user.description.replace(/(\r\n|\n|\r)/gm, " ")
    } 
  } else {
    document.getElementById("description").innerText = "no description set"
  }
  
  // Check if the user is already subscribed
  if(!localStorage.getItem("subscribed")) localStorage.setItem("subscribed", JSON.stringify([]))
  // If so, disable the subscribe button
  if(JSON.parse(localStorage.getItem("subscribed")).includes(user.name)) document.getElementById("subscribe").setAttribute("disabled", "true");

  document.getElementById("subscribe").onclick = function(event) { subscribe(user) }

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

  const videos = await getAllUserVideos(encodeURIComponent(id))
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
  videoUploader.href = `/user/${encodeURIComponent(info.uploader)}`
  videoUploader.classList.add("video-uploader");
  videoUploader.innerText = `published by: ${info.uploader}`;
  videoInfoContainer.appendChild(videoUploader);

  document.getElementById("videos").appendChild(video);
}

// TODO: for now subscribe function is fine but maybe polish it up a little
function subscribe(authorInfo) {
  return axios.get(`/api/subscribe/${encodeURIComponent(authorInfo.name)}`).then(data => {
    if(data.status != 200) {
      return document.getElementById("subscribers").innerText = "ERROR ERROR ERROE SEREVER ERROR!!!!"
    }

    // Write to localStorage
    if(!localStorage.getItem("subscribed")) localStorage.setItem("subscribed", JSON.stringify([]))
    const subscribed = JSON.parse(localStorage.getItem("subscribed"));
    subscribed.push(authorInfo.name);

    localStorage.setItem("subscribed", JSON.stringify(subscribed))

    // Disable subscribed button
    document.getElementById("subscribe").setAttribute("disabled", "true");

    // Update subscribed counter
    document.getElementById("subscribers").innerText = `${authorInfo.subscribers + 1} subscribers`;
  }).catch(error => {
    console.error(error);
    return document.getElementById("subscribers").innerText = "ERROR ERROR ERROE SEREVER ERROR!!!!"
  })
}