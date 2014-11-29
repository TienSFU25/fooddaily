// this class is used for the list page, after a user logs in

var express = require('express')
var _ = require('underscore')
var sprintf = require('sprintf-js').sprintf

foodRouter = express.Router()

var Food = db.model('Food')
var User = db.model('User')

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

foodRouter.get('/', function(req, response, next) {
	db.getAllChosenFoods(req.user.id, function(err, allFoods) {
		var allRows = []
		var thisRow = []
		//var lastDate = (allFoods.length > 0) ? allFoods[0]['createdAt'].toDateString() : ' '
		var lastDate = null
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
	var rtnjson = {}
	Food.checkFood(id, function(count) {
		if (count == 0) {
			// query nutritionix and save the food
			nutritionix.item(query, function(err, food) {
				Food.createFood(food, function(err, result) {
					if (err) {
						rtnjson.success = false
						rtnjson.message = err
						res.json(rtnjson)
					} else {
						db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
							if (err) {
								rtnjson.success = false
								rtnjson.message = err
								res.json(rtnjson)
							} else {
								rtnjson.success = true
								var dataValues = result.dataValues
								rtnjson.message = sprintf("Successfully added %s %ss of %s", req.body.amount, dataValues['servingUnit'], dataValues['foodname'])
								res.json(rtnjson)
							}
						})
					}
				})
			})				
		} else {
			// regardless, save eating food information to ChosenFoods
			// looks exactly like the code above, but this has to be written twice, because the food info might have to be retrieved from nutritionix
			Food.findOne({where: {id: id}}).done(function (err, food) {
				db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
					if (err) {
						rtnjson.success = false
						rtnjson.message = err
						res.json(rtnjson)
					} else {
						rtnjson.success = true
						var dataValues = food.dataValues
						rtnjson.message = sprintf("Successfully added %s %ss of %s", req.body.amount, dataValues['servingUnit'], dataValues['foodname'])
						res.json(rtnjson)
					}
				})
			})
		}
	})
})

foodRouter.put('/', function(req, res, next){
	// console.log(req.body)
	var params = req.body
	var rtnjson = {}

	// for some reason sequelize manual update gives no callback info
	db.updateFood(req.user.id, params.foodId, params.amount, params.time, function(err){
		if (err) {
			rtnjson.success = false
			rtnjson.message = err
			res.json(rtnjson)
		} else {
			db.model('ChosenFood').findOne({where: {id: params.foodId}}).done(function(err, food){
				if (err) {
					rtnjson.success = false
					rtnjson.message = err
					res.json(rtnjson)
				} else {
					rtnjson.success = true
					rtnjson.message = food['dataValues']
					res.json(rtnjson)
				}
			})
		}
	})
})

foodRouter.delete('/', function(req, res){
	var foodId = req.body.foodId
	var rtnjson = {}
	db.model('ChosenFood').findOne({where: {id: foodId}}).done(function(err, food){
		if(err) {
			rtnjson.success = false
			rtnjson.message = err
			res.json(rtnjson)
		} else if (food == null) {
			rtnjson.success = false
			rtnjson.message = "Food id " + foodId + " does not exist"
			res.json(rtnjson)
		} else {	
			var actualId = food['dataValues']['foodId']
			food.destroy().done(function(){
				// clean it up in the food table if there are no matching items in chosen
				db.model('ChosenFood').count({where: {foodId: actualId}}).success(function(count){
					db.model('Food').findOne({where: {id: actualId}}).done(function(err, actualFood){
						rtnjson.success = true
						rtnjson.message = "Successfully deleted food item " + actualFood['dataValues']['foodname']

						if (count == 0) {
							actualFood.destroy().done(function(){})
						}
						res.json(rtnjson)
					})
				})
			})
		}
	})
})

module.exports = foodRouter
