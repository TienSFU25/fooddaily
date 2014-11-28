var express = require('express')
var _ = require('underscore')

progressRouter = express.Router()
progressRouter.get('/', function(req, res){
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
			res.render('progress', {user: req.user, chartData: rr})
		}
	})
})

module.exports = progressRouter