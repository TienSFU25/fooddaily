var express = require('express')
var settingsRouter = express.Router()

settingsRouter.get('/', function(req, res){
		res.render('settings', {user: req.user, csrfToken: req.csrfToken()})
})

module.exports = settingsRouter