var express = require('express')
var dashboardRouter = express.Router()
var _ = require('underscore')

dashboardRouter.get('/', function(req, res){
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
			db.getLatestFoods(req.user.slug, function(err, latestFoods) {
				if (err) {
					res.json({success: false, message: "Error in getting latest foods for " + req.user.slug, err: err})
				} else {
					_.each(latestFoods, function(food, key){
						food['createdAt'] = food['createdAt'].toFormat("DDD MMM-DD-YYYY HH24:MI:SS")
					})

					res.render('dashboard', {user: req.user, chartData: rr, latestFoods: latestFoods})
				}
			})
		}
	})
})

module.exports = dashboardRouter