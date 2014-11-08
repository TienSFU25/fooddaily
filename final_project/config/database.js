var mysql = require('mysql')
var sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf

function Database() {
	this.connection = mysql.createConnection({
		host: 'localhost',
		user: 'group',
		password: 'thisgrouprocks',
		database: 'groupdb'
	})
}

var userTableName = 'users'
var historyTableName = 'historylist'

Database.prototype.searchUser = function f(username, callback) {
	query = sprintf('select * from %s where username = "%s";', userTableName, username)
	this.connection.query(query, callback)
}

Database.prototype.createUser = function f(username, password, callback) {
	query = sprintf('insert into %s(username, password) values("%s", "%s");', userTableName, username, password)
	this.connection.query(query, callback)
}

Database.prototype.addFood = function f(userid, foodname, callback) {
	query = sprintf('insert into %s(userid, foodname) values(%s, "%s");', historyTableName, userid, foodname)
	this.connection.query(query, callback)
}

Database.prototype.getAllFoods = function f(userid, callback) {
	query = sprintf('select * from %s where userid = %s;', historyTableName, userid)
	this.connection.query(query, callback)
}

Database.prototype.getFood = function f(userid, foodid, callback) {
	query = sprintf('select * from %s where userid=%s and foodid=%s;', historyTableName, userid, foodid)
	this.connection.query(query, callback)
}

Database.prototype.updateFood = function f(userid, foodid, newFoodName, callback) {
	query = sprintf('update %s set foodname="%s" where userid=%s and foodid=%s;', historyTableName, newFoodName, userid, foodid)
	this.connection.query(query, callback)
}

Database.prototype.deleteFood = function f(userid, foodid, callback) {
	query = sprintf('delete from %s where userid=%s and foodid=%s;', historyTableName, userid, foodid)
	this.connection.query(query, callback)
}

module.exports = Database
