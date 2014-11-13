function Database(){}

var Sequelize = require('sequelize')
var sequelize = new Sequelize('groupdb', 'group', 'thisgrouprocks', {
	host: 'localhost',
	dialect: 'mysql',
	language: 'en',
	// logging: false
})

var User = sequelize.define('User2', {
	userid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
	username: {type: Sequelize.STRING, allowNull: false},
	password: {type: Sequelize.STRING, allowNull: false},
	description: {type: Sequelize.STRING}
})

// sequelize.sync({force: true})

Database.prototype.createUser = function f(username, password, callback) {
	User.build({
		username: username,
		password: password,
		description: "some desc"
	})
	.save()
	.success(callback)
}

Database.prototype.searchUser = function f(username, callback) {
	User.findOne({where: {username: username}}).success(callback)
}

module.exports = Database
