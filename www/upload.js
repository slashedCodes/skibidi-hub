const nanoid = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
}

document.addEventListener("DOMContentLoaded", () => {
    if(Cookies.get("user") == null || Cookies.get("user") == undefined) {
        alert("You need to be logged in to upload videos!");
        window.location.pathname = "/";
    }
    const form = document.getElementById("form");
    const data = new FormData(form);

    const id = nanoid(7);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        axios.post("/api/upload", {
            id: id,
            title: data.get("title"),
            description: data.get("description"),
            uploader: Cookies.get("user"),
            video: data.get("video"),
            thumbnail: data.get("thumbnail"),
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': getToken(Cookies.get("user"))
            },

            onUploadProgress: function(event) {
                const percent = (event.loaded / event.total) * 100
                if(percent === 100) {
                    alert("video was uploaded successfully!")
                    window.location.pathname = `/video/${id}`
                }

                document.getElementById("progress-bar").setAttribute('value', percent);
                document.getElementById("progress").innerText = `${percent}%`
            },
        }).then(response => {
            console.log(response);
        }).catch(error => {
            throw new Error(`upload error: ${error}`);
        })
    })
});