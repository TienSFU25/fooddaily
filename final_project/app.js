var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')

var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var routes = require('./routes/routes.js')(app)

portNumber = 8080
app.listen(portNumber)
console.log("Express listening on port " + portNumber)