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
})

var Food = sequelize.define('Food', {
	foodid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	foodname: {type: Sequelize.STRING, allowNull: false},
})

User.hasMany(Food)
// sequelize.sync({force: true})

Database.prototype.createUser = function f(username, password, callback) {
	var instance = User.build({
		username: username,
		password: password,
		description: "some desc"
	})
	.save()

	instance.success(callback)
	instance.error(function(e){console.log(e)})
}

Database.prototype.searchUser = function f(username, callback) {
	User.findOne({where: {username: username}}).success(callback)
}

Database.prototype.addFood = function f(userid, foodname, callback) {
	User.findOne(userid).success(function(user) {
	var f = Food.build({
		foodname: foodname
	})
		user.addFood(f)
	})

	callback()
}

Database.prototype.getAllFoods = function f(userid, callback) {
	User.findOne(userid).success(function(user) {
		user.getFoods().success(callback)
	})
}

Database.prototype.getFood = function f(userid, foodid, callback) {
	User.findOne(userid).success(function(user) {
		user.getFoods({where: {foodid: foodid}}).success(callback)
	})
}

// TODO: Hard coded update food field. change this
Database.prototype.updateFood = function f(userid, foodid, newFoodName, callback) {
	Food.update(
		{foodname: newFoodName}
	,
	{
		where: {
			User2userid: userid,
			foodid: foodid
		}
	}).success(callback)
}

Database.prototype.deleteFood = function f(userid, foodid, callback) {
	User.findOne(userid).success(function(user) {
		user.removeFood(foodid)
		Food.destroy(
		{
			where: {
				User2userid: userid,
				foodid: foodid
			}
		}).success(callback)
	})
}

module.exports = Database