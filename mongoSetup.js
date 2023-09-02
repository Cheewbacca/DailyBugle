const { MongoClient } = require("mongodb");

// setup MongoDB
const uri = "mongodb://127.0.0.1:27017";

const mongo = new MongoClient(uri);

module.exports = {
  mongo,
};
