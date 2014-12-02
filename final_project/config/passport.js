// authentication using passportJS with local strategies
// backend database for querying users is mySQL
// bcrypt is used for hashing passwords

module.exports = function(passport, db) {
	var s = require('string')
	var _ = require('underscore')
	var LocalStrategy = require('passport-local').Strategy
	var bcrypt = require('bcrypt-nodejs')
	var User = db.model('User')
	var PassportUser = require('../custom/PassportUser.js')
	var FacebookStrategy = require('passport-facebook').Strategy;
	var FACEBOOK_APP_ID = '1501083956817978';
	var FACEBOOK_APP_SECRET = 'a8170539de31afad201eb9f48b904758';
	var WEBSITE_URL = "http://localhost:8080/";

	customDict = {
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}

	// login strategy
	customLogin = new LocalStrategy(customDict, function(req, username, password, done) {
		// first, try to search for this user. retrieve the hashed password
		User.findOne({where: {username: username}}).done(function(err, user) {
			if (err) {
				// this should never happen
				return done(err, false, {message: "Unknown error in User.findOne " + username})
			}
			if (user == null) {
				return done(null, false, {message: "Username " + username + " does not exist"})
			} 

			else {
				// if user does exist, compare hash in database with hash(plaintext password)
				userData = user.dataValues
				hash = userData['password']
				bcrypt.compare(password, hash, function(err, match) {
					if (err)
						return done(err, false, {message: "BCrypt error with password " + password + " and hash " + hash})
					// in "real life" probably the same error message for both username does not exist and wrong pw
					if (!match) {
						return done(null, false, {message: "Incorrect password"})
					}
					else {
						currUser = new PassportUser(userData['slug'], userData['userid'])
						return done(null, currUser)
					}
				})
			}
		})
	})

	customSignup = new LocalStrategy(customDict, function(req, username, password, done) {
		User.count({where: {username: username}}).success(function(count){
			if (count != 0) {
				// user name already exists
				return done(null, false, {message: "Username " + username + " has already been taken"})
			} else {
				User.findAll({attributes: ['slug']}).done(function(err, res) {
					if (err) {
						return done(err, false, {message: "Unknown error in finding all user slugs"})
					} else {
						var allSlugs = {}
						// copy all slugs into dictionary
						for (var i = 0; i < res.length; i++) {
							allSlugs[res[i]['dataValues']['slug']] = true
						}

						var slug = s(req.body.screenname).slugify().s
						
						// attempt to make a unique slug by adding 1, 2...to slug if it exists
						if (allSlugs[slug]) {
							var j = 1
							slug += j
							if (allSlugs[slug]) {
								// magic number 1000 here, no time to fix
								j++							
								for (j; j < 1000; j++) {
									slug = slug.substring(0, slug.length - 1) + j
									if (!allSlugs[slug]) break
								}
							}
						}

						// create a(n unsalted for now) hash
						bcrypt.hash(password, null, null, function(err, hash) {
							if (err) {
								return done(err, false, {message: "BCrypt error in hashing the string " + password})
							}

							User.createUser(username, hash, slug, function(err, res) {
								if (err) {
									return done(err, false, {message: "Sequelize error in creating username " + username + " with slug " + slug})
								} else {
									currUser = new PassportUser(slug, res['dataValues']['userid'])
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
		User.findOne({where: {username: debugUser}}).done(function(err, user) {
			if (user == null) {
				User.createUser(debugUser, 'a', 'b', 'c', 'd', function(err, res){
					userData = res.dataValues
					hash = userData['password']
					userid = userData['userid']
					currUser = new PassportUser('d', res['dataValues']['userid'])
					return done(null, currUser)
				})
			}

			userData = user.dataValues
			hash = userData['password']
			userid = userData['userid']
			currUser = new PassportUser('d', user['dataValues']['userid'])
			return done(null, currUser)
		})
	})

	passport.use('debug-login', debugLogin)
	passport.use('local-login', customLogin)
	passport.use('local-signup', customSignup)

	passport.use(new FacebookStrategy({
	    clientID: FACEBOOK_APP_ID,
	    clientSecret: FACEBOOK_APP_SECRET,
	    callbackURL: WEBSITE_URL + "auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	    // asynchronous verification, for effect...
	    var userInfo = profile._json
	    var displayName = profile["displayName"]

	    User.findOne({where: {facebookId: userInfo["id"]}}).done(function(err, fbUser){
	    	if (err) {
	    		return done(err, {message: "Unknown error in finding user in passport.js"})
	    	} else if (!fbUser) {
	    		User.findAll().done(function(err, allUsers){
	    			var allNames = []
	    			var allSlugs = []

	    			_.each(allUsers, function(user, index){
	    				allNames.push(user['dataValues']['username'])
	    				allSlugs.push(user['dataValues']['slug'])
	    			})

	    			var fbName = genUnique(allNames, "facebook", 100)
	    			var fbSlug = genUnique(allSlugs, s(displayName).slugify().s, 100)

	    			User.create({
	    				username:fbName,
	    				slug: fbSlug,
	    				facebookId: userInfo["id"]
	    			}).done(function(err, newFbUser){
	    				if (err) {
				    		return done(err, {message: "Unknown error in creating fb user in passport.js"})
	    				} else {
	    					return done(null, new PassportUser(newFbUser['dataValues']['slug'], newFbUser['dataValues']['id']))
	    				}
	    			})
	    		})
	    	} else {
	    		// fb user already exists in db, use this
	    		return done(null, new PassportUser(fbUser['dataValues']['slug'], fbUser['dataValues']['id']))
	    	}
	    })
	  }
	));

	function genUnique(all, prefix, end) {
		// let all be an array
		var tempArr = _.range(all.length)
		var allObj = _.object(all, tempArr)

		if (!allObj[prefix]) {
			return prefix
		}

		for (var i = 1; i < end; i++) {
			if (!allObj[(prefix + i.toString())]) {
				return (prefix + i.toString())
			}
		}

		console.log("Reached the end of genUnique")
		return false
	}


	// use userid for deserializing
	passport.serializeUser(function(user, done) {
		done(null, user.slug)
	})

	passport.deserializeUser(function(slug, done) {
		User.findOne({where: {slug: slug}}).done(function(err, user) {
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
			var currUser = new PassportUser(slug, user['dataValues']['userid'])
			return done(null, currUser)
		})
	})

}