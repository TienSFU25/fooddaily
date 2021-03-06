// this class is used for the list page, after a user logs in

var express = require('express')
userRouter = express.Router()

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

userRouter.get('/', function(req, res){
	res.render('success', {user: req.user, csrfToken: req.csrfToken()})
})

userRouter.use('/dashboard', require('./dashboardRouter'))
userRouter.use('/addfood', require('./addFoodRouter'))
userRouter.use('/recipesearch', require('./recipeRouter'))
userRouter.use('/favorites', require('./favoritesRouter'))
userRouter.use('/foods', require('./foodRouter'))
userRouter.use('/settings', require('./settingsRouter'))
userRouter.use('/friends', require('./friendRouter'))

userRouter.get('*', function(req, res){
  res.render('foodaily404', 404);
});
module.exports = userRouter
