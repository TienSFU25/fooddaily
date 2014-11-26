// this class is used for the list page, after a user logs in

var express = require('express')
var _ = require('underscore')
foodRouter = express.Router()

var Food = db.model('Food')

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

foodRouter.get('/', function(req, response, next) {
	db.getAllChosenFoods(req.user.id, function(err, allFoods) {
		var allRows = []
		var thisRow = []
		var lastDate = (allFoods.length > 0) ? allFoods[0]['createdAt'].toDateString() : ' '
		_.each(allFoods, function(foodDict, index){
			foodDict['createdAt'] = foodDict['createdAt'].toDateString()
			if (foodDict['createdAt'] == lastDate) {
				thisRow.push(_.values(foodDict))
			} else {
				allRows.push(thisRow)
				thisRow = []
				thisRow.push(_.values(foodDict))
				lastDate = foodDict['createdAt']
			}
		})

		allRows.push(thisRow)
		response.render('foods', {user:req.user, chartData: allRows, csrfToken: req.csrfToken()})
		return
	})
})

foodRouter.post('/', function(req, res, next) {
	var id = req.body.chosenFood
	var query = {id: id}
	Food.checkFood(id, function(count) {
		if (count == 0) {
			// query nutritionix and save the food
			nutritionix.item(query, function(err, food) {
				Food.createFood(food, function(err, result) {
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

foodRouter.put('/', function(req, res, next){
	console.log(req.body)
	res.send(200)
})

module.exports = foodRouter
