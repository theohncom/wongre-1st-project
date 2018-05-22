//Example POST method invocation
var Client = require('node-rest-client').Client;
//const bodyParser = require('body-parser');
 
var client = new Client();
 
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/customerContract";



var queryData={}
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("customerContract");
    var query = { a_date: "2018-05-22" };
    dbo.collection("customers").find(query).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result.a_time);
      for(i in result){
        //console.log(result[i].a_date);
        var queryObj={
            carrierFsCode : result[i].selectedFlight.substring(0, 2),
            flightNumber : result[i].selectedFlight.substring(2),
            d_year:result[i].a_date.split('-')[0],
            d_month:result[i].a_date.split('-')[1],
            d_day:result[i].a_date.split('-')[2]
        }
        callApiFlightStatus(queryObj);
      }
      db.close();
    });
  });
  //req.body.a_date.split('-')[1], req.body.a_date.split('-')[2], req.body.a_date.split('-')[0]

 // queryStr += req.body.carrierFsCode+'/'+req.body.flightNumber+'/arr/';
  //queryStr += req.body.d_year+'/'+req.body.d_month+'/'+req.body.d_day


// set content-type header and data as json in args parameter
function callApiFlightStatus(queryObj){
    var args = {
        data: queryObj,
        headers: { "Content-Type": "application/json" }
    };
    client.post("http://127.0.0.1:3000/api/searchflight", args, function (data, response) {
    // parsed response body as js object
    console.log(JSON.parse(data));
    // raw response
    //console.log(response);
    });
}

 

 
// registering remote methods
/*
client.registerMethod("postMethod", "http://remote.site/rest/json/method", "POST");
 
client.methods.postMethod(args, function (data, response) {
    // parsed response body as js object
    console.log(data);
    // raw response
    console.log(response);
});*/