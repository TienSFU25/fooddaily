var express = require('express')
var dashboardRouter = express.Router()

dashboardRouter.get('/', function(req, res){
	db.getCaloriesByDay(req.user.id, function(err, calories){
		if (!err) {
			res.render('dashboard', {user: req.user, calories: calories[0]['Total Calories'], csrfToken: req.csrfToken()})
		
		} else {
			res.render('dashboard', {user: req.user, calories: "No foods added today! </br> Error on: calories[0]['Total Calories']", csrfToken: req.csrfToken()})

		}
	})
})

module.exports = dashboardRouter