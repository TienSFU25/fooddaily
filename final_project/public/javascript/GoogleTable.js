function GoogleTable(chartSelector, initRows, handlerFunction, fields, fieldTypes, hiddenFields) {
	// vcl closure
	var myTable = this
	google.load("visualization", "1", {packages:["corechart", "table"]});

	google.setOnLoadCallback(function() {
		myTable.googleTable = new google.visualization.Table($(chartSelector).get(0));

		// initialize the columns. use all string fields
		myTable.data = new google.visualization.DataTable()	 	
	 	for (var i = 0; i < fields.length; i++) {
	 		myTable.data.addColumn(fieldTypes[i], fields[i])
	 	}

	 	myTable.view = new google.visualization.DataView(myTable.data)
	 	myTable.view.hideColumns(hiddenFields)

		// set the handler
		google.visualization.events.addListener(myTable.googleTable, 'select', handlerFunction)
		// for initially loading the chart
	 	myTable.googleChartsDraw(initRows)		
	})
}

// rows is an ARRAY OF ARRAYS
GoogleTable.prototype.googleChartsDraw = function f(rows) {
	// reset rows
	this.data.removeRows(0, this.data.getNumberOfRows())
	this.data.addRows(rows)
    this.googleTable.draw(this.view, {showRowNumber: true});
}

GoogleTable.prototype.getValue = function f(row, col) {
	return this.data.getValue(row, col)
}

GoogleTable.prototype.getSelectedRow = function f() {
	return this.googleTable.getSelection()[0].row
}