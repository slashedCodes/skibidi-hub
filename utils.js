const axios = require("axios");
const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const webhookURL = process.env.WEBHOOK_URL;

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

const ipwareObject = require("@fullerstack/nax-ipware");
const ipware = new ipwareObject.Ipware();
function checkToken(req, func) {
  const token = req.cookies.token;
  const ipInfo = ipware.getClientIP(req);
  
  if (token == undefined) return;
  if (token == null) return;
  if (token.trim() == "") return;
  let split = token.split("*&*&*&*&&&&*&&&&*&****&***&*");
  if (split.length > 1 && split[1] === "nexacopicloves15yearoldchineseboys") {
    console.log(`${func} being triggered by: ${split[0]} with the IP of ${ipInfo.ip}`);
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

function getThumbnail(id) {
  if (fs.existsSync(path.join("videos", id + "/"))) {
    return path.join(
      __dirname,
      path.join("videos", path.join(id, "thumbnail.jpg"))
    )
  } else {
    return null;
  }
}

module.exports = {multerErrorHandler, getRandomInt, videoExists, checkToken, sendWebhook, nanoid, checkBodyVideo, checkFile, getThumbnail, fakeCommentList, fakeTitleList};