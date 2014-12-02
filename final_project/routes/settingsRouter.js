var express = require('express')
var settingsRouter = express.Router()
var User = db.model('User')

settingsRouter.get('/', function(req, res){
	User.findOne({
		where: {userid: req.user.id},
		attributes: ['diet', 'dairy', 'eggs', 'gluten', 'peanut', 'seafood', 'sesame', 'soy', 'sulfite', 'treeNut', 'wheat']
	}).done(function(err, settings){
		// console.log(settings)
		res.render('settings', {user:req.user, row:settings['dataValues'], csrfToken: req.csrfToken()})
	})
})

settingsRouter.post('/', function(req, res){
	User.findOne({where: {userid: req.user.id}}).done(function(err, user){
		if (!user) {
			res.json({success: false, message: "User id " + req.user.id + " does not exist"})
		} else {
			var p = req.body
			var blMap = {true: true, false: false}
			user.updateAttributes({
				diet: p.diet,
				dairy: blMap[p.dairy],
				eggs: blMap[p.eggs],
				gluten: blMap[p.gluten],
				peanut: blMap[p.peanut],
				seafood: blMap[p.seafood],
				sesame: blMap[p.sesame],
				soy: blMap[p.soy],
				sulfite: blMap[p.sulfite],
				treeNut: blMap[p.treeNut],
				wheat: blMap[p.wheat]
			})
			user.save().done(function(err, rtn){
				if (err) {
					res.json({success: false, message: "Error in saving settings for user " + req.user.id})
				} else {
					res.json({success: true, message: "Successfully updated search settings"})
				}
			})
		}
	})
})

module.exports = settingsRouter