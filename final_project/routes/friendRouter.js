var express = require('express')
var events = require('events')
var _ = require('underscore')

var friendRouter = express.Router()
var User = db.model('User')
var Friend = db.model('Friends')
var MyEvent = require('../custom/MyEvent')

// this user has already been authenticated, pass in the DB model to the next middlewares
friendRouter.use('/', function(req, res, next){
	User.findOne({where: {userid: req.user.id}}).done(function(err, user){
		req.user.db = user
		next()
	})
})

friendRouter.get('/:slug', function(req, res){
	var thisUser = req.user.db
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

friendRouter.get('/', function(req, res){	
	var thisUser = req.user.db
	var allUsers = []
	var selfPending = []
	var otherPending = []
	var allFriends = []

	// for better performance, and prevent a giant loop of callbacks
	var allEvents = new MyEvent(2, function(){isComplete()}, "all db events")

	function isComplete() {
		res.render('friends', {user: req.user, csrfToken: req.csrfToken(), allUsers: allUsers, selfPending: selfPending, otherPending: otherPending, allFriends: allFriends})	
	}

	function filterFriends() {
		allUsers = _.difference(allUsers, allFriends)
		allUsers = _.difference(allUsers, selfPending)
		allUsers = _.without(allUsers, req.user.slug)

		allEvents.inc()
	}

	var allUserEvent = new MyEvent(2, function(){filterFriends()}, "Remove non friends from list event")
	User.findAll().done(function(err, allUsersDb){
		// indiscriminately load all users
		_.each(allUsersDb, function(user, index){
			allUsers.push(user['dataValues']['slug'])
		})
		allUserEvent.inc()
	})

	// load all friends BY this user (this person instantiated the friendship)
	thisUser.getFriend().done(function(err, friends){
		var friendEvents = new MyEvent(friends.length, function(){allUserEvent.inc()}, "load friends by this user event")
		_.each(friends, function(friend, index){
			friend = friend['dataValues']
			Friend.findOne({where: {befrienderId: req.user.id, FriendUserId: friend['userid']}}).done(function(err, friendRow){
				var accepted = friendRow['dataValues']['accepted']
				// push into pending, or already added friend based on the accepted field in Friends
				if (accepted == "0") {
					selfPending.push(friend['slug'])
				} else {
					allFriends.push(friend['slug'])
				}
				friendEvents.inc()
			})
		})
	})
	// where: Sequelize.and({name: 'a'}, Sequelize.or({id: [1, 2, 3], id: {lt: 10}}))

	// load all friends TO this user (someone else instantiated the friendship)
	Friend.findAll({where: {FriendUserId: req.user.id}}).done(function(err, friendRows){
		var friendOfEvent = new MyEvent(friendRows.length, function(){allEvents.inc()}, "load friends to this user event")
		_.each(friendRows, function(friendRow, index){
			User.findOne({where: {userid: friendRow['dataValues']['befrienderId']}}).done(function(err, friend){
				console.log(friend['dataValues']['slug'])
				if (friendRow['dataValues']['accepted'] == "0") {
					otherPending.push(friend['dataValues']['slug'])	
				}
				friendOfEvent.inc()
			})
		})	
	})
})

friendRouter.use('/', function(req, res, next){
	// check whether other user even exists
	if (req.body.slug == undefined)
		res.send("Slug must be defined")

	User.findOne({where: {slug: req.body.slug}}).done(function(err, otherUser){
		if (err) {
			res.send(err)
		}
		if (otherUser== null) {
			res.send("User " + req.body.slug + " does not exist ")
		}

		req.user.db2 = otherUser
		next()
	})
})

friendRouter.post('/', function(req, res){
	var thisUser = req.user.db
	var otherUser = req.user.db2
	var rtnjson = {}
	thisUser.hasFriend(otherUser).done(function(err, isFriends){
		if(err) {
			rtnjson.message = err
			rtnjson.success = false
			res.json(rtnjson)
		}

		if (isFriends) {
			rtnjson.message = "You have already sent a request to " + otherUser['dataValues']['slug']
			rtnjson.success = false
			res.json(rtnjson)
		} else {
			thisUser.addFriend([otherUser], {accepted: "0"}).done(function(err, result){
				rtnjson.message = "Successful friend request to " + otherUser['dataValues']['slug']
				rtnjson.success = true 
				res.json(rtnjson)
			})
		}
	})
})

// middleware to check that there is a friends row for both these users
friendRouter.use('/', function(req, res, next) {
	var thisUser = req.user.db
	var otherUser = req.user.db2
	var method = req.method
	var rtnjson = {}

	// this is for accepting friend requests, need to swap the users
	if (method == 'PUT') {
		var swap = thisUser
		thisUser = otherUser
		otherUser = swap
	}

	thisUser.hasFriend(otherUser).done(function(err, isFriends){
		if (!isFriends) {
			rtnjson.success = false
			rtnjson.message = "There is no existing friend request between " + otherUser['dataValues']['slug'] + " and " + thisUser['dataValues']['slug']
			res.send(rtnjson)
		} else {
			next()
		}
	})
})

friendRouter.put('/', function(req, res){
	var thisUser = req.user.db
	var otherUser = req.user.db2
	var rtnjson = {}

	var requester = otherUser['dataValues']
	var requested = thisUser['dataValues']
	Friend.findOne({where: {befrienderId: requester['userid'], FriendUserId: requested['userid']}}).done(function(err, result){
		result.updateAttributes({accepted: "1"})
		rtnjson.message = 'Successfully accepted friend request from ' + req.body.slug
		rtnjson.success = true
		res.send(rtnjson)
	})
})

friendRouter.delete('/', function(req, res){
	var thisUser = req.user.db
	var otherUser = req.user.db2
	var rtnjson = {}

	thisUser.removeFriend(otherUser).done(function(err, result){
		if (err) {
			rtnjson.message = err
			rtnjson.success = false
			res.send(rtnjson)
		} else {
			rtnjson.message = "Successfully removed friend " + req.body.slug
			rtnjson.success = true
			res.send(rtnjson)
		}
	})
});

module.exports = friendRouter