How to run
------------

1. Install MongoDB or create a cloud mongodb instance (cloud.mongodb.com)
2. Create a new app for slack (https://api.slack.com/apps?new_app=1)
3. Fill out .env secrets, i.e:
    - SLACK_BOT_TOKEN=xoxb-1337236306854-1320173441095-pW1zXUhZ86GAso3Dy2sZWV7t
    - SLACK_SIGNING_SECRET=db1fab5a0872ba5fb198cb9f94c3138c
    - CHAT_CHANNEL=chitczat
    - MONGODB_USER=chitczat
    - MONGODB_PASSWORD=chitczat
    - MONGODB_SERVER=localhost:27017
    - MONGODB_DATABASE=chitczat
4. Install a proxy tunnel with `npm install -g localtunnel` and run it `lt --port 3000`
5. After that use the provided url from the `lt` command and paste it in the "**Event Subscriptions**" slack configuration's tab with `/slack/events` at the end 
6. Below in the "**Subscribe to bot events**" add `message:channels` event and save.
7. Go to "**Incoming Webhooks**", enable it and save
8. Go to "**Oauth and Permissons**" and add `channels:join` to "**Bot Token Scopes**"
9. Start the app with `npm start`

------------

Bolt app template
=================

[Bolt](https://slack.dev/bolt) is our framework that lets you build JavaScript-based Slack apps in a flash.

This project is a simple app template to make it easy to create your first Bolt app. Read our [Getting Started with Bolt](https://api.slack.com/start/building/bolt) guide for a more in-depth tutorial

Project
------------

- `app.js` contains the primary Bolt app. It imports the Bolt package (`@slack/bolt`) and starts the Bolt app's server. It's where you'll add your app's listeners.
- `.env` is where you'll put your Slack app's authorization token and signing secret.

Read the [Getting Started guide](https://api.slack.com/start/building/bolt)
-------------------

Read the [Bolt documentation](https://slack.dev/bolt)
-------------------

\ ゜o゜)ノ
