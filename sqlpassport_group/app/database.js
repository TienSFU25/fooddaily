// class for handling database connections
// TODO: escape these queries, they are all plain text
// Schema: users(username, password) and todolist(listid, userid, content)

var mysql = require('mysql')
var sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf

function Database() {
	this.connection = mysql.createConnection({
		host: 'localhost',
		user: 'tien',
		password: 'pass',
		database: 'tiendb'
	})
}

var userTableName = 'users'
var listTableName = 'todolist'

Database.prototype.searchUser = function f(username, callback) {
	query = sprintf('select * from %s u where u.name = "%s"', userTableName, username)
	this.connection.query(query, callback)
}

Database.prototype.createUser = function f(username, password, callback) {
	query = sprintf('insert into %s(name, password) values("%s", "%s");', userTableName, username, password)
	this.connection.query(query, callback)
}

Database.prototype.searchList = function f(userid, callback) {
	query = sprintf('select * from %s where userid=%s;', listTableName, userid)
	this.connection.query(query, callback)
}

Database.prototype.addListItem = function f(userid, content, callback) {
	query = sprintf('insert into %s(userid, content) values(%s, "%s");', listTableName, userid, content)
	this.connection.query(query, callback)
}

Database.prototype.deleteListItem = function f(listid, callback) {
	query = sprintf('delete from %s where id=%s;', listTableName, listid)
	this.connection.query(query, callback)
}

Database.prototype.updateListItem = function f(listid, content, callback) {
	query = sprintf('update %s set content="%s" where id=%s;', listTableName, content, listid)
	this.connection.query(query, callback)
}

module.exports = Database
