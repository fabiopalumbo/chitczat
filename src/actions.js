const actions = [
  {
    id: "!join",
    description: "Joins you to the chat queue from provided location",
  },
  {
    id: "!add",
    description: "Add the provided user and location to the queue",
  },
  {
    id: "!people",
    description: "Displays every queued user",
  },
  {
    id: "!leave",
    description: "Removes you or the targeted person from the queue",
  },
  {
    id: "!match",
    description: "Generates pairs with all queued users",
  },
  {
    id: "!reset",
    description: "Resets the queue",
  },
  {
    id: "!help",
    description: "Shows all the commands descriptions",
  },
];

const findAction = (text) =>
  actions.find((action) => text.startsWith(action.id));

module.exports = { actions, findAction };
