var Sequelize = require('Sequelize')

module.exports = {
	id: {
		type: Sequelize.STRING, 
		primaryKey: true,
		nutritionix: 'item_id'
	}, 
	foodname: {
		type: Sequelize.STRING, 
		allowNull: false,
		nutritionix: 'item_name'
	},
	brandName: {
		type: Sequelize.STRING, 
		allowNull: false,
		nutritionix:'brand_name'
	}, 
	calories: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_calories'
	},
	fat: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_total_fat'
	},
	satFat: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_saturated_fat'
	},
	totalCarb: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_total_carbohydrate'
	},
	sugar: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_sugars'
	},
	totalProtein: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_protein'
	},
	fiber: {
    	type: Sequelize.INTEGER,
    	nutritionix:'nf_dietary_fiber'
  	},
	sodium: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_sodium'
	},
	servingQuantity: {
		type: Sequelize.INTEGER,
		nutritionix:'nf_serving_size_qty'
	},
	servingUnit: {
		type: Sequelize.STRING,
		nutritionix:'nf_serving_size_unit'
	}
}