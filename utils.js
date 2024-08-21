const axios = require("axios");
const multer = require("multer");

// Error-handling middleware for multer
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  next();
}

// Returns a random int up to a set limit.
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function videoExists(id) {
  // Here, i'd much rather check if its uploaded than exists on the database.
  if(fs.existsSync(
    path.join(__dirname, path.join("videos", id))
  )) {
    return true;
  } else {
    return false;
  }
}

function checkToken(req, func) {
  const token = req.cookies.token
  
  if (token == undefined) return;
  if (token == null) return;
  if (token.trim() == "") return;
  let split = token.split("*&*&*&*&&&&*&&&&*&****&***&*");
  if (split.length > 1 && split[1] === "nexacopicloves15yearoldchineseboys") {
    console.log(`${func} being triggered by: ${split[0]}`);
    return true;
  } else {
    return false;
  }
}

async function sendWebhook(message, username, embeds) {
  await axios.post(webhookURL, {
    "username": username,
    "content": message,
    "embeds": embeds
  })
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

function checkBodyVideo(body) {
  if(body.title.trim() == "") return false;
  if(body.uploader.trim() == "") return false;
  return true;
}

function checkFile(file, filetypes){
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return true;
  } else {
    return false;
  }
}

module.exports = {multerErrorHandler, getRandomInt, videoExists, checkToken, sendWebhook, nanoid, checkBodyVideo, checkFile};