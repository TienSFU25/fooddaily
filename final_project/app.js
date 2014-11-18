var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var morgan = require('morgan')
var passport = require('passport')
var mysql = require('mysql')
var session = require('express-session')
var flash = require('connect-flash')
var csrf = require('csurf')

var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

// initialize some middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(session(
	{
		secret: "some secret",
		cookie: {secure: false},
		resave: true,
		saveUninitialized: true,
	}))

// authentication
app.use(passport.initialize())
app.use(passport.session())
app.use(flash({locals:'flash'}))

// csrf
app.use(csrf())

// expost static files (images, javascript and css)
app.use(express.static(__dirname + '/public'));

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('malformed csrf')
})

// configure database, authentication procedures and routing
var database = require('./config/database')
db = new database()

db.createUser('tien234', 'dummypw', function(){console.log("successfully created dummy user")})

require('./config/passport')(passport, db)
require('./routes/routes.js')(app, passport, db)

portNumber = 8080
app.listen(portNumber)
console.log("Express listening on port " + portNumber)