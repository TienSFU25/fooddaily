var Sequelize = require('sequelize')
var _ = require('underscore')
var config = require('../config/nutritionix')

module.exports = {
	model: config,
	relations: {
		hasMany: {
			ChosenFood: {foreignKey: "foodId", allowNull: false}
		}
	},
	options: {
		tableName: "Foods",
		classMethods: {
			createFood: function(nutritionixFood, callback) {
				var Food = this
				var dbFields = _.keys(config)
				var nutritionixFields = _.pluck(config, 'nutritionix')
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
			},
			checkFood: function(foodid, callback) {
				this.count({where: {id: foodid}}).success(callback)
			}
		}
	}
}
