var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var morgan = require('morgan')
var passport = require('passport')
var mysql = require('mysql')
var session = require('express-session')
var flash = require('connect-flash')
var csrf = require('csurf')
var dutils = require('date-utils')

var app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

// initialize some middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(morgan('dev'))
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

//For angular csrf integration
app.use(function(req, res, next) {
	res.cookie('XSRF-TOKEN', req.csrfToken());
	next();
});

// expose static files (images, javascript and css)
app.use(express.static(path.join(__dirname, 'public'))); //  "public" off of current is root

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  res.status(403)
  res.send('malformed csrf')
})

// configure database, authentication procedures and routing
var database = require('./config/database')
db = new database('./models')
//db.sync(true)

// default fbProfile
var fbProfile = {
  "id": '000000000000000',
  "displayName": 'Test User',
}

var FACEBOOK_APP_ID = '1501083956817978';
var FACEBOOK_APP_SECRET = 'a8170539de31afad201eb9f48b904758';


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


/* BE SURE TO PICK ONE OF THE LINES BELOW DEPENDING ON WHETHER OR NOT YOU'RE WORKING LOCALLY */
var WEBSITE_URL = "http://localhost:8080/";
// var WEBSITE_URL = "http://cmpt470.csil.sfu.ca:9001/"

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: WEBSITE_URL + "auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      fbProfile.displayName = profile.displayName;
      fbProfile.id = profile.id; //TODO?: store fb user in database for future reference? maybe by fbProfile.id
      console.log("FB PROFILE NAME = " + fbProfile.displayName)
      console.log("FB PROFILE ID = " + fbProfile.id)
      return done(null, profile);
    });
  }
));

require('./config/passport')(passport, db)
require('./routes/routes.js')(app, passport, db, fbProfile)

portNumber = 8080
app.listen(portNumber)
console.log("Express listening on port " + portNumber)