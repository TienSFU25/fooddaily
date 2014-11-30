function GooglePie(chartSelector) {
	var myChart = this
	google.load("visualization", "1", {packages:["corechart"]});
	google.setOnLoadCallback(function() {
	 	// initialize the pie chart

		googlePieChart = new google.visualization.PieChart($(chartSelector).get(0))
		myChart.data = new google.visualization.DataTable()
	 	myChart.data.addColumn('string', 'Name')
	 	myChart.data.addColumn('number', 'Data')
		myChart.view = new google.visualization.DataView(myChart.data)
	})
}

// pie chart implementation
GooglePie.prototype.draw = function(rows, options) {
	if (options == undefined) {
		options = {
			is3D: true
		}
	}

	this.data.removeRows(0, this.data.getNumberOfRows())
	this.data.addRows(rows)
	googlePieChart.draw(this.view, options);
}