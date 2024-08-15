let likev = false;
let dislikev = false;

async function like(id) {
  if (likev)
    return alert(
      "you already like video you can not like it anymore beacuse you aleady like video!!!"
    );
  try {
    if (Cookies.get("user") == null) return alert("You need to login to like.");

    const response = await fetch(window.location.origin + `/api/like/${id}`, {
      method: "POST",
      headers: {
        Authorization: getToken(Cookies.get("user")),
      },
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = await response.json();
    if (!json) throw new Error(`json error`);
    if (json.status == 204) {
      likev = true;
      document.getElementById("video-likes").innerText =
        parseInt(document.getElementById("video-likes").innerText) + 1;
    } else {
      document.getElementById("video-likes").innerText =
        "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR";
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

async function dislike(id) {
  if (dislikev)
    return alert(
      "you already dislike video you can not dislike it anymore beacuse you aleady dislike video!!!"
    );
  try {
    if (Cookies.get("user") == null)
      return alert("You need to login to dislike.");

    const response = await fetch(
      window.location.origin + `/api/dislike/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: getToken(Cookies.get("user")),
        },
      }
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = await response.json();
    if (!json) throw new Error(`json error`);
    console.log(json);
    if (json.status == 204) {
      dislikev = true;
      document.getElementById("video-dislikes").innerText =
        parseInt(document.getElementById("video-dislikes").innerText) + 1;
    } else {
      document.getElementById("video-dislikes").innerText =
        "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR";
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

function gotoUser(user) {
  window.location.pathname = `/user/${user}`;
}

document.addEventListener("DOMContentLoaded", () => {
  let video = document.getElementById("video");
  let id = window.location.pathname.split("/")[2];

  if (Cookies.get("user") != null) {
    document.getElementById("login-button").classList.add("disabled");
    document.getElementById("upload-button").classList.remove("disabled");
  }

  document
    .getElementById("comment-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      var formData = new FormData(document.getElementById("comment-form"));
      var json = Object.fromEntries(formData);
      const user = Cookies.get("user");

      if (user != null) {
        json["commenter"] = user;
      } else {
        alert("You must log in to comment.");
        return;
      }

      await fetch(window.location.origin + "/api/comment/", {
        method: "POST",
        body: JSON.stringify({
          commenter: user,
          videoID: id,
          text: json["text"],
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(user),
        },
      }).then(async (data) => {
        const response = await data.json();
        if (response.status == 201) {
          makeComment(Cookies.get("user"), "right now", json["text"]);
        } else {
          alert("ERROR ERROR ERROR ERORROR SERVCER ERROR!!!");
        }
      });
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
      document.getElementById("video-title").innerText = info.title;
      document.getElementById(
        "video-author"
      ).innerText = `Uploaded by: ${info.uploader}`;
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
