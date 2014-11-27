var Sequelize = require('sequelize')

module.exports = {
	model: {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true}
	},
	relations: {},
	options: {}
}