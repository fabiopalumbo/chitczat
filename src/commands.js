const { msg } = require("./messages");
const { users } = require("./users");
const { findAction } = require("./actions");

const executeCommand = async (app, text, channel, user) => {
  const action = findAction(text);
  if (!action) return;

  const textWithoutAction = text.replace(action.id, "").trim();

  try {
    switch (action.id) {
      case "!join": {
        if (await users.addUser(user, textWithoutAction)) {
          msg.sendJoinedMessage(app, user, textWithoutAction, channel);
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

      case "!help": {
        msg.sendHelpMessage(app, channel);
      }

      default:
        break;
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  executeCommand,
};
