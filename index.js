const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const supabase = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookie_parser = require("cookie-parser");
const multer = require("multer");
const app = express();
require("dotenv").config();

const utils = require("./utils.js");

const port = 3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Validations
      if (!utils.checkBodyVideo(req.body)) throw new Error("invalid video body");
      if (!utils.checkToken(req, "/api/upload multer")) throw new Error("unauthorized");

      if(!req.skibidihub_id) req.skibidihub_id = utils.nanoid(7);
      console.log("Video ID:", req.skibidihub_id);

      // Check if the directory exists, and create it if it doesn't
      const dir = path.join(__dirname, "videos", req.skibidihub_id);
      if (!utils.videoExists(req.skibidihub_id)) {
        console.log("Directory does not exist, creating:", dir);
        fs.mkdirSync(dir, { recursive: true });
      }

      // Set the destination path for multer
      cb(null, dir);
    } catch (err) {
      console.log("Error in destination function:", err);
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    let filename;
    if (file.fieldname === "video") {
      filename = "video.mp4";
    } else if (file.fieldname === "thumbnail") {
      filename = "thumbnail.jpg";
    }
    console.log("Saving file with filename:", filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 100000 * 250 /* 250MB in bytes */ }
});
const client = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.static("www")); // Static folder
app.use(bodyParser.json());
app.use(cookie_parser());

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

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "contact.html")));
})

app.get("/video/:id", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "video.html")));
});

app.get("/user/:user", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "user.html")));
});

// API //

// Get an mp4 file according to its video ID.
app.get("/api/video/:id", function (req, res) {
  const range = req.headers.range;

  if(!utils.checkToken(req, "/api/video/:id")) {
    return res.sendFile(
      path.join(
        __dirname,
        path.join("www", path.join("assets", path.join("troll", "video.mp4")))
      )
    );
  }

  const videoPath = path.join(__dirname, path.join("videos", path.join(req.params.id, "video.mp4")));
  if(!fs.existsSync(videoPath)) return res.sendStatus(404);
  if (!range) {
    return res.sendFile(videoPath);
  }
  
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// Get a videos thumbnail according to its video ID.
app.get("/api/thumbnail/:id", (req, res) => {
  if (!utils.checkToken(req, "/api/thumbnail/:id")) {
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
            path.join("troll", images[utils.getRandomInt(images.length - 1)])
          )
        )
      )
    );
    return;
  }

  const thumbnail = utils.getThumbnail(req.params.id);
  if(thumbnail) return res.sendFile(thumbnail);
  if(!thumbnail) return res.sendStatus(404);
});

// Get a videos thumbnail according to its video ID.
app.get("/api/webhookThumbnail/:id", (req, res) => {
  const thumbnail = utils.getThumbnail(req.params.id);
  if(thumbnail) return res.sendFile(thumbnail);
  if(!thumbnail) return res.sendStatus(404);
});

