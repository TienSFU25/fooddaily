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
    "item_type": 3
  }
}

var nutrition = [
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
]


var $foodIn = $('#foodSearch')

// this variable is used to store array of arrays
// after google init callback is called, this will be displayed
var globalRows;

// get the indexes. rather poor way to do this
var map = []
for (var i = 0; i < nutrition.length; i++) {
	for (var j = 0; j < fields.length; j++) {
		if (nutrition[i] == fields[j]) {
			map[i] = j
		}
	}
}

var tableData;
var pieData;
var googleTable;
var googlePieChart;
var tableView;
var pieView;

function GoogleTable(foodSearchId, rows, handlerFunction) {
	$foodOut = $('#' + foodSearchId)

	// load rows
	globalRows = rows

	// vcl closure
	var myTable = this
	google.load("visualization", "1", {packages:["corechart", "table"]});
	google.setOnLoadCallback(function() {
		googleTable = new google.visualization.Table($('.foodChart').get(0));
		
		// initialize the columns. use all string fields
		tableData = new google.visualization.DataTable()
	 	
	 	var i;
	 	for (i = 0; i < fields.length; i++) {
	 		tableData.addColumn('string', fields[i])
	 	}
	 	// add the ID column
	 	tableData.addColumn('string', 'id')
	 	tableView = new google.visualization.DataView(tableData)

	 	// hide ID when showing table
	 	tableView.hideColumns([i])

	 	// initialize the pie chart
		googlePieChart = new google.visualization.PieChart($('.pieChart').get(0))
		pieData = new google.visualization.DataTable()
	 	pieData.addColumn('string', 'Name')
	 	pieData.addColumn('number', 'Data')
		pieView = new google.visualization.DataView(pieData)

		// set the handler
		google.visualization.events.addListener(googleTable, 'select', handlerFunction)

		// for initially loading the chart
	 	myTable.googleChartsDraw(globalRows)		
	})
}

// rows is an ARRAY OF ARRAYS
GoogleTable.prototype.googleChartsDraw = function f(rows) {
	// reset rows
	tableData.removeRows(0, tableData.getNumberOfRows())
	tableData.addRows(rows)
    googleTable.draw(tableView, {showRowNumber: true});
}

GoogleTable.prototype.getValue = function f(row, col) {
	return tableData.getValue(row, col)
}

GoogleTable.prototype.getSelectedRow = function f() {
	return googleTable.getSelection()[0].row
}

// damn data parsing
function jsonToArrayArrays(data) {
	var allRows = []

	// parse the JSON into allRows
	for (var i = 0; i < data['hits'].length; i++) {
		// f is a dictionary{item_name, nf_calories...}
		var f = data['hits'][i]['fields']
		var thisRow = []
		var j = 0

		for (j = 0; j < fields.length; j++) {
			var fieldName = fields[j]
			thisRow[j] = String(f[fieldName])
		}
		thisRow[j] = data['hits'][i]['_id']
		allRows[i] = thisRow
	}

	return allRows
}

// generate an array of arrays, with each element having fields matching queryDict['fields']
// only happens when a new search is called
// loading from the server should give array of arrays
GoogleTable.prototype.googleChartsUpdate= function f(json) {
	this.googleChartsDraw(jsonToArrayArrays(json))
}

// pie chart implementation
function googlePieDraw(rows) {
	pieData.removeRows(0, pieData.getNumberOfRows())
	pieData.addRows(rows)
	googlePieChart.draw(pieView);
}

// data has 3 numbers for macros
function googlePieUpdate(data) {
	// console.log(data)
	var allRows = []
	for (var i = 0; i < data.length; i++) {
		// fieldName is a string, like "nf_calories"
		var fieldName = nutrition[i]
		var row = []
		row[0] = fieldName
		row[1] = parseInt(data[i])
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