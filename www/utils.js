async function getVideo(id) {
  try {
    console.log(Cookies.get("user"));

    let response;
    if (Cookies.get("user") != null) {
      response = await fetch(window.location.origin + `/api/video/${id}`, {
        headers: { Authorization: getToken(Cookies.get("user")) },
      });
    } else {
      response = await fetch(window.location.origin + `/api/video/${id}`);
    }

    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const blob = response.blob();
    if (!blob) throw new Error(`blob error`);
    return blob;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

async function getThumbnail(id) {
  try {
    let response;
    if (Cookies.get("user") != null) {
      response = await fetch(window.location.origin + `/api/thumbnail/${id}`, {
        headers: { Authorization: getToken(Cookies.get("user")) },
      });
    } else {
      response = await fetch(window.location.origin + `/api/thumbnail/${id}`);
    }
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const blob = response.blob();
    if (!blob) throw new Error(`blob error`);
    return blob;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

async function getInfo(id) {
  try {
    const response = await fetch(
      window.location.origin + `/api/videoInfo/${id}`
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = response.json();
    if (!json) throw new Error(`json error`);
    return json;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

async function getComments(id) {
  try {
    const response = await fetch(
      window.location.origin + `/api/comments/${id}`
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = await response.json();
    if (!json) throw new Error(`json error`);
    return json;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

function isLoggedIn() {
  return true ? Cookies.get("user") != null : false;
}

function getToken(user) {
  return (
    user + "*&*&*&*&&&&*&&&&*&****&***&*nexacopicloves15yearoldchineseboys"
  );
}

function parseTimestamp(str) {
  let date = str.split("T")[0];
  let timestamp = str.split("T")[1].split("+")[0].split(".")[0];
  return { date: date, timestamp: timestamp };
}
