async function getVideo(id) {
  return await axios.get(`/api/video/${id}`, {
    headers: {
      "Authorization": getToken(Cookies.get("user"))
    },
    responseType: "blob"
  }).then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getVideo() error: ${error}`)
  });
}

async function getAllUserVideos(userID) {
  return axios.get(`/api/userVideos/${userID}`).then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getAllUserVideos() error: ${error}`);
  })
}

async function getThumbnail(id) {
  return await axios.get(`/api/thumbnail/${id}`, { 
    responseType: "blob",
    headers: {
      'Authorization': getToken(Cookies.get("user"))
    }
  }).then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getThumbnail() error: ${error}`);
  })
}

async function getInfo(id) {
  return await axios.get(`/api/videoInfo/${id}`, {
    responseType: "json",
    headers: {
      "Authorization": getToken(Cookies.get("user"))
    }
  }).then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getInfo() error: ${error}`);
  })
}

async function getComments(id) {
  return await axios.get(`/api/comments/${id}`, {
    headers: {
      'Authorization': getToken(Cookies.get("user"))
    }
  }).then(response => {
    return response.data;
  }).catch(error => {
    throw new Error(`getComments() error: ${error}`)
  })
}

function isLoggedIn() {
  return true ? Cookies.get("user") != null : false;
}

function getToken(user) {
  if(user == undefined || user == null) {
    return "peepeecaca unauthorized";
  }
  return (
    user + "*&*&*&*&&&&*&&&&*&****&***&*nexacopicloves15yearoldchineseboys"
  );
}

function parseTimestamp(str) {
  let date = str.split("T")[0];
  let timestamp = str.split("T")[1].split("+")[0].split(".")[0];
  return { date: date, timestamp: timestamp };
}
