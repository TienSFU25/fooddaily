var fs = require('fs')
var _ = require('underscore')
var Sequelize = require('sequelize')
var sprintf = require('sprintf-js').sprintf
var validator = require('validator')

var Database = function singleton(path){
	var sq = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
		host: 'localhost',
		dialect: 'mysql',
		language: 'en',
		timezone: '-08:00',
		logging: false
	})

	var models = {}
	this.models = models
	this.sequelize = sq

	var allModelRelationships = {}
	fs.readdirSync(path).forEach(function(fileName) {
		if (fileName[0] != '.') {	
			fileName = fileName.replace(/\.js$/i, "")
			var modelFile = require('.'+path+'/'+fileName)

			var model = modelFile.model
			var options = modelFile.options

			models[fileName] = sq.define(fileName, model, options)

			if (_.has(modelFile, 'relations')) {
				allModelRelationships[fileName] = modelFile['relations']
			}
		}
	})
	_.each(allModelRelationships, function(oneModelRelationships, modelName, list){
		//one model relations looks like this
		// {
		// hasMany: {
		// 	Test3: {foreignKey: "test2id", allowNull: false}
		// }, 
		// hasOne: {
		// Test3: {...}
		// }
		// modelName = "Test1"	

		_.each(oneModelRelationships, function(relationship, relationshipName, list) {
			// relationship = {Test3: {foreignKey: "test2id", allowNull: false}}
			// relationshipName = hasMany
			// _.key(relation), _.values(relation)
			//models[key].hasMany(Test3, options)
			var reference = _.keys(relationship)[0]
			var options = _.values(relationship)[0]

			models[modelName][relationshipName](models[reference], options)
		})
	})

	// can't add this to /models, User will not know about the Model
	var Friends = this.sequelize.define('Friends', { accepted: Sequelize.STRING })
	var User = this.models['User']
	User.hasMany(User, {through: Friends, as: 'Friend', foreignKey: 'befrienderId'})
	this.models['User'] = User
	this.models['Friends'] = Friends
}

Database.prototype.model = function(modelName) {
	return this.models[modelName]
}

Database.prototype.sync = function(force) {
	this.sequelize.sync({force: force}).done(function(err, res){})
}

Database.prototype.eatFood = function(userid, foodid, amountEaten, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}

	if (!validator.isInt(foodid)) {
		callback(new Error("Food id must be an integer"))
	}

	if (!validator.isInt(amountEaten)) {
		callback(new Error("Amount must be an integer"))
	}

	amountEaten = parseInt(amountEaten)
	if (amountEaten < 0) {
		callback(new Error("Amount must be positive"))
	}
	var ChosenFood = this.model('ChosenFood')
	ChosenFood.findOne({where: {userId: userid, foodId: foodid}}).done(function(err, chosenFood){
		if (err) {
			callback(err)
		} else {
			ChosenFood.create({
				userId: userid,
				foodId: foodid,
				amount: amountEaten
			}).done(callback)
		}
	})
}

// these methods require joining tables, and still have to be here
Database.prototype.getAllChosenFoods = function(userid, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	var customQuery = 'select'
	var dbFields = _.keys(require('./nutritionix'))

	_.each(dbFields, function(value, index) {
		customQuery += (' foods.' + value + ',')
	})
	customQuery += ' chosenfoods.amount, chosenfoods.createdAt, (chosenfoods.amount*foods.calories) as "Total Calories", chosenfoods.id as "ChosenFoodId" from chosenfoods, foods, users3 where chosenfoods.foodid=foods.id and chosenfoods.userId=users3.userid and users3.userid=' + userid + ' order by chosenfoods.createdAt'

	this.sequelize.query(customQuery, null, {raw: true}).done(callback)	
}

Database.prototype.getCaloriesByDay = function(userid, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	this.sequelize
	.query(
		'select date(c.createdAt) as "Date", sum(c.amount*f.calories) as "Total Calories" from chosenfoods c, foods f where userid=:id and c.foodid = f.id group by date(c.createdat) order by date(c.createdat) desc',
		null,
		{raw: true},
		{id: userid}
	).done(callback)
}

// time is supposed to be in this format hh:mm:ss
Database.prototype.updateFood = function(userid, foodid, newAmount, timestring, callback) {
	var ChosenFood = this.model('ChosenFood')
	var sq = this.sequelize
	var arr = timestring.split(':')
	if (!Date.validateHour(arr[0]) || !Date.validateMinute(arr[1]) || !Date.validateSecond(arr[2])) {
		callback(new Error("Invalid date format. Must be hh:mm:ss"))
		return
	}

	if (!validator.isInt(newAmount)) {
		callback(new Error("Amount is not an integer"))
		return
	}

	newAmount = parseInt(newAmount)
	// only this user can change the food
	ChosenFood.findOne(
		{where: {
			userId: userid,
			id: foodid	
		}}
	).done(function(err, food){
		if (!food) {
			callback(new Error(sprintf("Food id %s with userid %s does not exist", foodid, userid)))
			return
		} else {
			var oldAmount = parseInt(food['dataValues']['amount'])
			newAmount += oldAmount
			if (newAmount < 0) {
				callback(new Error("Cannot change amount to negative value"))
				return
			}
			sq.query(
				sprintf('update ChosenFoods set createdAt=concat(date(createdAt), " %s"), amount="%s" where id="%s"', timestring, newAmount, foodid),
				null,
				{raw: true}
			).done(callback)
		}
	})
}

module.exports = Database