const { db } = require("./db");
const { matchPeople } = require("./matching");

async function addUser(userId, location) {
  let u = undefined;
  let people = await db.getPeople();

  for (var i in people) {
    if (people[i].id == userId) {
      u = people[i];
    }
  }

  if (u === undefined) {
    let index = await db.getCount();
    people[index] = {
      id: userId,
      added: true,
      location: location,
      index: index
    };

    await db.addPerson(people[index]);

    return true;
  } else {
    if (location === "") {
      location = u.location;
    }

    for (var i in people) {
      if (people[i].id == userId) {
        people[i].location = location;

        if (people[i].added) {
          await db.updatePerson(people[i]);
          return false;
        } else {
          people[i].added = true;
          await db.updatePerson(people[i]);
          return true;
        }
      }
    }
  }
}

async function removeUser(userId) {
  const result = await db.updatePerson({ id: userId, added: false });
  return result.result.ok == 1;
}

async function matchUsers() {
  let people = await db.getPeople();
  let matches = await db.getMatches();

  let m = matchPeople(matches, people);

  if (m.result) {
    for (var i in people) {
      people[i].added = false;
      await db.updatePerson(people[i]);
    }

    await db.addMatch(m.match);
  }

  return m;
}

module.exports = {
  users: {
    addUser: addUser,
    removeUser: removeUser,
    matchUsers: matchUsers
  }
};
