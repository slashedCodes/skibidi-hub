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
            console.log("Valid commands are:\n\ndeleteVideo [id]\nban [ip]\nunban [ip]\ncleanDatabase\ncleanDrive\nupdateSocialScore [user] [-300]\nverifyUser [user]\ndeVerifyUser [user]");
            break;
        case "ban":
            if(!args[1]) return console.log("you need to provide an ip address to ban!");
            ips = JSON.parse(fs.readFileSync("./ipbans.json"));
            ips.push(args[1]);
            fs.writeFileSync("./ipbans.json", JSON.stringify(ips), {encoding:'utf8', flag:'w'})
            console.log("Successfully banned ip.");
            break;
        case "unban":
            if(!args[1]) return console.log("you need to provide an ip address to unban!");
            ips = JSON.parse(fs.readFileSync("./ipbans.json"));
            if(!ips.includes(args[1])) return console.log("the ip address provided isnt banned.");
            ips.splice(ips.indexOf(args[1]), 1)
            fs.writeFileSync("./ipbans.json", JSON.stringify(ips), {encoding:'utf8', flag:'w'})
            console.log("Successfully unbanned ip.");
            break;
        case "deleteVideo":
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
        case "updateSocialScore":
            if(!args[1]) return console.log("Please Provide a user to update the social credit score of.");
            if(!args[2]) return console.log("Please provide a value to update the social credit score.");
            if(!utils.userExists(args[1])) return console.log("User doesn't exist!");
            
            const socialScoreData = await client
            .from("users")
            .select("social_score")
            .eq("name", args[1]);
        
            const socialScore = parseInt(socialScoreData["data"][0]["social_score"]) + parseInt(args[2]);

            await client.from("users").update({"social_score": socialScore}).eq("name", args[1]).then(data => {
                if(data.error) {
                    return console.error(data);
                } else if(data.status != 204) {
                    return console.error(data);
                }

                return console.log("Updated successfully.");
            });

            break;
        case "verifyUser":
            if(!args[1]) return console.log("Please provide a user to verify.");
            if(!utils.userExists(args[1])) return console.log("User doesn't exist!");

            await client.from("users").update({"verified": "TRUE"}).eq("name", args[1]).then(data => {
                if(data.error) {
                    return console.error(data);
                } else if(data.status != 204) {
                    return console.error(data);
                }

                return console.log("Verified successfully.");
            });
            break;
        case "deVerifyUser":
            if(!args[1]) return console.log("Please provide a user to verify.");
            if(!utils.userExists(args[1])) return console.log("User doesn't exist!");

            await client.from("users").update({"verified": "FALSE"}).eq("name", args[1]).then(data => {
                if(data.error) {
                    return console.error(data);
                } else if(data.status != 204) {
                    return console.error(data);
                }

                return console.log("Deverified successfully.");
            });
            break;
        case "sunset":
            if(!args[1]) return console.log("please provide a unix timestamp for when you want skibidihub to explode");
            const sunset = path.join(__dirname, "sunset.json")
            const json = JSON.parse(fs.readFileSync(sunset))
            json.sunset = true
            json.timestamp = args[1]
            const text = JSON.stringify(json)
            fs.writeFileSync(sunset, text);
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