document.addEventListener("DOMContentLoaded", async () => {
    const existingData = await getUserInfo(Cookies.get("user"));
    if(existingData.website) document.getElementById("website").setAttribute("value", existingData.website);
    document.getElementById("description").value = existingData.description;
    console.log(existingData.description)


    document.getElementById("form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(document.getElementById("form"));

        await axios.post("/api/editUser", {
            website: data.get("website"),
            description: data.get("description")
        }).then(async (data) => {
            if(data.status != 200) {
                alert("ERROR ERROR ERRORE SERVER ERRORE");
                console.warn(data);
                return;
            }

            alert("Edit successfull.");
            window.location.pathname = `/user/${encodeURIComponent(Cookies.get("user"))}`
        }).catch(async (error) => {
            if(error.response) alert(error.response.data.message)
            console.error(error);
            throw new Error(`Error: ${error}`);
        })
    })
});