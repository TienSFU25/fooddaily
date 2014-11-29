module.exports = function(app, passport, db, fbProfile) {

	var s = require('string')
	console.log(new Date())
	// db.eatFood(17, "513fc997927da70408003f50", 400, function(){})
	// db.changeDate(1, new Date(), function(err, res){
	// 	console.log(err)
	// 	console.log(res)
	// })
	// print user
	app.use('/', function(req, res, next) {
		// console.log('logged in user is ' + req.user)
		// console.log(req.xhr)
		// console.log(req.path)
		next()
	})

	// app.get(/\/user\/(\d*)\/(edit)\/(\d+)/, function(req, res) {

	app.get('/test', function(req, res, next){
		if (!req.isAuthenticated()) {
			req.body.username = 'u'
			req.body.password = 'p'
			passport.authenticate('debug-login', function(err, user) {
				if (err) {
					console.log(err)
					next(err)
				} else {
					req.logIn(user, function(err){
						if (err) return next(err)
						res.redirect(user.slug)
					})
				}
			})
			(req, res)
		} else {
			next()
		}
	})

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
		//temporary routing for new frontend - tien please fix	
		} else if (str == 'newindex') {		
			res.render('newindex', { csrfToken: req.csrfToken(), user: req.user })
		} else if (str == 'about') {		
			res.render('about', { csrfToken: req.csrfToken(), user: req.user })
		} else if (str == 'logout') {
			if (req.isAuthenticated) {
				req.logout()
			}
			res.render('about', { csrfToken: req.csrfToken(), user: req.user })
		} else {
			if (!req.isAuthenticated()) {
				res.render('about', { csrfToken: req.csrfToken(), user: req.user })
			} else {
				next()
			}
		}
	})

	app.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			console.log(user)


			if (err) {
				console.log(err)
				next(err)
			}

			if (!user) {
				res.redirect('/login')
			} else {
				req.logIn(user, function(err){
					if (err) return next(err)
					res.redirect(user.slug + '/dashboard')
				})
			}
		})
		(req, res)
	})

	app.post('/signup', function(req, res, next) {
		passport.authenticate('local-signup', function(err, user, info) {
			if (err) {
				console.log(err)
				next(err)
			}

			if (!user) {
				res.redirect('/signup')
			} else {
				req.logIn(user, function(err){
					if (err) return next(err)
					res.redirect(user.slug)
				})
			}
		})
		(req, res)
	})

	app.get('/:slug', function(req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.slug == req.params.slug) {
				next()
			} else {
				console.log('Logged in with slug ' + req.user.slug + ' but param was ' + req.params.slug)
				res.redirect(req.user.slug)
			}			
		}
	})
	app.use('/:slug', require('./userRouter'))

	// down here means nobody is authenticated
	app.get('/', function(req, res, next){
		if (req.user == null) {
			res.render('about', { csrfToken: req.csrfToken() })
		} else {
			res.redirect(req.user.slug + '/dashboard')
		}
	})


// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this function will not be called.
  });

// GET /auth/facebook/callback
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res, profile) {
  	console.log('FACEBOOK UCMNSER')
  	console.log(req.user)
  	req.user.username = fbProfile.displayName + " (Facebook)";
    res.redirect('/dashboard');
  });


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

	app.get('/settings', function(req, res) {
		res.render('settings', { csrfToken: req.csrfToken() })
	})

	app.post('/settings', function(req, res) {
		res.redirect('/settings')
	})

	app.get('/jsontest', function(req, res) {
		res.send("This function is currently being built")
	})

	app.get('/search', function(req, res) {
		res.render('search',  { csrfToken: req.csrfToken() })
	})

	app.post('/search', function(req, res) {
		res.redirect('/jsontest')
	})

	app.get('/favourites', function(req, res) {
		res.render('favrecipes', {user: req.user})
	})
}