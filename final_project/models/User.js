var Sequelize = require('sequelize')

module.exports = {
	model: {
		userid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		username: {type: Sequelize.STRING, allowNull: false, unique: true},
		password: {type: Sequelize.STRING, allowNull: true},
		slug: {type: Sequelize.STRING, allowNull: false, unique: true},
		facebookId: {type: Sequelize.STRING, defaultValue: null},
		diet: {type: Sequelize.ENUM('none', 'vegan', 'vege', 'lacto_vege', 'ovo_vege', 'pesc', 'ovo_pesc', 'lacto_pesc', 'paleo'), defaultValue: 'none'},
		dairy: {type: Sequelize.BOOLEAN, defaultValue: false},
		eggs: {type: Sequelize.BOOLEAN, defaultValue: false},
		gluten: {type: Sequelize.BOOLEAN, defaultValue: false},
		peanut: {type: Sequelize.BOOLEAN, defaultValue: false},
		seafood: {type: Sequelize.BOOLEAN,defaultValue: false},
		sesame: {type: Sequelize.BOOLEAN, defaultValue: false},
		soy: {type: Sequelize.BOOLEAN, defaultValue: false},
		sulfite: {type: Sequelize.BOOLEAN, defaultValue: false},
		treeNut: {type: Sequelize.BOOLEAN, defaultValue: false},
		wheat: {type: Sequelize.BOOLEAN, defaultValue: false},
	},
	relations: {
		hasMany: {
			FavRecipes: {foreignKey: "userId", allowNull: false}
		},
	},
	options: {
		tableName: "Users3",
		classMethods: {
			createUser: function(username, password, slug, callback) {
				this.build({
					username: username,
					password: password,
					slug: slug
				})
				.save()
				.done(callback)
			}
		}
	}
}