var sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf

function Search() {
	this.xhr = XmlHttpRequest()
	this.APP_ID = "1aeab161"
	this.APP_KEY = "30949c53cf846dfc493a20eebfbbd422"
	this.searchParams = "test" //"document.getElementById('q')[0].value"
}

Search.prototype.searchRecipe = function f(searchParams, callback) {
	var params = searchParams.split(" ");

	var call = "http://api.yummly.com/v1/api/recipes?_"
	call += "app_id=" + APP_ID + "&_app_key=" + APP_KEY + "&"

	for (var i = 0; i < params.length; i++) {
		call += "+" + params[i]
	};

	this.xhr.open("GET", call, false)
	this.xhr.send()

	console.log(this.xhr.status)
	console.log(this.xhr.statusText)
	console.log(this.xhr.response)


	var obj = JSON.parse(this.xhr.response)
	// Modify Json here...

	
	
}

module.exports = Search