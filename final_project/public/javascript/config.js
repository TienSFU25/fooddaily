var appId="065c98a7"
var appKey="ac97e296e021c5ea6c0e51389f966307"

var mainTableOptions = {
  item_name: {
    type: 'string',
    hidden: false
  },
  brand_name: {
    type: 'string',
    hidden: false
  },
  nf_calories: {
    type: 'number',
    hidden: false
  },
  nf_total_fat: {
    type: 'number',
    hidden: false
  }, 
  nf_total_protein: {
    type: 'number',
    hidden: false
  }, 
  nf_total_carbohydrate: {
    type: 'number',
    hidden: false
  },  
  nf_total_sodium: {
    type: 'number',
    hidden: false
  }, 
  item_type: {
    type: 'number',
    hidden: false
  }, 
  item_id: {
    type: 'string',
    hidden: true
  },  
}

var queryDict = {
 "appId":appId,
 "appKey":appKey,
 "fields": _.keys(mainTableOptions),
  "offset": 0,
  "limit": 50,
  "sort": {
    "field": "nf_calories",
    "order": "desc"
  },
  "min_score": 0.5,
  "query": "",
  "filters": {
    // "item_type": 3
  }
}

var nutrition = [
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
]

// sloppy way to get the column indexes of items in nutrition
// or fields[map[i]] == nutrition[i]
var fields = _.keys(mainTableOptions)
var map = []

for (var i = 0; i < nutrition.length; i++) {
  for (var j = 0; j < fields.length; j++) {
    if (nutrition[i] == fields[j]) {
      map[i] = j
    }
  }
}

var foodTableOptions = {
  id: {
    type: 'string',
    hidden: false
  }, 
  foodname: {
    type: 'string',
    hidden: false
  },
  brandName: {
    type: 'string',
    hidden: false
  }, 
  calories: {
    type: 'number',
    hidden: false
  },   
  totalFat: {
    type: 'number',
    hidden: false
  }, 
  satFat: {
    type: 'number',
    hidden: false
  }, 
  totalCarb: {
    type: 'number',
    hidden: false
  }, 
  sugar: {
    type: 'number',
    hidden: false
  }, 
  totalProtein: {
    type: 'number',
    hidden: false
  }, 
  sodium: {
    type: 'number',
    hidden: false
  }, 
  servingQuantity: {
    type: 'number',
    hidden: false
  }, 
  servingUnit: {
    type: 'string',
    hidden: false
  }, 
  amount: {
    type: 'number',
    hidden: false
  }, 
  createdAt: {
    type: 'string',
    hidden: false
  }, 
}