function GoogleLine(chartSelector, initRows, handlerFunction, fields) {
	// vcl closure
	var myLine = this
	google.load("visualization", "1", {packages:["corechart"]});

	google.setOnLoadCallback(function() {
		myLine.googleLine = new google.visualization.LineChart($(chartSelector).get(0));

		// initialize the columns. use all string fields
		myLine.data = new google.visualization.DataTable()

		// x axis must be a string
 		myLine.data.addColumn('string', fields[0])

	 	for (var i = 1; i < fields.length; i++) {
	 		myLine.data.addColumn('number', fields[i])
	 	}

	 	myLine.view = new google.visualization.DataView(myLine.data)

		// set the handler
		google.visualization.events.addListener(myLine.googleLine, 'select', handlerFunction)
		// for initially loading the chart
	 	myLine.draw(initRows)		
	})
}

// rows is an ARRAY OF ARRAYS
GoogleLine.prototype.draw = function f(rows) {
	// reset rows
	this.data.removeRows(0, this.data.getNumberOfRows())
	this.data.addRows(rows)
    this.googleLine.draw(this.view);
}