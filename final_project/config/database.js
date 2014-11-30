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
		return
	}

	if (!validator.isInt(amountEaten)) {
		callback(new Error("Amount must be an integer"))
		return
	}

	amountEaten = parseInt(amountEaten)
	if (amountEaten < 0) {
		callback(new Error("Amount must be positive"))
		return
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
		customQuery += (' Foods.' + value + ',')
	})
	customQuery += ' ChosenFoods.amount, ChosenFoods.createdAt, (ChosenFoods.amount*Foods.calories) as "Total Calories", ChosenFoods.id as "ChosenFoodId" from ChosenFoods, Foods, Users3 where ChosenFoods.foodid=Foods.id and ChosenFoods.userId=Users3.userid and Users3.userid=' + userid + ' order by ChosenFoods.createdAt'

	this.sequelize.query(customQuery, null, {raw: true}).done(callback)	
}

Database.prototype.getCaloriesByDay = function(userid, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	this.sequelize
	.query(
		'select date(c.createdAt) as "Date", sum(c.amount*f.calories) as "Total Calories" from ChosenFoods c, Foods f where userid=:id and c.foodid = f.id group by date(c.createdat) order by date(c.createdat) desc',
		null,
		{raw: true},
		{id: userid}
	).done(callback)
}



Database.prototype.getFavs = function(userid, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	this.sequelize
	.query(
		'select * from FavRecipes where userid=:id',
		null,
		{raw: true},
		{id: userid}
	).done(callback)
}



// INSERT INTO FavRecipes (recipeName,yield,ingredientsList,URL,IMG_URL) VALUES ("French Onion Soup","6","1 Stick Butter; 4 Whole Large (or 6 Medium) Yellow Onions, Halved Root To Tip, And Sliced Thin; 1 cup (generous) Dry White Wine; 4 cups Low Sodium Chicken Broth; 4 cups Beef Broth; 2 cloves Minced Garlic; Worcestershire Sauce; Several Thick Slices Of French Bread Or Baguette; 5 ounces, weight (to 7 Ounces) Gruyere Cheese, Grated","http://thepioneerwoman.com/cooking/2009/02/french-onion-soup/","http://lh6.ggpht.com/Sn2qCFY3fG8cI71t9BdZ-Jyb9RyPh_0Dg79ii9iRNHhd97yQy5MYg0e9sun3HxY9inRax15XWkBSrQ3RCQGq0A=s360");


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