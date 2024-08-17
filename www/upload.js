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

    document.getElementById("form").addEventListener("submit", (event) => {
        const data = new FormData(document.getElementById("form"));
        event.preventDefault();

        data.set("uploader", Cookies.get("user"));
        if(data.get("id") == "") {
            data.set("id", nanoid(7));
        }

        if(data.get("thumbnail").size < 1) return alert("Please enter valid form data");
        if(data.get("video").size < 1) return alert("Please enter valid form data");
        if(data.get("title").trim() == "") return alert("Please enter valid form data");

        axios.post("/api/upload", data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },

            onUploadProgress: function(event) {
                const percent = (event.loaded / event.total) * 100
                if(percent === 100) {
                    alert("video was uploaded successfully!")
                }

                document.getElementById("progress-bar").setAttribute('value', percent);
                document.getElementById("progress").innerText = `${percent}%`
            },
        }).catch(error => {
            throw new Error(`upload error: ${error}`);
        })
    })
});