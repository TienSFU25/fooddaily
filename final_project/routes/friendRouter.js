var express = require('express')
var events = require('events')
var _ = require('underscore')

var friendRouter = express.Router()
var User = db.model('User')
var Friend = db.model('Friends')
var MyEvent = require('../custom/MyEvent')
var MyLogger = require('../custom/MyLogger')
var myLogger = new MyLogger('friendsLog')

// this user has already been authenticated, pass in the DB model to the next middlewares
friendRouter.use('/', function(req, res, next){
	myLogger.start()
	User.findOne({where: {userid: req.user.id}}).done(function(err, user){
		myLogger.log("User " + user['dataValues']['slug'] + " is viewing the friends page")
		req.user.db = user
		next()
	})
})

friendRouter.get('/:slug', function(req, res){
	myLogger.log("User attempting to view dashboard of " + req.params.slug)
	var thisUser = req.user.db
	var otherUserSlug = req.params.slug
	User.findOne({where: {slug: otherUserSlug}}).done(function(err, otherUser){
		if (err) {
			res.send(err)
		} else if (otherUser == null) {
			var msg = "User " + otherUserSlug + " does not exist"
			myLogger.log(msg)
			res.json({success: false, message: msg})
		} else {
			thisUser.hasFriend(otherUser).done(function(err, isFriend){
				if (!isFriend) {
					// no entry in the friends table
					myLogger.log("There is no friends entry between this user and " + otherUserSlug )
					res.send("You have not received a friend request from " + otherUserSlug)
				} else {
					var otherUserId = otherUser['dataValues']['userid']
					Friend.findOne({where: {befrienderId: req.user.id, FriendUserid: otherUserId}}).done(function(err, friendRow){
						if (err) {
							res.send(err)
						}
						// there is a pending request
						if (friendRow['dataValues']['accepted'] == "0") {
							myLogger.log("Pending request")
							res.send(otherUserSlug + " must approve your friend request before you can view their dashboard")
						} else {
							// there is an entry in the friends table and "accepted" is set to 1
							myLogger.log("Authorized to view dashboard")
							db.getCaloriesByDay(otherUserId, function(err, result){
								if (err) {
									res.json(err)
								} else {
									var rr = [[]]
									if (!_.isEmpty(result)) {
										var keys = _.keys(result[0])
										var createds = _.pluck(result, keys[0])
										createds = _.map(createds, function(val, index){
											return val.toDateString()
										})
										var amounts = _.pluck(result, keys[1])
										rr = _.zip(createds, amounts)
									}
									db.getLatestFoods(otherUserSlug, function(err, latestFoods) {
										if (err) {
											res.json({success: false, message: "Error in getting latest foods for " + otherUserSlug, err: err})
										} else {
											_.each(latestFoods, function(food, key){
												food['createdAt'] = food['createdAt'].toFormat("DDD MMM-DD-YYYY HH24:MI:SS")
											})

											res.render('dashFriend', {user: req.user, chartData: rr, otherUser: otherUserSlug, latestFoods: latestFoods})
										}
									})
								}
							})
						}
					})
				}
			})			
		}
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
		myLogger.log("All users:" + allUsers)
		myLogger.log("Self pending:" + selfPending)		
		myLogger.log("Other pending:" + otherPending)
		myLogger.log("All friends:" + allFriends)
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
	var rtnjson = {}

	if (req.body.slug == undefined || req.body.slug == null) {
		rtnjson.success = false
		rtnjson.message = "Slug field must be defined"
		res.json(rtnjson)
	} else if (req.body.slug == "") {
		rtnjson.success = false
		rtnjson.message = "Slug cannot be empty"
	} else {
		User.findOne({where: {slug: req.body.slug}}).done(function(err, otherUser){
			if (err) {
				myLogger.log("Sequelize error in use '/'")
				rtnjson.success = false
				rtnjson.message = "Sequelize error in friend router"
				res.json(rtnjson)
			} else if (otherUser== null) {
				myLogger.log("User with slug " + req.body.slug + "does not exist")
				rtnjson.success = false
				rtnjson.message = "Cannot find user with the slug " + req.body.slug
				res.json(rtnjson)
			} else {
				req.user.db2 = otherUser
				next()
			}
		})
	}
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
			myLogger.log("Friend request already sent to " + otherUser['dataValues']['slug'])
			rtnjson.message = "You have already sent a request to " + otherUser['dataValues']['slug']
			rtnjson.success = false
			res.json(rtnjson)
		} else {
			thisUser.addFriend([otherUser], {accepted: "0"}).done(function(err, result){
				rtnjson.message = "Successful friend request to " + otherUser['dataValues']['slug']
				myLogger.log(rtnjson.message)
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
			myLogger.log(rtnjson.message)
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
		myLogger.log(rtnjson.message)
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
			myLogger.log("Error in removing friend " + req.body.slug)
			rtnjson.message = err
			rtnjson.success = false
			res.send(rtnjson)
		} else {
			rtnjson.message = "Successfully removed friend " + req.body.slug
			myLogger.log(rtnjson.message)
			rtnjson.success = true
			res.send(rtnjson)
		}
	})
});

module.exports = friendRouter