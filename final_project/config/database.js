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
	customQuery += ' ChosenFoods.amount, ChosenFoods.createdAt, (ChosenFoods.amount*Foods.calories) as "Total Calories", ChosenFoods.id as "ChosenFoodId", Time(ChosenFoods.createdAt) as "Time" from ChosenFoods, Foods, Users3 where ChosenFoods.foodId=Foods.id and ChosenFoods.userId=Users3.userid and Users3.userid=' + userid + ' order by ChosenFoods.createdAt'

	this.sequelize.query(customQuery, null, {raw: true}).done(callback)	
}

Database.prototype.getCaloriesByDay = function(userid, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	this.sequelize
	.query(
		'select date(c.createdAt) as "Date", sum(c.amount*f.calories) as "Total Calories" from ChosenFoods c, Foods f where userid=:id and c.foodId = f.id group by date(c.createdAt) order by date(c.createdAt) desc',
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


Database.prototype.createFav = function(userid, recipeName, yield, ingredientsList, URL, IMG_URL, callback) {
	if (!validator.isInt(userid)) {
		callback(new Error("User id must be an integer"))
	}
	this.sequelize
	.query(
		sprintf('INSERT INTO FavRecipes (userID,recipeName,yield,ingredientsList,URL,IMG_URL) VALUES (%d,"%s","%s","%s","%s","%s");', userid, recipeName, yield, ingredientsList, URL, IMG_URL),
		null,
		{raw: true}
	).done(callback)
}



// INSERT INTO FavRecipes (recipeName,yield,ingredientsList,URL,IMG_URL) VALUES ("French Onion Soup","6","1 Stick Butter; 4 Whole Large (or 6 Medium) Yellow Onions, Halved Root To Tip, And Sliced Thin; 1 cup (generous) Dry White Wine; 4 cups Low Sodium Chicken Broth; 4 cups Beef Broth; 2 cloves Minced Garlic; Worcestershire Sauce; Several Thick Slices Of French Bread Or Baguette; 5 ounces, weight (to 7 Ounces) Gruyere Cheese, Grated","http://thepioneerwoman.com/cooking/2009/02/french-onion-soup/","http://lh6.ggpht.com/Sn2qCFY3fG8cI71t9BdZ-Jyb9RyPh_0Dg79ii9iRNHhd97yQy5MYg0e9sun3HxY9inRax15XWkBSrQ3RCQGq0A=s360");

// time is supposed to be in this format hh:mm:ss
Database.prototype.updateFood = function(userid, foodid, newAmount, timestring, paramdate, callback) {
	var datestring = ""
	// this "workaround" is here because I didn't know Jdatepicker gave this format
	if (paramdate != "") {
		var myDate = paramdate.split('/')
		if (myDate.length != 3) {
			callback(new Error("Invalid date format. Must be in format yyyy/mm/dd "))
			return
		}

		var datestring = myDate[2]+'-'+myDate[0]+'-'+myDate[1]
	}

	var ChosenFood = this.model('ChosenFood')
	var sq = this.sequelize
	var timeArr = timestring.split(':')
	var dateArr = datestring.split('-')
	var yyyy = parseInt(dateArr[0])
	var mm = parseInt(dateArr[1])
	var dd = parseInt(dateArr[2])

	// validate date, time and amount, if they are not empty
	if (timestring != "") {
		if (!Date.validateHour(timeArr[0]) || !Date.validateMinute(timeArr[1]) || !Date.validateSecond(timeArr[2])) {
			callback(new Error("Invalid time format. Must be hh:mm:ss"))
			return
		}
	}

	// yyyy-mm-dd
	// validate day requires dd-yyyy-mm
	if (datestring != "") {
		if (!Date.validateDay(dd, yyyy, mm-1)) {
			callback(new Error("Invalid date format. Must be yyyy/mm/dd"))
			return
		}
		
		try {
			var d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0)
			console.log(d)
			if (Date.compare(d, new Date()) == 1) {
				callback(new Error("Cannot set a date later than today"))
				return
			}
		} catch(err) {
			callback(new Error("Cannot parse date. Must be yyyy/mm/dd"))
			return
		}
	}

	if (newAmount != "") {
		if (!validator.isInt(newAmount)) {
			callback(new Error("Amount must be an integer"))
			return
		}
	}

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

			var myquery = "update ChosenFoods set "

			// if all 3 are empty
			if (newAmount == "" && timestring == "" && datestring == "") {
				callback(new Error("All fields were left empty"))
				return
			} else if (timestring == "" && datestring == "") {
			// if both time and date are empty
				// myquery += ", "
			} else if (timestring == "") {
				// if time is empty
				myquery += sprintf('createdAt="%s", ', datestring)
			} else if (datestring == "") {
				// if date is empty then have to do some mysql magic to keep the old date
				myquery += sprintf('createdAt=concat(date(createdAt), " %s"), ', timestring)
			} else if (timestring != "" && datestring != "") {
				myquery += sprintf('createdAt="%s %s", ', datestring, timestring)
			}

			if (newAmount != "") {
				newAmount = parseInt(newAmount)
				var oldAmount = parseInt(food['dataValues']['amount'])
				newAmount += oldAmount
				if (newAmount < 0) {
					callback(new Error("Cannot change amount to negative value"))
					return
				}
				myquery += sprintf('amount="%s" ', newAmount)
			} else {
				// delete the comma and space if time was the only thing changed
				myquery = myquery.substring(0, myquery.length -2)
			}

			myquery += sprintf(' where id="%s"', foodid)
			console.log(myquery)
			sq.query(
				myquery,
				// sprintf('update hCosenFoods set createdAt=concat(date(createdAt), " %s"), amount="%s" where id="%s"', timestring, newAmount, foodid),
				null,
				{raw: true}
			).done(callback)
		}
	})
}

module.exports = Database