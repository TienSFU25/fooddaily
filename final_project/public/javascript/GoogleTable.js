function GoogleTable(chartSelector, initRows, handlerFunction, options, chartTitle, callback) {
	var values = _.values(options)
	var display = _.pluck(values, 'display')
	var fieldTypes = _.pluck(values, 'type')
	var hiddenFields = []
	_.each(_.pluck(values, 'hidden'), function(val, index){
		if (val)
			hiddenFields.push(index)
	})

	// vcl closure
	var myTable = this
	this.selRow = null

	google.load("visualization", "1", {packages:["corechart", "table"]});

	google.setOnLoadCallback(function() {
		myTable.googleTable = new google.visualization.Table($(chartSelector).get(0));

		// initialize the columns. use all string fields
		myTable.data = new google.visualization.DataTable()	 	
	 	for (var i = 0; i < display.length; i++) {
	 		myTable.data.addColumn(fieldTypes[i], display[i])
	 	}

	 	myTable.view = new google.visualization.DataView(myTable.data)
	 	myTable.view.hideColumns(hiddenFields)

		// set the handler
		google.visualization.events.addListener(myTable.googleTable, 'select', handlerFunction)

		// for initially loading the chart
	 	myTable.draw(initRows)
	 	if (chartTitle)
			$(chartSelector).prepend('<h2 class="googleTableTitle">'+ chartTitle + '</h2>')

		if (callback)
			callback()
	})
}

// rows is an ARRAY OF ARRAYS
GoogleTable.prototype.draw = function f(rows, options) {
	// reset rows
	this.data.removeRows(0, this.data.getNumberOfRows())
	this.data.addRows(rows)

	if (options == undefined) {
		options = {
			showRowNumber: true,
			// alternatingRowStyle: false,
			page: 'enable', 
			pageSize: 10,
			cssClassNames: {
				// tableRow: 'popup-with-form',
				// oddTableRow: 'popup-with-form'
			}
		}
	}

    this.googleTable.draw(this.view, options);
}

GoogleTable.prototype.removeSelected = function() {
	if (this.selRow == null) {
		console.log("No rows have been selected for this table")
		return
	}

	this.data.removeRow(this.selRow)

	console.log(this.data.getNumberOfRows())
	if (this.data.getNumberOfRows() == 0) {
		this.googleTable.clearChart()
		return
	}

	options = {
		showRowNumber: true,
		page: 'enable', 
		pageSize: 10
	}

	this.googleTable.draw(this.view, options)
}

GoogleTable.prototype.getValue = function f(row, col) {
	return this.data.getValue(row, col)
}

// return all data in the last selected row
GoogleTable.prototype.dataDump = function f() {
	var cols = this.data.getNumberOfColumns()
	var tds = []
	for (var i = 0; i < cols; i++) {
		tds.push(this.data.getValue(this.selRow, i))
	}
	return tds
}