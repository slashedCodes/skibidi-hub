
# CLI Docs

SkibidiHub has an administration tool called ``cli.js``.

To run ``cli.js``, change into the main directory where you installed skibidihub and run: 

```
node cli.js [command]
```

Available commands:

### deleteVideo [id]

Deletes a video from the database and from the drive.
Example usage:

```
node cli.js deleteVideo OaOskc
```

### ban

Bans an IP address. 
Example usage:

```
node cli.js ban XXX.XXX.XXX.XXX
```

### unban

Unbans an IP address.
Example usage:

```
node cli.js unban XXX.XXX.XXX.XXX
```

### cleanDatabase

This command checks every video in the database, and if it doesn't exist on the drive it deletes the video from the database.
Example usage:

```
node cli.js cleanDatabase
```

### cleanDrive

This command checks every video on the drive to have both video.mp4 and thumbnail.jpg, otherwise it erases the video.
This command is DESTRUCTIVE and you cannot undo it's actions. I added this command to help with managing my test instance.
Example usage:

```
node cli.js cleanDrive
```

### updateSocialScore

This command takes a users social score and adds whatever value you give it.
Example usage:

```
# Decreases penguins1's social score by 300
node cli.js updateSocialScore penguins1 -300

# Increases penguins1's social score by 300
node cli.js updateSocialScore penguins1 300
```

### verifyUser

This command makes a user verified, which is self explanatory if you've ever touched a social media before.
Example usage:

```
node cli.js verifyUser penguins1
```

### deVerifyUser

This command undoes a users verification if you fucked up or you're mad at someone.
Example usage:

```
node cli.js deVerifyUser penguins1
```

### help

Not a very helpful command.
Example usage:

```
node cli.js help
```

