const ResClient = require('node-rest-client').Client;
const ResClientPromise = require('node-rest-client-promise').Client;
const nodemailer = require('nodemailer')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const replaceOnce = require('replace-once');


app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies
//var resclient = new Client();
var fs = require('fs');
var pdf = require('html-pdf');
var html_table = fs.readFileSync('./views/certificate_table.html', 'utf8');
var html_pdf = fs.readFileSync('./views/certificate.html', 'utf8');
//var html = fs.readFileSync('./views/certificate.html', 'utf8');
var options = { format: 'Letter' };

var pathView =  __dirname+'/views/';

const delayThreshold = 120 // in minute

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      //user: 'wongrecrop@gmail.com',
      //pass: '4phdfrommu'
      user: 'digitalre.crop@gmail.com',
      pass: '4phdfromMU'
    }
  });

var mailOptions = {
    from: 'wongrecrop@gmail.com',
    to: 'theohncom@gmail.com',
    subject: 'Flight Delay Certificate',
    text: 'Please check the attachment.',
    attachments: [
        {   filename: 'certificate.pdf',
            path: './certificatepdf/certificate.pdf',
            contentType: 'application/pdf'
        }]
  };
  
 /*pdf.create(html, options).toFile('./views/certificate3.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
*/
  //app.use('/js',express.static(__dirname+'/js'));
app.use('/js',express.static(__dirname+'/node_modules/bootstrap/dist/js'));
app.use('/js',express.static(__dirname+'/node_modules/jquery/dist'));
app.use('/js',express.static(__dirname+'/node_modules/popper.js/dist/umd'));
app.use('/js',express.static(__dirname+'/alljs'));
app.use('/css',express.static(__dirname+'/node_modules/bootstrap/dist/css'));
app.use('/css',express.static(__dirname+'/customcss'));
app.use('/images',express.static(__dirname+'/all_images'));
app.use('/web3',express.static(__dirname+'/node_modules/web3/dist'))



app.get('/',function(req,res){
    res.sendFile(pathView + "index.html");
})

app.get('/backup',function(req,res){
  res.sendFile(pathView + "index_backup.html");
})

app.get('/certificate',function(req,res){
    res.sendFile(pathView + "certificate.html");
})

app.get('/flightstatus',function(req,res){
  res.sendFile(pathView + "flightStatus.html");
})




// api
// searchflight api 
// input: departure date, from airport, and to airport
// output: list of flights in json format. 
// The list can be empty for no flight on the specificed date. 
app.post('/api/searchflight', function(req,res){
  
  //call flight api
 // direct way
  
  var resclient = new ResClient();
  var queryStr = "https://api.flightstats.com/flex/schedules/rest/v1/json/from/";
  queryStr += req.body.fromAirport+'/to/'+req.body.toAirport+'/';
  queryStr += 'arriving/'+req.body.d_year+'/'+req.body.d_month+'/'+req.body.d_day+'?';
  queryStr += 'appId=3cb4ef87&appKey=9edf6d10eb2a6d8fca078b3971dc3dc7';
  
  var flights ='';
  //console.log(req.body);

  resclient.get(queryStr, function (data, response) {
    // parsed response body as js object
     /*
     example of output format 
     var flights = {
    "flight1":{
      "d_time": "00:30",
      "d_date": "2018-05-14",
      "from": "BKK",
      "to" : "NRT",
      "a_time": "08:40",
      "a_date": "2018-05-14",
      "flight_list":[ "NH808", "9W4147", "TG6006", "ET1412", "UA7955"]
    },
    "flight2":{
      "d_time": "02:30",
      "d_date": "2018-05-14",
      "from": "BKK",
      "to" : "NRT",
      "a_time": "010:40",
      "a_date": "2018-05-14",
      "flight_list":[ "NH808", "9W4147"]
    }
  } */
  
    flights += '{';
    var counter = 0;
    if(data.scheduledFlights.length > 0){

      for(i in data.scheduledFlights){
        //console.log(i);
        //console.log( data.flightStatuses[i].departureDate.dateLocal);
        var d_time = data.scheduledFlights[i].departureTime.split('T')[1];
        var d_date = data.scheduledFlights[i].departureTime.split('T')[0];
        var a_time = data.scheduledFlights[i].arrivalTime.split('T')[1];
        var a_date = data.scheduledFlights[i].arrivalTime.split('T')[0];
        
        var flightArr=[];
        if ('J' == data.scheduledFlights[i].serviceType && data.scheduledFlights[i].operator == null){
          if (counter > 0) 
            flights += ',';

          flightArr.push();
          flights += '"flight'+counter+'":{ "d_time":"'+d_time+'", "d_date":"'+d_date+'",';
          flights += '"from":"'+req.body.fromAirport+'","to":"'+req.body.toAirport+'",';
          flights += '"a_time":"'+a_time+'", "a_date":"'+a_date+'","flight_list":[';
          flights += '"'+data.scheduledFlights[i].carrierFsCode+'-'+data.scheduledFlights[i].flightNumber+'"';
          if(data.scheduledFlights[i].codeshares != null){
            for(j in data.scheduledFlights[i].codeshares){
              flights += ',"'+data.scheduledFlights[i].codeshares[j].carrierFsCode+'-'+data.scheduledFlights[i].codeshares[j].flightNumber+'"';
            }
          }
          flights +=']}';
          counter +=1;
        }
      }
    }
    flights +='}';
    res.end( flights);
  });
})


