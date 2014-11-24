module.exports.arrayJsonToArrayArray = function(arr) {
	var fields = Object.keys(arr[0])
	var rows = []
	for (var i = 0; i < arr.length; i++) {
		var row = []
		json = arr[i]
		for (var j = 0; j < fields.length; j++) {
			row[j] = json[fields[j]]
		}		rows[i] = row
	}
	return rows
}
