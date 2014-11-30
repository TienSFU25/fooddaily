var foodTableOptions = {
  id: {
    type: 'string',
    hidden: true,
    display: ''
  }, 
  foodname: {
    type: 'string',
    hidden: false,
    display: 'Item'
  },
  brandName: {
    type: 'string',
    hidden: false,
    display: 'Brand'
  }, 
  calories: {
    type: 'number',
    hidden: false,
    display: 'Calories'
  },   
  totalFat: {
    type: 'number',
    hidden: true,
    display: 'Fats(g)'
  }, 
  satFat: {
    type: 'number',
    hidden: true,
    display: 'Saturated Fats(g)'
  }, 
  totalCarb: {
    type: 'number',
    hidden: true,
    display: 'Carbohydrates(g)'
  }, 
  sugar: {
    type: 'number',
    hidden: true,
    display: 'Sugar(g)'
  }, 
  totalProtein: {
    type: 'number',
    hidden: true,
    display: 'Protein(g)'
  },
  fiber: {
    type: 'number',
    hidden: true,
    display: 'Fiber'
  }, 
  sodium: {
    type: 'number',
    hidden: true,
    display: 'Sodium(ml)'
  }, 
  servingQuantity: {
    type: 'number',
    hidden: false,
    display: 'Serving Quantity'
  }, 
  servingUnit: {
    type: 'string',
    hidden: false, 
    display: 'Serving Unit'
  }, 
  amount: {
    type: 'number',
    hidden: false,
    display: 'Amount'
  }, 
  createdAt: {
    type: 'string',
    hidden: true,
    display: ''
  }, 
  totalCalories: {
    type: 'number',
    hidden: false,
    display: 'Total Calories'
  },
  chosenFoodId: {
    type: 'number',
    hidden: true,
    display: 'ChosenFoodId'
  },
  timeCreated: {
    type: 'string',
    hidden: false,
    display: 'Time entered'
  }
}

var fields = _.keys(foodTableOptions)

var nutrition = {
  totalFat: "Fats",
  totalCarb: "Carbohydrates",
  totalProtein: "Proteins"
}

var formTableOptions = {
  foodname: {
    type: 'string',
    hidden: false,
    display: 'Item'
  },
  brandName: {
    type: 'string',
    hidden: false,
    display: 'Brand'
  }, 
  satFat: {
    type: 'number',
    hidden: false,
    display: 'Saturated Fats(g)'
  }, 
  sugar: {
    type: 'number',
    hidden: false,
    display: 'Sugar(g)'
  }, 
  fiber: {
    type: 'number',
    hidden: false,
    display: 'Fiber'
  }, 
  sodium: {
    type: 'number',
    hidden: false,
    display: 'Sodium(ml)'
  }
}