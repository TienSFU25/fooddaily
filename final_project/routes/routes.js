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
		res.render('index', { csrfToken: req.csrfToken() });
	})

	app.get('/partials/:filename', function(req,res){
		res.render('partials/' + req.params.filename, { csrfToken: req.csrfToken() })
	})

	app.get('/api/foodlist', function(req,res) {
		db.getAllFoods(req.user.id, function(rows) {
			res.json(rows);
		})
	})

	app.post('/api/foodlist', function(req,res) {
		db.addFood(req.user.id, req.body.text, function(rows) {
			// get and returns the food list after deletion (refresh)
			db.getAllFoods(req.user.id, function(rows) {
				res.json(rows);						
			})
		})
	})

	app.delete('/api/foodlist/:food_id', function(req, res) {
		db.deleteFood(req.user.id, req.params.food_id, function(rows) {
			// get and returns the food list after adding a new one (refresh)
			db.getAllFoods(req.user.id, function(rows) {
				res.json(rows);
			})
		}) 
    })

    app.get('/test/addfood', function (req, res) {
    	db.addFood(req.user.id, "testfood", function(err){})
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
		// res.render('jsonscrollablelisttest')
	})

	app.get('/search', function(req, res) {
		res.render('search',  { csrfToken: req.csrfToken() })
	})

	app.post('/search', function(req, res) {
		res.redirect('/jsontest')
	})

	var testDict = {
		"_id": "dcmm2345",
		"item_name": "food name",
		"brand_name": "some brand",
		"nf_calories": 4000,
		"nf_total_fat": 40,
		"nf_protein": 30,
		"nf_total_carbohydrate": 25,
		"nf_sodium": 25,
		"item_type": 4
	}
	
	// db.createUser('tien234', 'test', function(err){console.log(err)})
	db.addFood(4, testDict, function(err) {console.log(err)})

	// display all foods related to this user
	// TODO: move this to config

	var cols = ['foodname', 'brandName', 'calories', 'totalFat', 'totalProtein', 'totalCarb', 'sodium', 'type', 'id']
	var cols2 = ['item_name', 'brand_name', 'nf_calories', 'nf_total_fat', 'nf_protein', 'nf_total_carbohydrate', 'nf_sodium', 'item_type', '_id']

	app.get('/foods', function(req, res, next) {
		db.getAllFoods(req.user.id, function(err, result){
			if (err) {
				next(err);
			} else {
				var rows = []
				var row = []
				var temp

				// only pass relevant data to the page
				for (var i = 0; i < result.length; i++) {
					temp = result[i]['dataValues']
					for (var j = 0; j < cols.length; j++) {
						row[j] = String(temp[cols[j]])
					}

					rows[i] = row
				}

				console.log(rows)
				res.render('foods', {user: req.user, foodList: rows})
			}
		})
	})
}