var APP_ID = "1aeab161";
var APP_KEY = "30949c53cf846dfc493a20eebfbbd422";



// The base url for the a Get Recipe GET is:
// http://api.yummly.com/v1/api/recipe/recipe-id?_app_id=YOUR_ID&_app_key=YOUR_APP_KEY
// where recipe IDs may be obtained from the Search Recipes call.
// The recipe ID is the part of a Yummly recipe page URL after the last slash: http://www.yummly.com/recipe/RECIPE-ID

// For example, to request the response for French Onion Soup by Ree Drummond The Pioneer Woman,
// append French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364

// GET QUERY example:
// http://api.yummly.com/v1/api/recipe/Hot-Turkey-Salad-Sandwiches-Allrecipes?_app_id=1aeab161&_app_key=30949c53cf846dfc493a20eebfbbd422
// ex 2:
// http://api.yummly.com/v1/api/recipe/French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364?_app_id=1aeab161&_app_key=30949c53cf846dfc493a20eebfbbd422



function queryYummly(foodId) {

	var call = "http://api.yummly.com/v1/api/recipe/";
	call += foodId + "?_";
	call += "app_id=" + APP_ID + "&_app_key=" + APP_KEY;

	var jqhxr = $.ajax({
		type: "GET",
		url: call,
		success: function(data) {
			updateResults(data);
		},
	})
}

function updateResults(data) {
		var info = "<li>" + data.name + "</li>";
	  	info += "<ul>";
	  	info += "<li> img goes here </li>"; // eg 	  	info += "<li><img src=\"http://lh6.ggpht.com/Sn2qCFY3fG8cI71t9BdZ-Jyb9RyPh_0Dg79ii9iRNHhd97yQy5MYg0e9sun3HxY9inRax15XWkBSrQ3RCQGq0A=s360\"></img></li>";
		info += "<li>Yield: " + data.yield + "</li>";


		info += "<li>Ingredients: ";
		info += "<ul>"
		for (i = 0; i < data.ingredientLines.length; i++){
			info += "<li>" + data.ingredientLines[i] + "</li>";
		}
		info += "</ul></li>"

		info += "<li><a href=\"" + data.source.sourceRecipeUrl + "\">URL</a></li>";
		info += "</ul><br>"
		// info += "<li><img src=\"" + data.images.hostedLargeUrl + "\"></img></li>";
		// info += data.images.hostedLargeUrl; // <img src="http://i2.yummly.com/Hot-Turkey-Salad-Sandwiches-Allrecipes.l.png"></img>
	// info +="<li><img src=\"http://i2.yummly.com/Hot-Turkey-Salad-Sandwiches-Allrecipes.l.png\"></img></li>";
		
	$("#favRecipes").append(info);
}


 $( document ).ready(function() {
	var example = "Hot-Turkey-Salad-Sandwiches-Allrecipes";
	var example2 = "French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364";

	var examples = [
		"Hot-Turkey-Salad-Sandwiches-Allrecipes",
		"French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364"
	]

	for (i = 0; i < examples.length; i++) { 
		queryYummly(examples[i]);
	}
  });


