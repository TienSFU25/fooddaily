module.exports = function(app, passport, db) {
	
	// debugging sessions
	app.use('/', function(req, res, next) {
		var sess = req.session
		if (sess.views)
			sess.views++
		else
			sess.views = 1
		next()
	})

	// print user
	app.use('/', function(req, res, next) {
		console.log(req.user)
		next()
	})

	//Authenticator.prototype.authenticate = function(strategy, options, callback) {
	app.get('/test', function(req, res, next) {
		req.body.username = 'u'
		req.body.password = 'p'
		passport.authenticate('debug-login', {
			successRedirect: 'success',
			failureRedirect: 'login',
			failureFlash: true
		})
		(req, res)
	})

	app.get('/', function(req, res) {
		res.render('index');
	})

	// pass in CSRF token for any page with a form
	app.get('/login', function(req, res) {
		res.render('login', { csrfToken: req.csrfToken() })
	})

	app.get('/signup', function(req, res) {
		console.log(req.csrfToken())
		res.render('signup', { csrfToken: req.csrfToken() })
	})

	app.get('/success', function(req, res) {
		res.render('success', {user: req.user})
	})

	app.post('/login', passport.authenticate('local-login',
											{successRedirect: 'success',
											failureRedirect: 'login',
											failureFlash: true})
	)

	app.post('/signup', passport.authenticate('local-signup',
										{successRedirect: 'success',
										failureRedirect: 'signup',
										failureFlash: true})
	)

	app.get('/logout', function(req, res) {
		req.logout()
		res.render('index')
	})

	app.get('/settings', function(req, res) {
		res.render('settings', { csrfToken: req.csrfToken() })
	})

	app.post('/settings', function(req, res) {
		res.redirect('/settings')
	})

	app.get('/jsontest', function(req, res) {
		res.render('jsonscrollablelisttest')
	})

}