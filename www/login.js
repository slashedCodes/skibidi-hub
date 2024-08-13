document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const form = new FormData(document.getElementById("form"));

        if (form.get("username") == "") {
            alert("Please enter valid login credentials");
            return;
        } else if (form.get("password") == "") {
            alert("Please enter valid login credentials");
            return;
        }

        login(form.get("username"));
        alert("Login successfull.");
    })
})

function login(user) {
    document.cookie = `user=${user}`
}