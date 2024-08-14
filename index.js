const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const supabase = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

const port = 3000;

const client = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.static("www")); // Static folder
app.use(bodyParser.json());

/*
// Make sure that the user has a name cookie if they are logged in
app.use((req,res,next) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    if(login.trim().length > 0 && password.trim().length > 0) {
        res.cookie("name", login.trim())
    }

    next()
});
*/

// User facing URL's
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "index.html")));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "login.html")));
});
app.get("/video/:id", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "video.html")));
});

app.get("/user/:user", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "user.html")));
});

/*
// what 
// stole most of this from stack overflow https://stackoverflow.com/questions/23616371/basic-http-authentication-with-node-and-express-4
app.get('/api/login', (req, res) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    let loggedOut = login == "bullshit" && password == "aasdjisadjasidjaisdjosadoasojd"

    if(!loggedOut && login.trim().length > 0 && password.trim().length > 0) {
        res.send("Successfully logged in.<script>history.go(-1)</script>");
        return;
    }

    res.set("WWW-Authenticate", "Basic realm=skibidihub")
    res.status(401).send("Please login")
});
app.get('/logout', (req, res) => {
    res.clearCookie("name").status(401).send("Successfully logged out.<script>history.go(-1)</script>")
})
*/

// API //

// Get an mp4 file according to its video ID.
app.get("/api/video/:id", (req, res) => {
  if (!checkToken(req.headers.authorization)) {
    return res.sendFile(
      path.join(
        __dirname,
        path.join("www", path.join("assets", path.join("troll", "video.mp4")))
      )
    );
  }

  if (fs.existsSync(path.join("videos", req.params.id + "/"))) {
    res.sendFile(
      path.join(
        __dirname,
        path.join("videos", path.join(req.params.id, "video.mp4"))
      )
    );
  } else {
    res.sendStatus(404);
  }
});

// Get a videos thumbnail according to its video ID.
app.get("/api/thumbnail/:id", (req, res) => {
  if (!checkToken(req.headers.authorization)) {
    let images = fs.readdirSync(
      path.join(__dirname, path.join("www", path.join("assets", "troll")))
    );
    res.sendFile(
      path.join(
        __dirname,
        path.join(
          "www",
          path.join(
            "assets",
            path.join("troll", images[getRandomInt(images.length - 1)])
          )
        )
      )
    );
    return;
  }

  if (fs.existsSync(path.join("videos", req.params.id + "/"))) {
    res.sendFile(
      path.join(
        __dirname,
        path.join("videos", path.join(req.params.id, "thumbnail.jpg"))
      )
    );
  } else {
    res.sendStatus(404);
  }
});

// Get the info for a video according to its video ID.
app.get("/api/videoInfo/:id", (req, res) => {
  client
    .from("videos")
    .select()
    .eq("id", req.params.id)
    .then((data) => {
      if (data.error) {
        res.sendStatus(400);
      } else if (data.status != 200) {
        res.sendStatus(data.status);
      }

      res.send(data["data"][0]);
    });
});

// Get the comments for a video according to its video ID.
app.get("/api/comments/:videoID", (req, res) => {
  client
    .from("comments")
    .select()
    .eq("video_id", req.params.videoID)
    .then((data) => {
      if (data.error) {
        res.sendStatus(400);
      } else if (data.status != 200) {
        res.sendStatus(data.status);
      }

      res.send(data["data"]);
    });
});

// Get a list of all videos
app.get("/api/getAllVideos", (req, res) => {
  client
    .from("videos")
    .select()
    .then((data) => {
      if (data.error) {
        res.sendStatus(400);
      } else if (data.status != 200) {
        res.sendStatus(data.status);
      }

      res.send(data["data"]);
    });
});

// Send a comment
app.post("/api/comment", async (req, res) => {
  if (!checkToken(req.headers.authorization)) return;
  const id = await client.from("comments").select();

  console.log(
    `New comment: videoID: ${req.body["videoID"]} text: ${req.body["text"]} commenter: ${req.body["commenter"]}`
  );

  client
    .from("comments")
    .insert({
      id: id["data"].length + 1,
      created_at: new Date().toISOString,
      commenter: req.body["commenter"],
      video_id: req.body["videoID"],
      text: req.body["text"],
    })
    .then((data) => {
      res.send(data);
    });
});

// Like a video
app.post("/api/like/:id", async (req, res) => {
  if (!req.headers.authorization) return;
  const likesData = await client
    .from("videos")
    .select("likes")
    .eq("id", req.params.id);
  const likes = likesData["data"][0]["likes"] + 1;

  const video = await client
    .from("videos")
    .update({ likes: likes })
    .eq("id", req.params.id);
  res.send(video);
});

// Dislike a video
app.post("/api/dislike/:id", async (req, res) => {
  if (!req.headers.authorization) return;
  const dislikesData = await client
    .from("videos")
    .select("dislikes")
    .eq("id", req.params.id);
  const dislikes = dislikesData["data"][0]["dislikes"] + 1;

  const video = await client
    .from("videos")
    .update({ dislikes: dislikes })
    .eq("id", req.params.id);
  res.send(video);
});

// Start App
app.listen(port, () => {
  console.log(`skibidihub listening on port ${port}`);
});

// Returns a random int up to a set limit.
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function checkToken(token) {
  let split = token.split("*&*&*&*&&&&*&&&&*&****&***&*");
  if (split.length > 1 && split[1] === "nexacopicloves15yearoldchineseboys") {
    return true;
  } else {
    return false;
  }
}
