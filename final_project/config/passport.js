// authentication using passportJS with local strategies
// backend database for querying users is mySQL
// bcrypt is used for hashing passwords

module.exports = function(passport, db) {

function User(username, password, id) {
	this.id = id
	this.username = username
	this.password = password
	this.list = [1, 4, 8, 2]
}

var LocalStrategy = require('passport-local').Strategy
var bcrypt = require('bcrypt-nodejs')
var sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf

customDict = {
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}

// login strategy
customLogin = new LocalStrategy(customDict, function(req, username, password, done) {
	// first, try to search for this user. retrieve the hashed password

	searchUserCallback = function(err, rows) {
		if (err)
			return done(err)
		if (rows.length == 0) {
			req.flash('loginMessage', 'User does not exist')
			return done(null, false)
		} 

		else {
			// if user does exist, compare hash in database with hash(plaintext password)
			hash = rows[0]['password']
			userid = rows[0]['userid']
			bcrypt.compare(password, hash, function(err, match) {
				if (err)
					return done(err)
				if (!match) {
					req.flash('loginMessage', 'Wrong password')
					return done(null, false)
				}
				else {
					currUser = new User(username, hash, userid)
					return done(null, currUser)
				}
			})
		}
	}

	db.searchUser(username, searchUserCallback)
})

customSignup = new LocalStrategy(customDict, function(req, username, password, done) {
	// check to see whether username already exists. if not, create the user
	lookupUserCallback = function(err, rows) {
		if (err)
			return done(err)
		if (rows.length == 1) {
			req.flash('signupMessage', 'Username has already been taken')
			return done(null, false)	
		}
		else
			bcrypt.hash(password, null, null, function(err, hash) {
				db.createUser(username, hash, function(err, result) {
					if (err)
						return done(err)
					else {
						currUser = new User(username, hash, result.insertId)
						return done(null, currUser)
					}
				})
			})
		}

	db.searchUser(username, lookupUserCallback)
})

passport.use('local-login', customLogin)
passport.use('local-signup', customSignup)

// use username for deserializing
passport.serializeUser(function(user, done) {
	done(null, user.username)
})

passport.deserializeUser(function(userid, done) {
	callback = function(err, rows) {
		if (!err) {
			currUser = new User(userid, rows[0]['password'], rows[0]['userid'])
			done(null, currUser)
		}
	}
	db.searchUser(userid, callback)
})

}