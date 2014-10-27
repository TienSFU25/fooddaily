// main route handling class

module.exports = function(app, passport, db) {
	// SESSION "MIDDLEWARE"
	app.use(function (req, res, next) {
		console.log(req.user)
		next();
	})

	app.get('/', function(req, res) {
	  	res.render('home')
	})

	// convenience method
	function getFlashMessage(req, flash) {
		m = ""
		a = req.flash(flash)
		if (a.length > 0)
			m = a

		return m
	}

	app.get('/login', function(req, res) {
		res.render('login', {message: getFlashMessage(req, 'loginMessage')})
	})

	// if authenticated, redirect to list page
	app.post('/login', passport.authenticate('local-login', 
										{successRedirect: 'list',
										failureRedirect: 'login',
										failureFlash: true})
	)

	app.get('/signup', function(req, res) {
		res.render('signup', {message: getFlashMessage(req, 'signupMessage')})
	})

	// simple test page to see who is logged in
	app.get('/test', function(req, res) {
		message = "Nobody is logged in"

		if (req.user != null)
			message = req.user.username + " is logged in with hashed password " + req.user.password

		res.render('test', {message: message})
	})


	// redirect to list page if successful signup
	app.post('/signup', passport.authenticate('local-signup',
										{successRedirect: 'list',
										failureRedirect: 'signup',
										failureFlash: true})
	)

	app.get('/logout', function(req, res) {
		message = "Nobody is logged in"
		if (req.user != null) {
			message = "Successful log out for user " + req.user.username
			req.logout()
		}
		res.render('logout', {message: message})
	})

	app.get('/report', function(req, res) {
		res.render('report')
	})

	// for routing to the list pages
	var listRouter = require('./list')
	app.use('/list', listRouter)
}