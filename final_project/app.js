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

// for CSS
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

// use the db like this
// db.searchUser("username", function(err, rows) {
	// console.log(rows)
// })

require('./config/passport')(passport, db)
require('./routes/routes.js')(app, passport, db)

// db.createUser('tien1', 'somepw', function(){})
// db.addFood(1, 'testfood', function(){console.log('food added')})
// db.getAllFoods(1, function(){})
// db.getFood(1, 1, function(food){console.log(food)})
// db.updateFood(1, 1, "newname", function() {console.log(1234)})
// db.deleteFood(1, 1, function() {console.log(1234)})

portNumber = 8080
app.listen(portNumber)
console.log("Express listening on port " + portNumber)