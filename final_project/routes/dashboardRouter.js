var express = require('express')
var dashboardRouter = express.Router()
var _ = require('underscore')

dashboardRouter.get('/', function(req, res){
	// db.getCaloriesByDay(req.user.id, function(err, calories){
	// 	if (!err) {
	// 		res.render('dashboard', {user: req.user, calories: calories[0]['Total Calories'], csrfToken: req.csrfToken()})
		
	// 	} else {
	// 		res.render('dashboard', {user: req.user, calories: "No foods added today! </br> Error on: calories[0]['Total Calories']", csrfToken: req.csrfToken()})

	// 	}
	// })

	db.getCaloriesByDay(req.user.id, function(err, result){
		if (err) {
			console.log("Error in db.get Amounts")
			next(err)
		} else {
			var rr = [[]]
			if (!_.isEmpty(result)) {
				var keys = _.keys(result[0])
				var createds = _.pluck(result, keys[0])
				createds = _.map(createds, function(val, index){
					return val.toDateString()
				})
				var amounts = _.pluck(result, keys[1])
				rr = _.zip(createds, amounts)
			}
			res.render('dashboard', {user: req.user, chartData: rr})
		}
	})
})

module.exports = dashboardRouter