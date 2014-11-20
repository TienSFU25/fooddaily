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
    "item_type"
  ]

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
    // "nf_calories": {
    //   "from": 0,
    //   "to": 400
    // },
    "item_type": 3
  }
}

var nutrition = [
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
]