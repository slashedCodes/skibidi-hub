
![Logo](https://github.com/slashedCodes/skibidi-hub/blob/main/www/assets/logo.png?raw=true)


# SkibidiHub

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) 

![This site is certified skibidi sigma](https://img.shields.io/badge/this_site_is_certified-skibidi_sigma-blue)


SkibidiHub is a video streaming platform, it's mainly a shitpost website but I built it to develop my frontend and backend skills.


## Roadmap

 - Channel Customization
 - Admin Panel
 - SkibidiHub Shorts (or any other name it doesn't really matter)

## Deployment

First off, you need to have a .env file with your supabase API keys and a discord webhook for updates:

```
SUPABASE_URL=""
SUPABASE_KEY=""
WEBHOOK_URL=""
```

For supabase you need to have three tables (RLS is disabled for every table, because I couldn't be bothered):

``videos``:

| ID          | Type        | Default Value | Primary | Nullable |
|-------------|-------------|---------------|---------|----------|
| id          | text        |               | ✅      | ❌      |
| uploaded_at | timestamptz | now()         | ❌      | ❌      |
| likes       | int8        | 0             | ❌      | ❌      |
| dislikes    | int8        | 0             | ❌      | ❌      |
| description | text        |               | ❌      | ✅      |
| uploader    | text        |               | ❌      | ❌      |
| title       | text        |               | ❌      | ❌      |

``comments``:

| ID          | Type        | Default Value | Primary | Nullable |
|-------------|-------------|---------------|---------|----------|
| id          | int8        |               | ✅      | ❌      |
| created_at  | timestamptz | now()         | ❌      | ❌      |
| commenter   | text        |               | ❌      | ❌      |
| video_id    | text        |               | ❌      | ❌      |
| text        | text        |               | ❌      | ❌      |

``users``:

| ID              | Type        | Default Value | Primary | Nullable |
|-----------------|-------------|---------------|---------|----------|
| name            | text        |               | ✅      | ❌      |
| subscribers     | int8        | 0             | ❌      | ❌      |
| social_score    | int8        | 0             | ❌      | ❌      |
| description     | text        |               | ❌      | ✅      |
| website         | text        |               | ❌      | ✅      |
| verified        | bool        | false         | ❌      | ❌      |

Once you've setup all of that, run these commands:

```bash
  git clone https://github.com/slashedCodes/skibidi-hub.git
  cd skibidi-hub
  npm i

  # I like to use pm2 to manage websites like this:
  npm i -g pm2
  pm2 start index.js --name skibidi-hub --log latest.log

  # OR without pm2
  node index.js
```

