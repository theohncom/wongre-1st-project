const express = require('express');
const app = express();
var pathView =  __dirname+'/views/';

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

app.listen(3000,function(){
    console.log('Server running on port 3000')
})