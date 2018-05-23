var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var query = { a_date: "2018-05-23" , status:"NA"};
  var dbo = db.db("customerContract");
  dbo.collection("customers").find().toArray(function(err, result) {
    if (err) throw err;
    console.log(JSON.stringify(result));
    db.close();
  });
});



