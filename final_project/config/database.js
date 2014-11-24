function Database(){}

var Sequelize = require('sequelize')
var sequelize = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
	host: 'localhost',
	dialect: 'mysql',
	language: 'en',
	timezone: '-08:00',
	// logging: false
})

var User = sequelize.define('User2', {
	userid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	username: {type: Sequelize.STRING, allowNull: false, unique: true},
	password: {type: Sequelize.STRING, allowNull: false},
	firstname: {type: Sequelize.STRING, allowNull: false},
	lastname: {type: Sequelize.STRING, allowNull: false},
	slug: {type: Sequelize.STRING, allowNull: false, unique: true},
	description: {type: Sequelize.STRING}
}, {
	tableName: "User2"
})

var Food = sequelize.define('Food', {
	id: {type: Sequelize.STRING, primaryKey: true},
	foodname: {type: Sequelize.STRING, allowNull: false},
	brandName: {type: Sequelize.STRING, allowNull: false},
	calories: {type: Sequelize.INTEGER},
	totalFat: {type: Sequelize.INTEGER},
	totalCarb: {type: Sequelize.INTEGER},
	totalProtein: {type: Sequelize.INTEGER},
	sodium: {type: Sequelize.INTEGER},
	type: {type: Sequelize.INTEGER},	
}, {
	tableName: "Foods"
})

var ChosenFood = sequelize.define('ChosenFood', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	amount: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1},
	myDate: {type: Sequelize.STRING, allowNull: false}
}, {
	timestamps: true,
	tableName: "ChosenFoods"
})

User.hasMany(ChosenFood, {allowNull:false, foreignKey: "userId"});
Food.hasMany(ChosenFood, {allowNull:false, foreignKey: "foodId"});

var FavRecipe = sequelize.define('FavRecipe', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	recipeName: {type: Sequelize.STRING, allowNull: false},
	yield: {type: Sequelize.STRING},
	ingredientsList: {type: Sequelize.STRING},
	URL: {type: Sequelize.STRING},
	IMG_URL: {type: Sequelize.STRING},
}, {
	tableName: "FavRecipes"
})

User.hasMany(FavRecipe, {allowNull: false, foreignKey: "userId"})

Database.prototype.getFavs = function f(userid, callback) {
	User.getFavRecipes({where: {userId: userid}}).done(callback)
}

Database.prototype.createFav = function f(userid, recipeName, callback) {
	FavRecipe.create({
		userId: userid,
		recipeName: recipeName
	}).done(callback)
}

// FavRecipe.sync()
// ChosenFood.sync({force: true});
// Food.sync({force: true})

// adds item in ChosenFoods table
// if item doesn't exist, make it. otherwise, update the table
Database.prototype.eatFood = function f(userid, foodid, amountEaten, callback) {
	amountEaten = parseInt(amountEaten)

	// store just the first part of the date as a string
	// too much work dealing with javascript dates
	var now = new Date().toString()
	var arr = now.split(" ")

	// arr[2] -= 1

	var myDate = ""
	for (var i = 0; i < 4; i++) {
		myDate += arr[i] + " "
	}

	ChosenFood.findOne({
		where: ['userid = ? AND foodId = ? AND myDate = ?', userid, foodid, myDate]
	})
	.done(function(err, res){
		if (err) {
			console.log(err)
			return
		}

		if (res == null) {
			ChosenFood.build({
				userId: userid,
				foodId: foodid,
				amount: amountEaten,
				myDate: myDate
			})
			.save()
			.done(callback)
		} else {
			var oldAmount = res.getDataValue('amount')
			res.setDataValue('amount', oldAmount + amountEaten)
			res.save().done(callback)
		}
	})
}

Database.prototype.createFood = function f(foodDict, callback) {
	var myDict = buildFood(foodDict)
	this.checkFood(myDict['id'], function(count){
		if (count == 0)
			Food.create(myDict).done(callback)

		else {
			console.log("Food id " + myDict['id'] + " already exists ")
			callback()
		}
	})
}

// helper function, check if food already in db
Database.prototype.checkFood = function f(foodid, callback) {
	Food.count({where: {id: foodid}}).success(callback)
}

// do not uncomment this unless you want to change the schema
// db and all tables will be reset
// sequelize.sync({force: true})

// callback = Promise<this|Errors.ValidationError>
Database.prototype.createUser = function f(username, password, firstname, lastname, slug, callback) {
	User.build({
		username: username,
		password: password,
		firstname: firstname,
		lastname: lastname,
		slug: slug,
		description: "some desc"
	})
	.save()
	.done(callback)
}

// callback = Promise<Instance>
Database.prototype.searchUser = function f(userid, callback) {
	User.findOne({where: {userid: userid}}).done(callback)
}

Database.prototype.searchUserByName = function f(username, callback) {
	User.findOne({where: {username: username}}).done(callback)
}

Database.prototype.searchUserBySlug = function f(slug, callback) {
	User.findOne({where: {slug: slug}}).done(callback)
}

Database.prototype.countUserByName = function f(username, callback) {
	User.count({where: {username: username}}).success(callback)
}

Database.prototype.searchAllSlugs = function f(callback) {
	User.findAll({attributes: ['slug']}).done(callback)
}

// helper functions
// TODO. change this function, returning a dict is ugly. use Food.build() and call save() instead
function buildFood(foodDict) {
	var f = {}
	f['id'] = foodDict['item_id']
	f['foodname'] = foodDict['item_name'],
	f['brandName'] = foodDict['brand_name'],
	f['calories'] = foodDict['nf_calories'],
	f['totalFat'] = foodDict['nf_total_fat'],
	f['totalCarb'] = foodDict['nf_total_carbohydrate'],
	f['totalProtein'] = foodDict['nf_protein'],
	f['sodium'] = foodDict['nf_sodium'],
	f['type'] = foodDict['item_type']

	return f;
}

// find a user by id and perform the callback function on the user
// this is here because finding user before doing something else (i.e add a food) is very common
// callback only happens if no errors and a user is found

function findUserAndCb(userid, callback) {
	User.findOne(userid).done(function(err, user) {
		if (err) {
			console.log(err)
			return
		}

		if (!user){
			console.log("User with id " + userid + " does not exist")
			return
		}

		callback(user)
	})
}

// callback = (err, result)
Database.prototype.getAllFoods = function f(userid, callback) {
	ChosenFood.findAll({where: {userId: userid}, order: 'myDate desc'}).done(callback)
}

Database.prototype.fixFood = function f(chosenfoodid, days, callback) {
	ChosenFood.findOne(chosenfoodid).done(function(err, food) {
		var myDate = food['dataValues']['myDate']
		var arr = myDate.split(' ')
		arr[2] = parseInt(arr[2]) - days
		myDate = ''
		for (var i = 0; i < arr.length; i++) {
			myDate += (arr[i] + ' ') 
		}

		ChosenFood.update({
			myDate: myDate
		}, {
			where: {
				id: chosenfoodid
			}
		})
	}).done(callback)
}

Database.prototype.getFoodsInArray = function f(arr, callback) {
	Food.findAll({where: {id: arr}}).done(callback)
}

// callback = (err, result)
Database.prototype.deleteFood = function f(foodid, callback) {
	Food.destroy(
	{
		where: {
			id: foodid
		}
	}).done(callback)
}

module.exports = Database