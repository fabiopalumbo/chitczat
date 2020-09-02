const { db } = require("./db");

const token = process.env.SLACK_BOT_TOKEN;

let sendPeopleMessage = async (app, channel) => {
  let message = "People who joined already: \n\n";
  let joined = false;
  let people = await db.getPeople();

  for (let i in people) {
    if (people[i].added) {
      message +=
        "<@" + people[i].id + ">, Region: " + people[i].location + "\n";
      joined = true;
    }
  }

  if (!joined) {
    message += "No one joined yet :cry:";
  }

  try {
    const result = await app.client.chat.postMessage({
      token: token,
      // Channel to send message to
      channel: channel,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message
          }
        }
      ],
      // Text in the notification
      text: "People who joined"
    });
  } catch (error) {
    console.error(error);
  }
};

let sendJoinedMessage = async (app, user_id, text, channel) => {
  try {
    const result = await app.client.chat.postMessage({
      token: token,
      // Channel to send message to
      channel: channel,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `<@${user_id}> joined` + (text === "" ? "!" : ` from ${text}!`)
          }
        }
      ],
      // Text in the notification
      text: "Message from Test App"
    });
  } catch (error) {
    console.error(error);
  }
};

let sendMatchesMessage = async (app, matches, channel) => {
  let people = await db.getPeople();
  let message = "";

  if (matches.length == 0) {
    message = "No matches :cry:\n";
  } else {
    message = "Matches are up :smile: \n\n";

    for (let i in matches) {
      let m = matches[i];
      let p1 = people[m[0]];
      let p2 = people[m[1]];
      message += `Matched: <@${p1.id}> (${p1.location}) <> <@${p2.id}> (${p2.location})\n`;
    }
  }

  try {
    const result = await app.client.chat.postMessage({
      token: token,
      // Channel to send message to
      channel: channel,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message
          }
        }
      ],
      // Text in the notification
      text: "Matches are up!"
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  msg: {
    sendPeopleMessage: sendPeopleMessage,
    sendMatchesMessage: sendMatchesMessage,
    sendJoinedMessage: sendJoinedMessage
  }
};
