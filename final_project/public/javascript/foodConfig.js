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
    hidden: false,
    display: 'Fats(g)'
  }, 
  satFat: {
    type: 'number',
    hidden: false,
    display: 'Saturated Fats(g)'
  }, 
  totalCarb: {
    type: 'number',
    hidden: false,
    display: 'Carbohydrates(g)'
  }, 
  sugar: {
    type: 'number',
    hidden: false,
    display: 'Sugar(g)'
  }, 
  totalProtein: {
    type: 'number',
    hidden: false,
    display: 'Protein(g)'
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
  }
}

var fields = _.keys(foodTableOptions)

var nutrition = [
  "totalFat",
  "totalCarb",
  "totalProtein",
]

var map = []

for (var i = 0; i < nutrition.length; i++) {
  for (var j = 0; j < fields.length; j++) {
    if (nutrition[i] == fields[j]) {
      map[i] = j
    }
  }
}
