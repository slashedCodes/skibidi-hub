let likev = false
let dislikev = false

async function getVideo(id) {
    try {
        let response;
        if(getCookie("user") != null) {
            response = await fetch(window.location.origin + `/api/video/${id}`, {headers: {'Authorization': getCookie("user")}})
        } else {
            response = await fetch(window.location.origin + `/api/video/${id}`)
        }

        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const blob = response.blob();
        if(!blob) throw new Error(`blob error`);
        return blob
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

async function getThumbnail(id) {
    try {
        let response;
        if(getCookie("user") != null) {
            response = await fetch(window.location.origin + `/api/thumbnail/${id}`, {headers: {'Authorization': getCookie("user")}})
        } else {
            response = await fetch(window.location.origin + `/api/thumbnail/${id}`)
        }
        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const blob = response.blob();
        if(!blob) throw new Error(`blob error`);
        return blob
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

async function getInfo(id) {
    try {
        const response = await fetch(window.location.origin + `/api/videoInfo/${id}`)
        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const json = response.json();
        if(!json) throw new Error(`json error`);
        return json
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

async function like(id) {
    if(likev) return alert("you already like video you can not like it anymore beacuse you aleady like video!!!")
    try {
        if(getCookie("user") == null) return alert("You need to login to like.");

        const response = await fetch(window.location.origin + `/api/like/${id}`, {
            method: "POST",
            headers: {
                "Authorization": getCookie("user")
            }
        })
        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const json = await response.json();
        if(!json) throw new Error(`json error`);
        if(json.status == 204) {
            likev = true
            document.getElementById("video-likes").innerText = parseInt(document.getElementById("video-likes").innerText) + 1
        } else {
            document.getElementById("video-likes").innerText = "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR"
        }
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

async function dislike(id) {
    if(dislikev) return alert("you already dislike video you can not dislike it anymore beacuse you aleady dislike video!!!")
    try {
        if(getCookie("user") == null) return alert("You need to login to dislike.");

        const response = await fetch(window.location.origin + `/api/dislike/${id}`, {
            method: "POST",
            headers: {
                "Authorization": getCookie("user")
            }
        })
        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const json = await response.json();
        if(!json) throw new Error(`json error`);
        console.log(json)
        if(json.status == 204) {
            dislikev = true
            document.getElementById("video-dislikes").innerText = parseInt(document.getElementById("video-dislikes").innerText) + 1
        } else {
            document.getElementById("video-dislikes").innerText = "ERROR ERROR ERROR ERROR ERRROR SERVCER ERROR"
        }
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

async function getComments(id) {
    try {
        const response = await fetch(window.location.origin + `/api/comments/${id}`)
        if(!response.ok) throw new Error(`Response status: ${response.status}`);

        const json = await response.json();
        if(!json) throw new Error(`json error`);
        return json
    } catch (error) {
        throw new Error(`Error: ${error}`)
    }
}

function getCookie(key) {
    let split = document.cookie.split(";")
    split.forEach(str => {split[split.indexOf(str)] = str.trim()})

    for(let i = 0; i < split.length; i++) {
        let pair = split[i];
        if(pair != "Secure") {
            let pairSplit = pair.split("=")
            if(pairSplit[0] == key) { 
                return pairSplit[1] 
            } else { 
                return null
            }
        } else {
            return null
        }
    }
}

function gotoUser(user) {
    window.location.pathname = `/user/${user}`
}

document.addEventListener("DOMContentLoaded", () => {
    let video = document.getElementById("video")
    let id = window.location.pathname.split("/")[2]
    console.log(id)

    getVideo(id).then(blob => {
        // Load video
        let source = document.createElement("source")
        console.log(blob)
        source.setAttribute("src", URL.createObjectURL(blob))
        source.setAttribute("type", "video/mp4")
        video.appendChild(source);

        // Load video thumbnail
        getThumbnail(id).then(blob => {
            console.log( URL.createObjectURL(blob))
            video.setAttribute("poster", URL.createObjectURL(blob))
        })

        // Load video info
        getInfo(id).then(info => {
            document.getElementById("video-title").innerText = info.title
            document.getElementById("video-author").innerText = `Uploaded by: ${info.uploader}`
            document.getElementById("video-date").innerText = parseTimestamp(info.uploaded_at).date + " " + parseTimestamp(info.uploaded_at).timestamp
            document.getElementById("video-description").innerText = info.description
            document.getElementById("video-likes").innerText = info.likes
            document.getElementById("video-dislikes").innerText = info.dislikes
        })

        // Load comments
        getComments(id).then(comments => {
            comments.forEach(comment => {
                makeComment(comment.commenter, parseTimestamp(comment.created_at).date + " " + parseTimestamp(comment.created_at).timestamp, comment.text)
            })
        })
    })
})

function parseTimestamp(str) {
    let date = str.split("T")[0]
    let timestamp = str.split("T")[1].split("+")[0].split(".")[0]
    return {date: date, timestamp: timestamp}
}

function makeComment(username, timestamp, content) {
    /*
    <div class="comment">
        <div class="comment-span">
            <h2 class="clickable-user" onclick="gotoUser('sigmaboy320')">sigmaboy320</h2>
            <h6>02/13/2111 15:15:15</h6>
        </div>
        <p>you cant say that bro they will cancel you</p>
    </div>
    */

    let comment = document.createElement("div")
    comment.setAttribute("class", "comment")

    let commentSpan = document.createElement("div")
    commentSpan.setAttribute("class", "comment-span")
    comment.appendChild(commentSpan)

    let user = document.createElement("h2")
    user.innerText = username
    user.onclick = `gotoUser(${username})`
    user.setAttribute("class", "clickable-user")
    commentSpan.appendChild(user)

    let date = document.createElement("h6")
    date.innerText = timestamp
    commentSpan.appendChild(date)

    let text = document.createElement("p")
    text.innerText = content
    comment.appendChild(text)
    document.getElementById("comments").appendChild(comment)
}

function home() {
    window.location.pathname = "/"
}