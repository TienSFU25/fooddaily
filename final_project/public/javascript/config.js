var appId="065c98a7"
var appKey="ac97e296e021c5ea6c0e51389f966307"

var mainTableOptions = {
  item_name: {
    type: 'string',
    hidden: false,
    display: 'Item'
  },
  brand_name: {
    type: 'string',
    hidden: false,
    display: 'Brand'
  },
  nf_calories: {
    type: 'number',
    hidden: false, 
    display: 'Calories'
  },
  nf_total_fat: {
    type: 'number',
    hidden: false,
    display: 'Fats(g)'
  },
  nf_saturated_fat: {
    type: 'number',
    hidden: true,
    display: 'Saturated Fat'
  },
  nf_protein: {
    type: 'number',
    hidden: false,
    display: 'Protein(g)'
  }, 
  nf_total_carbohydrate: {
    type: 'number',
    hidden: false,
    display: 'Carbohydrates(g)'
  },
  nf_sugars: {
    type: 'number',
    hidden: true,
    display: 'Sugar(g)'
  },
  nf_dietary_fiber: {
    type: 'number',
    hidden: true,
    display: ''
  },
  nf_sodium: {
    type: 'number',
    hidden: true,
    display: 'Sodium(mg)'
  }, 
  nf_serving_size_qty: {
    type: 'number',
    hidden: false,
    display: 'Serving size quantity'
  },
  nf_serving_size_unit: {
    type: 'string',
    hidden: false,
    display: 'Serving size units'
  },
  item_type: {
    type: 'number',
    hidden: true,
    display: ''
  }, 
  item_id: {
    type: 'string',
    hidden: true,
    display: ''
  },  
}

var fields = _.keys(mainTableOptions)

var queryDict = {
 "appId":appId,
 "appKey":appKey,
 "fields": fields,
  "offset": 0,
  "limit": 50,
  "sort": {
    "field": "nf_calories",
    "order": "asc"
  },
  "min_score": 0.5,
  "query": "",
  "filters": {
    // "item_type": 3
    nf_calories: {
      from: 0,
      to: 3000
    }
  }
}

var nutrition = {
  nf_total_fat: "Fat",
  nf_protein: "Protein",
  nf_total_carbohydrate: "Carbohydrates"
}