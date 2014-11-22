var appId="065c98a7"
var appKey="ac97e296e021c5ea6c0e51389f966307"

var fields = [
    "item_name",
    "brand_name",
    "nf_calories",
    "nf_total_fat",
    "nf_protein",
    "nf_total_carbohydrate",
    "nf_sodium",
    "item_type",
    "item_id"
  ]

var hidden = [fields.length - 1]

var queryDict = {
 "appId":appId,
 "appKey":appKey,
 "fields": fields,
  "offset": 0,
  "limit": 50,
  "sort": {
    "field": "nf_calories",
    "order": "desc"
  },
  "min_score": 0.5,
  "query": "",
  "filters": {
    "item_type": 3
  }
}

var nutrition = [
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
]

// sloppy way to get the column indexes of items in nutrition
// or fields[map[i]] == nutrition[i] 
var map = []

for (var i = 0; i < nutrition.length; i++) {
  for (var j = 0; j < fields.length; j++) {
    if (nutrition[i] == fields[j]) {
      map[i] = j
    }
  }
}