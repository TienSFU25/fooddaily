var APP_ID = "1aeab161";
var APP_KEY = "30949c53cf846dfc493a20eebfbbd422";

function queryYummly(foodName) {
	var call = "http://api.yummly.com/v1/api/recipes"; // ?_";
	var params = foodName.split(" ");

	call += "app_id=" + APP_ID + "&_app_key=" + APP_KEY + "&";

	for (var i = 0; i < params.length; i++) {
		call += "+" + params[i];
	};

	var jqhxr = $.ajax({
		type: "GET",
		url: call,
		success: function(data) {
			updateResults(data);
		},
	})
}

function updateResults(data) {
	var test = "<li> test </li>";
	test.appendTo($("#resultsList"));
}

// event listener
$("#recipeSearch").keypress(function(e){
	if(e.keyCode == 13) {
		// disable form submission
		e.preventDefault();
		queryYummly($("#recipeSearch input").val());
	}
})