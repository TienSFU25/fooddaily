function Database(){}

var sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf
var _ = require('underscore')

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
	satFat: {type: Sequelize.INTEGER},
	totalCarb: {type: Sequelize.INTEGER},
	sugar: {type: Sequelize.INTEGER},
	totalProtein: {type: Sequelize.INTEGER},
	sodium: {type: Sequelize.INTEGER},
	servingQuantity: {type: Sequelize.INTEGER},
	servingUnit: {type: Sequelize.STRING}
}, {
	tableName: "Foods"
})

var ChosenFood = sequelize.define('ChosenFood', {
	id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	amount: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1}
}, {
	timestamps: true,
	tableName: "ChosenFoods",
	classMethods: {
		setTime: function(foodid, daysback, callback) {
			ChosenFood.findOne({where: {foodId: foodid}}).done(function(err, food){
				var createdAt = food['dataValues']['createdAt']
				createdAt.setDate(createdAt.getDate() - daysback)

				food.updateAttributes({
					createdAt: createdAt
				}).done(callback)
			})
		}
	}
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

// adds item in ChosenFoods table
// if item doesn't exist, make it. otherwise, update the table
Database.prototype.eatFood = function f(userid, foodid, amountEaten, callback) {
	amountEaten = parseInt(amountEaten)

	var d = new Date()
	var month = d.getMonth() + 1
	var day = d.getDate()
	var year = d.getFullYear()

	// better way to do this?
	var query = sprintf('select c.id, c.amount from chosenfoods c where c.userid = %s and c.foodid="%s" and day(c.createdat)=%s and month(c.createdat)=%s and year(c.createdat)=%s', userid, foodid, day, month, year)

	sequelize
	.query(
		query,
		null,
		{raw: true}
	).done(function(err, res){
		if (err) {
			console.log(err)
			return
		}
		if (_.isEmpty(res)) {
			ChosenFood.build({
				userId: userid,
				foodId: foodid,
				amount: amountEaten
			})
			.save()
			.done(callback)
		} else {
			var oldAmount = res[0]['amount']
			ChosenFood.findOne({where: {foodId: foodid}}).done(function(err, res) {
				res.updateAttributes({
					amount: oldAmount + amountEaten
				})
			}).done(callback)
		}
	})
}

var dbFields = ['id', 'foodname', 'brandName', 'calories', 'totalFat', 'satFat', 'totalCarb', 'sugar', 'totalProtein', 'sodium', 'servingQuantity', 'servingUnit']
var nutritionixFields = ['item_id', 'item_name', 'brand_name', 'nf_calories', 'nf_total_fat', 'nf_saturated_fat', 'nf_total_carbohydrate', 'nf_sugars', 'nf_protein', 'nf_sodium', 'nf_serving_size_qty', 'nf_serving_size_unit']

Database.prototype.getAllChosenFoods = function f(userid, callback) {
	var customQuery = 'select '
	_.each(dbFields, function(value, index) {
		customQuery += (' foods.' + value + ',')
	})
	customQuery += ' chosenfoods.amount, chosenfoods.createdAt from chosenfoods, foods, user2 where chosenfoods.foodid = foods.id and user2.userid=' + userid + ' order by chosenfoods.createdAt'

	sequelize.query(customQuery, null, {raw: true}).done(callback)	
}


Database.prototype.createFood = function f(nutritionixFood, callback) {
	var myDict = {}
	_.each(dbFields, function(value, index) {
		myDict[value] = nutritionixFood[nutritionixFields[index]]
	})

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

Database.prototype.getAmounts = function f(userid, callback) {
	sequelize
	.query(
		'select c.createdAt, sum(amount) as amount from chosenfoods c where userid=:id group by day(c.createdat)',
		null,
		{raw: true},
		{id: userid}
	).done(callback)
}

Database.prototype.exec = function f(query, callback) {
	sequelize
	.query(
		query,
		null,
		{raw: true}
	).done(callback)
}

module.exports = Database