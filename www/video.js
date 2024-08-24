

let liked = false;
let disliked = false;

async function like(id) {
  if(!Cookies.get("user")) {
    return alert("you must be loggefd in to like!");
  }

  if (liked)
    return alert(
      "you already like video you can not like it anymore beacuse you aleady like video!!!"
    );
  
  axios.post(`/api/like/${id}`, {}).then(response => {
    if (response.data.status == 204) {
      liked = true;
      document.getElementById("video-likes").innerText =
        parseInt(document.getElementById("video-likes").innerText) + 1;
    } else {
      document.getElementById("video-likes").innerText =
        "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR";
    }
  }).catch(error => {
    throw new Error(`like() error: ${error}`);
  })
}

async function dislike(id) {
  if(!Cookies.get("user")) {
    return alert("you must be loggefd in to dislike!");
  }

  if (disliked)
    return alert(
      "you already dislike video you can not dislike it anymore beacuse you aleady dislike video!!!"
    );
  
  axios.post(`/api/dislike/${id}`, {}).then(response => {
    if (response.data.status == 204) {
      disliked = true;
      document.getElementById("video-dislikes").innerText =
        parseInt(document.getElementById("video-dislikes").innerText) + 1;
    } else {
      document.getElementById("video-dislikes").innerText =
        "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR";
    }
  }).catch(error => {
    throw new Error(`dislike() error: ${error}`);
  })
}

function gotoUser(user) {
  window.location.pathname = `/user/${user}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  let video = document.getElementById("video");
  let id = window.location.pathname.split("/")[2];

  document.getElementById("account-button-anchor").href = `/user/${Cookies.get('user')}`
  if (Cookies.get("user") != null) {
    document.getElementById("login-button").classList.add("disabled");
    document.getElementById("logout-button").classList.remove("disabled");
    document.getElementById("account-button").classList.remove("disabled");
    document.getElementById("upload-button").classList.remove("disabled");
  }

  document
    .getElementById("comment-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      var formData = new FormData(document.getElementById("comment-form"));
      var json = Object.fromEntries(formData);
      const user = Cookies.get("user");

      if (!user) {
        alert("You must log in to comment.");
        return;
      }

      await axios.post(`/api/comment`, {
        commenter: user,
        videoID: id,
        text: json["text"]
      }, {
        headers: {
          'Authorization': getToken(Cookies.get("user"))
        }
      }).then(response => {
        if (response.data.status == 201) {
          document.getElementById("comment-textarea").innerText = ""
          makeComment(Cookies.get("user"), "right now", json["text"]);
        } else {
          alert("ERROR ERROR ERROR ERORROR SERVCER ERROR!!!");
        }
      }).catch(error => {
        throw new Error(`comment error: ${error}`)
      })
    });
  
  // Load video
  let source = document.createElement("source");
  source.setAttribute("src", `/api/video/${id}`)
  source.setAttribute("type", "video/mp4");
  video.appendChild(source);
  video.setAttribute("poster", `/api/thumbnail/${id}`);

  // Load video info
  const info = await getInfo(id);
  document.getElementById("video-title").innerText = info.title;
  document.getElementById(
    "video-author"
  ).innerText = `Uploaded by: ${info.uploader}`;
  document.getElementById("video-author-anchor").href = `/user/${encodeURIComponent(info.uploader)}`;
  document.getElementById("video-date").innerText =
    parseTimestamp(info.uploaded_at).date +
    " " +
    parseTimestamp(info.uploaded_at).timestamp;
  document.getElementById("video-description").innerText = info.description;
  document.getElementById("video-likes").innerText = info.likes;
  document.getElementById("video-dislikes").innerText = info.dislikes;

  // Load author info
  const authorInfo = await getUserInfo(info.uploader);
  if(authorInfo.verified) document.getElementById("verified").classList.remove('disabled')
  document.getElementById("author-info").innerText = `${authorInfo.subscribers} subscribers ඞ ${authorInfo.social_score} social credit score`;

  // Check if the user is already subscribed
  if(!localStorage.getItem("subscribed")) localStorage.setItem("subscribed", JSON.stringify([]))
  // If so, disable the subscribe button
  if(JSON.parse(localStorage.getItem("subscribed")).includes(authorInfo.name)) document.getElementById("subscribe").setAttribute("disabled", "true");

  document.getElementById("subscribe").onclick = function(event) { subscribe(authorInfo) }

  // Load comments
  const comments = await getComments(id);
  comments.forEach((comment) => {
    makeComment(
      comment.commenter,
      parseTimestamp(comment.created_at).date +
        " " +
        parseTimestamp(comment.created_at).timestamp,
      comment.text
    );
  });

  document.getElementById("loading").classList.add("disabled")
});

function makeComment(username, timestamp, content) {
  let comment = document.createElement("div");
  comment.setAttribute("class", "comment");

  let commentSpan = document.createElement("div");
  commentSpan.setAttribute("class", "comment-span");
  comment.appendChild(commentSpan);

  let userAnchor = document.createElement("a");
  userAnchor.href = `/user/${encodeURIComponent(username)}`;
  userAnchor.classList.add("clickable-user")
  commentSpan.appendChild(userAnchor);

  let user = document.createElement("h2");
  user.innerText = username;
  user.setAttribute("class", "clickable-user");
  userAnchor.appendChild(user);

  let date = document.createElement("h6");
  date.innerText = timestamp;
  commentSpan.appendChild(date);

  let text = document.createElement("p");
  text.innerText = content;
  comment.appendChild(text);
  document.getElementById("comments").appendChild(comment);
}

function home() {
  window.location.pathname = "/";
}

// TODO: for now subscribe function is fine but maybe polish it up a little
function subscribe(authorInfo) {
  return axios.get(`/api/subscribe/${encodeURIComponent(authorInfo.name)}`).then(data => {
    if(data.status != 200) {
      return document.getElementById("author-info").innerText = "ERROR ERROR ERROE SEREVER ERROR!!!!"
    }

    // Write to localStorage
    if(!localStorage.getItem("subscribed")) localStorage.setItem("subscribed", JSON.stringify([]))
    const subscribed = JSON.parse(localStorage.getItem("subscribed"));
    subscribed.push(authorInfo.name);

    localStorage.setItem("subscribed", JSON.stringify(subscribed))

    // Disable subscribed button
    document.getElementById("subscribe").setAttribute("disabled", "true");

    // Update subscribed counter
    document.getElementById("author-info").innerText = `${authorInfo.subscribers + 1} subscribers ඞ ${authorInfo.social_score} social credit score`;
  }).catch(error => {
    console.error(error);
    return document.getElementById("author-info").innerText = "ERROR ERROR ERROE SEREVER ERROR!!!!"
  })
}