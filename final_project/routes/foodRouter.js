// this class is used for the list page, after a user logs in

var express = require('express')
var _ = require('underscore')
var sprintf = require('sprintf-js').sprintf

foodRouter = express.Router()

var Food = db.model('Food')


var User = db.model('User')
// console.log(_.functions(User))

var c = db.model('ChosenFood')
// console.log(_.functions(c))

// console.log(User.associations)
// User.getFriend({where: {}})
// console.log(c.associations)
// Food.getChosenFoods()

// Food.test()
// var Sequelize = require('sequelize')
// var sequelize = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
// 		host: 'localhost',
// 		dialect: 'mysql',
// 		language: 'en',
// 		timezone: '-08:00',
// 		logging: false
// 	})

// var Person    = sequelize.define('Person', { name: Sequelize.STRING })
// var Pet       = sequelize.define('Pet',    { name: Sequelize.STRING })
// Person.hasMany(Person, {as: 'Brothers'})
// Person.hasMany(Person, {as: 'Sisters'})
// Person.hasOne(Person, {as: 'Father', foreignKey: 'FatherId'})
// Person.hasOne(Person, {as: 'Mother', foreignKey: 'MotherId'})
// Person.hasMany(Pet)

// var chainer = new Sequelize.Utils.QueryChainer
//   , person  = Person.build({ name: 'Luke' })
//   , brother = Person.build({ name: 'Brother' })
//   , brother2 = Person.build({ name: 'Brother' })
//   , brother3 = Person.build({ name: 'Brother' })


// sequelize.sync({force:false}).on('success', function() {
//   chainer
//     .add(person.save())
//     .add(brother.save())
//     .add(brother2.save())
//     .add(brother3.save())
  
//   chainer.run().on('success', function() {
//     person.setBrothers([brother, brother2, brother3]).on('success', function() { person.getBrothers().on('success', function(brothers) {
//        console.log("my brothers: " + brothers.map(function(b) { return b.name }))
//     })})
//   }).on('failure', function(err) {
//     console.log(err)
//   })
// })


// var chainer = new Sequelize.Utils.QueryChainer
// var u1 = db.models['User'].build({
// 					username: '1q',
// 					password: 'p',
// 					firstname: 'f',
// 					lastname: 'l',
// 					slug: 'p2',
// 					description: "some desc"
// 				})

// var u2 = db.models['User'].build({
// 					username: 'u2qq',
// 					password: 'p',
// 					firstname: 'f',
// 					lastname: 'l',
// 					slug: '1',
// 					description: "some desc"
// 				})

// u1.save().success(function(u1){
// 	u2.save().success(function(u2){
// 		db.models['User'].findOne({where: {userid: 1}}).done(function(err, res){
// 		    u1.addFriend([u2], {accepted: 'aeebdc'}).on('success', function(res){console.log(res[0])})
// 		})
// 	})
// })
// db.trySomeShit()


// var t1 = sequelize.define('t1', {name1: Sequelize.STRING})
// var t2 = sequelize.define('t2', {name2: Sequelize.STRING})
// var t3 = sequelize.define('t3', {name3: Sequelize.STRING})

// t1.hasMany(t2, {through: t3, as: 'T2', foreignKey: "t1id"})
// t2.hasMany(t1, {through: t3, as: 'T1', foreignKey: "t2id"})

// // sequelize.sync({force: true})
// // t1.create({name1: 'whatever'})
// // t2.create({name2: 'some t2 name'})

// t1.findOne({where: {id: 1}}).success(function(t1) {
// 	t2.findOne({where: {id: 1}}).success(function(t2) {
// 		t1.addT2([t2], {name3: "SOME SHIT"}).done(function(err, res) {
// 			console.log(err)
// 			console.log(res)
// 		})
// 	})
// })


// var t4 = sequelize.define('t4', {name4: Sequelize.STRING})
// var t5 = sequelize.define('t5', {name5: Sequelize.STRING})

// t4.hasMany(t4, {through: t5, as: 'T4', foreignKey: "t4foreignid"})

// // sequelize.sync({force: true})
// // t4.create({name4: 'asdfasd'})
// // t4.create({name4: 'asdfas1d'})
// // t4.create({name4: 'asdfa23sd'})

