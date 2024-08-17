const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const supabase = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
require("dotenv").config();

const port = 3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //console.log(req);
    if(!fs.existsSync(path.join(__dirname, path.join("videos", req.body.id)))) {
      fs.mkdirSync(path.join(__dirname, path.join("videos", req.body.id)))
    }
    return cb(null, path.join(__dirname, path.join("videos", req.body.id)))
  },
  filename: function (req, file, cb) {
    if(file.fieldname == "video") cb(null, file.fieldname + ".mp4")
    if(file.fieldname == "thumbnail") cb(null, file.fieldname + ".jpg")
  }
})
const upload = multer({ storage: storage });

const fakeTitleList = [
  "CHICA added BBQ SAUCE to the mcdonalds FOOTJOB!!!",
  "FREDDY's bubble GYATT bounces on my BBC and breaks it in TWO PIECES!!!",
  "MONTY gets the PROFESSIONAL hawk tuah GOP GOP!!!",
  "stepmother FOXY is hungry for COCK!!!",
  "POV impregnate the CUPCAKE plushie with me!!!",
  "CHICA cheated on me with the CUPCAKE and i joined IN!!!!",
  "FREDDYS BBC got stuck in the GARBAGE DISPOSAL!!! You will NOT believe what happened next!",
  "LEGENDARY pegging session with FUNTIME FOXY!!!",
  "FUNTIME FOXY gives me the SLOPPY TOPPY with a TWIST!!!",
  "CHICA does OZEMPIC MUKBANG!!!!",
  "FOXY LICKS MY TOES ASMR!!!!",
  "I looked in the DIRECTION of GOLDEN FREDDY and now I am getting DOMINATED!!!"
]

const fakeCommentList = [
  "I would LOVE that gyatt on my dingaling dear 🤭",
  "Those tiddies are blinding dear 😎",
  "I have a big cock just for you darling 🤗",
  "I love chica i want to touch her everywhere inappropriately! 🤪",
  "I would love for funtime foxy to give me head 🥵",
  "You have the perfect body dear 😏😶‍🌫️",
  "please suck on my dick  you are so hot i love you 🥵🥵🥵🥵",
  "Am i not enough for you, freddy? 😥",
  "Am i not enough for you, chica? 😥",
  "I would love to clap those bootycheeks of yours 🥵 lets say my tongue is good aswell 👅",
  "Only if my wife was like you... 😥 i wish...",
  "you look Beautiful darling, how about you consider contacting me? 🤪🤭"
]

const client = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.static("www")); // Static folder
app.use(bodyParser.json());

// User facing URL's
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "index.html")));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "login.html")));
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "upload.html")));
})

app.get("/video/:id", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "video.html")));
});

app.get("/user/:user", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "user.html")));
});

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
      if(checkToken(req.headers.authorization)) {
        res.send(data["data"][0]);
      } else {
        let newData = {};
        newData.title = fakeTitleList[getRandomInt(fakeTitleList.length)]
        newData.description = "SIGN IN to see this EPIC content"
        newData.likes = "69"
        newData.dislikes = "0"
        newData.uploader = "SIGN IN to see this EPIC content"
        newData.uploaded_at = new Date().toISOString().toString();
        res.send(newData);
        return
      }

      if (data.error) {
        res.sendStatus(400);
      } else if (data.status != 200) {
        res.sendStatus(data.status);
      }
    });
});

// Get the comments for a video according to its video ID.
app.get("/api/comments/:videoID", (req, res) => {
  client
    .from("comments")
    .select()
    .eq("video_id", req.params.videoID)
    .then((data) => {
      if(!checkToken(req.headers.authorization)) {
        let comments = [];
        for(let i = 0; i < 8; i++) {
          let comment = {};
          comment.text = fakeCommentList[getRandomInt(fakeCommentList.length)]
          comment.commenter = "SIGN IN to see this EPIC content!";
          let date = new Date();
          date.setTime(1005286084);
          comment.created_at = date.toISOString();
          comments.push(comment);
        }

        console.log(comments)
        res.send(comments);
        return;
      }

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

      if(checkToken(req.headers.authorization)) {
        res.send(data["data"]);
      } else {
        let newData = [];
        for(let i = 0; i < 30; i++) {
          let temp = {};
          temp.description = "SIGN IN to see this EPIC content"
          temp.title = fakeTitleList[getRandomInt(fakeTitleList.length)]
          temp.uploader = "SIGN IN to see this EPIC content";
          temp.id = nanoid(7);
          newData.push(temp);
        }

        res.send(newData);
      }

    });
});

// Send a comment
app.post("/api/comment", async (req, res) => {
  if (!checkToken(req.headers.authorization)) return;
  const id = await client.from("comments").select();

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

app.get("/api/userVideos/:id", async (req, res) => {
  const data = await client
    .from("videos")
    .select()
    .eq("uploader", req.params.id);
  res.send(data);
});

app.post("/api/upload", upload.fields([
  { name: 'video' }, { name: 'thumbnail' }
]), async (req, res) => {
  await client.from("videos").insert({
    id: req.body.id,
    uploaded_at: new Date().toISOString,
    likes: 0,
    dislikes: 0,
    description: req.body.description,
    title: req.body.title,
    uploader: req.body.uploader
  })
})


// Start App
app.listen(port, () => {
  console.log(`skibidihub listening on port ${port}`);
});

// Returns a random int up to a set limit.
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function checkToken(token) {
  if (token == undefined) return;
  if (token == null) return;
  if (token.trim() == "") return;
  let split = token.split("*&*&*&*&&&&*&&&&*&****&***&*");
  if (split.length > 1 && split[1] === "nexacopicloves15yearoldchineseboys") {
    return true;
  } else {
    return false;
  }
}
const nanoid = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters[randomIndex];
  }
  return id;
}

