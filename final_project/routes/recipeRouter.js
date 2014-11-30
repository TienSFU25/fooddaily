// this class is used for the list page, after a user logs in

var express = require('express');



recipeRouter = express.Router();

var User = db.model('User');
var FavRecipes = db.model('FavRecipes');

recipeRouter.get('/', function(req, res) {
	res.render('recipes', {user:req.user, csrfToken: req.csrfToken()})
});

recipeRouter.post('/', function(req, res) {
	var id = req.body.chosenId;
	// var 
	// var 
	// var 
	// var 

	//createFav = function(userid, recipeName, yield, ingredientsList, URL, IMG_URL, callback) {
	// db.createFav(...);

	res.render('recipes', {user:req.user, csrfToken: req.csrfToken()})
});

module.exports = recipeRouter;
