var Sequelize = require('sequelize')

module.exports = {
	model: {
		userid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		username: {type: Sequelize.STRING, allowNull: false, unique: true},
		password: {type: Sequelize.STRING, allowNull: false},
		firstname: {type: Sequelize.STRING, allowNull: false},
		lastname: {type: Sequelize.STRING, allowNull: false},
		slug: {type: Sequelize.STRING, allowNull: false, unique: true},
		description: {type: Sequelize.STRING}
	},
	relations: {
		// hasMany: {
			// ChosenFood: {foreignKey: "userId", allowNull: false}
			// User: {through: 'Friends', as: 'Friend', foreignKey: 'befrienderId'}
			// Friends: {foreignKey: "userId", allowNull: false}
		// },
	},
	options: {
		tableName: "Users3",
		classMethods: {
			createUser: function(username, password, firstname, lastname, slug, callback) {
				this.build({
					username: username,
					password: password,
					firstname: firstname,
					lastname: lastname,
					slug: slug,
					description: "some desc"
				})
				.save()
				.done(callback)
			}
		}
	}
}