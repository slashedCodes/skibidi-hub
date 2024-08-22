// SkibidiHub Administration CLI //

require("dotenv").config();
const supabase = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const utils = require("./utils.js");
const client = supabase.createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Get process arguments
const args = process.argv;
args.shift();
args.shift();

async function main() {
    let ips;
    switch(args[0]) {
        case "help":
            console.log("Valid commands are:\n\ndelete [id]");
            break;
        case "ban":
            if(!args[1]) return console.log("you need to provide an ip address to ban!");
            ips = JSON.parse(fs.readFileSync("./ipbans.json"));
            ips.push(args[1]);
            fs.writeFileSync("./ipbans.json", JSON.stringify(ips), {encoding:'utf8', flag:'w'})
            break;
        case "unban":
            if(!args[1]) return console.log("you need to provide an ip address to unban!");
            ips = JSON.parse(fs.readFileSync("./ipbans.json"));
            if(!ips.includes(args[1])) return console.log("the ip address provided isnt banned.");
            ips.splice(ips.indexOf(args[1]), 1)
            fs.writeFileSync("./ipbans.json", JSON.stringify(ips), {encoding:'utf8', flag:'w'})
            break;
        case "delete":
            if(!args[1]) return console.log("you need to provide a video id to delete!");
            if(!utils.videoExists(args[1])) return console.log("the video you are trying to delete doesnt exist!");
            
            await deleteVideo(args[1]);
    
            break;
        case "cleanDatabase":
            client.from("videos").select("id").then(data => {
                data.data.forEach(async (video) => {
                    if(!utils.videoExists(video.id)) {
                        console.log(`Video with ID ${video.id} doesn't exist on drive. Erasing it on the database...`)
                        await client.from("videos").delete().eq("id", video.id);
                    }
                });
            })
            break;
        case "cleanDrive":
            if(args[1] != "confirm") {
                console.log("This should only be run on a BROKEN videos folder from a DEVELOPMENT environment.")
                console.log("If you run this, you WILL destroy some videos which you can NOT undo.");
                console.log("You must also run cleanDatabase before running this.");
                console.log("to confirm, run node cli.js cleanDrive confirm.");
                return;
            }
    
            const videos = fs.readdirSync(path.join(__dirname, "videos"));
            videos.forEach(async (id) => {
                const videoPath = path.join(__dirname, path.join("videos", id));
                if(!fs.existsSync(path.join(videoPath, "video.mp4"))) return await deleteVideo(id);
                if(!fs.existsSync(path.join(videoPath, "thumbnail.jpg"))) return await deleteVideo(id);
            })
            break;
        default:
            console.log("SkibidiHub Administration CLI\n\nPlease enter a valid command.")
            break;
    }    
}

async function deleteVideo(id) {
    console.log(`Deleting video with the id ${id}...`);

    // Delete video on hard drive
    if(fs.existsSync(path.join(__dirname, path.join("videos", path.join(id, "video.mp4"))))) fs.unlinkSync(path.join(__dirname, path.join("videos", path.join(id, "video.mp4"))));
    if(fs.existsSync(path.join(__dirname, path.join("videos", path.join(id, "thumbnail.jpg"))))) fs.unlinkSync(path.join(__dirname, path.join("videos", path.join(id, "thumbnail.jpg"))));
    fs.rmSync(path.join(__dirname, path.join("videos", id)), { recursive: true, force: true });

    // Delete video in the database
    await client.from("videos").delete().eq("id", id);
}

main();