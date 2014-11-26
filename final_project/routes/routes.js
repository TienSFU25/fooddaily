module.exports = function(app, passport, db, fbProfile) {

	var s = require('string')
	// print user
	app.use('/', function(req, res, next) {
		console.log(req.user)
		next()
	})

	// app.get(/\/user\/(\d*)\/(edit)\/(\d+)/, function(req, res) {

	app.get(/(\w+)/, function(req, res, next) {
		var str = req.params[0]

		if (str == 'login') {
			res.render('login', { csrfToken: req.csrfToken() })
		} else if (str == 'signup') {
			res.render('signup', { csrfToken: req.csrfToken() })
		} else if (str == '!test') {
			req.body.username = 'u'
			req.body.password = 'p'
			passport.authenticate('debug-login', {
				successRedirect: 'dashboard',
				failureRedirect: 'login',
				failureFlash: true
			})
			(req, res)	
		//temporary routing for new frontend - tien please fix	
		} else if (str == 'newindex') {		
			res.render('newindex', { csrfToken: req.csrfToken(), user: req.user })
		} else if (str == 'about') {		
			res.render('about', { csrfToken: req.csrfToken(), user: req.user })
		// } else if (str == '') {		
		// 	res.render('', { csrfToken: req.csrfToken(), user: req.user })
		// } else if (str == '') {		
		// 	res.render('', { csrfToken: req.csrfToken(), user: req.user })
		// } else if (str == '') {		
		// 	res.render('', { csrfToken: req.csrfToken(), user: req.user })
		// } else if (str == '') {		
		// 	res.render('', { csrfToken: req.csrfToken(), user: req.user })
		
		} else {
			next()
		}
	})



	app.use('/:slug', require('./userRouter'))

	app.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				console.log(err)
				next(err)
			}

			if (!user) {
				res.redirect('/login')
			} else {
				req.logIn(user, function(err){
					if (err) return next(err)
					res.redirect('/')
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

	app.get('/', function(req, res) {
		if (req.user) {
			res.render('dashboard', { csrfToken: req.csrfToken(), user: req.user })
		} else {
			res.render('about', { csrfToken: req.csrfToken() })
		}
	})


	app.post('/login', passport.authenticate('local-login',
											{successRedirect: 'dashboard',
											failureRedirect: 'login',
											failureFlash: true})
	)


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

	//signup success redirect should go to settings page or a introductory guide, 
	//and a quick survey of settings
	app.post('/signup', passport.authenticate('local-signup',
										{successRedirect: 'dashboard',
										failureRedirect: 'signup',
										failureFlash: true})
	)

	app.get('/logout', function(req, res) {
		req.logout()

		res.render('index', { csrfToken: req.csrfToken() })
	})

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

	app.get('/:slug', function(req, res, next) {
		if (req.user) {
			if (req.user.slug == req.params.slug) {
				next()
			} else {
				// TODO: implement this part
				res.send("Unauthorized to view this source")
			}			
		} else {
			res.redirect('/login')
		}
	})
}