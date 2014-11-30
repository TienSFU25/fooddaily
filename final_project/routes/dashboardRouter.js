var express = require('express')
var dashboard = express.Router()

dashboard.get('/', function(req, res){
	db.getCaloriesByDay(req.user.id, function(err, calories){
		if (!err) {
			res.render('dashboard', {username: req.user.slug, calories: calories[0]['Total Calories'], csrfToken: req.csrfToken()})
		
		} else {
			res.render('dashboard', {username: req.user.slug, calories: "No foods added today! </br> Error on: calories[0]['Total Calories']", csrfToken: req.csrfToken()})

		}
	})
})

module.exports = dashboard