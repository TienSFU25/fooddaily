function Database(){}

var Sequelize = require('sequelize')
var sequelize = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
	host: 'localhost',
	dialect: 'mysql',
	language: 'en',
	logging: false
})

var User = sequelize.define('User2', {
	userid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	username: {type: Sequelize.STRING, allowNull: false, unique: true},
	password: {type: Sequelize.STRING, allowNull: false},
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
	type: {type: Sequelize.INTEGER, allowNull: false},	
}, {
	tableName: "Foods"
})

var ChosenFood = sequelize.define('ChosenFood', {
	timesEaten: {type: Sequelize.INTEGER, default: 1}
}, {
	tableName: "ChosenFoods"
})

User.hasMany(Food, {through: ChosenFood, foreignKey: "userId"})
Food.hasMany(User, {through: ChosenFood, foreignKey: "foodId"})


// do not uncomment this unless you want to change the schema
// db and all tables will be reset
// sequelize.sync({force: true})

// callback = Promise<this|Errors.ValidationError>
Database.prototype.createUser = function f(username, password, callback) {
	User.build({
		username: username,
		password: password,
		description: "some desc"
	})
	.save()
	.done(callback)
}

// callback = Promise<Instance>
Database.prototype.searchUser = function f(username, callback) {
	User.findOne({where: {username: username}}).done(callback)
}

// helper functions
function buildFood(foodDict) {
	var f = {}
	f['id'] = foodDict['_id']
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

// callback = (err)
Database.prototype.addFood = function f(userid, foodDict, callback) {
	var food = buildFood(foodDict);
	user = findUserAndCb(userid, function(user){
		user.createFood(food).done(callback)
	});
}

// callback = (err, result)
Database.prototype.getAllFoods = function f(userid, callback) {
	findUserAndCb(userid, function(user){
		user.getFoods().done(callback)
	})
}

// callback = (err, result)
Database.prototype.getFood = function f(userid, foodid, callback) {
	findUserAndCb(userid, function(user){
		user.getFoods({where: {id: foodid}}).done(callback)
	})
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