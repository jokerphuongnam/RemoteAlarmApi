'use_strict'

// khoi tao thu vien
var express = require('express'); // khoi tao express js web app
var bodyParser = require('body-parser'); // khoi tao thu vien phân giải json
var multer = require('multer'); // khoi tao thu vien phan giai form data cua html
var upload = multer(); 
var app = express(); // khoi chay web app express js

// khai bao thu muc chua resouce file  
app.use(express.static(__dirname + '/')); // thu muc goc (root)

// su dung bo phan giai application/json
app.use(bodyParser.json()); 

// su dung bo phan giai application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// su dung bo phan giai multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));


// lien ket router dieu huong
var router = require('./router.js');
app.use('/',router)

// chay server
app.listen(process.env.PORT || 5000, () => { // port 500 dung de test , port con lai dung chay heroku
    console.log('Server running')
});