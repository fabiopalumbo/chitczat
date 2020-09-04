const { App } = require("@slack/bolt");
const { executeCommand } = require("./src/commands");

const token = process.env.SLACK_BOT_TOKEN;

const app = new App({
  token: token,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const chatChannel = process.env.CHAT_CHANNEL;

// main loop
app.event("message", async ({ event: { channel, text, user } }) => {
  try {
    let conversation = await app.client.conversations.info({
      token: token,
      channel: channel,
    });

    if (!conversation.ok || conversation.channel.name != chatChannel) return;

    // Join channel
    await app.client.conversations.join({
      token: token,
      channel: channel,
    });

    executeCommand(app, text, channel, user);
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
