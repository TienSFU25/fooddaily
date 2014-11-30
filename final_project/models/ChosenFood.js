var Sequelize = require('sequelize')
var sprintf = require('sprintf-js').sprintf
var validator = require('validator')

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
			}
		}	
	}
}