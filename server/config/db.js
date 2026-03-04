const Datastore = require("nedb");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function makeDB(file) {
  return new Datastore({ filename: path.join(dataDir, file), autoload: true });
}

module.exports = {
  usersDB: makeDB("users.db"),
  videosDB: makeDB("videos.db"),
  commentsDB: makeDB("comments.db"),
  subscriptionsDB: makeDB("subscriptions.db"),
  historyDB: makeDB("history.db"),
};