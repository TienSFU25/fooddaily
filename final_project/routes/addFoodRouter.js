var express = require('express')
var addFoodRouter = express.Router()

addFoodRouter.get('/', function(req, res){
		res.render('addfood', {user: req.user, csrfToken: req.csrfToken()})
})

module.exports = addFoodRouter