async function queryDB4UpdateStatus(query){
  var result=[]
  try{
      //console.log('in queryDB4UpdaeStatus',query)
      var MongoClient = require('mongodb').MongoClient;
      var url = "mongodb://localhost:27017/";
      //var query = { a_date: "2018-05-22" , status:"NA"};
      var db = await MongoClient.connect(url);
      var dbo = db.db("customerContract");
      result = await dbo.collection("customers").find(query).toArray()
      return result
  }catch(err){
    //console.log('error----------')
    console.log(err)
    return ressult
  }
  

}



function updateDBSet(queryObjs){
  // queryObjs={1:{
  //            carrierFsCode:"TG",
  //            flightNumber: "808",
  //            a_date: "2018-05-23"
  //            status: Delay     [Delay,Close,NA] 
  //      }
  //    }
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("customerContract");
    for (i in queryObjs){
      var myquery = { selectedFlight: queryObjs[i].carrierFsCode+-+queryObjs[i].flightNumber,
        a_date: queryObjs[i].p_local_date, status: "NA" };
      var newvalues = { $set: {status: queryObjs[i].status} };
      console.log(myquery)
      dbo.collection("customers").updateMany(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });

    }
    db.close();
  });
}

app.post('/api/closeAndCompensation',async function(req,res){
  // input is a_date
  // step1: update all flights that their a_date is equal to a_date from query string
  //        update only the flight status in [Delay,Normal]
  // step2: send email to users that their flight in the result in step1

  var query={a_date: req.body.a_date, status:"NA"}
  //console.log(query)
  var queryRes = await queryDB4UpdateStatus(query)
  var numOfItem=0
  var resApiFlightStatus=[]
  //console.log('---',queryRes.length)
  if (queryRes.length > 0){
     //console.log(queryRes);
    // 1. queryApi to find ethier schedule or delay for every flight
    var db2queryObj ={}
    for (i in queryRes){
        var queryObj={
          id: queryRes[i]._id,
          carrierFsCode : queryRes[i].selectedFlight.split('-')[0],
          flightNumber : queryRes[i].selectedFlight.split('-')[1],
          a_year: queryRes[i].a_date.split('-')[0],
          a_month: queryRes[i].a_date.split('-')[1],
          a_date: queryRes[i].a_date.split('-')[2]
        }
        db2queryObj[i]=queryObj
      }
    //console.log('------------------------------')
    //console.log(db2queryObj)
    //console.log('------------------------------')

    resApiFlightStatus= await callApiFlightStatus(db2queryObj)
    //console.log('++++++++++++++++++++++++++++++++++++')
    //console.log(resApiFlightStatus)
    //console.log('++++++++++++++++++++++++++++++++++++')
    //2. find delay or schedule
    for (i in resApiFlightStatus){
      timeDiff=findTimeDiff(resApiFlightStatus[i])
      resApiFlightStatus[i]["timeDiff"]=timeDiff
    } 
    //console.log(resApiFlightStatus)
    
    // 3. send email
    for (i in resApiFlightStatus){
        var mailOptions={
            from: 'wongrecrop@gmail.com',
            to: queryRes[i].email,
            subject: 'Flight Delay insurance information',
            text: 'Your flight('+resApiFlightStatus[i].carrierFsCode+resApiFlightStatus[i].flightNumber +') arrived on schedule. Thank you for using our service.',
          }
        var textDelay = 'Your flight('+resApiFlightStatus[i].carrierFsCode+resApiFlightStatus[i].flightNumber +') is delayed. We have already transferred your compensation.' 
            textDelay += 'Thank you for using our service.'
        if(resApiFlightStatus[i].timeDiff > delayThreshold){
          resApiFlightStatus[i].status = 'Delay'
            mailOptions.text = textDelay
        }else{
          resApiFlightStatus[i].status = 'Schedule'
        }
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
          }
        });
      }

    //console.log(resApiFlightStatus)
    
    // 4. update db
    updateDBSet(resApiFlightStatus)
    
  }
  // return with a number of updated items 
  //res.send(resApiFlightStatus.length)
  res.send(String(Object.keys(resApiFlightStatus).length));
})

