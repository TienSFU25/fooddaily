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

foodRouter.get('/', function(req, response, next) {
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

module.exports = foodRouter
