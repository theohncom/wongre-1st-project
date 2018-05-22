var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/customerContract";
/*
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});*/
/*
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("customerContract");
  dbo.createCollection("customers", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});*/
/*
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("customerContract");
  dbo.collection("customers").findOne({}, function(err, result) {
    if (err) throw err;

    console.log(result);
    db.close();
  });
});*/


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("customerContract");
  var query = { a_date: "2018-05-23" };
  dbo.collection("customers").find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log(result.a_time);
    for(i in result){
      
    }
    db.close();
  });
});