// Get the info for a video according to its video ID.
app.get("/api/videoInfo/:id", (req, res) => {
  if(!utils.videoExists(req.params.id)) return res.sendStatus(404);

  if(!utils.checkToken(req, "/api/videoInfo/:id")) {
    let newData = {};
    newData.title = utils.fakeTitleList[utils.getRandomInt(utils.fakeTitleList.length)]
    newData.description = "SIGN IN to see this EPIC content"
    newData.likes = "69"
    newData.dislikes = "0"
    newData.uploader = "SIGN IN to see this EPIC content"
    newData.uploaded_at = new Date().toISOString().toString();
    return res.send(newData);
  }

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
  if(!utils.videoExists(req.params.videoID)) return res.sendStatus(404);

  if(!utils.checkToken(req, "/api/comments/:videoID")) {
    let comments = [];
    for(let i = 0; i < 8; i++) {
      let comment = {};
      comment.text = utils.fakeCommentList[utils.getRandomInt(utils.fakeCommentList.length)]
      comment.commenter = "SIGN IN to see this EPIC content!";
      let date = new Date();
      date.setTime(1005286084);
      comment.created_at = date.toISOString();
      comments.push(comment);
    }

    return res.send(comments);
  }

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
  if(!utils.checkToken(req, "/api/getAllVideos/")) {
    let newData = [];
    for(let i = 0; i < 12; i++) {
      let temp = {};
      temp.description = "SIGN IN to see this EPIC content"
      temp.title = utils.fakeTitleList[utils.getRandomInt(utils.fakeTitleList.length)]
      temp.uploader = "SIGN IN to see this EPIC content";
      temp.id = utils.nanoid(7);
      newData.push(temp);
    }

    return res.send(newData);
  }

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
  if (!utils.checkToken(req, "/api/comment")) return res.sendStatus(401);
  
  // Sanity chekcs
  if(!req.body.commenter) return res.sendStatus(400);
  if(!req.body.videoID) return res.sendStatus(400);
  if(!req.body.text) return res.sendStatus(400);
  if(!utils.videoExists(req.body.videoID)) return res.sendStatus(404);

  client
    .from("comments")
    .insert({
      commenter: req.body.commenter,
      video_id: req.body.videoID,
      text: req.body.text,
    })
    .then((data) => {
      res.send(data);

      // Discord webhook
      utils.sendWebhook(
        "new comment guys",
        "New COMMENT!!!!!",
        [
          {
            "id": 220464536,
            "description": req.body.text.trim(),
            "fields": [],
            "title": `New comment on video ${req.body.videoID}!`,
            "author": {
              "name": req.body.commenter,
              "url": `http://skibidihub.buttplugstudios.xyz/user/${encodeURIComponent(req.body.commenter)}`
            },
            "url": `http://skibidihub.buttplugstudios.xyz/video/${req.body.videoID}`,
            "color": 917248
          }
        ]
      )
    });
});

// Like a video
app.post("/api/like/:id", async (req, res) => {
  if(!utils.checkToken(req, "/api/like/:id")) return res.sendStatus(401);
  if(!utils.videoExists(req.params.id)) return res.sendStatus(404);

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
  if(!utils.checkToken(req, "/api/dislike/:id")) return res.sendStatus(401);
  if(!utils.videoExists(req.params.id)) return res.sendStatus(404);

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
    .eq("uploader", decodeURIComponent(req.params.id));
  res.send(data);
});

app.post("/api/upload", upload.fields([
  { name: 'video' }, { name: 'thumbnail' }
]), utils.multerErrorHandler, async (req, res) => {
  console.log(req.skibidihub_id);
  if(!utils.checkBodyVideo(req.body)) return res.status(400).json({ message: "invalid video body" });
  if(!utils.checkToken(req, "/api/upload")) return res.status(401).json({ message: "SIGN IN to UPLOAD videos!!!" });

  await client.from("videos").insert({
    id: req.skibidihub_id,
    likes: 0,
    dislikes: 0,
    description: req.body.description,
    title: req.body.title,
    uploader: req.body.uploader
  }).then(data => {
    res.status(201).json({
      "id": req.skibidihub_id
    })
    // Discord webhook
    utils.sendWebhook(
      `new video guys <@&1274653503448678440>`,
      "New UPLOAD!!!!",
      [
        {
          "id": 220464536,
          "description": req.body.description,
          "fields": [],
          "title": req.body.title,
          "author": {
            "name": req.body.uploader,
            "url": `http://skibidihub.buttplugstudios.xyz/user/${encodeURIComponent(req.body.uploader)}`
          },
          "url": `http://skibidihub.buttplugstudios.xyz/video/${req.skibidihub_id}`,
          "color": 9830655,
          "image": {
            "url": `https://skibidihub.buttplugstudios.xyz/api/webhookThumbnail/${req.skibidihub_id}`
          }
        }
      ]
    )
  })
})

// Start App
app.listen(port, () => {
  console.log(`skibidihub listening on port ${port}`);
});