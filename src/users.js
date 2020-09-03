const { db } = require("./db");
const { matchPeople } = require("./matching");


async function addUser(user_id, location) {
  let u = undefined;
  let people = await db.getPeople();

  for (var i in people) {
    if (people[i].id == user_id) {
      u = people[i];
    }
  }

  if (u === undefined) {
    let index = await db.getCount();
    people[index] = {
      id: user_id,
      added: true,
      location: location,
      index: index
    };

    db.addPerson(people[index]);

    return true;
  } else {
    if (location === "") {
      location = u.location;
    }

    for (var i in people) {
      if (people[i].id == user_id) {
        people[i].location = location;

        if (people[i].added) {
          db.updatePerson(people[i]);
          return false;
        } else {
          people[i].added = true;
          db.updatePerson(people[i]);
          return true;
        }
      }
    }
  }
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
    matchUsers: matchUsers
  }
};