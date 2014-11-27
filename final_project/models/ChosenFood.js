var Sequelize = require('sequelize')
var sprintf = require('sprintf-js').sprintf

module.exports = {
	model: {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		amount: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1}
	},
	relations: {
		belongsTo: {
			User: {foreignKey: 'userId', allowNull: false}
		}
	},
	options: {
		timestamps: true,
		tableName: "ChosenFoods",
		classMethods: {
			setTime: function(id, daysback, callback) {
				this.findOne({where: {id: id}}).done(function(err, food){
					var createdAt = food['dataValues']['createdAt']
					createdAt.setDate(createdAt.getDate() - daysback)

					food.updateAttributes({
						createdAt: createdAt
					}).done(callback)
				})
			},
			updateFood: function(userid, foodid, newAmount, callback) {
				newAmount = parseInt(newAmount)
				this.findOne(
					{where: {
						userId: userid,
						id: foodid	
					}}
				).done(function(err, food){
					if (!food) {
						callback(new Error(sprintf("Food id %s with userid %s does not exist", foodid, userid)))
						return false
					} else {
						var oldAmount = parseInt(food['dataValues']['amount'])
						newAmount += oldAmount
						if (newAmount < 0) {
							callback(new Error("Cannot change amount to negative value"))
							return false
						}
						food.updateAttributes({
							amount: newAmount
						}).done(callback)
					}
				})
			}
		}	
	}
}