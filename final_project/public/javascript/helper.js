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