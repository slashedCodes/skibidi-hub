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
  
  axios.post(`/api/like/${id}`, {}, {
    headers: {
      'Authorization': getToken(Cookies.get("user"))
    }
  }).then(response => {
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
  
  axios.post(`/api/dislike/${id}`, {}, {
    headers: {
      'Authorization': getToken(Cookies.get("user"))
    }
  }).then(response => {
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

document.addEventListener("DOMContentLoaded", () => {
  let video = document.getElementById("video");
  let id = window.location.pathname.split("/")[2];

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
          makeComment(Cookies.get("user"), "right now", json["text"]);
        } else {
          alert("ERROR ERROR ERROR ERORROR SERVCER ERROR!!!");
        }
      }).catch(error => {
        throw new Error(`comment error: ${error}`)
      })
    });

  getVideo(id).then((blob) => {
    // Load video
    let source = document.createElement("source");
    console.log(blob);
    source.setAttribute("src", URL.createObjectURL(blob));
    source.setAttribute("type", "video/mp4");
    video.appendChild(source);

    // Load video thumbnail
    getThumbnail(id).then((blob) => {
      console.log(URL.createObjectURL(blob));
      video.setAttribute("poster", URL.createObjectURL(blob));
    });

    // Load video info
    getInfo(id).then((info) => {
      console.log(info)

      document.getElementById("video-title").innerText = info.title;
      document.getElementById(
        "video-author"
      ).innerText = `Uploaded by: ${info.uploader}`;
      document.getElementById("video-author").onclick = function(event) {
        window.location.pathname = `/user/${info.uploader}`
      }
      document.getElementById("video-date").innerText =
        parseTimestamp(info.uploaded_at).date +
        " " +
        parseTimestamp(info.uploaded_at).timestamp;
      document.getElementById("video-description").innerText = info.description;
      document.getElementById("video-likes").innerText = info.likes;
      document.getElementById("video-dislikes").innerText = info.dislikes;
    });

    // Load comments
    getComments(id).then((comments) => {
      comments.forEach((comment) => {
        makeComment(
          comment.commenter,
          parseTimestamp(comment.created_at).date +
            " " +
            parseTimestamp(comment.created_at).timestamp,
          comment.text
        );
      });
    });

    document.getElementById("loading").classList.add("disabled")
  });
});

function makeComment(username, timestamp, content) {
  let comment = document.createElement("div");
  comment.setAttribute("class", "comment");

  let commentSpan = document.createElement("div");
  commentSpan.setAttribute("class", "comment-span");
  comment.appendChild(commentSpan);

  let user = document.createElement("h2");
  user.innerText = username;
  //user.setAttribute("onclick", `gotoUser(${username})`);
  user.onclick = function (event) {
    window.location.pathname = `/user/${username}`;
  };
  user.setAttribute("class", "clickable-user");
  commentSpan.appendChild(user);

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
