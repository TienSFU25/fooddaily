var express = require('express');
var _ = require('underscore')
recipeRouter = express.Router();

var User = db.model('User');
var FavRecipes = db.model('FavRecipes');

recipeRouter.get('/', function(req, res) {
	User.findOne({
		where: {userid: req.user.id},
		attributes: ['diet', 'dairy', 'eggs', 'gluten', 'peanut', 'seafood', 'sesame', 'soy', 'sulfite', 'treeNut', 'wheat']
	}).done(function(err, settings){
		res.render('recipes', {user:req.user, row:settings['dataValues'], csrfToken: req.csrfToken()})
	})
});

recipeRouter.post('/', function(req, res){
	var userId = req.user.id;
	var p = req.body

	User.findOne({where: {userid: req.user.id}}).done(function(err, user){
		var strList = _.reduce(p.ingredientsList, function(memo, value, index){
			return memo + ";" + value
		})
		user.createFavRecipe({
			recipeName: p.name,
			yield: p.yield,
			ingredientsList: strList,
			URL: p.sourceUrl,
			IMG_URL: p.image,
		}).done(function(err, favRecipe){
			if (err) {
				res.json({success: false, message: "Error in creating favorite recipe"})
			} else {
				res.json({success: true, message: "Successfully added recipe to your favorites list"})
			}
		})
	})
});

module.exports = recipeRouter;