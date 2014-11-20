var nutrition = [
	"nf_total_fat",
	"nf_total_carbohydrate",
	"nf_protein",
]

function GooglePie() {
	var myChart = this
	google.load("visualization", "1", {packages:["corechart"]});
	google.setOnLoadCallback(function() {
	 	// initialize the pie chart

		googlePieChart = new google.visualization.PieChart($('.pieChart').get(0))
		myChart.pieData = new google.visualization.DataTable()
	 	myChart.pieData.addColumn('string', 'Name')
	 	myChart.pieData.addColumn('number', 'Data')
		myChart.pieView = new google.visualization.DataView(myChart.pieData)
	})
}

// pie chart implementation
GooglePie.prototype.googlePieDraw = function(rows) {
	this.pieData.removeRows(0, this.pieData.getNumberOfRows())
	this.pieData.addRows(rows)
	googlePieChart.draw(this.pieView);
}

// data has 3 numbers for macros
GooglePie.prototype.googlePieUpdate = function(data) {
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
	console.log(allRows)
	this.googlePieDraw(allRows)
}