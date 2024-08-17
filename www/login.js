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
    window.location.pathname = "/";
  });
});

function login(user) {
  Cookies.set("user", user);
  Cookies.set("token", getToken(user));
}

function getToken(user) {
  if(user == undefined || user == null) {
    return "peepeecaca unauthorized";
  }
  return (
    user + "*&*&*&*&&&&*&&&&*&****&***&*nexacopicloves15yearoldchineseboys"
  );
}