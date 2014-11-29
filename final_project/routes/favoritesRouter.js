// this class is used for the list page, after a user logs in

var express = require('express')
var _ = require('underscore')

favoritesRouter = express.Router()

var User = db.model('User')

favoritesRouter.get('/', function(req, res) {
	res.render('favrecipes')
})


module.exports = favoritesRouter
