var express = require('express')
var parser = require('./parser')

progressRouter = express.Router()

progressRouter.get('/', function(req, res){
	db.getAmounts(req.user.id, function(err, result){
		if (err) {
			console.log("Error in db.get Amounts")
			next
		} else {
			console.log(result)
			res.render('progress', {user: req.user, chartData: parser.arrayJsonToArrayArray(result)})
		}
	})
})

module.exports = progressRouter