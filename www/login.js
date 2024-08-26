document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(document.getElementById("form"));

    if (form.get("username") == "") {
      alert("Please enter valid login credentials");
      return;
    } else if (form.get("password") == "") {
      alert("Please enter valid login credentials");
      return;
    }

    await login(form.get("username"));

  });
});

async function login(user) {
  Cookies.set("user", user);
  Cookies.set("token", getToken(user));

  return await axios.post("/api/login", {
    user: user,
  }).then(data => {
    if(data.status != 200) return console.error(data);

    alert("Login successfull.");
    window.location.pathname = "/";
    return;
  });
}

function getToken(user) {
  if(user == undefined || user == null) {
    return "peepeecaca unauthorized";
  }
  return (
    user + "*&*&*&*&&&&*&&&&*&****&***&*nexacopicloves15yearoldchineseboys"
  );
}