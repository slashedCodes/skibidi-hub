require("dotenv").config();
const supabase = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const utils = require("./utils.js");
const client = supabase.createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

if(!fs.existsSync("users.json")) {
    console.error("No users.json file found.")
    process.exit(1);
}

const users = JSON.parse(fs.readFileSync("users.json"));
users.forEach(async (user) => {
    await client.from("users").insert({
        name: user.user
    })
})
