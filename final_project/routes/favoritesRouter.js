// this class is used for the list page, after a user logs in

var express = require('express')

favoritesRouter = express.Router()

var User = db.model('User')
var FavRecipes = db.model('FavRecipes')

// favoritesRouter.get('/', function(req, res) {
// 	// getFavsCallback = function(err, rows) {
// 	// 	if (!err) {
// 	// 		console.log(req.user.username)
// 	// 		res.render('favrecipes', {user:req.user, rows:rows, csrfToken: req.csrfToken()})
// 	// 	} else {
// 	// 		console.log(err)
// 	// 	}
// 	// }
// 	// FavRecipes.getFavs(req.user.id, getFavsCallback);


// 	FavRecipes.getFavs(req.user.id, function(err, rows) {
// 			res.render('favrecipes', {user:req.user, rows:rows, csrfToken: req.csrfToken()})
// 		});

// 	// res.render('favrecipes')
// })





// Returns: TypeError: Object [object SequelizeModel] has no method 'checkFood'
favoritesRouter.get('/', function(req, res) {
	FavRecipes.getFavs(req.user.id, function(err, rows) {
			res.render('favrecipes', {user:req.user, rows:rows, csrfToken: req.csrfToken()})
	});
});

module.exports = favoritesRouter
