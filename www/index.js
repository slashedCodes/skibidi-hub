// Gets all the videos uploaded to SkibidiHub
async function getAllVideos() {
  try {
    const response = await fetch(window.location.origin + "/api/getAllVideos");
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = await response.json();
    if (json) return json;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
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

/*
var account = null

function updateLoginState() {
    let cookie = RegExp("name"+"=([^;]+)").exec(document.cookie);
    if(cookie != null) account = cookie[1]; 
    if(account != null && account != undefined)  {
        console.log("successfully logged in as " + account)
        loginBtn.innerText = account
        loginBtn.href = "/user/" + account
        logoutBtn.classList.remove("disabled")
    }
}
*/

document.addEventListener("DOMContentLoaded", async () => {
  /*
    // check if user is logged in
    updateLoginState();
    window.setInterval(updateLoginState, 1000);
    
    logoutBtn.addEventListener('click', e=>{
        e.preventDefault();
        //log out by trying to authenticate with an invalid login (yes this is the only way using basic auth)
        fetch('/logout', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa('bullshit:aasdjisadjasidjaisdjosadoasojd')
            }
        }).then(response => {
            if (response.status === 200) {
                window.location.reload();
            }
        });
    })
    */

  const videos = await getRandomVideos(30);
  console.log(videos);

  document.getElementById("form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    sendComment();
  });
});

async function sendComment() {
  var data = new FormData(document.getElementById("form"));
  var json = Object.fromEntries(data);
  const user = getCookie("user");

  if (user != null) {
    json["commenter"] = user;
  } else {
    alert("You must log in to comment.");
    return;
  }

  const response = await fetch(window.location.origin + "/api/comment/", {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(Cookies.get("user")),
    },
  });
}
