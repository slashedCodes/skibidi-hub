document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("account-button-anchor").href = `/user/${encodeURIComponent(Cookies.get('user'))}`
    if (Cookies.get("user") != null) {
        document.getElementById("login-button").classList.add("disabled");
        document.getElementById("logout-button").classList.remove("disabled");
        document.getElementById("upload-button").classList.remove("disabled");
        document.getElementById("account-button").classList.remove("disabled");
    }

    const urlParams = new URLSearchParams(window.location.search);
    if(!urlParams.has("query")) alert("you must search something to see results");
    const results = await search(urlParams.get("query"));
    if(results.status != 200) {
        console.error(results);
        return alert("ERRORE ERRORE ERRORE");
    }

    if(results.data.length < 1) {
        document.getElementById("no-results").innerText = `the search query "${urlParams.get("query")}" on the site "skibidihub" is not bringing up any results on the site "skibidihub"`
    } else {
        document.getElementById("no-results").classList.add("disabled");
    }

    results.data.forEach(video => {
        makeVideo(video);
    });
})

async function search(query) {
    return await axios.post("/api/search", { query: query }).then(data => {
        return data;
    }).catch(error => {
        console.error(error);
        throw new Error("search error: ", error)
    })
}

function makeVideo(video) {
    // search-video
    const parent = document.createElement("div")
    parent.classList.add("search-video");
    
    // thumbnail anchor
    const thumbnailAnchor = document.createElement("a")
    thumbnailAnchor.classList.add("anchor");
    thumbnailAnchor.setAttribute("href", `/video/${video.id}`);
    parent.appendChild(thumbnailAnchor);

    // search-thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.classList.add("search-thumbnail");
    thumbnail.setAttribute("height", "155px");
    thumbnail.setAttribute("width", "275px");
    thumbnail.setAttribute("src", `/api/thumbnail/${video.id}`);
    thumbnailAnchor.appendChild(thumbnail);

    // search-video-info
    const videoInfo = document.createElement("div");
    videoInfo.classList.add("search-video-info");
    parent.appendChild(videoInfo);

    // title anchor
    const titleAnchor = document.createElement("a");
    titleAnchor.classList.add("anchor");
    titleAnchor.setAttribute("href", `/video/${video.id}`);
    videoInfo.appendChild(titleAnchor);

    // video title
    const title = document.createElement("h2");
    title.innerText = video.title;
    titleAnchor.appendChild(title);

    // author anchor
    const authorAnchor = document.createElement("a");
    authorAnchor.classList.add("anchor");
    authorAnchor.setAttribute("href", `/user/${encodeURIComponent(video.uploader)}`);
    videoInfo.appendChild(authorAnchor);

    // author
    const author = document.createElement("p");
    author.innerText = `Uploaded by: ${video.uploader}`;
    authorAnchor.appendChild(author);

    document.getElementById("videos").appendChild(parent);
}