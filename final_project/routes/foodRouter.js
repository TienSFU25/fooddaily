// this class is used for the list page, after a user logs in

var express = require('express')
foodRouter = express.Router()

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

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

// too much black magic in here
foodRouter.get('/', function(req, response, next) {
	db.getAllFoods(req.user.id, function(err, res){
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
			var oneDay = []
			var index = 0
			var days = 0
			var last = (res.length > 0) ? res[0]['dataValues']['myDate'] : ''

			for (var k = 0; k < res.length; k++) {
				var eatenFood = res[k]['dataValues']
				var row = []

				var id = eatenFood['foodId']
				var p
				for (p = 0; p < shortFields.length; p++) {
					row[p] = String(foodDict[id][shortFields[p]])
				}

				row[p] = String(eatenFood['myDate'])
				row[p + 1] = String(eatenFood['amount'])

				if (row[p] == last) {
					oneDay[index++] = row
				} else {
					// date changed
					last = row[p]

					// put one day's items in rows
					rows[days++] = oneDay

					// reset oneDay
					oneDay = [row]
				}
			}
			rows[days] = oneDay
			response.render('foods', {user:req.user, chartData: rows})
		})
	})
})

foodRouter.post('/', function(req, res, next) {
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
							if (err) {
								console.log(err)
								res.send(500)
							}

							res.json(r)
						})
					}
				})
			})				
		} else {
			// regardless, save eating food information to ChosenFoods
			db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
				if (err) {
					console.log(err)
					res.send(500)
				}

				res.json(r)
			})
		}
	})

})

module.exports = foodRouter
