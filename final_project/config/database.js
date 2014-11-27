var fs = require('fs')
var _ = require('underscore')
var Sequelize = require('sequelize')

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
}

Database.prototype.model = function(modelName) {
	return this.models[modelName]
}

Database.prototype.sync = function(force) {
	return this.sequelize.sync({force: force})
}

Database.prototype.eatFood = function(userid, foodid, amountEaten, callback) {
	amountEaten = parseInt(amountEaten)

	var d = new Date()
	var month = d.getMonth() + 1
	var day = d.getDate()
	var year = d.getFullYear()
	var ChosenFood = this['models']['ChosenFood']
	var sprintf = require('sprintf-js').sprintf

	// better way to do this?
	var query = sprintf('select c.id, c.amount from chosenfoods c where c.userid = %s and c.foodid="%s" and day(c.createdat)=%s and month(c.createdat)=%s and year(c.createdat)=%s', userid, foodid, day, month, year)

	this.sequelize
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

// these methods require joining tables, and still have to be here
Database.prototype.getAllChosenFoods = function(userid, callback) {
	var customQuery = 'select '
	var dbFields = _.keys(require('./nutritionix'))

	_.each(dbFields, function(value, index) {
		customQuery += (' foods.' + value + ',')
	})
	customQuery += ' chosenfoods.amount, chosenfoods.createdAt, (chosenfoods.amount*foods.calories) as "Total Calories", chosenfoods.id as "ChosenFoodId" from chosenfoods, foods, user2 where chosenfoods.foodid = foods.id and user2.userid=' + userid + ' order by chosenfoods.createdAt'

	this.sequelize.query(customQuery, null, {raw: true}).done(callback)	
}

Database.prototype.getCaloriesByDay = function(userid, callback) {
	this.sequelize
	.query(
		'select date(c.createdAt) as "Date", sum(c.amount*f.calories) as "Total Calories" from chosenfoods c, foods f where userid=:id and c.foodid = f.id group by date(c.createdat)',
		null,
		{raw: true},
		{id: userid}
	).done(callback)
}

Database.prototype.exec = function(query, callback) {
	sequelize
	.query(
		query,
		null,
		{raw: true}
	).done(callback)
}

module.exports = Database