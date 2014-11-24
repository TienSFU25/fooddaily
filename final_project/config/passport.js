// authentication using passportJS with local strategies
// backend database for querying users is mySQL
// bcrypt is used for hashing passwords

module.exports = function(passport, db) {
	var s = require('string')
	var LocalStrategy = require('passport-local').Strategy
	var bcrypt = require('bcrypt-nodejs')

	function User(first, last, slug, id) {
		this.first = first
		this.last = last
		this.slug = slug
		this.id = id
	}

	customDict = {
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}

	// login strategy
	customLogin = new LocalStrategy(customDict, function(req, username, password, done) {
		// first, try to search for this user. retrieve the hashed password
		db.searchUserByName(username, function(err, user) {
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
				bcrypt.compare(password, hash, function(err, match) {
					if (err)
						return done(err)
					if (!match) {
						req.flash('loginMessage', 'Wrong password')
						return done(null, false)
					}
					else {
						currUser = new User(userData['firstname'], userData['lastname'], userData['slug'], userData['userid'])
						return done(null, currUser)
					}
				})
			}
		})
	})


	// db.createUser('username2', 'pw', 'first', 'last', 'sluggy2', function(){})
	// db.searchAllSlugs(function(err, res){console.log(res)})

	customSignup = new LocalStrategy(customDict, function(req, username, password, done) {
		db.countUserByName(username, function(count){
			if (count != 0) {
				// user name already exists
				console.log("Username has already been taken")
				return done(null, false)
			} else {
				db.searchAllSlugs(function(err, res) {
					if (err) {
						console.log("Unknown error in searchAllSlugs")
						return done(null, false)
					} else {
						var allSlugs = {}
						// copy all slugs into dictionary
						for (var i = 0; i < res.length; i++) {
							allSlugs[res[i]['dataValues']['slug']] = true
						}

						var slug = s(req.body.firstname + ' ' + req.body.lastname).slugify().s
						// attempt to make a unique slug by adding 1, 2...to slug if it exists
						if (allSlugs[slug]) {
							var j = 1
							slug += j
							if (allSlugs[slug]) {
								j++							
								for (j; j < 100; j++) {
									slug = slug.substring(0, slug.length - 1) + j
									if (!allSlugs[slug]) break
								}
							}
						}

						// create a(n unsalted for now) hash
						bcrypt.hash(password, null, null, function(err, hash) {
							if (err) {
								console.log(err)
								return done(null, false)
							}

							db.createUser(username, hash, req.body.firstname, req.body.lastname, slug, function(err, res) {
								if (err) {
									console.log("Unknown error in db.createUser")
									return done(null, false)
								} else {
									currUser = new User(req.body.firstname, req.body.lastname, slug, res['dataValues']['userid'])
									return done(null, currUser)
								}
							})
						})	
					}
				})
			}
		})
	})

	var debugUser = 'tien234'
	// "hack" function for debugging without having to login. DELETE THIS LATER
	debugLogin = new LocalStrategy(customDict, function(req, username, password, done) {
		console.log("debug login here")
		db.searchUserByName(debugUser, function(err, user) {
			if (user == null) {
				db.createUser(debugUser, 'a', 'b', 'c', 'd', function(err, res){
					userData = res.dataValues
					hash = userData['password']
					userid = userData['userid']
					currUser = new User('b', 'c', 'd', res['dataValues']['userid'])
					return done(null, currUser)
				})
			}

			userData = user.dataValues
			hash = userData['password']
			userid = userData['userid']
			currUser = new User('b', 'c', 'd', user['dataValues']['userid'])
			return done(null, currUser)
		})
	})

	passport.use('debug-login', debugLogin)
	passport.use('local-login', customLogin)
	passport.use('local-signup', customSignup)

	// use userid for deserializing
	passport.serializeUser(function(user, done) {
		done(null, user.slug)
	})

	passport.deserializeUser(function(slug, done) {
		db.searchUserBySlug(slug, function(err, user) {
			if (err) {
				console.log(err)
				return done(null, false)
			}

			// this should never happen
			if (!user) {
				console.log("User with slug " + slug + " does not exist")
				return done(null, false)
			}
			var userData = user.dataValues
			currUser = new User(userData['firstname'], userData['lastname'], slug, user['dataValues']['userid'])
		})
		return done(null, currUser)
	})

}