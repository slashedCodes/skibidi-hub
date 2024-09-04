const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const supabase = require("@supabase/supabase-js");
const cookie_parser = require("cookie-parser");
const multer = require("multer");
const app = express();
require("dotenv").config();

const utils = require("./utils.js");
const url = "https://skibidihub.buttplugstudios.xyz"

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
  limits: { fileSize: 1000000 * 250 /* 250MB in bytes */ }
});

const client = supabase.createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const ipwareObject = require("@fullerstack/nax-ipware");
const ipware = new ipwareObject.Ipware();
const ipBlacklist = JSON.parse(fs.readFileSync("./ipbans.json"));
app.use(function(req, res, next) {
  req.ipInfo = ipware.getClientIP(req);

  if(ipBlacklist.includes(req.ipInfo.ip)) {
    res.setHeader("Cache-Control", "no-cache");
    return res.sendFile(path.join(__dirname, path.join("www", "down.html")));
  }

  next();
});

app.use(express.static("www")); // Static folder
app.use(express.json()); // JSON body parser
app.use(cookie_parser()); // Cookie parser

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

app.get("/editProfile", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "editProfile.html")));
});

app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, path.join("www", "search.html")));
});

app.set('view engine', 'ejs');
app.get("/video/:id", async (req, res) => {
  if(utils.discordCheck(req) && utils.videoExists(req.params.id)) {
    const videoInfo = await utils.videoInfo(req.params.id);
    if(isNaN(videoInfo)) {
      return res.render("video", {
        video: `${url}/api/video/${req.params.id}.mp4`,
        video_name: videoInfo.title,
        description: videoInfo.description,
        url: url,
        author_url: `${url}/api/oembed/?author_name=${videoInfo.uploader}&author_url=${url}/user/${encodeURIComponent(videoInfo.uploader)}`
      })
    }
  }

  if(!utils.videoExists(req.params.id) && utils.checkToken(req, "/video/:id")) {
    return res.sendFile(path.join(__dirname, path.join("www", "404.html")));
  }

  res.sendFile(path.join(__dirname, path.join("www", "video.html")));
});

app.get("/user/:user", (req, res) => {
  if(!utils.checkToken(req, "/user/:user")) {
    return res.sendFile(path.join(__dirname, path.join("www", "user.html")));
  }

  // Check if user exists
  client.from("users").select().eq("name", decodeURIComponent(req.params.user)).then(data => {
    if(data.error) {
      return res.sendFile(path.join(__dirname, path.join("www", "404.html")));
    } else if (data.status != 200) {
      return res.sendFile(path.join(__dirname, path.join("www", "404.html")));
    }

    if(!data.data[0]) return res.sendFile(path.join(__dirname, path.join("www", "404.html")));
    res.sendFile(path.join(__dirname, path.join("www", "user.html")));
  })
});

// API //

