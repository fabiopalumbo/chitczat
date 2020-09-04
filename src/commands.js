const { msg } = require("./messages");
const { users } = require("./users");

const commands = ["!join", "!match", "!people", "!leave", "!add", "!reset"];

const findCommand = (text) =>
  commands.find((command) => text.startsWith(command));

const executeCommand = async (app, text, channel, user) => {
  const command = findCommand(text);
  const textWithoutCommand = text.replace(command, "").trim();

  try {
    switch (command) {
      case "!join": {
        if (await users.addUser(user, textWithoutCommand)) {
          msg.sendJoinedMessage(app, user, textWithoutCommand, channel);
        }
        break;
      }

      case "!match": {
        const m = await users.matchUsers();
        msg.sendMatchesMessage(app, m.match, channel);
        break;
      }

      case "!people": {
        msg.sendPeopleMessage(app, channel);
        break;
      }

      case "!reset": {
        await db.reset();
        break;
      }

      case "!add": {
        const addInfo = /\<\@([A-z0-9]*)\>(.*)/.exec(text);
        const [user, location] = addInfo;

        if (await users.addUser(user, location.trim())) {
          msg.sendJoinedMessage(app, user, location, channel);
        }
        break;
      }

      case "!leave": {
        const m = /\<\@([A-z0-9]*)\>(.*)/.exec(text);
        const userToRemove = m !== null ? m[1] : user;

        if (await users.removeUser(userToRemove)) {
          msg.sendLeaveMessage(app, userToRemove, channel);
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  commands,
  findCommand,
  executeCommand,
};
