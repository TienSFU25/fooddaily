var express = require('express')
favoritesRouter = express.Router()

favoritesRouter.get('/', function(req, res) {
	db.model('FavRecipes').findAll({where: {userId: req.user.id}}).done(function(err, rows) {
		res.render('favrecipes', {user:req.user, rows:rows, csrfToken: req.csrfToken()})
	});
});

module.exports = favoritesRouter