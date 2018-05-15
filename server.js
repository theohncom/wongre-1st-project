const ResClient = require('node-rest-client').Client;
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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'wongrecrop@gmail.com',
      pass: '4phdfrommu'
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



app.get('/',function(req,res){
    res.sendFile(pathView + "index.html");
})

app.get('/backup',function(req,res){
  res.sendFile(pathView + "index_backup.html");
})

app.get('/certificate',function(req,res){
    res.sendFile(pathView + "certificate.html");
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
  var queryStr = "https://api.flightstats.com/flex/flightstatus/rest/v2/json/route/status/";
  queryStr += req.body.fromAirport+'/'+req.body.toAirport+'/';
  queryStr += 'dep/'+req.body.d_year+'/'+req.body.d_month+'/'+req.body.d_day+'?';
  queryStr += 'appId=3872726a&appKey=e6ecd704d1070c827f0466414de3a049&hourOfDay=0&utc=false&numHours=24';
  
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
    if(data.flightStatuses.length > 0){

      for(i in data.flightStatuses){
        //console.log(i);
        //console.log( data.flightStatuses[i].departureDate.dateLocal);
        var d_time = data.flightStatuses[i].departureDate.dateLocal.split('T')[1];
        var d_date = data.flightStatuses[i].departureDate.dateLocal.split('T')[0];
        var a_time = data.flightStatuses[i].arrivalDate.dateLocal.split('T')[1];
        var a_date = data.flightStatuses[i].arrivalDate.dateLocal.split('T')[0];
        
        var flightArr=[];
        if ('J' == data.flightStatuses[i].schedule.flightType){
          if (counter > 0) 
            flights += ',';

          flightArr.push();
          flights += '"flight'+counter+'":{ "d_time":"'+d_time+'", "d_date":"'+d_date+'",';
          flights += '"from":"'+req.body.fromAirport+'","to":"'+req.body.toAirport+'",';
          flights += '"a_time":"'+a_time+'", "a_date":"'+a_date+'","flight_list":[';
          flights += '"'+data.flightStatuses[i].carrierFsCode+data.flightStatuses[i].flightNumber+'"';
          if(data.flightStatuses[i].codeshares != null){
            for(j in data.flightStatuses[i].codeshares){
              flights += ',"'+data.flightStatuses[i].codeshares[j].fsCode+data.flightStatuses[i].codeshares[j].flightNumber+'"';
            }
          }
          flights +=']}';
          counter +=1;
        }
      }
    }
    flights +='}';
  });
  
  setTimeout(function() {
    res.end( flights);
}, 3000);
  
})


app.post('/api/flightStatus',function(req,res){
  //console.log(req.body);
  var resclient = new ResClient();
  var queryStr = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/';
  queryStr += req.body.carrierFsCode+'/'+req.body.flightNumber+'/arr/';
  queryStr += req.body.d_year+'/'+req.body.d_month+'/'+req.body.d_day+'?';
  queryStr += 'appId=3872726a&appKey=e6ecd704d1070c827f0466414de3a049&utc=false';
  //console.log(queryStr);
  //myStr="https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/NH/808/arr/2018/5/12?appId=3872726a&appKey=e6ecd704d1070c827f0466414de3a049&utc=false";
  var output='';
  resclient.get(queryStr, function (data, response) {
    var date = data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[0];
    var time = data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal.split('T')[1];
    //console.log(data.flightStatuses[0].operationalTimes.actualRunwayArrival.dateLocal);
    //console.log(date+':'+time);
    res.end(JSON.stringify(data));
    //output = response;
  })
})

app.post('/api/getcert', function(req,res){
  //step0. call smart contract
  //step1. copy certificate.html -> certificate_uniquevale.html
  //step2. convert certificate_uniquevalu.html -> certificate_uniquevalue.pdf
  //step3. send certificate_uniquevalue.html as text to web client

  //console.log(req.body);
  var certHTML_pdf = html_pdf;
  var certHTML_table = html_table;
  var find = ['replaceName', 'replaceLName', 'replaceEmail', 'replaceTxHash', 'replaceCarrier', 'replaceFlightNum', 
  'replaceFromAriport', 'replaceDMonth', 'replaceDDay', 'replaceDYear', 'replaceDTime',
 'replaceToAirport', 'replaceAMonth', 'replaceADay', 'replaceAYear', 'replaceATime'];
  var replace = [req.body.fname, req.body.lname, req.body.email, 'transection hash', req.body.selectedFlight.substring(0, 2), req.body.selectedFlight.substring(2),
 req.body.f_airport, req.body.d_date.split('-')[1], req.body.d_date.split('-')[2], req.body.d_date.split('-')[0], req.body.d_time,
 req.body.t_airport, req.body.a_date.split('-')[1], req.body.a_date.split('-')[2], req.body.d_date.split('-')[0], req.body.a_time];
  certHTML_pdf=replaceOnce(certHTML_pdf, find, replace, 'g');
  certHTML_table=replaceOnce(certHTML_table, find, replace, 'g');

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