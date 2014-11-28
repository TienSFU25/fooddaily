var express = require('express')
var viewFriendRouter = express.Router()
var _ = require('underscore')
var User = db.model('User')
var Friend = db.model('Friends')
var MyEvent = require('../custom/MyEvent')

viewFriendRouter.get('/:slug', function(req, res){
	var thisUser = req.user.db
	console.log(req.params.slug)
	User.findOne({where: {slug: req.params.slug}}).done(function(err, otherUser){
		if (err) {
			res.send(err)
		}
		thisUser.hasFriend(otherUser).done(function(err, isFriend){
			if (!isFriend) {
				res.send("You have not received a friend request from " + req.params.slug)
			} else {
				var otherUserId = otherUser['dataValues']['userid']
				Friend.findOne({where: {befrienderId: req.user.id, FriendUserid: otherUserId}}).done(function(err, friendRow){
					if (err) {
						res.send(err)
					}
					// there is a pending request
					if (friendRow['dataValues']['accepted'] == "0") {
						res.send(req.params.slug + " must approve your friend request before you can view their dashboard")
					} else {
						db.getCaloriesByDay(otherUserId, function(err, calories){
							if (err) {
								res.send(err)
							} else if (calories.length == 0) {
								res.render('test', {username: req.params.slug, calories: [], csrfToken: req.csrfToken()})
							} else {
								res.render('test', {username: req.params.slug, calories: calories[0]['Total Calories'], csrfToken: req.csrfToken()})
							}
						})
					}
				})
			}
		})
	})
})

viewFriendRouter.get('/', function(req, res){
	var allFriends = []
	Friend.findAll({where: {befrienderId: req.user.id, accepted: "1"}}).done(function(err, friends){
		if (err) {
			res.send(err)
		} else {
			var renderPage = new MyEvent(friends.length, function(){
				res.render('viewFriends', {user: req.user, allFriends: allFriends})
			}, "Render page event")
			_.each(friends, function(friend, index){
				User.findOne({where: {userid: friend['dataValues']['FriendUserid']}}).done(function(err, otherUser){
 					allFriends.push(otherUser['dataValues']['slug'])
 					renderPage.inc()
				})
			})
		}
	})
})

module.exports = viewFriendRouter