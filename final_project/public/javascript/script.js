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

var nutrition = [
	"nf_calories",
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
	"nf_sodium"
]

// function searchFoodById(foodid) {
// 	xmlhttp = new XMLHttpRequest();

// 	xmlhttp.onreadystatechange=function()
// 	  {
// 	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
// 	    {
// 			googlePieUpdate(xmlhttp['responseText'])
// 	    }
// 	  }
// 	xmlhttp.open("get",, true)
// 	xmlhttp.send()
// }
// requests nutritionix, parse json and update google table

function searchFoodById(foodid) {
	$.ajax({
		type: "GET",
		url: "https://api.nutritionix.com/v1_1/item?id=" + foodid 
		+"&appId="+appId+"&appKey="+appKey,
		success: function(d) {
			googlePieUpdate(d)
		},
	})
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
var tableData;
var pieData;
var googleTable;
var googlePieChart;

var fields = queryDict['fields']


// initialize the columns. use all string fields

// TODO: better way to update table than restarting?
function resetTableData() {
	tableData = new google.visualization.DataTable()
 	for (var i = 0; i < fields.length; i++) {
 		tableData.addColumn('string', fields[i])
 	}
}

// initialize an empty table and pie chart
function googleChartsInit() {
	googleTable = new google.visualization.Table($('.foodChart').get(0));
	googlePieChart = new google.visualization.PieChart($('.pieChart').get(0))

	google.visualization.events.addListener(googleTable, 'select', selectHandler);

	function selectHandler(e) {
		var selectedId = $('.google-visualization-table-tr-sel').attr('_id')
		searchFoodById(selectedId)
	}
	resetTableData()
 	googleChartsDraw([])

 	resetPieData()
}

function googleChartsDraw(rows) {
	tableData.addRows(rows)
    googleTable.draw(tableData, {showRowNumber: true});
}

// generate an array of arrays, with each element having fields matching queryDict['fields']
function googleChartsUpdate(data) {
	resetTableData()
	var allRows = []
	var ids = []

	for (var i = 0; i < data['hits'].length; i++) {
		// f is a dictionary{item_name, nf_calories...}
		var f = data['hits'][i]['fields']
		var thisRow = []

		for (var j = 0; j < fields.length; j++) {
			var fieldName = fields[j]
			thisRow[j] = String(f[fieldName])
		}

		allRows[i] = thisRow

		// store ID of food for later data binding
		ids[i] = data['hits'][i]['_id']
	}
	googleChartsDraw(allRows)

	// use d3 to bind _id to the rows
	var d3Rows = d3.selectAll('.google-visualization-table-table tr:not(.google-visualization-table-tr-head)')
	d3Rows.attr("_id", function(d, i){
		return String(ids[i])})
}

// pie chart implementation
function resetPieData() {
	pieData = new google.visualization.DataTable()
 	pieData.addColumn('string', 'Name')
 	pieData.addColumn('number', 'Data')
}

function googlePieDraw(rows) {
	pieData.addRows(rows)
	googlePieChart.draw(pieData);
}

function googlePieUpdate(data) {
	console.log(data)
	console.log(data[2])
	console.log(data.item_id)
	console.log(data['nf_calories'])
	resetPieData()
	var allRows = []
	for (var i = 0; i < nutrition.length; i++) {
		// fieldName is a string, like "nf_calories"
		var fieldName = nutrition[i]
		var row = []
		row[0] = fieldName
		row[1] = data[fieldName]
		allRows[i] = row
	}
	googlePieDraw(allRows)
}

// event listener
$foodIn.keypress(function(e){
	if(e.keyCode == 13) {
		// disable form submission
		e.preventDefault()
		searchFoodsByName($('#foodSearch input').val())
	}
})