function findTimeDiff(obj){
  //6 numbers specify year, month, day, hour, minute, second:
  var arrA_date = obj.a_local_date.split('-')
  var arrA_time = obj.a_local_time.split(':')
  var actArr = new Date(arrA_date[0],arrA_date[1],arrA_date[2],arrA_time[0],arrA_time[1],arrA_time[2])
  var arrP_date = obj.p_local_date.split('-')
  var arrP_time = obj.p_local_time.split(':')
  var plnArr = new Date(arrP_date[0],arrP_date[1],arrP_date[2],arrP_time[0],arrP_time[1],arrP_time[2])
  var difftime = ((actArr - plnArr)/1000)/60
  return difftime
}

app.post('/api/searchflightdb', async function(req,res){
  
  // step1: query all fights on a spcificed a_date
  // output: all flights that their a_date equel to a_date in query string
  // step2: by list of flight from step1 then query from web api
  //        to check a real arrival time
  // output: list of all flights in DB together with their status that reported by api
  // EX: {
  //       "1":{"flightNum": "NH808", "status":"Delay"},
  //       "2":{"flightNum": "TG402", "status":"Normal"},
  //       "3":{"flightNum": "ANA220", "status":"Unknown"}
  //  } 

  
  try{
    var responseResult={};
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    var query = { a_date: req.body.a_date, status: "NA"};
    //console.log(req.body.a_date)
    var db = await MongoClient.connect(url);
    var dbo = db.db('customerContract');
    var dbResult = await dbo.collection("customers").find(query).toArray()
    db.close()
    if (dbResult.length > 0){
      var db2queryObj ={}
      for(i in dbResult){
        var queryObj={
            carrierFsCode : dbResult[i].selectedFlight.split('-')[0],
            flightNumber : dbResult[i].selectedFlight.split('-')[1],
            a_year:dbResult[i].a_date.split('-')[0],
            a_month:dbResult[i].a_date.split('-')[1],
            a_date:dbResult[i].a_date.split('-')[2]
        }
        db2queryObj[i]=queryObj
      }
      //console.log(db2queryObj)
      //send db2queryObj to web api
      responseResult= await callApiFlightStatus(db2queryObj)
    }
    //console.log(responseResult)
    res.send(JSON.stringify(responseResult))
  }catch(err){
      console.log(err)
      res.send(JSON.stringify(responseResult))
  }
})

function callwebApi(queryStr){
  return new Promise((resolve, reject)=>{
    var resclient = new ResClient();
    resclient.get(queryStr, function (data, response){
      resolve(data)
    })
  })
}

function callApiFlightStatus(queryObj){
  return new Promise(async (resolve, reject)=>{
    // kick off some async work
    //console.log('query Length',queryObj)
    var result=[]
    for (i in queryObj){
      var queryStr = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
      queryStr += queryObj[i].carrierFsCode+'/'+queryObj[i].flightNumber+'/arr/';
      queryStr += queryObj[i].a_year+'/'+queryObj[i].a_month+'/'+queryObj[i].a_date+'?';
      queryStr += 'appId=3cb4ef87&appKey=9edf6d10eb2a6d8fca078b3971dc3dc7&utc=false';
      //console.log(queryStr)
      //console.log(i)
      try{ 
        //console.log(i)    
        result[i] = await callwebApi(queryStr)
        //console.log('***************************')
        //console.log(result[i])
        //console.log(tmp)
      }catch(error){
        console.log(error)
      }
    }
    var objResult={};
    var count = 0;
    //console.log(result)
    for (j in result){
      //console.log("result:",result[j]);
      if(result[j].flightStatuses[0].operationalTimes.hasOwnProperty('actualRunwayArrival')){
        objResult[count]={
          carrierFsCode: result[j].request.airline.fsCode,
          flightNumber: result[j].request.flight.requested,
          //carrierFsCode: result[j].flightStatuses[0].carrierFsCode,
          //flightNumber: result[j].flightStatuses[0].flightNumber,
          p_local_date: result[j].flightStatuses[0].arrivalDate.dateLocal.split('T')[0],
          p_local_time: result[j].flightStatuses[0].arrivalDate.dateLocal.split('T')[1].split('.')[0],
          a_local_date: result[j].flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[0],
          a_local_time: result[j].flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[1].split('.')[0]
        }
        count +=1
      }
    }
    //console.log(objResult)
    resolve(objResult)
  })
}

