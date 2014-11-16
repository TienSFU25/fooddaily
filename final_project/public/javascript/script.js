var $foodIn = $('#foodSearch')
var $foodOut = $('#foodResults')
var appId="065c98a7"
var appKey="ac97e296e021c5ea6c0e51389f966307"

var queryDict = {
 "appId":appId,
 "appKey":appKey,
 "fields": [
    "item_name",
    "brand_name",
    "nf_calories",
    "nf_sodium",
    "nf_protein",
    "item_type"
  ],
  "offset": 0,
  "limit": 50,
  "sort": {
    "field": "nf_calories",
    "order": "desc"
  },
  "min_score": 0.5,
  "query": "",
  "filters": {
    "nf_calories": {
      "from": 0,
      "to": 400
    }
  }
}

function searchFoodById() {
	xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange=function()
	  {
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	    {
			$foodOut.val(xmlhttp['responseText'])
	    }
	  }
	xmlhttp.open("get", "https://api.nutritionix.com/v1_1/item?id=5266a0fa9f05a39eb3007777&appId="
						+appId+"&appKey="+appKey, true)
	xmlhttp.send()
}

// requests nutritionix, parse json and update google table
function searchFoodsByName(foodName) {
	queryDict["query"] = foodName

	$.ajax({
		type: "POST",
		url: "https://api.nutritionix.com/v1_1/search",
		data: queryDict,
		success: function(d) {
			googleChartsUpdate(d)
		},
	})
}

// use google charts to draw a table
google.load("visualization", "1", {packages:["corechart", "table"]});
google.setOnLoadCallback(googleChartsInit)
var googleData;
var googleTable;

var fields = queryDict['fields']


// initialize the columns. use all string fields

// TODO: better way to update table than restarting?
function resetData() {
	googleData = new google.visualization.DataTable()
 	for (var i = 0; i < fields.length; i++) {
 		googleData.addColumn('string', fields[i])
 	}
}

// initialize an empty table
function googleChartsInit() {
	googleTable = new google.visualization.Table($('.foodChart').get(0));
	resetData()

 	googleChartsDraw([])
}

function googleChartsDraw(rows) {
	googleData.addRows(rows)
    googleTable.draw(googleData, {showRowNumber: true});
}

// generate an array of arrays, with each element having fields matching queryDict['fields']
function googleChartsUpdate(data) {
	resetData()
	var allRows = []
	for (var i = 0; i < data['hits'].length; i++) {
		var f = data['hits'][i]['fields']
		var thisRow = []

		for (var j = 0; j < fields.length; j++) {
			var fieldName = fields[j]
			thisRow[j] = String(f[fieldName])
		}

		allRows[i] = thisRow
	}
	googleChartsDraw(allRows)
}

// event listener
$foodIn.keypress(function(e){
	if(e.keyCode == 13) {
		// disable form submission
		e.preventDefault()
		searchFoodsByName($('#foodSearch input').val())
	}
})