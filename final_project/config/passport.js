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
	searchUserCallback = function(err, user) {
		if (err) {
			console.log(err)
			return done(null, false)
		}
		if (!user) {
			req.flash('loginMessage', 'User does not exist')
			return done(null, false)
		} 

		else {
			// if user does exist, compare hash in database with hash(plaintext password)
			userData = user.dataValues
			hash = userData['password']
			userid = userData['userid']
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
	bcrypt.hash(password, null, null, function(err, hash) {
		if (err)
			console.log(err)
		db.createUser(username, hash, function(err) {
			if (err) {
				// 
				if (err.name == 'SequelizeUniqueConstraintError') {
					console.log("Username has already been taken")
					return done(null, false)
				}
			} else {
				db.searchUser(username, function(err, user) {
					id = user.dataValues.userid
					currUser = new User(username, hash, id)
					return done(null, currUser)
				})
			}
		})
	})
})

var debugUser = 'tien234'
// "hack" function for debugging without having to login. DELETE THIS LATER
debugLogin = new LocalStrategy(function(username, password, done) {
	console.log("debug login here")
	db.searchUser(debugUser, function(err, user) {
		userData = user.dataValues
		hash = userData['password']
		userid = userData['userid']
		currUser = new User(debugUser, hash, userid)
		return done(null, currUser)
	})
})

passport.use('debug-login', debugLogin)
passport.use('local-login', customLogin)
passport.use('local-signup', customSignup)

// use username for deserializing
passport.serializeUser(function(user, done) {
	done(null, user.username)
})

passport.deserializeUser(function(userid, done) {
	db.searchUser(userid, function(err, user) {
		if (err) {
			console.log(err)
			return done(null, false)
		}
		userData = user.dataValues
		currUser = new User(userData.username, userData.password, userid)
	})
	return done(null, currUser)
})

}