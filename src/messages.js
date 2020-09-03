const { db } = require("./db");

const token = process.env.SLACK_BOT_TOKEN;

let sendPeopleMessage = async (app, channel) => {
  let message = "People who joined the queue: \n\n";
  let joined = false;
  let people = await db.getPeople();

  for (let i in people) {
    if (people[i].added) {
      message += "<@" + people[i].id + ">, Region: " + people[i].location + "\n";
      joined = true;
    }
  }

  if (!joined) {
    message += "No one joined yet :cry:";
  }

  try {
    const result = await app.client.chat.postMessage({
      token: token,
      channel: channel,
      text: message
    });
  } catch (error) {
    console.error(error);
  }
};

let sendJoinedMessage = async (app, userId, text, channel) => {
  try {
    const result = await app.client.chat.postMessage({
      token: token,
      channel: channel,
      text: `<@${userId}> joined` + (text === "" ? "!" : ` from ${text}!`)
    });
  } catch (error) {
    console.error(error);
  }
};

async function sendLeaveMessage(app, userId, channel) {
  try {
    const result = await app.client.chat.postMessage({
      token: token,
      channel: channel,
      text: `<@${userId}> left the chat queue.`
    });
  } catch (error) {
    console.error(error);
  }
}

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
      channel: channel,
      text: message
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  msg: {
    sendPeopleMessage: sendPeopleMessage,
    sendMatchesMessage: sendMatchesMessage,
    sendJoinedMessage: sendJoinedMessage,
    sendLeaveMessage: sendLeaveMessage
  }
};
