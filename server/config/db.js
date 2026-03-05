const path = require("path");
const fs = require("fs");
const Datastore = require("nedb-promises");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function makeDB(file) {
  return Datastore.create({
    filename: path.join(dataDir, file),
    autoload: true,
  });
}

module.exports = {
  usersDB: makeDB("users.db"),
  videosDB: makeDB("videos.db"),
  commentsDB: makeDB("comments.db"),
  subscriptionsDB: makeDB("subscriptions.db"),
  historyDB: makeDB("history.db"),
};