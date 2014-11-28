var Sequelize = require('sequelize')

module.exports = {
	model: {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		recipeName: {type: Sequelize.STRING, allowNull: false},
		yield: {type: Sequelize.STRING},
		ingredientsList: {type: Sequelize.STRING},
		URL: {type: Sequelize.STRING},
		IMG_URL: {type: Sequelize.STRING},
	},
	relations: {
		belongsTo: {
			User: {foreignKey: 'userId', allowNull: false}
		}
	},
	options: {
		tableName: "FavRecipes"
	},
	classMethods: {
		getFavs: function(userid, callback) {
			this.findAll({where: {userId: userid}})
		},
		createFav: function(userid, recipeName, callback) {
			this.create({
				userId: userid,
				recipeName: recipeName
			}).done(callback)
		}
	}
}