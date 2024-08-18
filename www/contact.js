document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("account-button-anchor").href = `/user/${Cookies.get('user')}`
    if (Cookies.get("user") != null) {
      document.getElementById("login-button").classList.add("disabled");
      document.getElementById("logout-button").classList.remove("disabled");
      document.getElementById("upload-button").classList.remove("disabled");
      document.getElementById("account-button").classList.remove("disabled");
    }
});