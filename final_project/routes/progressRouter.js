var express = require('express')
var _ = require('underscore')

progressRouter = express.Router()
progressRouter.get('/', function(req, res){
	db.getAmounts(req.user.id, function(err, result){
		if (err) {
			console.log("Error in db.get Amounts")
			next
		} else {
			var keys = _.keys(result)
			// should just be 2, whatever the string is, date created and amount eaten that day
			var createds = _.pluck(result, 'createdAt')
			createds = _.map(createds, function(created){
				return created.toDateString()
			})
			var amounts = _.pluck(result, 'amount')
			var rr = _.zip(createds, amounts)

			res.render('progress', {user: req.user, chartData: rr})
		}
	})
})

module.exports = progressRouter