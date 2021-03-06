// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const { db } = require("./src/db");
const { msg } = require("./src/messages");
const { users } = require("./src/users");

const token = process.env.SLACK_BOT_TOKEN;

const app = new App({
  token: token,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const chatChannel = process.env.CHAT_CHANNEL;

// main loop
app.event("message", async ({ event, context }) => {
  try {
    let conversation = await app.client.conversations.info({
      token: token,
      channel: event.channel
    });

    if (!conversation.ok || conversation.channel.name != chatChannel) return;

    // Join channel
    await app.client.conversations.join({
      token: token,
      channel: event.channel
    });

    if (event.text.startsWith("!match")) {
      let m = await users.matchUsers();
      msg.sendMatchesMessage(app, m.match, event.channel);

      return;
    }

    if (event.text.startsWith("!people")) {
      msg.sendPeopleMessage(app, event.channel);
      return;
    }

    if (event.text.startsWith("!reset")) {
      await db.reset();
      return;
    }

    if (event.text.startsWith("!add")) {
      let m = /\<\@([A-z0-9]*)\>(.*)/.exec(event.text);
      m[2] = m[2].trim();

      if (await users.addUser(m[1], m[2])) {
        msg.sendJoinedMessage(app, m[1], m[2], event.channel);
      }

      return;
    }

    if (event.text.startsWith("!join")) {
      let text = event.text.replace("!join", "").trim();
      if (await users.addUser(event.user, text)) {
        msg.sendJoinedMessage(app, event.user, text, event.channel);
      }
      return;
    }

    if (event.text.startsWith("!leave")) {
      const m = /\<\@([A-z0-9]*)\>(.*)/.exec(event.text);
      const user = m !== null ? m[1] : event.user;

      if (await users.removeUser(user)) {
        msg.sendLeaveMessage(app, user, event.channel);
      }

      return;
    }
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
