var express = require('express')
var settingsRouter = express.Router()

settingsRouter.get('/', function(req, res){
		res.render('addfood', {user: req.user, csrfToken: req.csrfToken()})
})

module.exports = settingsRouter