var express = require('express')
var bodyParser = require('body-parser') // req.body for POSTs
var path = require('path')
var morgan = require('morgan') // logger
var passport = require('passport') // authentication service
var flash = require('connect-flash')
var session = require('express-session') // session service

var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs') // set up ejs for templating

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(session({secret: 'some secret'}))
app.use(passport.initialize());
app.use(passport.session())
app.use(flash({locals:'flash'}))

// for CSS
app.use(express.static(__dirname + '/public'));

require('./app/database')

var database = require('./app/database')
db = new database()

// initialize routing and authentication classes
require('./app/passport')(passport, db)
require('./routes/main.js')(app, passport, db)

portNumber = 9000
app.listen(portNumber)
console.log("listening on port " + portNumber)