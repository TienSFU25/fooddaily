module.exports = function(app, passport, db) {

	var s = require('string')

	// app.get(/\/user\/(\d*)\/(edit)\/(\d+)/, function(req, res) {
	app.get('/auth/facebook',
	  passport.authenticate('facebook'),
	  function(req, res){
	    // The request will be redirected to Facebook for authentication, so this function will not be called.
	  });

	// GET /auth/facebook/callback
	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { failureRedirect: '/login' }),
	  function(req, res) {
		res.redirect("/" + req.user.slug + "/dashboard")
	});

	// right now routing goes like this
	// test (if not logged in) -> login/signup/logout -> if not auth: about -> if auth: check slug
	// -> if slug equal: dashboard, else: about
	// the last get('/') to about at the end is because the first regex doesn't capture an empty string

	app.get(/(\w+)/, function(req, res, next) {
		var str = req.params[0]

		if (str == 'login') {
			res.render('login', { csrfToken: req.csrfToken() })
		} else if (str == 'signup') {
			res.render('signup', { csrfToken: req.csrfToken() })
		} else if (str == 'logout') {
			if (req.isAuthenticated) {
				req.logout()
			}
			res.render('about')
		} else {
			if (!req.isAuthenticated()) {
				res.redirect('/')
			} else {
				next()
			}
		}
	})

	app.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			var rtnjson = {}
			if (err) {
				rtnjson.err = err
				rtnjson.success = false
				rtnjson.message = info.message
				res.json(rtnjson)
			} else if (!user) {
				rtnjson.success = false
				rtnjson.message = info.message
				res.json(rtnjson)
			} else {
				// no error, user is returned (is authenticated)
				req.logIn(user, function(err){
					if (err) {
						rtnjson.err = err
						rtnjson.success = false
						rtnjson.message = "Unknown error in passport login"
						res.json(rtnjson)
					} else {
						rtnjson.success = true
						rtnjson.message = "Successful login!"
						rtnjson.url = user.slug + '/dashboard'
						res.json(rtnjson)
					}
				})
			}
		})
		(req, res)
	})

	app.post('/signup', function(req, res, next) {
		var p = req.body
		var rtnjson = {}

		if (!p.username || !p.password || !p.screenname) {
			res.json({success: false, message: "All fields are required"})
		} else if (p.password != p.passwordre) {
			res.json({success: false, message: "Passwords do not match"})
		} else {
			passport.authenticate('local-signup', function(err, user, info) {
				if (err) {
					rtnjson.err = err
					rtnjson.success = false
					rtnjson.message = info.message
					res.json(rtnjson)
				} else if (!user) {
					rtnjson.success = false
					rtnjson.message = info.message
					res.json(rtnjson)
				} else {
					// no error, user is returned (is authenticated)
					req.logIn(user, function(err){
						if (err) {
							rtnjson.err = err
							rtnjson.success = false
							rtnjson.message = "Unknown error in passport login"
							res.json(rtnjson)
						} else {
							rtnjson.success = true
							rtnjson.message = "Successful login!"
							rtnjson.url = user.slug + '/dashboard'
							res.json(rtnjson)
						}
					})
				}
			})(req, res)
		}
	})

	app.get('/:slug', function(req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.slug == req.params.slug) {
				next()
			} else {
				res.redirect(req.user.slug)
			}			
		}
	})
	app.use('/:slug', require('./userRouter'))

	// down here means nobody is authenticated
	app.get('/', function(req, res, next){
		if (req.user == null) {
			res.render('about')
		} else {
			res.redirect(req.user.slug + '/dashboard')
		}
	})

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }

    console.log("req.id is : " + req.id);
  res.redirect('/login')
}
}