function handleVideoAPI(req, res) {
  if(!utils.checkToken(req, "/api/video/:id") && !utils.discordCheck(req)) {
    return res.sendFile(
      path.join(
        __dirname,
        path.join("www", path.join("assets", path.join("troll", "video.mp4")))
      )
    );
  }

  const videoPath = path.join(__dirname, path.join("videos", path.join(req.params.id, "video.mp4")));
  if(!fs.existsSync(videoPath)) return res.sendStatus(404);

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  console.log('Requested Range:', range); // Log the range for debugging

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    let start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Handle the case where range is 0-1
    if (start === 0 && end === 1) {
      end = 1;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}

// Get an mp4 file according to its video ID.
app.get('/api/video/:id*.mp4', handleVideoAPI);
app.get("/api/video/:id", handleVideoAPI);

// OEmbed
const oembed = (provider_name, provider_url, author_name, author_url, url) => {
  const baseObject = {
      version: '1.0',
  };
  if (provider_name && provider_url) {
      baseObject.provider_name = provider_name;
      baseObject.provider_url = provider_url;
  }
  if (author_name) {
      baseObject.author_name = author_name;
  }
  if (author_url) {
      baseObject.author_url = author_url;
  }
  if (url) {
      baseObject.url = url;
  }
  return baseObject;
};

app.get('/api/oembed', (req, res) => {
  const {
      provider_name,
      provider_url,
      author_name,
      author_url,
      url,
  } = req.query;
  return res.status(200).send(oembed(provider_name, provider_url, author_name, author_url, url));
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
app.get("/api/videoInfo/:id", async (req, res) => {
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

  if(!utils.videoExists(req.params.id)) return res.sendStatus(404);

  const videoInfo = await utils.videoInfo(req.params.id);
  if(isNaN(videoInfo)) {
    return res.send(videoInfo);
  } else {
    return res.sendStatus(videoInfo);
  }
});

// Pulls the user information from the database and returns it.
app.get("/api/userInfo/:id", (req, res) => {
  if(!utils.checkToken(req, "/api/userInfo/:id")) {
    let data = {
      name: "SIGN IN to see this EPIC CONTENT",
      subscribers: 999,
      social_score: 999,
      description: "SIGN IN to see this EPIC content",
      verified: true
    }

    return res.send(data);
  }


  client.from("users").select().eq("name", decodeURIComponent(req.params.id)).then(data => {
    if(data.error) {
      return res.sendStatus(400);
    } else if (data.status != 200) {
      return res.sendStatus(data.status);
    }

    if(!data.data[0]) return res.sendStatus(400);
    return res.send(data.data[0]);
  })
})

// Subscribes to a user
app.get("/api/subscribe/:id", async (req, res) => {
  if(!utils.checkToken(req)) return res.sendStatus(401);
  if(!utils.userExists(decodeURIComponent(req.params.id))) return res.sendStatus(400);

  const subscribersData = await client
    .from("users")
    .select("subscribers")
    .eq("name", decodeURIComponent(req.params.id));

  const subscribers = subscribersData["data"][0]["subscribers"] + 1;

  client.from("users").update({
    subscribers: subscribers
  }).eq("name", decodeURIComponent(req.params.id)).then(data => {
    if(data.error) {
      return res.sendStatus(400);
    } else if (data.status != 204) {
      return res.sendStatus(data.status);
    }

    return res.sendStatus(200);
  })
});

// Login endpoints (Just handles user creation)
app.post("/api/login", async (req, res) => {
  if(!req.body.user) return res.sendStatus(400);
  const ipInfo = ipware.getClientIP(req);

  // If user doesn't exist, create the user.
  if(!await utils.userExists(req.body.user)) {
    console.log(`User ${req.body.user} doesn't exist. Creating the user...`);
    await client.from("users").insert({
      name: req.body.user
    }).then(data => {
      if(data.error) {
        return res.status(500).send(data);
      } else if(data.status != 201) {
        return res.status(500).send(data);
      }

      console.log(`User created successfully. IP: ${ipInfo.ip}`);
      return res.sendStatus(200);
    });
  } else {
    console.log(`User ${req.body.user} already exists. Logging in... IP: ${ipInfo.ip}`);
    return res.sendStatus(200);
  }
});

app.post("/api/editUser", async (req, res) => {
  // Validate request
  const user = utils.checkUserToken(req, "/api/editUser");
  if(!user.value) return res.status(401).json({message: "you need to login to edit your user page"});
  if(!req.body.description && !req.body.website) return res.status(400).json({message: "invalid form data"});
  if(req.body.website && !utils.isValidUrl(req.body.website)) return res.status(400).json({message: "invalid website"});
  
  // Update user
  await client.from("users").update({
    description: req.body.description,
    website: req.body.website,
  }).eq("name", user.user).then(data => {
    if(data.error) {
      return res.status(500).send(data);
    } else if(data.status != 204) {
      return res.status(500).send(data);
    }

    return res.sendStatus(200);
  })
});

// Get the comments for a video according to its video ID.
app.get("/api/comments/:videoID", (req, res) => {
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

  if(!utils.videoExists(req.params.videoID)) return res.sendStatus(404);

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
        return res.sendStatus(400);
      } else if (data.status != 200) {
        return res.sendStatus(data.status);
      }

      return res.send(data["data"]);
    });
});

// Search endpoint
app.post("/api/search", (req, res) => {
  if(!utils.checkToken(req)) return res.sendStatus(401);
  if(!req.body.query) return res.sendStatus(400);
  client
  .from("videos")
  .select()
  .then((response) => {
    if (response.error) {
      return res.sendStatus(400);
    } else if (response.status != 200) {
      return res.sendStatus(response.status);
    }

    let results = [];
    response.data.forEach(video => {
      if(video.title.startsWith(req.body.query.toLowerCase()) || video.uploader.startsWith(req.body.query.toLowerCase())) results.push(video);
    })

    return res.send(results);
  });
})

// Send a comment
app.post("/api/comment", async (req, res) => {
  if (!utils.checkToken(req, "/api/comment")) return res.sendStatus(401);
  
  // Sanity chekcs
  if(!req.body.commenter) return res.sendStatus(400);
  if(!req.body.videoID) return res.sendStatus(400);
  if(!req.body.text) return res.sendStatus(400);
  

  if(req.body.text.trim() == "") return res.sendStatus(400);
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