app.post('/api/flightStatus',function(req,res){
  //console.log(req.body);
  var resclient = new ResClient();
  var queryStr = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
  queryStr += req.body.carrierFsCode+'/'+req.body.flightNumber+'/arr/';
  queryStr += req.body.d_year+'/'+req.body.d_month+'/'+req.body.d_day+'?';
  queryStr += 'appId=3cb4ef87&appKey=9edf6d10eb2a6d8fca078b3971dc3dc7&utc=false';
  //console.log(queryStr);
  //myStr="https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/NH/808/arr/2018/5/12?appId=3872726a&appKey=e6ecd704d1070c827f0466414de3a049&utc=false";
  var output='';
  resclient.get(queryStr, function (data, response) {
    //console.log(data);
    var date = data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[0];
    var time = data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[1];
    //console.log(data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal);
    //console.log(date+':'+time);
    res.end(JSON.stringify(data));
    //output = response;
  })
})


function contract2DB(myobj){
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("customerContract");
    dbo.collection("customers").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}

app.post('/api/getcert', function(req,res){
  //step0. call smart contract
  //step1. copy certificate.html -> certificate_uniquevale.html
  //step2. convert certificate_uniquevalu.html -> certificate_uniquevalue.pdf
  //step3. send certificate_uniquevalue.html as text to web client
  
  // add to DB
  var data2DB={
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    txHash: req.body.txHash,
    selectedFlight: req.body.selectedFlight,
    f_airport: req.body.f_airport,
    t_airport: req.body.t_airport,
    d_date: req.body.d_date,
    d_time: req.body.d_time,
    a_date: req.body.a_date,
    a_time: req.body.a_time,
    status: "NA"
  }
  contract2DB(data2DB)
  //console.log(req.body.selectedPolicy)
  var policyStartDate = new Date()
  //console.log(req.body);
  var certHTML_pdf = html_pdf;
  var certHTML_table = html_table;
  var find = ['replaceName', 'replaceLName', 'replaceEmail', 'replaceTxHash', 'replaceCarrier', 'replaceFlightNum', 
  'replaceFromAriport', 'replaceDMonth', 'replaceDDay', 'replaceDYear', 'replaceDTime',
 'replaceToAirport', 'replaceAMonth', 'replaceADay', 'replaceAYear', 'replaceATime','replacePolicyStartDate',
 'replacePremiumAmount', 'replaceCompensation'];
  var replace = [req.body.fname, req.body.lname, req.body.email, req.body.txHash, req.body.selectedFlight.split('-')[0], req.body.selectedFlight.split('-')[1],
 req.body.f_airport, req.body.d_date.split('-')[1], req.body.d_date.split('-')[2], req.body.d_date.split('-')[0], req.body.d_time,
 req.body.t_airport, req.body.a_date.split('-')[1], req.body.a_date.split('-')[2], req.body.a_date.split('-')[0], req.body.a_time,policyStartDate.toUTCString(),
 req.body.selectedPolicy.split(':')[0], req.body.selectedPolicy.split(':')[1]];
  certHTML_pdf=replaceOnce(certHTML_pdf, find, replace, 'g');
  certHTML_table=replaceOnce(certHTML_table, find, replace, 'g');

  //

  setTimeout(function() {
    res.end(certHTML_table);
}, 3000);

// create pdf
var pdfFileName = 'certificate_tx'+Date.now()+'.pdf';
var pdfFullPath = './certificatepdf/'+pdfFileName;
 pdf.create(certHTML_pdf, options).toFile(pdfFullPath, function(err, res) {
    if (err) return console.log(err);
    console.log(res);
    mailOptions.to = req.body.email;
    mailOptions.attachments[0].filename = pdfFileName;
    mailOptions.attachments[0].path = pdfFullPath;
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });
  
})

app.listen(3000,function(){
    console.log('Server running on port 3000')
})
