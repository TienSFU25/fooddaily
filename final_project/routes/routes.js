module.exports = function(app, passport, db) {

	var nutritionix = require('nutritionix')({
	    appId: '065c98a7',
	    appKey: 'ac97e296e021c5ea6c0e51389f966307'
	}, false).v1_1;

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
		res.render('success', {user: req.user, csrfToken: req.csrfToken()})
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

	app.get('/favourites', function(req, res) {
		res.render('favrecipes', {user: req.user})
	})
	
	var shortFields = [
	  'id',
	  'foodname',
	  'brandName',
	  'calories',
	  'totalFat',
	  'totalCarb',
	  'totalProtein',
	  'sodium',
	  'type'
	]

	app.get('/foods', function(req, response, next) {
		db.getAllFoods(req.user.id, function(err, res){
			var json = {}
			var allIds = {}
			var rows = []

			// javascript "set"
			for (var i = 0; i < res.length; i++) {
				id = res[i].dataValues['foodId']
				allIds[id] = true
			}

			db.getFoodsInArray(Object.keys(allIds), function(err, results) {
				// loop over results and store their associated data
				// for example
				// rtn[32][foodname] should give foodname of food id "32"
				var foodDict = {}
				for (var j = 0; j < results.length; j++) {
					var attr = results[j]['dataValues']
					var id = attr['id']
					// store id twice, oh well
					foodDict[id] = attr
				}

				// now loop over chosen foods again and attach associated data from food dict
				for (var k = 0; k < res.length; k++) {
					var eatenFood = res[k].dataValues
					var row = []

					// deep copy from the food dict
					json[k] = JSON.parse(JSON.stringify(foodDict[eatenFood['foodId']]))
					json[k]['myDate'] = eatenFood['myDate']
					json[k]['amount'] = eatenFood['amount']

					var id = eatenFood['foodId']
					var p
					for (p = 0; p < shortFields.length; p++) {
						row[p] = String(foodDict[id][shortFields[p]])
					}

					row[p] = String(eatenFood['myDate'])
					row[p + 1] = String(eatenFood['amount'])
					rows[k] = row
				}

				response.render('foods', {user:req.user, chartData: rows})
				// console.log(rows)
				// console.log(json)
			})
		})
	})

	app.post('/saveFood', function(req, res, next) {
		var id = req.body.chosenFood
		var query = {id: id}
		db.checkFood(id, function(count) {
			if (count == 0) {
				// query nutritionix and save the food
				nutritionix.item(query, function(err, food) {
					db.createFood(food, function(err, result) {
						if (err) {
							console.log(err)
							next()
						} else {
							db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
								console.log(err)
								console.log(r)
								res.send(200)
							})
						}
					})
				})				
			} else {
				// regardless, save eating food information to ChosenFoods
				db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
					console.log(err)
					console.log(r)
					res.send(200)
				})
			}
		})

	})
}