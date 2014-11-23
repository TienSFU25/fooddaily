// this class is used for the list page, after a user logs in

var express = require('express')
userRouter = express.Router()

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

userRouter.get('/', function(req, res){
	console.log(req.user)
	res.render('success', {user: req.user, csrfToken: req.csrfToken()})
})

userRouter.use('/foods', require('./foodRouter'))
module.exports = userRouter