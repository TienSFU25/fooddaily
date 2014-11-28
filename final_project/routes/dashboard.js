var express = require('express')
var dashboard = express.Router()

dashboard.get('/', function(req, res){
	db.getCaloriesByDay(req.user.id, function(err, calories){
		if (!err)
		res.render('test', {username: req.user.slug, calories: calories[0]['Total Calories'], csrfToken: req.csrfToken()})

		else res.sendStatus(200)
	})
})

module.exports = dashboard