// t4.findOne({where: {id: 1}}).success(function(t41) {
// 	t4.findOne({where: {id: 2}}).success(function(t42) {
// 		t41.addT4([t42], {name5: "SOME SHIT"}).done(function(err, res) {
// 			console.log(err)
// 			console.log(res)
// 		})
// 	})
// })

// User.hasMany(User, {through: Friends, as: 'Friend', foreignKey: 'befrienderId'})

// var Friends = db.model('Friends')
// // console.log(Friends)

// chainer.add(u1.save()).add(u2.save())
//  chainer.run().on('success', function() {
//     u1.setFriend([u2]).on('success', function(){})
//       }).on('failure', function(err) {
//     console.log(err)
//   })

// u1.save()
// u2.save()
// u1.addFriend(u2, {UserUserid: 5, befrienderId: 3}).on('success', function(){})
// u1.setFriend([u2], {UserUserid: 3})

// console.log(_.functions(u1))

// u1.createFriend({
// 	username: 'uqqqqqq',
// 	password: 'p',
// 	firstname: 'f',
// 	lastname: 'l',
// 	slug: 'asqqqqq',
// 	description: "some desc",
// 	UserUserid: 1,
// 	FriendUserid: 2
// }).done(function (err, res){
// 	console.log(err)
// })

// User.findOne({where: {userId: 1}}).done(function(err, res) {
// 	console.log(res['dataValues'])
// 	console.log(_.functions(res))
// 	res.createFriend({befrienderId: 2, FriendUserId: 1})
// 	res.getFriend()
// })



// var Friend = db.model('Friends')
// Friend.create({
// 	befrienderId: 1,
// 	FriendUserid: 2
// })

// Friends.build({
// 	befrienderId: 1,
// 	FriendUserid: 1
// }).save()

var nutritionix = require('nutritionix')({
    appId: '065c98a7',
    appKey: 'ac97e296e021c5ea6c0e51389f966307'
}, false).v1_1;

foodRouter.get('/', function(req, response, next) {
	db.getAllChosenFoods(req.user.id, function(err, allFoods) {
		var allRows = []
		var thisRow = []
		var lastDate = (allFoods.length > 0) ? allFoods[0]['createdAt'].toDateString() : ' '
		_.each(allFoods, function(foodDict, index){
			foodDict['createdAt'] = foodDict['createdAt'].toDateString()
			if (foodDict['createdAt'] == lastDate) {
				thisRow.push(_.values(foodDict))
			} else {
				allRows.push(thisRow)
				thisRow = []
				thisRow.push(_.values(foodDict))
				lastDate = foodDict['createdAt']
			}
		})

		allRows.push(thisRow)
		response.render('foods', {user:req.user, chartData: allRows, csrfToken: req.csrfToken()})
		return
	})
})

foodRouter.post('/', function(req, res, next) {
	var id = req.body.chosenFood
	var query = {id: id}
	Food.checkFood(id, function(count) {
		if (count == 0) {
			// query nutritionix and save the food
			nutritionix.item(query, function(err, food) {
				Food.createFood(food, function(err, result) {
					if (err) {
						console.log(err)
						next()
					} else {
						db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
							if (err) {
								console.log(err)
								res.send(500)
							}
							var dataValues = result.dataValues
							var message = sprintf("Successfully added %s %ss of %s", req.body.amount, dataValues['servingUnit'], dataValues['foodname'])
							res.send(message)
						})
					}
				})
			})				
		} else {
			// regardless, save eating food information to ChosenFoods
			Food.findOne({where: {id: id}}).done(function (err, food) {
				db.eatFood(req.user.id, id, req.body.amount, function(err, r) {
					if (err) {
						console.log(err)
						res.send(500)
					}
					var dataValues = food.dataValues
					var message = sprintf("Successfully added %s %ss of %s", req.body.amount, dataValues['servingUnit'], dataValues['foodname'])
					res.send(message)
				})
			})
		}
	})
})

foodRouter.put('/', function(req, res, next){
	console.log(req.body)
	var ChosenFood = db.model('ChosenFood')
	ChosenFood.updateFood(req.user.id, req.body.chosenFoodId, req.body.amount, function(err, food){
		if (err) {
			res.send(err.message)
		} else {
			res.send(food['dataValues'])
		}
	})
})

module.exports = foodRouter
