const password = process.env.MONGODB_PASSWORD;
const database = process.env.MONGODB_DATABASE;

const MongoClient = require("mongodb").MongoClient;

const uri =
  "mongodb+srv://admin:" +
  password +
  "@cluster0-zvhpj.mongodb.net/" +
  database +
  "?retryWrites=true&w=majority";

function getClient() {
  return new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

let getPeople = async () => {
  const client = getClient();
  let people = {};

  await client.connect();
  const collection = client.db(database).collection("people");

  const docs = await collection.find({}).toArray();
  docs.forEach(doc => {
    people[doc.index] = doc;
  });

  await client.close();
  return people;
};

let getCount = async () => {
  let people = await getPeople();
  return Object.keys(people).length + 1;
};

let addPerson = async person => {
  const client = getClient();
  await client.connect();
  const collection = client.db(database).collection("people");
  person = await collection.insertOne(person);
  await client.close();

  return person;
};

let updatePerson = async person => {
  const client = getClient();
  await client.connect();
  const collection = client.db(database).collection("people");
  person = await collection.replaceOne({ id: person.id }, person);
  await client.close();

  return person;
};

async function getMatches() {
  const client = getClient();

  await client.connect();
  const collection = client.db(database).collection("matches");

  let allMatches = [];
  const docs = await collection.find({}).toArray();
  docs.forEach(doc => {
    allMatches.push(doc.matches);
  });

  await client.close();

  return allMatches;
}

async function addMatch(match) {
  const client = getClient();
  await client.connect();
  const collection = client.db(database).collection("matches");
  match = await collection.insertOne({ matches: match });
  await client.close();

  return match;
}

async function reset() {
  const client = getClient();
  await client.connect();
  const peopleCollection = client.db(database).collection("people");
  await peopleCollection.drop();
  const matchesCollection = client.db(database).collection("matches");
  await matchesCollection.drop();

  await client.close();
}

module.exports = {
  db: {
    getPeople: getPeople,
    addPerson: addPerson,
    updatePerson: updatePerson,
    getCount: getCount,
    getMatches: getMatches,
    addMatch: addMatch,
    reset: reset
  }
};
