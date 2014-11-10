module.exports = function(app, passport, db) {
	app.use('/', function(req, res, next) {
		var sess = req.session
		if (sess.views)
			sess.views++
		else
			sess.views = 1
		next()
	})

	app.get('/', function(req, res) {
		res.render('index');
	})

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
}