var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/mydb";

const dbConn = () => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Connected to MongoDB");
    db.close();
  });
};

dbConn();
