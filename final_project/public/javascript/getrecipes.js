var APP_ID = "1aeab161";
var APP_KEY = "30949c53cf846dfc493a20eebfbbd422";

var example = "Hot-Turkey-Salad-Sandwiches-Allrecipes";



// The base url for the a Get Recipe GET is:
// http://api.yummly.com/v1/api/recipe/recipe-id?_app_id=YOUR_ID&_app_key=YOUR_APP_KEY
// where recipe IDs may be obtained from the Search Recipes call.
// The recipe ID is the part of a Yummly recipe page URL after the last slash: http://www.yummly.com/recipe/RECIPE-ID

// For example, to request the response for French Onion Soup by Ree Drummond The Pioneer Woman,
// append French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364

// GET QUERY example:
// http://api.yummly.com/v1/api/recipe/Hot-Turkey-Salad-Sandwiches-Allrecipes?_app_id=1aeab161&_app_key=30949c53cf846dfc493a20eebfbbd422



function queryYummly(foodName) {
	var params = foodName.split(" ");

	// var call = "http://api.yummly.com/v1/api/recipe/";

	// for (var i = 0; i < params.length; i++) {
	// 	call += "+" + params[i];
	// };

	// call += recipe + "recipes?_";
	// call += "app_id=" + APP_ID + "&_app_key=" + APP_KEY;

	var call = "http://api.yummly.com/v1/api/recipe/Hot-Turkey-Salad-Sandwiches-Allrecipes?_app_id=1aeab161&_app_key=30949c53cf846dfc493a20eebfbbd422";

	var jqhxr = $.ajax({
		type: "GET",
		url: call,
		success: function(data) {
			updateResults(data);
		},
	})
}

function updateResults(data) {
	// var j = JSON.parse(data);

    // var obj = JSON && JSON.parse(data) || $.parseJSON(data);
	var test = "<li>" + data.yield + "</li>";
	$("ul").append(test);
}

// event listener
// $("#getRecipes").click(function(e){
// 	alert('Heyo');
// 	// if(e.keyCode == 13) {
// 		// disable form submission
// 		// e.preventDefault();
// 		// queryYummly($("#recipeSearch input").val());
// 		queryYummly("test");
// 	// }
// })

  $("#getR").click(function(e){
    // $("p").toggle();
    // alert("eeeeee");
		queryYummly("test");

	// var test = "<li> test </li>";

    // $("ul").append("<li>Appended item</li>");
    // $("ul").append(test);
  });


