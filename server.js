const nodemailer = require('nodemailer')
const express = require('express');
const app = express();

var fs = require('fs');
var pdf = require('html-pdf');
var html = fs.readFileSync('./views/certificate.html', 'utf8');
var options = { format: 'A4' };

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
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    attachments: [
        {   filename: 'certificate.pdf',
            path: './certificatepdf/certificate.pdf',
            contentType: 'application/pdf'
        }]
  };

 transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  
 /*pdf.create(html, options).toFile('./views/certificate.pdf', function(err, res) {
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
    //res.sendFile(pathView+'index.html');
    res.sendFile(pathView + "index.html");
})

app.get('/certificate',function(req,res){
    //res.sendFile(pathView+'index.html');
    res.sendFile(pathView + "certificate.html");
})
app.listen(3000,function(){
    console.log('Server running on port 3000')
})