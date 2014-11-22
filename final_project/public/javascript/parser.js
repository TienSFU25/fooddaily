function arrayJsonToArrayArrays(arrayJson) {
	var allRows = []
	var keys = Object.keys(arrayJson[0])

	for (var i = 0; i < arrayJson.length; i++) {
		var row = []
		for (var j = 0; j < keys.length; j++) {
			row[j] = String(arrayJson[i][keys[j]])
		}

		allRows[i] = row
	}

	return allRows
}

// damn data parsing
function jsonToArrayArrays(data, fields) {
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

		allRows[i] = thisRow
	}

	return allRows
}