var express = require('express');
recipeRouter = express.Router();

var User = db.model('User');
var FavRecipes = db.model('FavRecipes');

recipeRouter.get('/', function(req, res) {
	User.findOne({
		where: {userid: req.user.id},
		attributes: ['diet', 'dairy', 'eggs', 'gluten', 'peanut', 'seafood', 'sesame', 'soy', 'sulfite', 'treeNut', 'wheat']
	}).done(function(err, settings){
		// console.log(settings)
		res.render('recipes', {user:req.user, row:settings['dataValues'], csrfToken: req.csrfToken()})
	})
});

module.exports = recipeRouter;